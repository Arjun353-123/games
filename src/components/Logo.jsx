import React from 'react';
import { Sparkles, Gamepad2 } from 'lucide-react';

export default function Logo({ mode = 'college', size = 'normal' }) {
  const isKidsMode = mode === 'kids';
  const isNoirMode = mode === 'noir';

  return (
    <div className="flex items-center gap-3 select-none">
      {/* 3D Cyber Gaming Emblem */}
      <div
        className={`relative p-2.5 rounded-2xl shadow-xl transition-transform hover:scale-105 duration-300 flex items-center justify-center ${
          isKidsMode
            ? 'bg-gradient-to-tr from-pink-400 via-purple-400 to-amber-400 text-white font-kids border-2 border-pink-200'
            : isNoirMode
            ? 'bg-white text-black font-extrabold border-2 border-white shadow-[0_0_20px_rgba(255,255,255,0.6)]'
            : 'bg-gradient-to-br from-[#0c1424] via-[#111936] to-[#1c0f2e] text-cyan-400 border border-cyan-400/40 shadow-[0_0_25px_rgba(6,182,212,0.35)]'
        }`}
      >
        <Gamepad2 className="w-6 h-6 text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
        <span className="w-2 h-2 rounded-full bg-cyan-400 absolute -top-0.5 -right-0.5 animate-ping" />
      </div>

      {/* Brand Text */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <h1
            className={`text-lg md:text-xl font-black tracking-wider leading-none ${
              isKidsMode
                ? 'font-kids text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-amber-500'
                : isNoirMode
                ? 'font-retro text-base text-white neon-text-noir tracking-wider'
                : 'font-heading font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-fuchsia-400 tracking-wider text-xl'
            }`}
          >
            KIBORI <span className="text-amber-400 font-mono text-sm tracking-normal">GAMING</span>
          </h1>
        </div>
        <span
          className={`text-[9px] font-mono tracking-[0.2em] uppercase mt-0.5 ${
            isKidsMode
              ? 'text-pink-600 font-kids'
              : isNoirMode
              ? 'text-zinc-400 tracking-wider'
              : 'text-cyan-300/70'
          }`}
        >
          {isKidsMode ? 'KIDS PLAYLAND 3D' : isNoirMode ? 'MONOCHROME NOIR ARCADE' : '3D CYBER ARCADE & GAMING UNIVERSE'}
        </span>
      </div>
    </div>
  );
}

