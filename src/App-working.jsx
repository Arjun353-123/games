import React, { useState } from 'react';

export default function App() {
  const [selectedGame, setSelectedGame] = useState(null);

  const games = [
    { id: 'vice', name: '🌴 Vice City 3D', color: 'from-pink-500 to-purple-500' },
    { id: 'racer', name: '🏎️ Neon Racer', color: 'from-cyan-500 to-blue-500' },
    { id: 'temple', name: '🏃 Temple Runner', color: 'from-blue-500 to-cyan-500' },
    { id: 'snake', name: '🐍 Cyber Snake', color: 'from-green-500 to-teal-500' },
    { id: 'ox', name: '❌⭕ Neon OX', color: 'from-purple-500 to-pink-500' },
    { id: 'bird', name: '🐦 Flappy Bird', color: 'from-sky-400 to-blue-500' },
    { id: 'brick', name: '🧱 Brick Breaker', color: 'from-indigo-500 to-purple-500' },
  ];

  if (selectedGame) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center p-8">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-black">🎮 {selectedGame}</h1>
          <p className="text-xl text-gray-400">Game loading coming soon...</p>
          <button
            onClick={() => setSelectedGame(null)}
            className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-bold text-lg hover:brightness-110 transition-all"
          >
            ← Back to Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/30 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-2xl">
              🎮
            </div>
            <h1 className="text-2xl font-black tracking-wider">
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 text-transparent bg-clip-text">
                KIBORI ARCADE
              </span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-4 py-2 bg-cyan-500/20 border border-cyan-400/40 rounded-full text-sm font-bold text-cyan-300">
              🎯 8 Games Available
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/15 border border-cyan-400/40 rounded-full text-sm font-bold text-cyan-300">
            ⚡ 3D CYBER ARCADE & GAMING UNIVERSE
          </div>
          <h2 className="text-5xl md:text-6xl font-black tracking-tight">
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-purple-400 text-transparent bg-clip-text">
              SELECT YOUR GAME
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Eight interactive 3D gaming experiences with high-octane physics and cyber aesthetics
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4 mb-12 max-w-3xl mx-auto">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center backdrop-blur-sm">
            <div className="text-3xl font-black text-cyan-400">8</div>
            <div className="text-sm text-gray-400 font-semibold mt-1">Total Games</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center backdrop-blur-sm">
            <div className="text-3xl font-black text-purple-400">0</div>
            <div className="text-sm text-gray-400 font-semibold mt-1">Games Played</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center backdrop-blur-sm">
            <div className="text-3xl font-black text-pink-400">0</div>
            <div className="text-sm text-gray-400 font-semibold mt-1">High Score</div>
          </div>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <button
              key={game.id}
              onClick={() => setSelectedGame(game.name)}
              className="group relative bg-white/5 border border-white/10 rounded-3xl p-8 hover:border-cyan-400/50 transition-all hover:scale-[1.02] text-left overflow-hidden backdrop-blur-sm"
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
              
              <div className="relative z-10 space-y-4">
                <div className="text-5xl">{game.name.split(' ')[0]}</div>
                <h3 className="text-xl font-black text-white group-hover:text-cyan-300 transition-colors">
                  {game.name.substring(game.name.indexOf(' ') + 1)}
                </h3>
                <p className="text-sm text-gray-400">
                  Click to play this exciting game
                </p>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-gray-500 font-mono">High Score: 0</span>
                  <div className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-bold text-sm group-hover:brightness-110 transition-all flex items-center gap-2">
                    ▶ Play
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-sm text-gray-500 border-t border-white/10 pt-8">
          <p>KIBORI · 3D CYBER ARCADE • Built with React & Tailwind CSS</p>
        </footer>
      </main>
    </div>
  );
}
