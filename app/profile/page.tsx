'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatedButton } from '@/components/ui/animated-button';
import { Input } from '@/components/ui/input';
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

export default function Profile() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [videoQuality, setVideoQuality] = useState('720p');
  const [audioQuality, setAudioQuality] = useState('high');
  const [notifications, setNotifications] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth');
      return;
    }

    // Fetch user profile from database
    fetchUserProfile();

    // Load settings from localStorage
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setVideoQuality(settings.videoQuality || '720p');
      setAudioQuality(settings.audioQuality || 'high');
      setNotifications(settings.notifications !== false);
    }
  }, [router]);

  const fetchUserProfile = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    
    // Decode token to get user data (same as history page)
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('Token payload:', payload);
        
        // Use the same fields as history page
        setUsername(payload.username || '');
        setEmail(payload.email || '');
        
        console.log('Username from token:', payload.username);
        console.log('Email from token:', payload.email);
      } catch (tokenError) {
        console.error('Token decode error:', tokenError);
      }
    }
    
    // Then try to fetch from API to update with latest data
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
      
      console.log('🌐 Fetching profile from:', `${apiUrl}/api/user/profile`);
      console.log('🔐 Token:', token ? 'Present' : 'Missing');
      
      const response = await fetch(`${apiUrl}/api/user/profile`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📊 Profile response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.warn('⚠️ API returned error:', response.status, errorText);
        console.log('✅ Using token data (already loaded above)');
        setLoading(false);
        return; // Token data already set, just return
      }

      const data = await response.json();
      console.log('✅ Profile data received from API:', data);

      // Update with API data if available (overrides token data)
      if (data.success && data.data && data.data.user) {
        setUsername(data.data.user.username || username);
        setEmail(data.data.user.email || email);
      } else if (data.user) {
        setUsername(data.user.username || username);
        setEmail(data.user.email || email);
      } else if (data.username && data.email) {
        setUsername(data.username || username);
        setEmail(data.email || email);
      }
    } catch (error) {
      console.warn('⚠️ API fetch failed:', error);
      console.log('✅ Using token data (already loaded above)');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }

    setPasswordLoading(true);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        alert('Password changed successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        alert(data.error || 'Failed to change password');
      }
    } catch (error) {
      alert('Server error');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSaveSettings = () => {
    const settings = {
      videoQuality,
      audioQuality,
      notifications,
    };
    localStorage.setItem('userSettings', JSON.stringify(settings));
    alert('Settings saved successfully');
  };

  const handleLogout = () => {
    api.clearToken();
    router.push('/auth');
  };

  if (loading) {
    return (
      <div
        className="min-h-screen bg-cover bg-center flex items-center justify-center"
        style={{
          backgroundImage: "url('https://i.postimg.cc/P5w0yP5X/ds.png')",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "url('https://www.transparenttextures.com/patterns/black-orchid.png')",
            opacity: 1,
            mixBlendMode: 'overlay',
          }}
        ></div>
        <p className="text-white text-xl relative z-10">Loading profile...</p>
      </div>
    );
  }

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
      <div className="max-w-5xl mx-auto px-6 py-16 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-white mb-4 tracking-tight drop-shadow-lg">
            Profile & Settings
          </h2>
          <p className="text-lg text-gray-200">Manage your account and preferences</p>
        </div>

        <div className="grid gap-6">
          {/* Profile Information */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Profile Information</CardTitle>
              <CardDescription className="text-gray-200">
                Your account details from registration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-white">Username</label>
                <Input
                  type="text"
                  value={username}
                  disabled
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-300 backdrop-blur-sm cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-white">Email</label>
                <Input
                  type="email"
                  value={email}
                  disabled
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-300 backdrop-blur-sm cursor-not-allowed"
                />
              </div>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Change Password</CardTitle>
              <CardDescription className="text-gray-200">
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-white">Current Password</label>
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-300 backdrop-blur-sm"
                    placeholder="Enter current password"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-white">New Password</label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-300 backdrop-blur-sm"
                    placeholder="Enter new password"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-white">Confirm New Password</label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-300 backdrop-blur-sm"
                    placeholder="Confirm new password"
                    required
                  />
                </div>
                <AnimatedButton type="submit" className="w-full" size="lg" disabled={passwordLoading}>
                  {passwordLoading ? 'Changing Password...' : 'Change Password'}
                </AnimatedButton>
              </form>
            </CardContent>
          </Card>

          {/* Video & Audio Settings */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Call Settings</CardTitle>
              <CardDescription className="text-gray-200">
                Configure your video and audio preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-white">Video Quality</label>
                <select
                  value={videoQuality}
                  onChange={(e) => setVideoQuality(e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
                >
                  <option value="360p" className="bg-gray-800">
                    360p (Low)
                  </option>
                  <option value="480p" className="bg-gray-800">
                    480p (Medium)
                  </option>
                  <option value="720p" className="bg-gray-800">
                    720p (HD)
                  </option>
                  <option value="1080p" className="bg-gray-800">
                    1080p (Full HD)
                  </option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-white">Audio Quality</label>
                <select
                  value={audioQuality}
                  onChange={(e) => setAudioQuality(e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
                >
                  <option value="low" className="bg-gray-800">
                    Low
                  </option>
                  <option value="medium" className="bg-gray-800">
                    Medium
                  </option>
                  <option value="high" className="bg-gray-800">
                    High
                  </option>
                </select>
              </div>
              <div className="flex items-center space-x-3 bg-white/5 p-4 rounded-lg">
                <input
                  type="checkbox"
                  id="notifications"
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                  className="w-5 h-5 text-white border-white/20 rounded focus:ring-white/50"
                />
                <label htmlFor="notifications" className="text-sm text-white font-medium">
                  Enable notifications
                </label>
              </div>
              <AnimatedButton onClick={handleSaveSettings} className="w-full" size="lg">
                Save Settings
              </AnimatedButton>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
