
import React from 'react';
import InteractiveDotGrid from './InteractiveDotGrid';

const BackgroundEffects: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {/* Deep Base Gradient */}
      <div className="absolute inset-0 bg-[#047CD2]" />
      
      {/* Interactive Magnetic Dot Grid */}
      <InteractiveDotGrid />

      {/* Top Left Green Glow */}
      <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-[#0ea879]/30 blur-[150px]" />
      
      {/* Center Blue Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] rounded-full bg-[#0f6fb8]/20 blur-[180px]" />
      
      {/* Bright Central Point */}
      <div className="absolute top-[30%] left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-[#2dd4bf]/10 blur-[100px]" />

      {/* Animated Light Streaks (Stars/Comets) */}
      <svg className="absolute inset-0 w-full h-full opacity-30">
        <defs>
          <linearGradient id="streakGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="50%" stopColor="white" stopOpacity="0.4" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>
        <line x1="20%" y1="10%" x2="35%" y2="25%" stroke="url(#streakGradient)" strokeWidth="0.5" transform="rotate(15 200 100)" />
        <line x1="70%" y1="20%" x2="85%" y2="35%" stroke="url(#streakGradient)" strokeWidth="0.5" transform="rotate(-15 700 200)" />
        <line x1="10%" y1="80%" x2="25%" y2="95%" stroke="url(#streakGradient)" strokeWidth="0.5" />
      </svg>
      
      {/* Thin Orbit Lines */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.05]">
        <div className="w-[80vw] h-[80vw] border border-white rounded-full scale-[1.5] -rotate-12" />
        <div className="absolute w-[60vw] h-[60vw] border border-white rounded-full scale-[1.2] rotate-6" />
      </div>
    </div>
  );
};

export default BackgroundEffects;
