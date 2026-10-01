import React from 'react';
import { Gamepad2, Sparkles } from 'lucide-react';

export default function Logo({ mode = 'college', size = 'normal' }) {
  const isKidsMode = mode === 'kids';
  const isNoirMode = mode === 'noir';

  return (
    <div className="flex items-center gap-3 select-none">
      {/* 3D Animated Logo Icon */}
      <div
        className={`relative p-2.5 rounded-2xl shadow-xl transition-transform hover:scale-105 duration-300 flex items-center justify-center ${
          isKidsMode
            ? 'bg-gradient-to-tr from-pink-400 via-purple-400 to-amber-400 text-white font-kids border-2 border-pink-200'
            : isNoirMode
            ? 'bg-white text-black font-extrabold border-2 border-white shadow-[0_0_20px_rgba(255,255,255,0.6)]'
            : 'bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 text-cyan-200 neon-border-blue border border-cyan-300/40'
        }`}
      >
        <Gamepad2 className="w-7 h-7 animate-bounce" />
        <Sparkles className="w-3.5 h-3.5 absolute -top-1 -right-1 text-amber-300 animate-pulse" />
      </div>

      {/* Brand Text */}
      <div className="flex flex-col">
        <h1
          className={`text-xl md:text-2xl font-black tracking-tight leading-none ${
            isKidsMode
              ? 'font-kids text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-amber-500'
              : isNoirMode
              ? 'font-retro text-lg text-white neon-text-noir tracking-wider'
              : 'font-retro text-lg text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400'
          }`}
        >
          ARCADE UNIVERSE
        </h1>
        <span
          className={`text-[10px] font-extrabold tracking-widest uppercase mt-0.5 ${
            isKidsMode
              ? 'text-pink-600 font-kids'
              : isNoirMode
              ? 'text-zinc-400 tracking-wider'
              : 'text-cyan-400/90'
          }`}
        >
          {isKidsMode ? '🎈 KIDS PLAYLAND 3D' : isNoirMode ? '🖤 MONOCHROME NOIR' : '⚡ 3D GAMING APP'}
        </span>
      </div>
    </div>
  );
}
