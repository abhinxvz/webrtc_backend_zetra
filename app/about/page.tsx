'use client';

import { useState } from 'react';
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

export default function About() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      <div className="max-w-5xl mx-auto px-6 py-16 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="w-32 h-32 bg-black/50 rounded-3xl flex items-center justify-center mb-8 mx-auto">
            <img src="/zetra-logo.svg" alt="Zetra" className="w-24 h-24" />
          </div>
          <h1 className="text-6xl font-bold text-white mb-4 tracking-tight drop-shadow-lg">
            Zetra
          </h1>
          <p className="text-2xl text-gray-200 mb-2">Connect. Communicate. Collaborate.</p>
          <p className="text-lg text-gray-300">The future of video calling</p>
        </div>

        <div className="grid gap-6">
          {/* What is Zetra */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-3xl text-white">What is Zetra?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-200 text-lg">
              <p>
                Zetra is a modern, real-time video calling platform designed to bring people together
                seamlessly. Built with cutting-edge WebRTC technology, Zetra provides crystal-clear
                video and audio quality for your personal and professional communications.
              </p>
              <p>
                Whether you're connecting with friends, family, or colleagues, Zetra makes it simple
                to create or join video calls with just a few clicks.
              </p>
            </CardContent>
          </Card>

          {/* Key Features */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-3xl text-white">Key Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">🎥</span>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg mb-1">HD Video Quality</h3>
                      <p className="text-gray-300 text-sm">
                        Experience crystal-clear video calls with adaptive quality
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">🔒</span>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg mb-1">Secure & Private</h3>
                      <p className="text-gray-300 text-sm">
                        End-to-end encrypted connections for your privacy
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">💬</span>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg mb-1">Real-time Chat</h3>
                      <p className="text-gray-300 text-sm">
                        Send messages during calls with instant delivery
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">🖥️</span>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg mb-1">Screen Sharing</h3>
                      <p className="text-gray-300 text-sm">
                        Share your screen for presentations and collaboration
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">✨</span>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg mb-1">AI Summaries</h3>
                      <p className="text-gray-300 text-sm">
                        Get AI-powered meeting summaries and action items
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">📊</span>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg mb-1">Call History</h3>
                      <p className="text-gray-300 text-sm">
                        Track and review your past calls and meetings
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How It Works */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-3xl text-white">How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-xl">1</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg mb-2">Create or Join a Room</h3>
                  <p className="text-gray-300">
                    Start a new video call by creating a room, or join an existing one using a room ID
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-xl">2</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg mb-2">Connect Instantly</h3>
                  <p className="text-gray-300">
                    Share the room ID with others and they can join your call in seconds
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-xl">3</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg mb-2">Communicate Freely</h3>
                  <p className="text-gray-300">
                    Use video, audio, chat, and screen sharing to collaborate effectively
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Technology */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-3xl text-white">Built with Modern Technology</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-200">
              <p className="text-lg">
                Zetra is powered by industry-leading technologies to ensure the best experience:
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white/5 p-4 rounded-lg">
                  <h4 className="text-white font-semibold mb-2">WebRTC</h4>
                  <p className="text-sm text-gray-300">
                    Real-time peer-to-peer communication
                  </p>
                </div>
                <div className="bg-white/5 p-4 rounded-lg">
                  <h4 className="text-white font-semibold mb-2">Socket.IO</h4>
                  <p className="text-sm text-gray-300">
                    Instant bidirectional communication
                  </p>
                </div>
                <div className="bg-white/5 p-4 rounded-lg">
                  <h4 className="text-white font-semibold mb-2">Next.js</h4>
                  <p className="text-sm text-gray-300">
                    Fast, modern web framework
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <Card className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-md border-white/20">
            <CardContent className="p-12 text-center">
              <h2 className="text-4xl font-bold text-white mb-4">Ready to Connect?</h2>
              <p className="text-xl text-gray-200 mb-8">
                Start your first video call today and experience seamless communication
              </p>
              <AnimatedButton onClick={() => router.push('/dashboard')} size="lg">
                Go to Dashboard
              </AnimatedButton>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
