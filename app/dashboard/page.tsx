'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatedButton } from '@/components/ui/animated-button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CardSpotlight } from '@/components/ui/card-spotlight';
import { api } from '@/lib/api';
import { 
  Navbar, 
  NavBody, 
  NavItems, 
  MobileNav, 
  MobileNavHeader, 
  MobileNavMenu, 
  MobileNavToggle
} from '@/components/ui/resizable-navbar';

export default function Dashboard() {
  const [roomId, setRoomId] = useState('');
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      router.push('/auth');
    }
  }, [router]);

  const handleCreateRoom = async () => {
    setLoading(true);
    try {
      const response = await api.createRoom();
      if (response.error) {
        alert(response.error);
      } else if (response.data) {
        router.push(`/room/${response.data.roomId}`);
      }
    } catch (error) {
      alert('Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!roomId.trim()) {
      alert('Please enter a room ID');
      return;
    }

    setLoading(true);
    try {
      const response = await api.joinRoom(roomId);
      if (response.error) {
        alert(response.error);
      } else {
        router.push(`/room/${roomId}`);
      }
    } catch (error) {
      alert('Failed to join room');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    api.clearToken();
    router.push('/auth');
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center relative"
      style={{
        backgroundImage:
          "url('https://i.postimg.cc/P5w0yP5X/ds.png')",
      }}
    >
      {/* Noise Overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "url('https://www.transparenttextures.com/patterns/black-orchid.png')",
          opacity: 1,
          mixBlendMode: 'overlay',
        }}
      ></div>

      {/* Navigation */}
      <Navbar className="top-0">
        <NavBody>
          <a href="/dashboard" className="relative z-20 flex items-center gap-3 px-2 py-1">
            <img src="/zetra-logo.svg" alt="Zetra" className="w-12 h-12" />
            <span className="text-3xl font-bold text-white">Zetra</span>
          </a>
          <NavItems 
            items={[
              { name: 'Dashboard', link: '/dashboard' },
              { name: 'History', link: '/history' },
              { name: 'About', link: '/about' },
              { name: 'Profile', link: '/profile' },
            ]}
          />
          <div className="flex items-center gap-3">
            <AnimatedButton onClick={handleLogout} size="md">
              Logout
            </AnimatedButton>
          </div>
        </NavBody>
        
        <MobileNav>
          <MobileNavHeader>
            <a href="/dashboard" className="flex items-center gap-2">
              <img src="/zetra-logo.svg" alt="Zetra" className="w-10 h-10" />
              <span className="text-2xl font-bold text-white">Zetra</span>
            </a>
            <MobileNavToggle 
              isOpen={mobileMenuOpen} 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            />
          </MobileNavHeader>
          <MobileNavMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)}>
            <a href="/dashboard" className="text-white hover:text-gray-300 transition-colors">Dashboard</a>
            <a href="/history" className="text-white hover:text-gray-300 transition-colors">History</a>
            <a href="/about" className="text-white hover:text-gray-300 transition-colors">About</a>
            <a href="/profile" className="text-white hover:text-gray-300 transition-colors">Profile</a>
            <AnimatedButton onClick={handleLogout} size="sm" className="w-full">
              Logout
            </AnimatedButton>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-16 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-white mb-4 tracking-tight drop-shadow-lg">
            Start your video call
          </h2>
          <p className="text-lg text-gray-200 max-w-2xl mx-auto">
            Create a new room or join an existing one to connect with others
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Create Room Card */}
          <CardSpotlight className="group hover:border-white/40 transition-all flex flex-col">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold text-white">Create room</CardTitle>
              <CardDescription className="text-base text-gray-200">
                Start a new video call and invite others to join
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-end">
              <div className="h-[56px] mb-4"></div>
              <AnimatedButton
                onClick={handleCreateRoom}
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? 'Creating...' : 'Create new room'}
              </AnimatedButton>
            </CardContent>
          </CardSpotlight>

          {/* Join Room Card */}
          <CardSpotlight className="group hover:border-white/40 transition-all flex flex-col">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold text-white">Join room</CardTitle>
              <CardDescription className="text-base text-gray-200">
                Enter a room ID to join an existing call
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-end space-y-4">
              <Input
                type="text"
                placeholder="Enter room ID"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-300 backdrop-blur-sm"
              />
              <AnimatedButton
                onClick={handleJoinRoom}
                disabled={loading || !roomId.trim()}
                className="w-full"
                size="lg"
              >
                {loading ? 'Joining...' : 'Join room'}
              </AnimatedButton>
            </CardContent>
          </CardSpotlight>
        </div>


      </div>
    </div>
  );
}
