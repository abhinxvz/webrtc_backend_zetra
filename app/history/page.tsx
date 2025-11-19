'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatedButton } from '@/components/ui/animated-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
} from '@/components/ui/resizable-navbar';

interface CallLog {
  _id: string;
  roomId: string;
  participants: string[];
  startTime: string;
  endTime: string;
  duration: number;
}

export default function History() {
  const router = useRouter();
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth');
      return;
    }

    fetchCallHistory(token);
  }, [router]);

  const fetchCallHistory = async (token: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
      console.log('📊 Fetching call history from:', `${apiUrl}/api/call-logs`);
      
      const res = await fetch(`${apiUrl}/api/call-logs`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📊 Response status:', res.status);

      if (res.ok) {
        const data = await res.json();
        console.log('✅ Call logs received:', data);
        setCallLogs(data.callLogs || data.data || []);
      } else {
        const errorText = await res.text();
        console.error('❌ Failed to fetch call history:', res.status, errorText);
      }
    } catch (error) {
      console.error('💥 Error fetching call history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handleLogout = () => {
    api.clearToken();
    router.push('/auth');
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center relative"
      style={{
        backgroundImage: "url('https://i.postimg.cc/P5w0yP5X/ds.png')",
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
            <a href="/dashboard" className="text-white hover:text-gray-300 transition-colors">
              Dashboard
            </a>
            <a href="/history" className="text-white hover:text-gray-300 transition-colors">
              History
            </a>
            <a href="/about" className="text-white hover:text-gray-300 transition-colors">
              About
            </a>
            <a href="/profile" className="text-white hover:text-gray-300 transition-colors">
              Profile
            </a>
            <AnimatedButton onClick={handleLogout} size="sm" className="w-full">
              Logout
            </AnimatedButton>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-16 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-white mb-4 tracking-tight drop-shadow-lg">
            Call History
          </h2>
          <p className="text-lg text-gray-200">View your past video calls and meetings</p>
        </div>

        {loading ? (
          <Card className="bg-white/10 backdrop-blur-md border-white/20 p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            <p className="text-white mt-4">Loading call history...</p>
          </Card>
        ) : callLogs.length === 0 ? (
          <Card className="bg-white/10 backdrop-blur-md border-white/20 p-12 text-center">
            <div className="w-24 h-24 bg-black/50 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <img src="/zetra-logo.svg" alt="Zetra" className="w-16 h-16" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-2">No Call History</h3>
            <p className="text-gray-200 mb-6">You haven't made any calls yet</p>
            <AnimatedButton onClick={() => router.push('/dashboard')} size="lg">
              Start Your First Call
            </AnimatedButton>
          </Card>
        ) : (
          <div className="space-y-4">
            {callLogs.map((log) => (
              <Card
                key={log._id}
                className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-white font-semibold text-lg">Room ID:</span>
                        <code className="text-sm text-gray-200 bg-white/10 px-3 py-1 rounded-lg">
                          {log.roomId}
                        </code>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-200">
                        <span>👥 {log.participants.length} participant{log.participants.length !== 1 ? 's' : ''}</span>
                        <span>🕐 {formatDate(log.startTime)}</span>
                        <span>⏱️ {formatDuration(log.duration)}</span>
                      </div>
                    </div>
                    <AnimatedButton
                      onClick={() => router.push(`/room/${log.roomId}`)}
                      size="md"
                    >
                      Rejoin Room
                    </AnimatedButton>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
