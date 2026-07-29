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
        <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-2 sm:gap-4 z-10">
          <img src="/zetra-logo.svg" alt="Zetra" className="w-10 h-10 sm:w-16 sm:h-16" />
          <h2 className="text-white text-2xl sm:text-4xl font-bold">Zetra</h2>
        </div>

        {/* Center Content */}
        <div className="text-center px-4 w-full max-w-2xl sm:w-[85%] md:w-[75%] lg:w-[60%] relative z-10 py-12">
          <h1 className="garamond-font text-3xl sm:text-5xl lg:text-6xl font-normal text-white drop-shadow-lg leading-tight">
            Connect Seamlessly, <span className="garamond-italic">Communicate Effortlessly!</span>
          </h1>
          <p className="text-white text-xs sm:text-sm mt-4 sm:mt-6 opacity-90">
            Experience crystal-clear video calls powered by WebRTC technology
          </p>
          <button 
            onClick={() => window.location.href = '/auth'}
            className="mt-6 sm:mt-8 px-5 sm:px-6 py-2.5 sm:py-3 bg-black text-white text-sm sm:text-base font-normal rounded-2xl hover:bg-gray-900 transition duration-300"
          >
            Get Started For Free →
          </button>
        </div>

      
      </div>
  );
}
