import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, ExternalLink, X, Trophy, Globe, Zap, LogIn, User, Lock, ArrowRight } from 'lucide-react';

// Import actual game components
import ViceCity3D from './games/ViceCity3D';
import CyberRacer3D from './games/CyberRacer3D';
import TempleRunner3D from './games/TempleRunner3D';
import Snake3D from './games/Snake3D';
import TicTacToe3D from './games/TicTacToe3D';
import CyberBird from './games/CyberBird';
import BrickBreaker from './games/BrickBreaker';

const GAMES = [
  { id: 'vice', name: 'Vice City 3D', icon: '🌴', desc: 'Open world Miami 1986 action', component: 'ViceCity3D' },
  { id: 'racer', name: 'Neon Racer', icon: '🏎️', desc: 'High-speed synthwave racing', component: 'CyberRacer3D' },
  { id: 'temple', name: 'Temple Runner', icon: '🏃', desc: 'Fast-paced obstacle runner', component: 'TempleRunner3D' },
  { id: 'snake', name: 'Cyber Snake', icon: '🐍', desc: 'Classic snake in 3D grid', component: 'Snake3D' },
  { id: 'ox', name: 'Neon OX', icon: '❌', desc: 'Tic-tac-toe with AI', component: 'TicTacToe3D' },
  { id: 'bird', name: 'Flappy Bird', icon: '🐦', desc: 'Tap to fly arcade game', component: 'CyberBird' },
  { id: 'breaker', name: 'Brick Breaker', icon: '🧱', desc: 'Paddle ball brick smasher', component: 'BrickBreaker' },
  { id: 'cyber', name: 'Cyber Bird 2', icon: '🎮', desc: 'Enhanced flappy mechanics', component: 'CyberBird' },
];

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      setIsLoading(true);
      setTimeout(() => {
        onLogin(username);
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg glow-cyan">
            <Gamepad2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-black text-black mb-2">KIBORI GAMING</h1>
          <p className="text-black">Sign in to access 8 amazing games</p>
        </div>

        {/* Login Form */}
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Input */}
            <div>
              <label className="block text-sm font-bold text-black mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full pl-11 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-cyan-500 focus:outline-none transition-colors text-black font-medium placeholder:text-gray-400"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-bold text-black mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-11 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-cyan-500 focus:outline-none transition-colors text-black font-medium placeholder:text-gray-400"
                  required
                />
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg glow-cyan disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Quick Login */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-black text-center mb-3 font-semibold">Quick Login (Demo)</p>
            <button
              type="button"
              onClick={() => onLogin('Guest Player')}
              className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-black font-bold rounded-lg transition-all flex items-center justify-center gap-2 border-2 border-gray-300"
            >
              Continue as Guest
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-black font-semibold mt-6">
          By signing in, you agree to our Terms & Privacy Policy
        </p>
      </motion.div>
    </div>
  );
}

function MainApp({ username, onLogout }) {
  const [selectedGame, setSelectedGame] = useState(null);
  const [activeGame, setActiveGame] = useState(null);

  const handleGameClick = (game) => {
    setSelectedGame(game);
  };

  const handleStartGame = () => {
    if (selectedGame) {
      setActiveGame(selectedGame);
      setSelectedGame(null);
    }
  };

  const handleBackToMenu = () => {
    setActiveGame(null);
  };

  // Render active game
  if (activeGame) {
    const GameComponent = {
      ViceCity3D,
      CyberRacer3D,
      TempleRunner3D,
      Snake3D,
      TicTacToe3D,
      CyberBird,
      BrickBreaker,
    }[activeGame.component];

    if (GameComponent) {
      return <GameComponent isKidsMode={false} highScore={0} onBackToMenu={handleBackToMenu} />;
    }
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center glow-cyan-sm">
              <Gamepad2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-sm font-bold text-black tracking-wide">KIBORI GAMING</span>
              <p className="text-xs text-black font-semibold">Welcome, {username}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-cyan-50 border border-cyan-200 rounded-md text-xs font-semibold text-cyan-600">
              8 GAMES
            </span>
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold rounded-lg text-sm transition-all glow-red"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12 space-y-6">
          <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg glow-cyan">
            <Gamepad2 className="w-12 h-12 text-white" />
          </div>

          <div className="space-y-3">
            <h1 className="text-5xl font-black text-black tracking-tight">
              KIBORI GAMING UNIVERSE
            </h1>
            <p className="text-xl text-black font-bold">
              8 Interactive 3D Gaming Experiences
            </p>
          </div>

          <p className="text-black max-w-2xl mx-auto leading-relaxed font-medium">
            Experience cinematic 3D environments with real-time WebGL rendering, physics-based gameplay, 
            and immersive cyber aesthetics across multiple gaming genres.
          </p>

          <div className="flex justify-center gap-4 pt-4">
            <button className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold rounded-lg transition-all flex items-center gap-2 shadow-lg glow-cyan">
              <ExternalLink className="w-5 h-5" />
              Launch Full Arena
            </button>
            <button 
              onClick={() => document.getElementById('games-grid').scrollIntoView({ behavior: 'smooth' })}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-lg transition-all flex items-center gap-2 shadow-lg glow-purple"
            >
              <Gamepad2 className="w-5 h-5" />
              Browse Games
            </button>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { icon: <Gamepad2 className="w-6 h-6" />, label: '8 Games', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', glow: 'glow-purple-sm' },
            { icon: <Globe className="w-6 h-6" />, label: 'WebGL 3D', color: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-200', glow: 'glow-cyan-sm' },
            { icon: <Zap className="w-6 h-6" />, label: 'Real-time Physics', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', glow: 'glow-yellow-sm' },
            { icon: <Trophy className="w-6 h-6" />, label: 'High Scores', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', glow: 'glow-orange-sm' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`p-6 ${item.bg} border-2 ${item.border} rounded-xl text-center hover:shadow-lg transition-all ${item.glow} cursor-pointer`}
            >
              <div className={`${item.color} mb-3 flex justify-center`}>
                {item.icon}
              </div>
              <div className="text-sm font-black text-black">{item.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Games Grid */}
        <div id="games-grid" className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent flex-1" />
            <span className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full text-sm font-bold tracking-wider glow-cyan">
              ⚡ AVAILABLE GAMES
            </span>
            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent flex-1" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {GAMES.map((game, i) => (
              <motion.button
                key={game.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => handleGameClick(game)}
                className="group p-6 bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 hover:border-cyan-400 rounded-2xl text-left transition-all hover:shadow-xl glow-cyan-sm-hover"
              >
                <div className="text-4xl mb-3">{game.icon}</div>
                <h3 className="text-lg font-black text-black mb-2">
                  {game.name}
                </h3>
                <p className="text-xs text-black font-semibold mb-4">{game.desc}</p>
                <div className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-black text-sm text-center group-hover:from-cyan-600 group-hover:to-blue-600 transition-all glow-cyan-sm">
                  Play Now →
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-16">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center text-sm">
          <p className="font-black text-black">KIBORI · 3D CYBER ARCADE & GAMING UNIVERSE</p>
          <p className="mt-1 text-black font-semibold">Built with React, Three.js & Tailwind CSS</p>
        </div>
      </footer>

      {/* Game Modal */}
      <AnimatePresence>
        {selectedGame && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-6"
            onClick={() => setSelectedGame(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 max-w-md w-full border-2 border-gray-300 shadow-2xl"
            >
              <div className="text-center space-y-6">
                <div className="text-6xl">{selectedGame.icon}</div>
                <div>
                  <h2 className="text-3xl font-black text-black mb-2">{selectedGame.name}</h2>
                  <p className="text-black font-semibold">{selectedGame.desc}</p>
                </div>
                <div className="space-y-3">
                  <button 
                    onClick={handleStartGame}
                    className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-black rounded-lg transition-all flex items-center justify-center gap-2 glow-green"
                  >
                    <Gamepad2 className="w-5 h-5" />
                    Start Game
                  </button>
                  <button 
                    onClick={() => setSelectedGame(null)}
                    className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-black font-bold rounded-lg transition-all flex items-center justify-center gap-2 border-2 border-gray-300"
                  >
                    <X className="w-5 h-5" />
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');

  const handleLogin = (name) => {
    setUsername(name);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
  };

  return isLoggedIn ? (
    <MainApp username={username} onLogout={handleLogout} />
  ) : (
    <LoginPage onLogin={handleLogin} />
  );
}
