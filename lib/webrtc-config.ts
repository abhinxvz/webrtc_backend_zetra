// WebRTC Configuration with STUN/TURN servers

export const getIceServers = (): RTCIceServer[] => {
  return [
    // Google's public STUN servers
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    
    // Free TURN server (OpenRelay)
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
    {
      urls: 'turn:openrelay.metered.ca:443?transport=tcp',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
  ];
};

export const rtcConfiguration: RTCConfiguration = {
  iceServers: getIceServers(),
  iceCandidatePoolSize: 10,
  iceTransportPolicy: 'all', // Use 'relay' to force TURN
};

// Test ICE server connectivity
export const testIceServers = async (): Promise<boolean> => {
  try {
    const pc = new RTCPeerConnection(rtcConfiguration);
    
    return new Promise((resolve) => {
      let hasCandidate = false;
      
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          hasCandidate = true;
          console.log('ICE Candidate:', event.candidate.type, event.candidate.address);
        }
      };

      pc.onicegatheringstatechange = () => {
        console.log('ICE Gathering State:', pc.iceGatheringState);
        if (pc.iceGatheringState === 'complete') {
          pc.close();
          resolve(hasCandidate);
        }
      };

      // Create a dummy data channel to trigger ICE gathering
      pc.createDataChannel('test');
      pc.createOffer().then((offer) => pc.setLocalDescription(offer));

      // Timeout after 5 seconds
      setTimeout(() => {
        pc.close();
        resolve(hasCandidate);
      }, 5000);
    });
  } catch (error) {
    console.error('ICE server test failed:', error);
    return false;
  }
};

export default rtcConfiguration;
