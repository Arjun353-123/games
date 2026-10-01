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
    : 'bg-slate-900/80 text-slate-300 border-white/10 hover:bg-slate-800';

  return (
    <header className={`relative z-30 w-full px-4 py-3 border-b backdrop-blur-xl transition-colors duration-300 flex justify-between items-center ${
      isNoirMode ? 'bg-black/90 border-white/20' : 'bg-slate-950/75 border-white/10'
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
              : 'bg-gradient-to-r from-indigo-900/80 to-purple-900/80 text-purple-200 border-purple-500/40 hover:border-purple-400'
          }`}
          title="Switch Theme Mode"
        >
          {isKidsMode ? <Sparkles className="w-4 h-4" /> : isNoirMode ? <Moon className="w-4 h-4" /> : <Flame className="w-4 h-4" />}
          <span className="hidden sm:inline">{isKidsMode ? 'KIDS 🎨' : isNoirMode ? 'NOIR 🖤' : 'COLLEGE ⚡'}</span>
        </button>

        {/* Background Selector */}
        <div className="relative hidden md:block">
          <select
            value={bgType}
            onChange={(e) => onChangeBgType(e.target.value)}
            className={`px-3 py-2 text-xs font-semibold rounded-2xl border outline-none cursor-pointer ${btnBase}`}
          >
            <option value="3d-particles">✨ Particles</option>
            <option value="cyber-video">🎬 Cyber</option>
            <option value="matrix">💻 Matrix</option>
            <option value="mesh">🌈 Mesh</option>
            <option value="aurora">🌌 Aurora</option>
          </select>
        </div>

        {/* Achievements */}
        <button
          onClick={onOpenAchievements}
          className={`p-2.5 rounded-2xl border shadow-md active:scale-95 transition-all relative ${btnBase}`}
          title="Achievements"
        >
          <Award className="w-5 h-5 text-purple-400" />
          {achievementCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
              {achievementCount}
            </span>
          )}
        </button>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className={`p-2.5 rounded-2xl border shadow-md active:scale-95 transition-all ${btnBase}`}
          title="Settings"
        >
          <Settings className="w-5 h-5 text-cyan-400" />
        </button>

        {/* Sound */}
        <button
          onClick={onToggleSound}
          className={`p-2.5 rounded-2xl border transition-all active:scale-95 shadow-md ${
            soundMuted ? 'bg-rose-500/20 text-rose-400 border-rose-500/30 hover:bg-rose-500/30' : btnBase
          }`}
          title="Toggle Sound"
        >
          {soundMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
        </button>

        {/* High Scores */}
        <button
          onClick={onOpenHighScores}
          className={`p-2.5 rounded-2xl border shadow-md active:scale-95 transition-all ${btnBase}`}
          title="High Scores"
        >
          <Trophy className="w-5 h-5 text-amber-400" />
        </button>

        {/* Fullscreen */}
        <button
          onClick={toggleFullscreen}
          className={`p-2.5 rounded-2xl border shadow-md active:scale-95 transition-all hidden lg:block ${btnBase}`}
          title="Fullscreen"
        >
          <Maximize className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
