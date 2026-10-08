import React from 'react';
import { Volume2, VolumeX, Trophy, Sparkles, Maximize, Flame, Moon, Settings, Award } from 'lucide-react';
import { soundFx } from '../utils/audio';
import Logo from './Logo';

export default function Navbar({
  mode = 'college',
  onToggleMode,
  soundMuted,
  onToggleSound,
  bgType,
  onChangeBgType,
  onOpenHighScores,
  onOpenSettings,
  onOpenAchievements,
  onOpenKibori,
  achievementCount = 0,
}) {
  const toggleFullscreen = () => {
    soundFx.playClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((e) => console.error(e));
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const isKidsMode = mode === 'kids';
  const isNoirMode = mode === 'noir';

  const btnBase = isNoirMode
    ? 'bg-zinc-900 text-white border-white/30 hover:bg-zinc-800'
    : isKidsMode
    ? 'bg-white text-slate-700 border-pink-200 hover:bg-pink-50'
    : 'bg-[#0f152a]/90 text-slate-200 border-cyan-500/30 hover:border-cyan-400 hover:bg-[#182042] shadow-sm';

  return (
    <header className={`relative z-30 w-full px-4 py-3 border-b backdrop-blur-xl transition-colors duration-300 flex justify-between items-center ${
      isNoirMode
        ? 'bg-black/90 border-white/20'
        : isKidsMode
        ? 'bg-white/85 border-pink-200'
        : 'bg-[#070a16]/92 border-cyan-500/20 shadow-[0_4px_25px_rgba(0,0,0,0.8)]'
    }`}>
      <Logo mode={mode} />

      <div className="flex items-center gap-1.5 md:gap-2">
        {/* Mode Toggle */}
        <button
          onClick={onToggleMode}
          className={`px-3 py-2 rounded-2xl text-xs md:text-sm font-extrabold flex items-center gap-1.5 border transition-all active:scale-95 shadow-lg ${
            isKidsMode
              ? 'bg-gradient-to-r from-amber-400 to-pink-400 text-slate-900 border-amber-300 hover:brightness-105'
              : isNoirMode
              ? 'bg-gradient-to-r from-neutral-800 to-zinc-900 text-white border-white/50 hover:border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]'
              : 'bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 text-white border-cyan-400 hover:brightness-110 shadow-[0_0_20px_rgba(6,182,212,0.4)]'
          }`}
          title="Switch Theme Mode"
        >
          {isKidsMode ? <Sparkles className="w-4 h-4" /> : isNoirMode ? <Moon className="w-4 h-4" /> : <Gamepad2 className="w-4 h-4" />}
          <span className="hidden sm:inline">{isKidsMode ? 'KIDS 🎨' : isNoirMode ? 'NOIR 🖤' : 'KIBORI 🎮'}</span>
        </button>

        {/* Background Canvas Selector */}
        <div className="relative hidden md:block">
          <select
            value={bgType}
            onChange={(e) => onChangeBgType(e.target.value)}
            className={`px-3 py-2 text-xs font-semibold rounded-2xl border outline-none cursor-pointer ${btnBase}`}
          >
            <option value="kibori">🎮 Cyber Neon Arena</option>
            <option value="3d-particles">✨ 3D Galaxy Particles</option>
            <option value="cyber-video">🎬 Synthwave Tunnel</option>
            <option value="matrix">💻 Cyber Matrix Rain</option>
            <option value="mesh">🌈 Mesh Gradient</option>
            <option value="aurora">🌌 Northern Aurora</option>
          </select>
        </div>

        {/* 3D Gaming Stage Jump */}
        <button
          onClick={onOpenKibori}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl border border-cyan-500/40 bg-gradient-to-r from-[#0c142b] to-[#121b3b] text-cyan-200 hover:border-cyan-300 text-xs font-bold transition-all shadow-md active:scale-95"
          title="Open interactive 3D Gaming Stage"
        >
          <Gamepad2 className="w-4 h-4 text-cyan-400" />
          <span>3D Game Arena</span>
        </button>

        {/* Login / Auth Page */}
        <a
          href="/login.html"
          className="inline-flex items-center gap-1 px-3 py-2 rounded-2xl border border-white/20 bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-all shadow-md active:scale-95"
          title="Sign in to KIBORI Gaming Account"
        >
          <span>Sign In</span>
        </a>

        {/* Achievements */}
        <button
          onClick={onOpenAchievements}
          className={`p-2.5 rounded-2xl border shadow-md active:scale-95 transition-all relative ${btnBase}`}
          title="Gaming Achievements"
        >
          <Award className={`w-5 h-5 ${isKidsMode ? 'text-pink-500' : isNoirMode ? 'text-white' : 'text-purple-400'}`} />
          {achievementCount > 0 && (
            <span className={`absolute -top-1 -right-1 w-4 h-4 text-[9px] font-black rounded-full flex items-center justify-center ${
              isKidsMode ? 'bg-pink-500 text-white' : isNoirMode ? 'bg-white text-black' : 'bg-cyan-500 text-black font-mono'
            }`}>
              {achievementCount}
            </span>
          )}
        </button>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className={`p-2.5 rounded-2xl border shadow-md active:scale-95 transition-all ${btnBase}`}
          title="Gaming Settings"
        >
          <Settings className={`w-5 h-5 ${isKidsMode ? 'text-purple-500' : isNoirMode ? 'text-white' : 'text-cyan-400'}`} />
        </button>

        {/* Sound */}
        <button
          onClick={onToggleSound}
          className={`p-2.5 rounded-2xl border transition-all active:scale-95 shadow-md ${
            soundMuted ? 'bg-rose-500/20 text-rose-400 border-rose-500/30 hover:bg-rose-500/30' : btnBase
          }`}
          title="Toggle Sound"
        >
          {soundMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className={`w-5 h-5 ${isKidsMode ? 'text-emerald-500' : isNoirMode ? 'text-white' : 'text-emerald-400'}`} />}
        </button>

        {/* High Scores */}
        <button
          onClick={onOpenHighScores}
          className={`p-2.5 rounded-2xl border shadow-md active:scale-95 transition-all ${btnBase}`}
          title="High Scores Leaderboard"
        >
          <Trophy className={`w-5 h-5 ${isKidsMode ? 'text-amber-500' : isNoirMode ? 'text-white' : 'text-amber-400'}`} />
        </button>

        {/* Fullscreen */}
        <button
          onClick={toggleFullscreen}
          className={`p-2.5 rounded-2xl border shadow-md active:scale-95 transition-all hidden lg:block ${btnBase}`}
          title="Fullscreen Mode"
        >
          <Maximize className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
