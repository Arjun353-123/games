import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, Sparkles, Zap } from 'lucide-react';

export default function SplashScreen({ onComplete, mode = 'college' }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 450);
          return 100;
        }
        return p + 3;
      });
    }, 35);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.03 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-[#060814] text-white select-none"
      >
        {/* Ambient radial cyber glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.25)_0%,rgba(147,51,234,0.15)_45%,transparent_70%)] blur-[40px]" />
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.15)_0%,transparent_60%)] blur-[50px]" />
          <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />
        </div>

        {/* Floating Cyber Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(16)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-cyan-400"
              initial={{
                x: `${15 + (i * 5) % 70}vw`,
                y: '105vh',
                opacity: 0,
                scale: 0.5,
              }}
              animate={{
                y: '-10vh',
                opacity: [0, 0.8, 1, 0.4, 0],
                x: `${15 + ((i * 5) % 70) + Math.sin(i) * 8}vw`,
                scale: [0.5, 1.2, 0.8],
              }}
              transition={{
                duration: 3 + (i % 4) * 0.8,
                repeat: Infinity,
                delay: (i * 0.25) % 3,
                ease: 'easeOut',
              }}
              style={{
                width: `${2 + (i % 3) * 1.5}px`,
                height: `${2 + (i % 3) * 1.5}px`,
                boxShadow: '0 0 10px #06b6d4',
              }}
            />
          ))}
        </div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 180, damping: 22 }}
          className="relative z-10 flex flex-col items-center gap-7 px-6 max-w-lg text-center"
        >
          {/* Cyber Gaming Emblem */}
          <div className="relative group">
            <motion.div
              animate={{
                boxShadow: [
                  '0 0 25px rgba(6,182,212,0.35)',
                  '0 0 50px rgba(168,85,247,0.5)',
                  '0 0 25px rgba(6,182,212,0.35)'
                ],
                scale: [1, 1.02, 1]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="w-24 h-24 rounded-3xl border border-cyan-400/50 bg-gradient-to-br from-[#0b132b] via-[#101b3b] to-[#1c0f38] flex flex-col items-center justify-center p-3 relative overflow-hidden backdrop-blur-md"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.25)_0%,transparent_75%)]" />
              <Gamepad2 className="w-12 h-12 text-cyan-400 relative z-10 drop-shadow-[0_0_12px_rgba(6,182,212,0.8)]" />
              <span className="text-[9px] uppercase tracking-[0.25em] text-cyan-300/80 mt-1 relative z-10 font-mono font-bold">
                GAMING
              </span>
            </motion.div>

            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute -inset-2 rounded-[28px] border border-cyan-400/30 border-dashed pointer-events-none"
            />
          </div>

          {/* Typography */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-cyan-400/40 bg-cyan-500/10 text-cyan-300 text-[11px] font-semibold tracking-widest uppercase font-mono">
              <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>3D CYBER ARCADE & GAMING UNIVERSE</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-purple-400 pt-1 font-heading">
              K I B O R I
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 font-light tracking-wide max-w-sm mx-auto leading-relaxed">
              Eight interactive 3D gaming realms, high-octane physics, and real-time cyber stages.
            </p>
          </div>

          {/* Glowing cyber progress bar */}
          <div className="w-72 sm:w-80 space-y-2">
            <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-white/10 p-0.5">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-sky-400 to-purple-500 shadow-[0_0_12px_rgba(6,182,212,0.8)]"
                style={{ width: `${progress}%` }}
                transition={{ ease: 'easeOut' }}
              />
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-400 tracking-wider font-mono">
              <span className="flex items-center gap-1 text-cyan-300">
                <Sparkles className="w-3 h-3" /> Initializing 3D engine…
              </span>
              <span className="font-bold text-white">{progress}%</span>
            </div>
          </div>

          {/* Skip / Enter Action */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={onComplete}
              className="text-xs font-semibold px-4 py-1.5 rounded-full border border-white/20 hover:border-cyan-400 hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer font-mono"
            >
              Skip to Arcade Hub →
            </button>
            <a
              href="/login.html"
              className="text-xs font-semibold px-4 py-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-white font-bold transition-all shadow-[0_0_16px_rgba(6,182,212,0.5)] font-mono"
            >
              Player Sign In ↗
            </a>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
