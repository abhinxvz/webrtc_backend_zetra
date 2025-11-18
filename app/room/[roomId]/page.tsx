'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { Button } from '@/components/ui/button';
import { AnimatedButton } from '@/components/ui/animated-button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { CardSpotlight } from '@/components/ui/card-spotlight';
import MeetingSummarizer from '@/components/MeetingSummarizer';
import { 
  Navbar, 
  NavBody, 
  NavItems, 
  MobileNav, 
  MobileNavHeader, 
  MobileNavMenu, 
  MobileNavToggle 
} from '@/components/ui/resizable-navbar';
import { ControlDock, DockDivider } from '@/components/ui/control-dock';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  MonitorUp, 
  MonitorStop, 
  MessageSquare, 
  MessageSquareOff, 
  Sparkles, 
  LogOut,
  Copy
} from 'lucide-react';

export default function Room() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ username: string; message: string; timestamp: Date }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [username, setUsername] = useState('');
  const [showSummarizer, setShowSummarizer] = useState(false);
  const [showNamePrompt, setShowNamePrompt] = useState(true);
  const [tempName, setTempName] = useState('');
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [remoteUsers, setRemoteUsers] = useState<string[]>([]);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const iceCandidatesQueueRef = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUserId(payload.userId || 'anonymous');
      // Don't set username yet - wait for user input
      setTempName(payload.username || '');
    } catch (error) {
      console.error('Token decode error:', error);
    }
  }, [router]);

  const handleJoinRoom = () => {
    if (!tempName.trim()) {
      alert('Please enter your name');
      return;
    }
    setUsername(tempName.trim());
    setShowNamePrompt(false);
  };

  useEffect(() => {
    if (!username || showNamePrompt) return;

    const socketInstance = io(process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000');
    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    const configuration: RTCConfiguration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        {
          urls: 'turn:openrelay.metered.ca:80',
          username: 'openrelayproject',
          credential: 'openrelayproject',
        },
        {
          urls: 'turn:openrelay.metered.ca:443',
          username: 'openrelayproject',
          credential: 'openrelayproject',
        },
      ],
      iceCandidatePoolSize: 10,
    };

    const createPeerConnection = (targetUserId: string) => {
      console.log('Creating peer connection for:', targetUserId);
      
      const peerConnection = new RTCPeerConnection(configuration);
      
      // Add local stream tracks
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          peerConnection.addTrack(track, localStreamRef.current!);
        });
      }

      // Handle incoming tracks
      peerConnection.ontrack = (event) => {
        console.log('Received remote track from:', targetUserId, event.streams[0]);
        if (event.streams[0]) {
          setRemoteStreams(prev => {
            const newStreams = new Map(prev);
            newStreams.set(targetUserId, event.streams[0]);
            return newStreams;
          });
          console.log('Added remote stream for:', targetUserId);
        }
      };

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('Sending ICE candidate to:', targetUserId);
          socketInstance.emit('ice-candidate', {
            roomId,
            candidate: event.candidate,
            targetUserId,
          });
        }
      };

      // Connection state monitoring
      peerConnection.onconnectionstatechange = () => {
        console.log(`Connection state with ${targetUserId}:`, peerConnection.connectionState);
      };

      peerConnectionsRef.current.set(targetUserId, peerConnection);
      return peerConnection;
    };

    const initializeMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Join room
        socketInstance.emit('join-room', roomId, userId);

        // Handle existing users in room
        socketInstance.on('existing-users', async (userIds: string[]) => {
          console.log('Existing users in room:', userIds);
          setRemoteUsers(userIds);
          
          // Create peer connections and send offers to all existing users
          for (const targetUserId of userIds) {
            const peerConnection = createPeerConnection(targetUserId);
            
            try {
              const offer = await peerConnection.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: true,
              });
              await peerConnection.setLocalDescription(offer);
              
              socketInstance.emit('offer', {
                roomId,
                offer,
                targetUserId,
              });
              console.log('Sent offer to:', targetUserId);
            } catch (error) {
              console.error('Error creating offer for:', targetUserId, error);
            }
          }
        });

        // Handle new user joining
        socketInstance.on('user-connected', (connectedUserId: string) => {
          console.log('New user connected:', connectedUserId);
          setRemoteUsers(prev => [...prev, connectedUserId]);
          // Don't create connection yet - wait for their offer
        });

        // Handle incoming offer
        socketInstance.on('offer', async ({ offer, senderId }: { offer: any; senderId: string }) => {
          console.log('Received offer from:', senderId);
          
          let peerConnection = peerConnectionsRef.current.get(senderId);
          if (!peerConnection) {
            peerConnection = createPeerConnection(senderId);
          }

          try {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
            
            // Process queued ICE candidates
            const queue = iceCandidatesQueueRef.current.get(senderId) || [];
            for (const candidate of queue) {
              await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
            }
            iceCandidatesQueueRef.current.delete(senderId);
            
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            
            socketInstance.emit('answer', {
              roomId,
              answer,
              targetUserId: senderId,
            });
            console.log('Sent answer to:', senderId);
          } catch (error) {
            console.error('Error handling offer from:', senderId, error);
          }
        });

        // Handle incoming answer
        socketInstance.on('answer', async ({ answer, senderId }: { answer: any; senderId: string }) => {
          console.log('Received answer from:', senderId);
          
          const peerConnection = peerConnectionsRef.current.get(senderId);
          if (!peerConnection) {
            console.error('No peer connection for:', senderId);
            return;
          }

          try {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
            
            // Process queued ICE candidates
            const queue = iceCandidatesQueueRef.current.get(senderId) || [];
            for (const candidate of queue) {
              await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
            }
            iceCandidatesQueueRef.current.delete(senderId);
            
            console.log('Answer processed for:', senderId);
          } catch (error) {
            console.error('Error handling answer from:', senderId, error);
          }
        });

        // Handle incoming ICE candidate
        socketInstance.on('ice-candidate', async ({ candidate, senderId }: { candidate: any; senderId: string }) => {
          console.log('Received ICE candidate from:', senderId);
          
          const peerConnection = peerConnectionsRef.current.get(senderId);
          if (!peerConnection) {
            console.log('Peer connection not ready, queuing candidate');
            const queue = iceCandidatesQueueRef.current.get(senderId) || [];
            queue.push(candidate);
            iceCandidatesQueueRef.current.set(senderId, queue);
            return;
          }

          try {
            if (peerConnection.remoteDescription) {
              await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
              console.log('ICE candidate added for:', senderId);
            } else {
              const queue = iceCandidatesQueueRef.current.get(senderId) || [];
              queue.push(candidate);
              iceCandidatesQueueRef.current.set(senderId, queue);
            }
          } catch (error) {
            console.error('Error adding ICE candidate from:', senderId, error);
          }
        });

        // Handle user disconnection
        socketInstance.on('user-disconnected', (disconnectedUserId: string) => {
          console.log('User disconnected:', disconnectedUserId);
          
          const peerConnection = peerConnectionsRef.current.get(disconnectedUserId);
          if (peerConnection) {
            peerConnection.close();
            peerConnectionsRef.current.delete(disconnectedUserId);
          }
          
          setRemoteUsers(prev => prev.filter(id => id !== disconnectedUserId));
          setRemoteStreams(prev => {
            const newStreams = new Map(prev);
            newStreams.delete(disconnectedUserId);
            return newStreams;
          });
        });

        socketInstance.on('chat-message', (data: { message: string; username: string; timestamp: Date }) => {
          setChatMessages((prev) => [...prev, data]);
        });
      } catch (error: any) {
        console.error('Error accessing media devices:', error);
        
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          alert('Camera/Microphone Access Denied\n\nPlease allow camera and microphone permissions in your browser settings to join the video call.\n\n1. Click the camera icon in your browser address bar\n2. Allow camera and microphone access\n3. Refresh the page');
        } else if (error.name === 'NotFoundError') {
          alert('No Camera/Microphone Found\n\nPlease connect a camera and microphone to your device.');
        } else if (error.name === 'NotReadableError') {
          alert('Camera/Microphone In Use\n\nYour camera or microphone is being used by another application. Please close other apps and try again.');
        } else {
          alert('Failed to Access Media Devices\n\nError: ' + error.message + '\n\nPlease check your camera and microphone permissions.');
        }
        
        // Redirect back to dashboard after 3 seconds
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
      }
    };

    initializeMedia();

    return () => {
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      screenStreamRef.current?.getTracks().forEach((track) => track.stop());
      peerConnectionsRef.current.forEach((pc) => pc.close());
      peerConnectionsRef.current.clear();
      socketInstance.disconnect();
    };
  }, [roomId, router, userId, username, showNamePrompt]);

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });

        screenStreamRef.current = screenStream;
        const videoTrack = screenStream.getVideoTracks()[0];

        // Replace video track for all peer connections
        peerConnectionsRef.current.forEach((peerConnection) => {
          const sender = peerConnection.getSenders().find((s) => s.track?.kind === 'video');
          if (sender) {
            sender.replaceTrack(videoTrack);
          }
        });

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }

        videoTrack.onended = () => {
          stopScreenShare();
        };

        setIsScreenSharing(true);
      } catch (error) {
        console.error('Error sharing screen:', error);
      }
    } else {
      stopScreenShare();
    }
  };

  const stopScreenShare = () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop());
    }

    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      
      // Restore camera track for all peer connections
      peerConnectionsRef.current.forEach((peerConnection) => {
        const sender = peerConnection.getSenders().find((s) => s.track?.kind === 'video');
        if (sender && videoTrack) {
          sender.replaceTrack(videoTrack);
        }
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }
    }

    setIsScreenSharing(false);
  };

  const sendChatMessage = () => {
    if (chatInput.trim() && socket) {
      socket.emit('chat-message', roomId, chatInput, username);
      setChatInput('');
    }
  };

  const leaveRoom = () => {
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    screenStreamRef.current?.getTracks().forEach((track) => track.stop());
    peerConnectionsRef.current.forEach((pc) => pc.close());
    peerConnectionsRef.current.clear();
    socket?.disconnect();
    router.push('/dashboard');
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    alert('Room ID copied!');
  };

  return (
    <div className="min-h-screen flex flex-col bg-black relative">
      {/* Name Prompt Modal */}
      {showNamePrompt && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <CardSpotlight className="max-w-md w-full p-8">
            <div className="text-center mb-6">
              <div className="w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <img src="/zetra-logo.svg" alt="Zetra" className="w-full h-full" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Join Video Call</h2>
              <p className="text-gray-300 text-sm">Enter your name to join the meeting</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Your Name
                </label>
                <Input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
                  placeholder="Enter your name..."
                  className="w-full bg-white/10 border-white/20 text-white placeholder:text-gray-400 h-12 text-base"
                  autoFocus
                />
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={() => router.push('/dashboard')}
                  variant="outline"
                  className="flex-1 bg-transparent border-white/30 text-white hover:bg-white/10 h-12"
                >
                  Cancel
                </Button>
                <AnimatedButton
                  onClick={handleJoinRoom}
                  className="flex-1 h-12"
                  size="lg"
                >
                  Join Room
                </AnimatedButton>
              </div>
            </div>
          </CardSpotlight>
        </div>
      )}


      {/* Navigation */}
      <Navbar className="top-0 relative z-50">
        <NavBody>
          <a href="/dashboard" className="relative z-20 flex items-center gap-3 px-2 py-1">
            <img src="/zetra-logo.svg" alt="Zetra" className="w-10 h-10" />
            <span className="text-2xl font-bold text-white">Zetra</span>
          </a>
          <div className="absolute inset-0 flex flex-1 items-center justify-center">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-200">Room:</span>
              <code className="bg-white/20 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-sm font-mono font-semibold border border-white/30">
                {roomId}
              </code>
              <Button
                onClick={copyRoomId}
                variant="ghost"
                size="sm"
                className="h-8 text-white hover:bg-white/20 flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy ID
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className="text-sm font-medium text-gray-200">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </NavBody>
        
        <MobileNav>
          <MobileNavHeader>
            <a href="/dashboard" className="flex items-center gap-2">
              <img src="/zetra-logo.svg" alt="Zetra" className="w-8 h-8" />
              <span className="text-xl font-bold text-white">Zetra</span>
            </a>
          </MobileNavHeader>
        </MobileNav>
      </Navbar>

      {/* Main Content */}
      <div className="flex-1 flex relative z-10">
        {/* Video Filters Sidebar */}
        {/* AI Summarizer Sidebar */}
        {showSummarizer && (
          <div className="w-96 bg-white/10 backdrop-blur-md border-r-2 border-white/20 p-6 overflow-y-auto">
            <MeetingSummarizer
              roomId={roomId}
              userId={userId}
              username={username}
              isConnected={isConnected}
            />
          </div>
        )}

        {/* Video Grid */}
        <div className="flex-1 flex items-center justify-center p-6 pb-32">
          <div className={`grid gap-4 w-full max-w-7xl ${
            remoteStreams.size === 0 ? 'grid-cols-1 max-w-2xl' :
            remoteStreams.size === 1 ? 'grid-cols-1 md:grid-cols-2' :
            remoteStreams.size === 2 ? 'grid-cols-1 md:grid-cols-3' :
            'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
          }`}>
            {/* Local Video */}
            <Card className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-black backdrop-blur-sm border-2 border-green-500/50 rounded-2xl shadow-2xl hover:border-green-500 transition-all duration-300">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover rounded-2xl"
                style={{ minHeight: '300px', maxHeight: '500px' }}
              />
              <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-lg px-4 py-2 rounded-xl border border-white/20">
                <p className="text-white text-sm font-semibold">You ({username})</p>
              </div>
              {!isVideoEnabled && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 rounded-2xl">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-2 border-4 border-white">
                      <span className="text-3xl text-white font-bold">{username.charAt(0).toUpperCase()}</span>
                    </div>
                    <p className="text-white text-sm font-medium">Camera off</p>
                  </div>
                </div>
              )}
            </Card>

            {/* Remote Videos - Dynamic Grid */}
            {Array.from(remoteStreams.entries()).map(([userId, stream]) => (
              <Card key={userId} className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-black backdrop-blur-sm border-2 border-blue-500/50 rounded-2xl shadow-2xl hover:border-blue-500 transition-all duration-300">
                <video
                  autoPlay
                  playsInline
                  ref={(el) => {
                    if (el && el.srcObject !== stream) {
                      el.srcObject = stream;
                    }
                  }}
                  className="w-full h-full object-cover rounded-2xl"
                  style={{ minHeight: '300px', maxHeight: '500px' }}
                  onLoadedMetadata={() => console.log('✅ Video loaded for:', userId)}
                />
                <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-lg px-4 py-2 rounded-xl border border-white/20">
                  <p className="text-white text-sm font-semibold">User {userId.slice(0, 8)}</p>
                </div>
              </Card>
            ))}

            {/* Waiting Placeholder - Only show if no remote users */}
            {remoteStreams.size === 0 && (
              <Card className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-black backdrop-blur-sm border-2 border-white/30 rounded-2xl shadow-2xl">
                <div className="flex items-center justify-center" style={{ minHeight: '300px' }}>
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3 border-4 border-white/50">
                      <span className="text-3xl text-white font-bold">?</span>
                    </div>
                    <p className="text-white text-sm font-medium">Waiting for others to join...</p>
                    <p className="text-gray-400 text-xs mt-2">Share the room ID to invite</p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Summarizer Sidebar */}
        {showSummarizer && (
          <div className="w-96 bg-white/10 backdrop-blur-md border-l-2 border-white/20 p-6 overflow-y-auto">
            <MeetingSummarizer
              roomId={roomId}
              userId={userId}
              username={username}
              isConnected={isConnected}
            />
          </div>
        )}

        {/* Chat Sidebar */}
        {showChat && !showSummarizer && (
          <div className="w-96 bg-white/10 backdrop-blur-md border-l-2 border-white/20 flex flex-col">
            <div className="p-6 border-b-2 border-white/20">
              <h3 className="text-xl font-bold text-white">Chat</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {chatMessages.length === 0 ? (
                <div className="text-center text-gray-300 mt-8">
                  <p className="text-sm">No messages yet</p>
                </div>
              ) : (
                chatMessages.map((msg, idx) => (
                  <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <p className="text-white text-sm font-bold">{msg.username}</p>
                    <p className="text-gray-200 text-sm mt-1">{msg.message}</p>
                    <p className="text-gray-400 text-xs mt-2">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                ))
              )}
            </div>
            <div className="p-6 border-t-2 border-white/20">
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
                  placeholder="Type a message..."
                  className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-gray-300 backdrop-blur-sm"
                />
                <Button
                  onClick={sendChatMessage}
                  size="lg"
                  className="bg-black hover:bg-gray-900 text-white shadow-lg"
                >
                  Send
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Control Dock */}
      <ControlDock>
        <Button
          onClick={toggleAudio}
          variant={isAudioEnabled ? 'outline' : 'default'}
          size="icon"
          className={
            !isAudioEnabled
              ? 'bg-red-600 hover:bg-red-700 text-white w-12 h-12 rounded-full'
              : 'bg-white/10 border border-white/30 text-white hover:bg-white/20 w-12 h-12 rounded-full'
          }
          title={isAudioEnabled ? 'Mute' : 'Unmute'}
        >
          {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </Button>

        <Button
          onClick={toggleVideo}
          variant={isVideoEnabled ? 'outline' : 'default'}
          size="icon"
          className={
            !isVideoEnabled
              ? 'bg-red-600 hover:bg-red-700 text-white w-12 h-12 rounded-full'
              : 'bg-white/10 border border-white/30 text-white hover:bg-white/20 w-12 h-12 rounded-full'
          }
          title={isVideoEnabled ? 'Stop video' : 'Start video'}
        >
          {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </Button>

        <Button
          onClick={toggleScreenShare}
          variant={isScreenSharing ? 'default' : 'outline'}
          size="icon"
          className={
            isScreenSharing
              ? 'bg-white/20 hover:bg-white/30 text-white w-12 h-12 rounded-full'
              : 'bg-white/10 border border-white/30 text-white hover:bg-white/20 w-12 h-12 rounded-full'
          }
          title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
        >
          {isScreenSharing ? <MonitorStop className="w-5 h-5" /> : <MonitorUp className="w-5 h-5" />}
        </Button>

        <Button
          onClick={() => setShowChat(!showChat)}
          variant="outline"
          size="icon"
          className="relative bg-white/10 border border-white/30 text-white hover:bg-white/20 w-12 h-12 rounded-full"
          title={showChat ? 'Hide chat' : 'Show chat'}
        >
          {showChat ? <MessageSquareOff className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
          {chatMessages.length > 0 && !showChat && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {chatMessages.length}
            </span>
          )}
        </Button>

        <DockDivider />

        <Button
          onClick={leaveRoom}
          variant="default"
          size="icon"
          className="bg-red-600 hover:bg-red-700 w-12 h-12 rounded-full"
          title="Leave room"
        >
          <LogOut className="w-5 h-5" />
        </Button>
      </ControlDock>
    </div>
  );
}
