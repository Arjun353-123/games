import React from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, Trophy, Flame, Clock, Target, Sparkles, Zap, ShieldAlert } from 'lucide-react';

export default function StatsDashboard({ stats, highScores, isKidsMode, isNoirMode }) {
  const totalScore = Object.values(highScores).reduce((a, b) => a + (b || 0), 0);
  const gamesExplored = stats.gamesTried?.length || 0;

  const items = [
    {
      icon: Gamepad2,
      tag: 'ARCADE',
      label: 'Total Sessions',
      value: stats.gamesPlayed || 0,
      accent: isNoirMode
        ? 'border-white/20 text-white bg-zinc-900/60'
        : isKidsMode
        ? 'border-pink-200 text-pink-600 bg-white/80'
        : 'border-cyan-500/30 text-cyan-300 bg-[#0d142d]/80 hover:border-cyan-400/60 shadow-[0_0_20px_rgba(6,182,212,0.15)]',
      badge: 'ACTIVE'
    },
    {
      icon: Trophy,
      tag: 'RECORD',
      label: 'Master Score',
      value: totalScore.toLocaleString(),
      accent: isNoirMode
        ? 'border-white/30 text-white bg-zinc-900/60'
        : isKidsMode
        ? 'border-amber-200 text-amber-600 bg-white/80'
        : 'border-amber-500/40 text-amber-300 bg-[#1c160b]/80 hover:border-amber-400/70 shadow-[0_0_20px_rgba(245,158,11,0.2)]',
      badge: 'HIGH'
    },
    {
      icon: Flame,
      tag: 'COMBO',
      label: 'Win Streak',
      value: `${stats.streakDays || 1}d`,
      accent: isNoirMode
        ? 'border-white/20 text-white bg-zinc-900/60'
        : isKidsMode
        ? 'border-rose-200 text-rose-600 bg-white/80'
        : 'border-rose-500/35 text-rose-300 bg-[#200e18]/80 hover:border-rose-400/60 shadow-[0_0_20px_rgba(244,63,94,0.15)]',
      badge: 'STREAK'
    },
    {
      icon: Target,
      tag: 'ARENA',
      label: 'Games Explored',
      value: `${gamesExplored}/8`,
      accent: isNoirMode
        ? 'border-white/20 text-white bg-zinc-900/60'
        : isKidsMode
        ? 'border-purple-200 text-purple-600 bg-white/80'
        : 'border-purple-500/35 text-purple-300 bg-[#170e2b]/80 hover:border-purple-400/60 shadow-[0_0_20px_rgba(168,85,247,0.15)]',
      badge: 'STAGE'
    },
    {
      icon: Clock,
      tag: 'ONLINE',
      label: 'Game Time',
      value: `${stats.totalPlayMinutes || 0}m`,
      accent: isNoirMode
        ? 'border-white/20 text-white bg-zinc-900/60'
        : isKidsMode
        ? 'border-blue-200 text-blue-600 bg-white/80'
        : 'border-emerald-500/35 text-emerald-300 bg-[#0a1e1b]/80 hover:border-emerald-400/60 shadow-[0_0_20px_rgba(16,185,129,0.15)]',
      badge: 'HOURS'
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.5 }}
      className="mb-8"
      aria-label="Arcade Gaming Performance Dashboard"
    >
      {/* Dashboard Subheader */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-mono font-bold tracking-widest ${
            isNoirMode ? 'text-white' : isKidsMode ? 'text-pink-600' : 'text-cyan-400'
          }`}>
            PLAYER METRICS
          </span>
          <span className="text-xs uppercase font-mono tracking-wider text-slate-400">
            Real-Time Arcade Dashboard
          </span>
        </div>
        <div className={`flex items-center gap-1.5 text-[11px] font-mono font-semibold ${
          isNoirMode ? 'text-white' : isKidsMode ? 'text-pink-600' : 'text-cyan-400'
        }`}>
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>SERVERS ONLINE</span>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {items.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 * i, duration: 0.4 }}
              whileHover={{ scale: 1.025, y: -2 }}
              className={`relative rounded-2xl p-4 border backdrop-blur-md transition-all duration-300 shadow-lg ${item.accent}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Icon className="w-4 h-4 opacity-90" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                    {item.label}
                  </span>
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider font-extrabold text-cyan-400/80">
                  {item.tag}
                </span>
              </div>

              <div className="flex items-baseline justify-between mt-1">
                <p className="text-2xl md:text-3xl font-black tabular-nums tracking-tight text-white">
                  {item.value}
                </p>
                <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border border-current opacity-70">
                  {item.badge}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}
