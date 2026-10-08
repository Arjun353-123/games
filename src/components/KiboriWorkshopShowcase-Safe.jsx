import React from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, Sparkles, ExternalLink } from 'lucide-react';

// Safe placeholder for Kibori Workshop until the 3D component is fixed
export default function KiboriWorkshopShowcaseSafe({ onLaunchFullscreen }) {
  return (
    <motion.section
      id="kibori-workshop-stage"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="mb-10 relative"
      aria-label="3D Cyber Gaming Arena Stage"
    >
      <div className="relative rounded-3xl overflow-hidden border border-cyan-500/35 bg-gradient-to-br from-[#0a1128] via-[#101938] to-[#0b1026] shadow-[0_16px_50px_rgba(6,182,212,0.2),0_0_1px_1px_rgba(56,189,248,0.25)]">
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-gradient-to-r from-[#0a1128]/95 via-[#101938]/95 to-[#0b1026]/95 border-b border-cyan-500/25 backdrop-blur-md z-20 relative">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0e1d42] to-[#1c0f38] border border-cyan-400/50 flex items-center justify-center text-cyan-400 shadow-inner">
              <Gamepad2 className="w-5 h-5 drop-shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-extrabold text-sm md:text-base text-white tracking-wider">
                  KIBORI 3D CYBER GAMING ARENA
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 font-mono font-bold flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 animate-pulse text-cyan-400" /> FEATURED
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-light">
                Interactive 3D gaming experiences with real-time physics and cyber environments
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/landing-pages/kibori.html"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-white transition-all flex items-center gap-1.5 shadow-[0_2px_12px_rgba(6,182,212,0.35)] cursor-pointer font-mono"
              title="Open 3D arena in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Launch Arena</span>
            </a>
          </div>
        </div>

        {/* Placeholder Content */}
        <div className="relative h-[500px] flex items-center justify-center bg-gradient-to-br from-[#070b1a] via-[#0d1428] to-[#0a0f24]">
          {/* Animated Grid Background */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.1)_1px,transparent_1px)] bg-[size:50px_50px]" />
          </div>

          {/* Floating Particles */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-cyan-400 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -20, 0],
                  opacity: [0.3, 1, 0.3],
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>

          {/* Center Content */}
          <div className="relative z-10 text-center px-6 space-y-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-24 h-24 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-600/20 border border-cyan-400/50 flex items-center justify-center backdrop-blur-sm">
                <Gamepad2 className="w-12 h-12 text-cyan-400 drop-shadow-[0_0_20px_rgba(6,182,212,0.8)]" />
              </div>
            </motion.div>

            <div className="space-y-3">
              <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-purple-400 tracking-wider">
                8 INTERACTIVE 3D GAMES
              </h3>
              <p className="text-slate-300 text-sm max-w-md mx-auto leading-relaxed">
                Experience high-octane 3D gaming with Temple Runner, Vice City Open World, Neon Racer, Cyber Snake, and more!
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 pt-4">
              <a
                href="/landing-pages/kibori.html"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-white font-bold text-sm transition-all shadow-[0_4px_20px_rgba(6,182,212,0.4)] flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Launch Full Arena
              </a>
              
              <button
                onClick={() => document.getElementById('games-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-all border border-white/20 flex items-center gap-2"
              >
                <Gamepad2 className="w-4 h-4" />
                Browse Games Below
              </button>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center gap-2 pt-4">
              {['WebGL 3D', 'Real-time Physics', 'High Scores', 'Mobile Ready'].map((feature, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-mono font-bold"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
