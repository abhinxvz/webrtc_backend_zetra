'use client';

import React from 'react';

export default function Hero() {
  return (
    <div
        className="flex flex-col items-center justify-center min-h-screen bg-cover bg-center relative"
        style={{ backgroundImage: "url('https://images.hdqwalls.com/wallpapers/shooting-stars-s8.jpg')" }}
      >
        {/* Background overlay to slightly dim the image */}
        <div className="absolute inset-0 bg-black/55 pointer-events-none" />
        {/* Top-left Logo */}
        <div className="absolute top-6 left-6 flex items-center gap-4 z-10">
          <img src="/zetra-logo.svg" alt="Zetra" className="w-16 h-16" />
          <h2 className="text-white text-4xl font-bold">Zetra</h2>
        </div>

        {/* Center Content */}
        <div className="text-center px-4 w-[60%] relative z-10">
          <h1 className="garamond-font text-6xl font-normal text-white drop-shadow-lg">
            Connect Seamlessly, <span className="garamond-italic">Communicate Effortlessly!</span>
          </h1>
          <p className="text-white text-sm mt-6 opacity-90">
            Experience crystal-clear video calls powered by WebRTC technology
          </p>
          <button 
            onClick={() => window.location.href = '/auth'}
            className="mt-8 px-6 py-3 bg-black text-white font-normal rounded-2xl hover:bg-gray-900 transition duration-300"
          >
            Get Started For Free →
          </button>
        </div>

        {/* Footer Credit */}
        <div className="absolute bottom-12 z-10">
          <p className="garamond-italic text-black text-base font-bold">
            Made by <a href="https://github.com/abhinxvz" target="_blank" rel="noopener noreferrer" className="hover:underline hover:opacity-70 transition">Abhinav</a>
          </p>
        </div>
      </div>
  );
}
