'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MagicCard } from '@/components/ui/magic-card';
import { api } from '@/lib/api';

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let response;
      
      if (isLogin) {
        response = await api.login(formData.email, formData.password);
      } else {
        response = await api.register(formData.username, formData.email, formData.password);
      }

      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        api.setToken(response.data.token);
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
        className="relative min-h-screen flex items-center justify-center bg-cover bg-center p-4"
        style={{
          backgroundImage:
            "url('https://images.hdqwalls.com/download/planet-pixel-art-4k-3p-1280x720.jpg')",
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

        {/* Logo */}
        <div className="absolute top-6 left-6 z-10 flex items-center gap-4">
          <img src="/zetra-logo.svg" alt="Zetra" className="w-16 h-16" />
          <h1 className="text-white text-4xl font-bold">Zetra</h1>
        </div>

        <MagicCard 
          className="w-full max-w-md z-10 rounded-3xl border-white/20 shadow-2xl"
          gradientSize={300}
          gradientColor="#ffffff"
          gradientOpacity={0.3}
          gradientFrom="#ffffff"
          gradientTo="#a855f7"
        >
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="garamond-italic text-3xl font-normal tracking-tight text-white">
              {isLogin ? 'Welcome back' : 'Create account'}
            </CardTitle>
          <CardDescription className="text-base text-gray-200">
            {isLogin
              ? 'Sign in to continue to your account'
              : 'Sign up to get started with video calls'}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-white">Username</label>
                <Input
                  type="text"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required={!isLogin}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-300 backdrop-blur-sm"
                />
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-white">Email</label>
              <Input
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-300 backdrop-blur-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-white">Password</label>
              <Input
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-300 backdrop-blur-sm"
              />
            </div>
            {error && (
              <div className="bg-red-500/20 backdrop-blur-sm border-2 border-red-400/50 text-red-100 px-4 py-3 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full bg-black hover:bg-gray-900 text-white shadow-lg" size="lg" disabled={loading}>
              {loading ? 'Please wait...' : isLogin ? 'Sign in' : 'Create account'}
            </Button>
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-sm text-gray-200 hover:text-white font-medium transition-colors"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : 'Already have an account? Sign in'}
            </button>
          </CardFooter>
        </form>
      </MagicCard>
    </div>
  );
}
