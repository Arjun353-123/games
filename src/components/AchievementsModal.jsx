import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Award, Lock, Sparkles } from 'lucide-react';
import { ACHIEVEMENT_DEFS } from '../utils/stats';
import { soundFx } from '../utils/audio';

export default function AchievementsModal({ isOpen, onClose, unlockedIds, mode }) {
  const isKidsMode = mode === 'kids';
  const isNoirMode = mode === 'noir';

  if (!isOpen) return null;

  const unlockedCount = unlockedIds.length;
  const totalCount = ACHIEVEMENT_DEFS.length;
  const progress = Math.round((unlockedCount / totalCount) * 100);

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
          className={`max-w-lg w-full p-6 rounded-3xl border shadow-2xl relative max-h-[85vh] overflow-y-auto ${
            isNoirMode
              ? 'glass-panel-noir border-white/40'
              : isKidsMode
              ? 'glass-panel-kids border-pink-300'
              : 'bg-[#0a0f24]/95 border-purple-500/35 shadow-[0_20px_60px_rgba(168,85,247,0.25)] text-slate-100 backdrop-blur-xl'
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

          <div className="flex items-center gap-3 mb-4">
            <div className={`p-3 rounded-2xl border ${
              isNoirMode
                ? 'bg-white/10 border-white/30 text-white'
                : isKidsMode
                ? 'bg-pink-100 border-pink-300 text-pink-600'
                : 'bg-purple-500/20 border-purple-400/50 text-purple-400'
            }`}>
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`text-xl font-black ${
                  isKidsMode ? 'text-slate-800' : isNoirMode ? 'text-white' : 'font-heading text-white tracking-wide'
                }`}>
                  Gaming Achievements
                </h3>
                {!isKidsMode && !isNoirMode && (
                  <span className="text-[10px] font-mono text-purple-300 bg-purple-950/80 border border-purple-500/40 px-2 py-0.5 rounded-full font-bold">
                    TROPHIES
                  </span>
                )}
              </div>
              <p className={`text-xs ${isKidsMode ? 'text-slate-500' : isNoirMode ? 'text-zinc-400' : 'text-slate-400'}`}>
                {unlockedCount} of {totalCount} arcade trophies unlocked
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className={`h-2.5 rounded-full overflow-hidden ${
              isNoirMode ? 'bg-zinc-800' : isKidsMode ? 'bg-pink-100' : 'bg-slate-900 border border-white/10'
            }`}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className={`h-full rounded-full transition-all duration-700 ${
                  isNoirMode
                    ? 'bg-white'
                    : isKidsMode
                    ? 'bg-gradient-to-r from-pink-500 to-amber-500'
                    : 'bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 shadow-[0_0_15px_rgba(168,85,247,0.7)]'
                }`}
              />
            </div>
            <div className="flex justify-between items-center text-xs mt-1.5 font-mono">
              <span className="text-slate-400">TROPHY PROGRESS</span>
              <span className={`font-bold ${isKidsMode ? 'text-pink-600' : isNoirMode ? 'text-white' : 'text-cyan-400'}`}>
                {progress}% COMPLETE
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ACHIEVEMENT_DEFS.map((ach, i) => {
              const isUnlocked = unlockedIds.includes(ach.id);
              return (
                <motion.div
                  key={ach.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`p-3.5 rounded-2xl border flex items-start gap-3 transition-all ${
                    isUnlocked
                      ? isNoirMode
                        ? 'bg-white/10 border-white/40'
                        : isKidsMode
                        ? 'bg-pink-50 border-pink-300'
                        : 'bg-[#12102e]/90 border-purple-500/40 shadow-[0_0_20px_rgba(168,85,247,0.15)]'
                      : 'bg-slate-900/60 border-white/5 opacity-40'
                  }`}
                >
                  <span className="text-2xl select-none">{isUnlocked ? ach.icon : '🔒'}</span>
                  <div className="min-w-0">
                    <p className={`text-sm font-extrabold truncate ${
                      isKidsMode && isUnlocked
                        ? 'text-slate-800'
                        : isNoirMode
                        ? 'text-white'
                        : isUnlocked
                        ? 'text-white'
                        : 'text-slate-400'
                    }`}>
                      {ach.title}
                    </p>
                    <p className="text-[11px] text-slate-400 leading-snug mt-0.5">{ach.desc}</p>
                    {isUnlocked && (
                      <span className={`inline-flex items-center gap-1 mt-1 text-[10px] font-bold uppercase tracking-wider font-mono ${
                        isKidsMode ? 'text-pink-600' : isNoirMode ? 'text-white' : 'text-cyan-400'
                      }`}>
                        <Sparkles className="w-2.5 h-2.5" /> Unlocked
                      </span>
                    )}
                    {!isUnlocked && (
                      <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-1 font-mono">
                        <Lock className="w-2.5 h-2.5" />
                        <span>Locked</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          <button
            onClick={() => { soundFx.playClick(); onClose(); }}
            className={`w-full mt-6 py-3 rounded-2xl font-black text-sm transition-all shadow-lg cursor-pointer ${
              isNoirMode
                ? 'bg-white text-black hover:bg-neutral-200'
                : isKidsMode
                ? 'bg-pink-500 text-white'
                : 'bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 text-white font-extrabold hover:brightness-110 shadow-[0_4px_20px_rgba(168,85,247,0.35)]'
            }`}
          >
            RETURN TO ARCADE
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
