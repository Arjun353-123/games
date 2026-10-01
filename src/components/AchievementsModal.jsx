import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Award, Lock } from 'lucide-react';
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
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className={`max-w-lg w-full p-6 rounded-3xl border shadow-2xl relative max-h-[85vh] overflow-y-auto ${
            isNoirMode ? 'glass-panel-noir border-white/40' : isKidsMode ? 'glass-panel-kids border-pink-300' : 'glass-panel border-purple-400/30'
          }`}
        >
          <button
            onClick={() => { soundFx.playClick(); onClose(); }}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-500/20 text-purple-400 rounded-2xl border border-purple-400/30">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className={`text-xl font-extrabold ${isKidsMode ? 'text-slate-800' : 'text-white'}`}>Achievements</h3>
              <p className="text-xs text-slate-400">{unlockedCount} of {totalCount} unlocked</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-6">
            <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
              />
            </div>
            <p className="text-right text-xs text-slate-500 mt-1 font-bold">{progress}% complete</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ACHIEVEMENT_DEFS.map((ach, i) => {
              const isUnlocked = unlockedIds.includes(ach.id);
              return (
                <motion.div
                  key={ach.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`p-4 rounded-2xl border flex items-start gap-3 transition-all ${
                    isUnlocked
                      ? isNoirMode
                        ? 'bg-white/10 border-white/40'
                        : 'bg-purple-500/10 border-purple-400/40 shadow-[0_0_20px_rgba(168,85,247,0.15)]'
                      : 'bg-slate-900/50 border-white/5 opacity-50'
                  }`}
                >
                  <span className="text-2xl">{isUnlocked ? ach.icon : '🔒'}</span>
                  <div className="min-w-0">
                    <p className={`text-sm font-extrabold truncate ${isKidsMode && isUnlocked ? 'text-slate-800' : 'text-white'}`}>
                      {ach.title}
                    </p>
                    <p className="text-[11px] text-slate-400 leading-snug">{ach.desc}</p>
                    {isUnlocked && (
                      <span className="inline-block mt-1 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Unlocked</span>
                    )}
                    {!isUnlocked && (
                      <Lock className="w-3 h-3 text-slate-600 mt-1" />
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
