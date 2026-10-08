import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { KiboriLandingPage } from '@designcodeio/threeui';
import { Gamepad2, Maximize2, Minimize2, Sparkles, Zap, Eye, Compass, ExternalLink } from 'lucide-react';
import { soundFx } from '../utils/audio';

const GAMING_MODES = [
  { id: '01', name: 'Cyber Grid', code: 'MATRIX', desc: 'Real-time 3D vector arena' },
  { id: '02', name: 'Neon Drift', code: 'RACER', desc: 'High-speed synth highway' },
  { id: '03', name: 'Open World', code: 'VICE 3D', desc: 'Urban Miami sandbox action' },
  { id: '04', name: 'Temple Run', code: 'RUNNER', desc: 'Fast-paced obstacle chase' },
  { id: '05', name: 'Cyber Snake', code: 'ARCADE', desc: 'Retro 3D grid puzzle' },
  { id: '06', name: 'Neon OX', code: 'AI BATTLE', desc: 'Strategic multiplayer grid' },
  { id: '07', name: 'Flappy Bird', code: 'PHYSICS', desc: 'Tap-to-fly cyber obstacle' },
  { id: '08', name: 'Brick Smash', code: 'PADDLE', desc: 'Neon bouncing laser physics' },
];

export default function KiboriWorkshopShowcase({ onLaunchFullscreen }) {
  const [viewSize, setViewSize] = useState('medium'); // 'compact', 'medium', 'expanded'
  const [activeMode, setActiveMode] = useState(GAMING_MODES[0]);
  const stageRef = useRef(null);

  const heightClasses = {
    compact: 'h-[360px]',
    medium: 'h-[500px] md:h-[580px]',
    expanded: 'h-[640px] md:h-[720px]',
  };

  const handleToggleExpand = () => {
    soundFx.playClick();
    setViewSize((prev) => (prev === 'medium' ? 'expanded' : prev === 'expanded' ? 'compact' : 'medium'));
  };

  return (
    <motion.section
      ref={stageRef}
      id="kibori-workshop-stage"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="mb-10 relative"
      aria-label="3D Cyber Gaming Arena Stage"
    >
      {/* Container Frame */}
      <div className="relative rounded-3xl overflow-hidden border border-cyan-500/35 bg-[#070b1a] shadow-[0_16px_50px_rgba(6,182,212,0.2),0_0_1px_1px_rgba(56,189,248,0.25)]">
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
                  <Zap className="w-2.5 h-2.5 animate-pulse text-cyan-400" /> LIVE WEBGL
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-light">
                Direct 3D interactive stage — drag to inspect 3D assets, rotate camera, and experience real-time physics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleExpand}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all flex items-center gap-1.5 cursor-pointer font-mono"
              title="Change canvas height"
            >
              {viewSize === 'expanded' ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline capitalize">{viewSize} View</span>
            </button>

            {onLaunchFullscreen && (
              <button
                onClick={() => {
                  soundFx.playClick();
                  onLaunchFullscreen();
                }}
                className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-white transition-all flex items-center gap-1.5 shadow-[0_2px_12px_rgba(6,182,212,0.35)] cursor-pointer font-mono"
                title="Open fullscreen cinema mode"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Cinema Mode</span>
              </button>
            )}

            <a
              href="/landing-pages/kibori.html"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-white/10 border border-white/15 transition-colors"
              title="Open full canvas in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Live 3D Canvas Viewport */}
        <div className={`w-full relative transition-all duration-300 ${heightClasses[viewSize]}`}>
          <KiboriLandingPage className="w-full h-full" />

          {/* Interactive Hint Overlay */}
          <div className="absolute bottom-3 left-4 pointer-events-none z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-cyan-500/30 text-[11px] text-cyan-200 font-mono">
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span>Interactive: Click & drag to orbit camera in real-time 3D</span>
          </div>
        </div>

        {/* 8 Gaming Modes Quick Navigator */}
        <div className="p-3 bg-[#0a0f26]/95 border-t border-cyan-500/25">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-300 flex items-center gap-1.5 font-bold">
              <Sparkles className="w-3 h-3" />
              Eight Gaming Realms in Universe
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              REAL-TIME WEBGL SHADERS
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {GAMING_MODES.map((modeItem) => {
              const isSelected = activeMode.id === modeItem.id;
              return (
                <button
                  key={modeItem.id}
                  onClick={() => {
                    soundFx.playClick();
                    setActiveMode(modeItem);
                  }}
                  className={`p-2 rounded-xl border text-left transition-all active:scale-95 cursor-pointer ${
                    isSelected
                      ? 'bg-[#15234d] border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.35)]'
                      : 'bg-[#0c132e]/80 border-cyan-500/20 text-slate-300 hover:border-cyan-400/50 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] font-mono text-cyan-400 font-bold">{modeItem.id}</span>
                    <span className="font-mono text-[9px] text-purple-300 font-bold">{modeItem.code}</span>
                  </div>
                  <div className="text-xs font-bold truncate text-white">{modeItem.name}</div>
                  <div className="text-[9px] text-slate-400 truncate">{modeItem.desc}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
