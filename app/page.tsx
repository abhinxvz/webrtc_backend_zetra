'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Hero from '@/components/Hero';

export default function Home() {
  const router = useRouter();
  const [showHero, setShowHero] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      router.push('/dashboard');
    } else {
      setShowHero(true);
    }
  }, [router]);

  if (!showHero) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return <Hero />;
}
