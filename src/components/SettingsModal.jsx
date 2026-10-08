import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, Palette, Volume2, Sparkles, Zap } from 'lucide-react';
import { soundFx } from '../utils/audio';

export default function SettingsModal({ isOpen, onClose, settings, onUpdateSettings, mode }) {
  const isKidsMode = mode === 'kids';
  const isNoirMode = mode === 'noir';

  if (!isOpen) return null;

  const handleChange = (key, value) => {
    soundFx.playClick();
    onUpdateSettings({ ...settings, [key]: value });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className={`max-w-md w-full p-6 rounded-3xl border shadow-2xl relative ${
            isNoirMode
              ? 'glass-panel-noir border-white/40'
              : isKidsMode
              ? 'glass-panel-kids border-pink-300'
              : 'bg-[#0a0f24]/95 border-cyan-500/35 shadow-[0_20px_60px_rgba(6,182,212,0.25)] text-slate-100 backdrop-blur-xl'
          }`}
        >
          <button
            onClick={() => { soundFx.playClick(); onClose(); }}
            className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
              isNoirMode
                ? 'text-white/60 hover:text-white bg-white/10'
                : isKidsMode
                ? 'text-slate-400 hover:text-slate-800 bg-pink-100'
                : 'text-slate-400 hover:text-white bg-white/5 hover:bg-white/15'
            }`}
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className={`p-3 rounded-2xl border ${
              isNoirMode
                ? 'bg-white/10 border-white/30 text-white'
                : isKidsMode
                ? 'bg-pink-100 border-pink-300 text-pink-600'
                : 'bg-cyan-500/20 border-cyan-400/50 text-cyan-400'
            }`}>
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`text-xl font-black ${
                  isKidsMode ? 'text-slate-800' : isNoirMode ? 'text-white' : 'font-heading text-white tracking-wide'
                }`}>
                  Gaming Settings
                </h3>
                {!isKidsMode && !isNoirMode && (
                  <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/80 border border-cyan-500/40 px-2 py-0.5 rounded-full font-bold">
                    SYSTEM
                  </span>
                )}
              </div>
              <p className={`text-xs ${isKidsMode ? 'text-slate-500' : isNoirMode ? 'text-zinc-400' : 'text-slate-400'}`}>
                Configure your 3D arcade graphics & audio controls
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Background Theme */}
            <div>
              <label className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-2 ${
                isKidsMode ? 'text-slate-600' : isNoirMode ? 'text-zinc-400' : 'text-cyan-400'
              }`}>
                <Palette className="w-3.5 h-3.5" /> Background Canvas
              </label>
              <select
                value={settings.bgType}
                onChange={(e) => handleChange('bgType', e.target.value)}
                className={`w-full px-4 py-3 text-sm font-semibold rounded-2xl border outline-none cursor-pointer ${
                  isNoirMode
                    ? 'bg-zinc-900 text-white border-white/20'
                    : isKidsMode
                    ? 'bg-white text-slate-800 border-pink-200'
                    : 'bg-[#080d20] text-slate-100 border-cyan-500/40 focus:border-cyan-300'
                }`}
              >
                <option value="kibori">🎮 Cyber Neon Arena (3D Live)</option>
                <option value="3d-particles">✨ 3D Galaxy Particles</option>
                <option value="cyber-video">🎬 Synthwave Video Tunnel</option>
                <option value="matrix">💻 Cyber Matrix Rain</option>
                <option value="mesh">🌈 Modern Gradient Mesh</option>
                <option value="aurora">🌌 Northern Lights Aurora</option>
              </select>
            </div>

            {/* Sound Effects */}
            <div className={`flex items-center justify-between p-4 rounded-2xl border ${
              isNoirMode
                ? 'bg-zinc-900/60 border-white/10'
                : isKidsMode
                ? 'bg-white/70 border-pink-200'
                : 'bg-[#080d20]/80 border-white/10'
            }`}>
              <div className="flex items-center gap-3">
                <Volume2 className={`w-5 h-5 ${isKidsMode ? 'text-pink-500' : isNoirMode ? 'text-white' : 'text-cyan-400'}`} />
                <div>
                  <p className={`text-sm font-bold ${isKidsMode ? 'text-slate-800' : 'text-white'}`}>Sound Effects & SFX</p>
                  <p className="text-xs text-slate-400">Arcade clicks, power-ups & game audio</p>
                </div>
              </div>
              <button
                onClick={() => handleChange('sound', !settings.sound)}
                className={`w-12 h-7 rounded-full transition-colors relative ${
                  settings.sound
                    ? isNoirMode ? 'bg-white' : isKidsMode ? 'bg-pink-500' : 'bg-cyan-500'
                    : 'bg-zinc-800'
                }`}
              >
                <span className={`absolute top-1 w-5 h-5 rounded-full ${
                  settings.sound && isNoirMode ? 'bg-black' : 'bg-white'
                } shadow transition-transform ${
                  settings.sound ? 'left-6' : 'left-1'
                }`} />
              </button>
            </div>

            {/* Reduce Motion */}
            <div className={`flex items-center justify-between p-4 rounded-2xl border ${
              isNoirMode
                ? 'bg-zinc-900/60 border-white/10'
                : isKidsMode
                ? 'bg-white/70 border-pink-200'
                : 'bg-[#080d20]/80 border-white/10'
            }`}>
              <div className="flex items-center gap-3">
                <Sparkles className={`w-5 h-5 ${isKidsMode ? 'text-purple-500' : isNoirMode ? 'text-white' : 'text-purple-400'}`} />
                <div>
                  <p className={`text-sm font-bold ${isKidsMode ? 'text-slate-800' : 'text-white'}`}>Reduce Motion</p>
                  <p className="text-xs text-slate-400">Minimal animations for comfort</p>
                </div>
              </div>
              <button
                onClick={() => handleChange('reduceMotion', !settings.reduceMotion)}
                className={`w-12 h-7 rounded-full transition-colors relative ${
                  settings.reduceMotion
                    ? isNoirMode ? 'bg-white' : isKidsMode ? 'bg-pink-500' : 'bg-purple-500'
                    : 'bg-zinc-800'
                }`}
              >
                <span className={`absolute top-1 w-5 h-5 rounded-full ${
                  settings.reduceMotion && isNoirMode ? 'bg-black' : 'bg-white'
                } shadow transition-transform ${
                  settings.reduceMotion ? 'left-6' : 'left-1'
                }`} />
              </button>
            </div>

            {/* Card Glow Effects */}
            <div className={`flex items-center justify-between p-4 rounded-2xl border ${
              isNoirMode
                ? 'bg-zinc-900/60 border-white/10'
                : isKidsMode
                ? 'bg-white/70 border-pink-200'
                : 'bg-[#080d20]/80 border-white/10'
            }`}>
              <div className="flex items-center gap-3">
                <Zap className={`w-5 h-5 ${isKidsMode ? 'text-amber-500' : isNoirMode ? 'text-white' : 'text-amber-400'}`} />
                <div>
                  <p className={`text-sm font-bold ${isKidsMode ? 'text-slate-800' : 'text-white'}`}>Neon Card Glow</p>
                  <p className="text-xs text-slate-400">Cyber edge illumination on game cards</p>
                </div>
              </div>
              <button
                onClick={() => handleChange('cardGlow', settings.cardGlow !== false ? false : true)}
                className={`w-12 h-7 rounded-full transition-colors relative ${
                  settings.cardGlow !== false
                    ? isNoirMode ? 'bg-white' : isKidsMode ? 'bg-pink-500' : 'bg-amber-400'
                    : 'bg-zinc-800'
                }`}
              >
                <span className={`absolute top-1 w-5 h-5 rounded-full ${
                  settings.cardGlow !== false && isNoirMode ? 'bg-black' : 'bg-white'
                } shadow transition-transform ${
                  settings.cardGlow !== false ? 'left-6' : 'left-1'
                }`} />
              </button>
            </div>
          </div>

          <button
            onClick={() => { soundFx.playClick(); onClose(); }}
            className={`w-full mt-6 py-3.5 rounded-2xl font-black text-sm transition-all shadow-lg cursor-pointer ${
              isNoirMode
                ? 'bg-white text-black hover:bg-neutral-200'
                : isKidsMode
                ? 'bg-gradient-to-r from-pink-500 to-amber-500 text-white'
                : 'bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 text-white font-extrabold hover:brightness-110 shadow-[0_4px_20px_rgba(6,182,212,0.35)]'
            }`}
          >
            SAVE & CLOSE
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
