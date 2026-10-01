import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award } from 'lucide-react';

export default function AchievementToast({ achievement, onDismiss }) {
  if (!achievement) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        onClick={onDismiss}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] cursor-pointer"
      >
        <div className="flex items-center gap-4 px-6 py-4 rounded-2xl glass-panel border border-purple-400/40 shadow-[0_0_40px_rgba(168,85,247,0.3)] backdrop-blur-xl">
          <div className="p-2 bg-purple-500/20 rounded-xl">
            <Award className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-purple-400">Achievement Unlocked!</p>
            <p className="text-lg font-black text-white flex items-center gap-2">
              <span>{achievement.icon}</span> {achievement.title}
            </p>
            <p className="text-xs text-slate-400">{achievement.desc}</p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
