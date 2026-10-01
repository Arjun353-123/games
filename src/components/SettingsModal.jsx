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
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className={`max-w-md w-full p-6 rounded-3xl border shadow-2xl relative ${
            isNoirMode ? 'glass-panel-noir border-white/40' : isKidsMode ? 'glass-panel-kids border-pink-300' : 'glass-panel border-cyan-400/30'
          }`}
        >
          <button
            onClick={() => { soundFx.playClick(); onClose(); }}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className={`p-3 rounded-2xl border ${
              isNoirMode ? 'bg-white/10 border-white/30 text-white' : 'bg-cyan-500/20 text-cyan-400 border-cyan-400/30'
            }`}>
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h3 className={`text-xl font-extrabold ${isKidsMode ? 'text-slate-800' : 'text-white'}`}>Settings</h3>
              <p className="text-xs text-slate-400">Customize your arcade experience</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Background */}
            <div>
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                <Palette className="w-3.5 h-3.5" /> Background Theme
              </label>
              <select
                value={settings.bgType}
                onChange={(e) => handleChange('bgType', e.target.value)}
                className="w-full px-4 py-3 text-sm font-semibold rounded-2xl border outline-none cursor-pointer bg-slate-900/80 text-slate-200 border-white/10 hover:bg-slate-800"
              >
                <option value="3d-particles">✨ 3D Particles</option>
                <option value="cyber-video">🎬 Cyber Video</option>
                <option value="matrix">💻 Matrix FX</option>
                <option value="mesh">🌈 Mesh Gradient</option>
                <option value="aurora">🌌 Aurora Waves</option>
              </select>
            </div>

            {/* Sound */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-white/10">
              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-emerald-400" />
                <div>
                  <p className="text-sm font-bold text-white">Sound Effects</p>
                  <p className="text-xs text-slate-400">UI clicks & game audio</p>
                </div>
              </div>
              <button
                onClick={() => handleChange('sound', !settings.sound)}
                className={`w-12 h-7 rounded-full transition-colors relative ${
                  settings.sound ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              >
                <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  settings.sound ? 'left-6' : 'left-1'
                }`} />
              </button>
            </div>

            {/* Reduce motion */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-white/10">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-sm font-bold text-white">Reduce Motion</p>
                  <p className="text-xs text-slate-400">Less animations for comfort</p>
                </div>
              </div>
              <button
                onClick={() => handleChange('reduceMotion', !settings.reduceMotion)}
                className={`w-12 h-7 rounded-full transition-colors relative ${
                  settings.reduceMotion ? 'bg-purple-500' : 'bg-slate-700'
                }`}
              >
                <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  settings.reduceMotion ? 'left-6' : 'left-1'
                }`} />
              </button>
            </div>

            {/* Show particles on cards */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-white/10">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-amber-400" />
                <div>
                  <p className="text-sm font-bold text-white">Card Glow Effects</p>
                  <p className="text-xs text-slate-400">Animated borders on game cards</p>
                </div>
              </div>
              <button
                onClick={() => handleChange('cardGlow', settings.cardGlow !== false ? false : true)}
                className={`w-12 h-7 rounded-full transition-colors relative ${
                  settings.cardGlow !== false ? 'bg-amber-500' : 'bg-slate-700'
                }`}
              >
                <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  settings.cardGlow !== false ? 'left-6' : 'left-1'
                }`} />
              </button>
            </div>
          </div>

          <button
            onClick={() => { soundFx.playClick(); onClose(); }}
            className="w-full mt-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-2xl font-bold text-sm transition-all"
          >
            Done
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
