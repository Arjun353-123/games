import React from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, X, ExternalLink, Sparkles } from 'lucide-react';

export default function KiboriSceneModalSafe({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#060814] text-white select-none">
      {/* Top Header Bar */}
      <header className="flex items-center justify-between px-6 py-3.5 border-b border-cyan-500/20 bg-[#060814]/95 backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
          <Gamepad2 className="w-5 h-5 text-cyan-400" />
          <span className="text-sm font-extrabold tracking-wider text-white">KIBORI — 3D CYBER ARENA</span>
          <span className="hidden sm:inline-block text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-mono">
            FEATURED GAMES
          </span>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="/landing-pages/kibori.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold px-3.5 py-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white transition-all flex items-center gap-1.5"
          >
            <ExternalLink className="w-3 h-3" />
            Open 3D Arena
          </a>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer flex items-center gap-1.5"
          >
            <X className="w-3.5 h-3.5" />
            <span>Close</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative flex-1 w-full h-full overflow-hidden bg-gradient-to-br from-[#070b1a] via-[#0d1428] to-[#0a0f24] flex items-center justify-center">
        {/* Animated Grid Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.2)_1px,transparent_1px)] bg-[size:60px_60px]" />
        </div>

        {/* Animated Particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-cyan-400"
              style={{
                width: `${2 + Math.random() * 3}px`,
                height: `${2 + Math.random() * 3}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 1, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 4 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Center Content */}
        <div className="relative z-10 text-center px-8 max-w-3xl space-y-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* Icon */}
            <div className="w-32 h-32 mx-auto rounded-3xl bg-gradient-to-br from-cyan-500/20 to-purple-600/20 border-2 border-cyan-400/50 flex items-center justify-center backdrop-blur-sm shadow-[0_0_50px_rgba(6,182,212,0.3)]">
              <Gamepad2 className="w-16 h-16 text-cyan-400 drop-shadow-[0_0_20px_rgba(6,182,212,1)]" />
            </div>

            {/* Title */}
            <div className="space-y-3">
              <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-purple-400 tracking-wider">
                KIBORI GAMING UNIVERSE
              </h1>
              <p className="text-xl text-slate-300 font-light max-w-2xl mx-auto">
                8 Interactive 3D Gaming Experiences
              </p>
            </div>

            {/* Description */}
            <p className="text-slate-400 text-base max-w-xl mx-auto leading-relaxed">
              Experience cinematic 3D environments with real-time WebGL rendering, physics-based gameplay, and immersive cyber aesthetics across multiple gaming genres.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <a
                href="/landing-pages/kibori.html"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-white font-black text-base transition-all shadow-[0_6px_30px_rgba(6,182,212,0.5)] flex items-center gap-3"
              >
                <ExternalLink className="w-5 h-5" />
                Launch Full 3D Arena
              </a>

              <button
                onClick={onClose}
                className="px-8 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-base transition-all border-2 border-white/20 flex items-center gap-3"
              >
                <Gamepad2 className="w-5 h-5" />
                Browse Games
              </button>
            </div>

            {/* Feature Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8">
              {[
                { icon: '🎮', label: '8 Games' },
                { icon: '🌐', label: 'WebGL 3D' },
                { icon: '⚡', label: 'Real-time Physics' },
                { icon: '🏆', label: 'High Scores' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-400/20 backdrop-blur-sm"
                >
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <div className="text-sm text-cyan-300 font-bold">{item.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Game List */}
            <div className="pt-6 space-y-3">
              <div className="flex items-center justify-center gap-2 text-cyan-400">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-mono font-bold tracking-wider uppercase">Available Games</span>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  'Vice City 3D',
                  'Neon Racer',
                  'Temple Runner',
                  'Cyber Snake',
                  'Neon OX',
                  'Flappy Bird',
                  'Brick Breaker',
                  'Cyber Bird'
                ].map((game, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-400/30 text-purple-300 text-xs font-mono"
                  >
                    {game}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
