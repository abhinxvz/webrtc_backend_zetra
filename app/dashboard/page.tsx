'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
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
  MobileNavToggle,
  NavbarButton 
} from '@/components/ui/resizable-navbar';


interface MeetingSummary {
  _id: string;
  roomId: string;
  username: string;
  summary: string;
  keyPoints: string[];
  actionItems: string[];
  duration: number;
  startTime: string;
  createdAt: string;
}

export default function Dashboard() {
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [recentSummaries, setRecentSummaries] = useState<MeetingSummary[]>([]);
  const [summariesLoading, setSummariesLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      router.push('/auth');
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const uid = payload.userId || 'anonymous';
      setUserId(uid);

      // Fetch user profile
      api.getProfile().then((response) => {
        if (response.data) {
          setUsername(response.data.user.username);
        }
      });

      // Fetch recent summaries
      fetchRecentSummaries(uid);
      
      // Fetch dashboard stats
      fetchDashboardStats();
    } catch (error) {
      console.error('Token decode error:', error);
    }
  }, [router]);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
      
      console.log('Fetching dashboard stats from:', `${apiUrl}/api/call-logs/dashboard`);
      
      const response = await fetch(`${apiUrl}/api/call-logs/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.warn('Dashboard stats not available:', response.status);
        setDashboardStats(null);
        return;
      }

      const data = await response.json();
      console.log('Dashboard stats received:', data);
      
      if (data.success) {
        setDashboardStats(data.data);
      } else {
        setDashboardStats(null);
      }
    } catch (error) {
      console.log('Dashboard stats endpoint not available (this is optional)');
      setDashboardStats(null);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchRecentSummaries = async (uid: string) => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
      
      console.log('Fetching summaries from:', `${apiUrl}/api/meeting-summary/user/${uid}`);
      
      const response = await fetch(
        `${apiUrl}/api/meeting-summary/user/${uid}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        console.warn('Summaries not available:', response.status);
        setRecentSummaries([]);
        return;
      }

      const data = await response.json();
      if (data.success) {
        setRecentSummaries(data.data.slice(0, 3)); // Only show 3 most recent
      } else {
        setRecentSummaries([]);
      }
    } catch (error) {
      console.log('Summaries endpoint not available (this is optional)');
      setRecentSummaries([]);
    } finally {
      setSummariesLoading(false);
    }
  };

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
              { name: 'Summaries', link: '/summaries' },
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
            <a href="/summaries" className="text-white hover:text-gray-300 transition-colors">Summaries</a>
            <a href="/profile" className="text-white hover:text-gray-300 transition-colors">Profile</a>
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
            Welcome back, {username || 'User'}!
          </h2>
          <p className="text-lg text-gray-200 max-w-2xl mx-auto">
            Here's your call activity overview
          </p>
        </div>

        {/* Dashboard Stats */}
        {!statsLoading && dashboardStats && (
          <div className="mb-12">
            {/* Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader className="pb-2">
                  <CardDescription className="text-gray-300 text-xs">Total Calls</CardDescription>
                  <CardTitle className="text-3xl text-white">{dashboardStats.overview?.totalCalls || 0}</CardTitle>
                </CardHeader>
              </Card>
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader className="pb-2">
                  <CardDescription className="text-gray-300 text-xs">Completed</CardDescription>
                  <CardTitle className="text-3xl text-white">{dashboardStats.overview?.completedCalls || 0}</CardTitle>
                </CardHeader>
              </Card>
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader className="pb-2">
                  <CardDescription className="text-gray-300 text-xs">Active Now</CardDescription>
                  <CardTitle className="text-3xl text-green-400">{dashboardStats.overview?.activeCalls || 0}</CardTitle>
                </CardHeader>
              </Card>
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader className="pb-2">
                  <CardDescription className="text-gray-300 text-xs">Avg Duration</CardDescription>
                  <CardTitle className="text-3xl text-white">
                    {Math.floor((dashboardStats.overview?.averageDuration || 0) / 60)}m
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>

            {/* Time Period Stats */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <Card className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Today</CardTitle>
                  <CardDescription className="text-gray-200">
                    {dashboardStats.today?.calls || 0} calls • {Math.floor((dashboardStats.today?.duration || 0) / 60)}m
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="bg-gradient-to-br from-green-500/20 to-teal-500/20 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-white text-lg">This Week</CardTitle>
                  <CardDescription className="text-gray-200">
                    {dashboardStats.thisWeek?.calls || 0} calls • {Math.floor((dashboardStats.thisWeek?.duration || 0) / 60)}m
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-white text-lg">This Month</CardTitle>
                  <CardDescription className="text-gray-200">
                    {dashboardStats.thisMonth?.calls || 0} calls • {Math.floor((dashboardStats.thisMonth?.duration || 0) / 60)}m
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        )}

        <div className="text-center mb-8">
          <h3 className="text-3xl font-bold text-white mb-2">Start your video call</h3>
          <p className="text-gray-200">Create a new room or join an existing one</p>
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
                onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
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

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-6 mb-16">
          <Card className="text-center bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="pt-8 pb-8">
              <div className="text-4xl font-bold text-white mb-2">0</div>
              <div className="text-sm text-gray-200 font-medium">Total calls</div>
            </CardContent>
          </Card>
          <Card className="text-center bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="pt-8 pb-8">
              <div className="text-4xl font-bold text-white mb-2">{recentSummaries.length}</div>
              <div className="text-sm text-gray-200 font-medium">AI Summaries</div>
            </CardContent>
          </Card>
          <Card className="text-center bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="pt-8 pb-8">
              <div className="text-4xl font-bold text-white mb-2">0m</div>
              <div className="text-sm text-gray-200 font-medium">Total duration</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent AI Summaries */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-3xl font-bold text-white">Recent AI Summaries</h3>
            <AnimatedButton
              onClick={() => router.push('/summaries')}
              size="md"
            >
              View All
            </AnimatedButton>
          </div>

          {summariesLoading ? (
            <Card className="bg-white/10 backdrop-blur-md border-white/20 p-8 text-center">
              <p className="text-white">Loading summaries...</p>
            </Card>
          ) : recentSummaries.length === 0 ? (
            <Card className="bg-white/10 backdrop-blur-md border-white/20 p-8 text-center">
              <div className="w-16 h-16 bg-black/50 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                <img src="/zetra-logo.svg" alt="Zetra" className="w-10 h-10" />
              </div>
              <p className="text-white text-lg font-semibold mb-2">No AI summaries yet</p>
              <p className="text-gray-300 text-sm">
                Start a meeting and use the AI summarizer to create your first summary
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {recentSummaries.map((summary) => (
                <Card
                  key={summary._id}
                  className="bg-white/10 backdrop-blur-md border-white/20 p-6 hover:border-white/40 transition-all cursor-pointer"
                  onClick={() => router.push('/summaries')}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-lg font-bold text-white mb-1">
                        Meeting Summary
                      </h4>
                      <p className="text-sm text-gray-300">
                        Room: {summary.roomId.substring(0, 8)}... • {' '}
                        {new Date(summary.startTime).toLocaleDateString()} at{' '}
                        {new Date(summary.startTime).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                    <div className="bg-black/50 px-3 py-1 rounded-full">
                      <span className="text-white text-xs font-semibold">
                        {Math.floor(summary.duration / 60)}m {summary.duration % 60}s
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-gray-200 text-sm line-clamp-2">
                        {summary.summary}
                      </p>
                    </div>

                    {summary.keyPoints && summary.keyPoints.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {summary.keyPoints.slice(0, 2).map((point, idx) => (
                          <span
                            key={idx}
                            className="bg-white/10 text-gray-200 text-xs px-3 py-1 rounded-full"
                          >
                            • {point.substring(0, 40)}...
                          </span>
                        ))}
                        {summary.keyPoints.length > 2 && (
                          <span className="bg-white/10 text-gray-200 text-xs px-3 py-1 rounded-full">
                            +{summary.keyPoints.length - 2} more
                          </span>
                        )}
                      </div>
                    )}

                    {summary.actionItems && summary.actionItems.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <span className="text-white font-bold">→</span>
                        <span>{summary.actionItems.length} action item{summary.actionItems.length > 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
