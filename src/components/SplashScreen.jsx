import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, Sparkles } from 'lucide-react';

export default function SplashScreen({ onComplete, mode = 'college' }) {
  const [progress, setProgress] = useState(0);
  const isKidsMode = mode === 'kids';
  const isNoirMode = mode === 'noir';

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 400);
          return 100;
        }
        return p + 4;
      });
    }, 40);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.5 }}
        className={`fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden ${
          isKidsMode
            ? 'bg-gradient-to-br from-pink-100 via-purple-50 to-amber-100'
            : isNoirMode
            ? 'bg-black'
            : 'bg-slate-950'
        }`}
      >
        {/* Aurora background */}
        {!isNoirMode && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className={`aurora-blob absolute -top-1/2 -left-1/4 w-[600px] h-[600px] rounded-full blur-[100px] opacity-40 ${
              isKidsMode ? 'bg-pink-400' : 'bg-blue-600'
            }`} />
            <div className={`aurora-blob absolute -bottom-1/2 -right-1/4 w-[500px] h-[500px] rounded-full blur-[100px] opacity-30 animation-delay-2000 ${
              isKidsMode ? 'bg-amber-400' : 'bg-purple-600'
            }`} />
          </div>
        )}

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="relative z-10 flex flex-col items-center gap-8"
        >
          <motion.div
            animate={{ rotate: [0, 5, -5, 0], y: [0, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className={`p-6 rounded-3xl shadow-2xl ${
              isKidsMode
                ? 'bg-gradient-to-tr from-pink-400 via-purple-400 to-amber-400'
                : isNoirMode
                ? 'bg-white text-black border-2 border-white shadow-[0_0_40px_rgba(255,255,255,0.5)]'
                : 'bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 neon-border-blue'
            }`}
          >
            <Gamepad2 className={`w-16 h-16 ${isNoirMode ? 'text-black' : 'text-white'}`} />
            <Sparkles className="w-5 h-5 absolute top-2 right-2 text-amber-300 animate-pulse" />
          </motion.div>

          <div className="text-center space-y-2">
            <h1 className={`text-3xl md:text-4xl font-black tracking-tight ${
              isKidsMode
                ? 'font-kids text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600'
                : isNoirMode
                ? 'font-retro text-white neon-text-noir text-2xl'
                : 'font-retro text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 text-2xl'
            }`}>
              ARCADE UNIVERSE
            </h1>
            <p className={`text-sm font-semibold tracking-widest uppercase ${
              isNoirMode ? 'text-zinc-500' : isKidsMode ? 'text-pink-600' : 'text-cyan-400/80'
            }`}>
              Loading your 3D experience...
            </p>
          </div>

          {/* Progress bar */}
          <div className={`w-64 h-1.5 rounded-full overflow-hidden ${
            isNoirMode ? 'bg-zinc-800' : isKidsMode ? 'bg-pink-200' : 'bg-slate-800'
          }`}>
            <motion.div
              className={`h-full rounded-full ${
                isKidsMode
                  ? 'bg-gradient-to-r from-pink-500 to-amber-400'
                  : isNoirMode
                  ? 'bg-white'
                  : 'bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500'
              }`}
              style={{ width: `${progress}%` }}
              transition={{ ease: 'easeOut' }}
            />
          </div>
          <span className={`text-xs font-bold tabular-nums ${isNoirMode ? 'text-zinc-600' : 'text-slate-500'}`}>
            {progress}%
          </span>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
