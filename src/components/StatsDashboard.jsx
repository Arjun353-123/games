import React from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, Trophy, Flame, Clock, Target } from 'lucide-react';

export default function StatsDashboard({ stats, highScores, isKidsMode, isNoirMode }) {
  const totalScore = Object.values(highScores).reduce((a, b) => a + (b || 0), 0);
  const gamesExplored = stats.gamesTried?.length || 0;

  const items = [
    { icon: Gamepad2, label: 'Sessions', value: stats.gamesPlayed || 0, color: 'cyan' },
    { icon: Trophy, label: 'Total Score', value: totalScore, color: 'amber' },
    { icon: Flame, label: 'Day Streak', value: stats.streakDays || 0, color: 'rose' },
    { icon: Target, label: 'Games Tried', value: `${gamesExplored}/5`, color: 'emerald' },
    { icon: Clock, label: 'Play Time', value: `${stats.totalPlayMinutes || 0}m`, color: 'purple' },
  ];

  const colorMap = {
    cyan: isNoirMode ? 'text-white border-white/30 bg-white/5' : isKidsMode ? 'text-sky-600 border-sky-200 bg-sky-50' : 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
    amber: isNoirMode ? 'text-white border-white/30 bg-white/5' : isKidsMode ? 'text-amber-600 border-amber-200 bg-amber-50' : 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    rose: isNoirMode ? 'text-white border-white/30 bg-white/5' : isKidsMode ? 'text-rose-600 border-rose-200 bg-rose-50' : 'text-rose-400 border-rose-500/30 bg-rose-500/10',
    emerald: isNoirMode ? 'text-white border-white/30 bg-white/5' : isKidsMode ? 'text-emerald-600 border-emerald-200 bg-emerald-50' : 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    purple: isNoirMode ? 'text-white border-white/30 bg-white/5' : isKidsMode ? 'text-purple-600 border-purple-200 bg-purple-50' : 'text-purple-400 border-purple-500/30 bg-purple-500/10',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8"
    >
      {items.map((item, i) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 * i }}
            whileHover={{ scale: 1.03, y: -2 }}
            className={`rounded-2xl p-4 border backdrop-blur-sm transition-shadow hover:shadow-lg ${colorMap[item.color]}`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <Icon className="w-4 h-4 opacity-80" />
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">{item.label}</span>
            </div>
            <p className="text-xl md:text-2xl font-black tabular-nums">{item.value}</p>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
