import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, ExternalLink, X, Trophy, Globe, Zap } from 'lucide-react';

const GAMES = [
  { id: 'vice', name: 'Vice City 3D', icon: '🌴' },
  { id: 'racer', name: 'Neon Racer', icon: '🏎️' },
  { id: 'temple', name: 'Temple Runner', icon: '🏃' },
  { id: 'snake', name: 'Cyber Snake', icon: '🐍' },
  { id: 'ox', name: 'Neon OX', icon: '❌' },
  { id: 'bird', name: 'Flappy Bird', icon: '🐦' },
  { id: 'breaker', name: 'Brick Breaker', icon: '🧱' },
  { id: 'cyber', name: 'Cyber Bird', icon: '🎮' },
];

export default function App() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/40 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center">
              <Gamepad2 className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <span className="text-sm font-bold text-white tracking-wider">KIBORI — 3D CYBER ARENA</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-md text-xs font-semibold text-cyan-400">
              FEATURED GAMES
            </span>
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Close
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12 space-y-6">
          {/* Icon */}
          <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 flex items-center justify-center">
            <Gamepad2 className="w-12 h-12 text-cyan-400" />
          </div>

          {/* Title */}
          <div className="space-y-3">
            <h1 className="text-5xl font-black text-white tracking-tight">
              KIBORI GAMING UNIVERSE
            </h1>
            <p className="text-xl text-gray-400 font-light">
              8 Interactive 3D Gaming Experiences
            </p>
          </div>

          {/* Description */}
          <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Experience cinematic 3D environments with real-time WebGL rendering, physics-based gameplay, 
            and immersive cyber aesthetics across multiple gaming genres.
          </p>

          {/* CTA Buttons */}
          <div className="flex justify-center gap-4 pt-4">
            <button className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20">
              <ExternalLink className="w-5 h-5" />
              Launch Full 3D Arena
            </button>
            <button className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-lg transition-all flex items-center gap-2">
              <Gamepad2 className="w-5 h-5" />
              Browse Games
            </button>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { icon: <Gamepad2 className="w-6 h-6" />, label: '8 Games', text: 'text-purple-400' },
            { icon: <Globe className="w-6 h-6" />, label: 'WebGL 3D', text: 'text-cyan-400' },
            { icon: <Zap className="w-6 h-6" />, label: 'Real-time Physics', text: 'text-yellow-400' },
            { icon: <Trophy className="w-6 h-6" />, label: 'High Scores', text: 'text-orange-400' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-6 bg-white/5 border border-white/10 rounded-xl text-center hover:bg-white/10 transition-all"
            >
              <div className={`${item.text} mb-3 flex justify-center`}>
                {item.icon}
              </div>
              <div className="text-sm font-semibold text-white">{item.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Available Games Section */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent flex-1" />
            <span className="px-4 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-xs font-bold text-cyan-400 tracking-wider">
              ⚡ AVAILABLE GAMES
            </span>
            <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent flex-1" />
          </div>

          {/* Games Pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {GAMES.map((game) => (
              <button
                key={game.id}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/50 rounded-lg text-sm font-medium text-gray-300 hover:text-white transition-all flex items-center gap-2"
              >
                <span>{game.icon}</span>
                <span>{game.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Back to Menu */}
        <div className="text-center">
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-lg transition-all"
          >
            <Gamepad2 className="w-5 h-5" />
            Return to Main Menu
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-16">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center text-sm text-gray-500">
          <p>KIBORI · 3D CYBER ARCADE & GAMING UNIVERSE</p>
          <p className="mt-1">Built with React, Three.js & Tailwind CSS</p>
        </div>
      </footer>
    </div>
  );
}
