import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, X, Trophy, Globe, Zap, LogIn, User, Lock, ArrowRight, Star, Circle, ExternalLink } from 'lucide-react';

// Import actual game components
import CyberRacer3D from './games/CyberRacer3D';
import TempleRunner3D from './games/TempleRunner3D';
import Snake3D from './games/Snake3D';
import TicTacToe3D from './games/TicTacToe3D';
import CyberBird from './games/CyberBird';
import BrickBreaker from './games/BrickBreaker';

const GAMES = [
  { id: 'racer', name: 'Neon Racer', icon: '🏎️', desc: 'High-speed synthwave racing', component: 'CyberRacer3D' },
  { id: 'temple', name: 'Temple Runner', icon: '🏃', desc: 'Fast-paced obstacle runner', component: 'TempleRunner3D' },
  { id: 'snake', name: 'Cyber Snake', icon: '🐍', desc: 'Classic snake in 3D grid', component: 'Snake3D' },
  { id: 'ox', name: 'Neon OX', icon: '❌', desc: 'Tic-tac-toe with AI', component: 'TicTacToe3D' },
  { id: 'bird', name: 'Flappy Bird', icon: '🐦', desc: 'Tap to fly arcade game', component: 'CyberBird' },
  { id: 'breaker', name: 'Brick Breaker', icon: '🧱', desc: 'Paddle ball brick smasher', component: 'BrickBreaker' },
  { id: 'cyber', name: 'Cyber Bird', icon: '🎮', desc: 'Enhanced flappy mechanics', component: 'CyberBird' },
];

// Animated Stars Background Component
function StarField() {
  const [stars, setStars] = useState([]);

  useEffect(() => {
    const newStars = Array.from({ length: 150 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 2,
    }));
    setStars(newStars);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute bg-white rounded-full"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
          }}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            delay: star.delay,
          }}
        />
      ))}
    </div>
  );
}

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showKibori, setShowKibori] = useState(false);

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
    <div className="min-h-screen bg-[#0a0a0a] relative">
      <StarField />
      
      {/* Kibori 3D Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <iframe 
          src="/landing-pages/kibori.html" 
          className="w-full h-full border-0 opacity-30"
          title="Kibori 3D Background"
          sandbox="allow-scripts"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
      </div>

      {/* Top Navigation */}
      <header className="relative z-20 border-b border-gray-800/50 bg-black/30 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center glow-cyan-sm">
              <Gamepad2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-sm font-black text-white tracking-wide">KIBORI — 3D CYBER ARENA</span>
            </div>
          </div>
          <button
            onClick={() => setShowKibori(!showKibori)}
            className="px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 font-bold rounded-lg text-sm transition-all flex items-center gap-2"
          >
            <Gamepad2 className="w-4 h-4" />
            {showKibori ? 'Hide 3D Arena' : 'View Full 3D Arena'}
          </button>
        </div>
      </header>

      <div className="flex items-center justify-center p-6 min-h-[calc(100vh-80px)] relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg glow-cyan">
              <Gamepad2 className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-black text-white mb-2">KIBORI GAMING UNIVERSE</h1>
            <p className="text-gray-400">Sign in to access 7 amazing 3D games</p>
          </div>

          {/* Login Form */}
          <div className="bg-[#1a1a1a]/90 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-white mb-2">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="w-full pl-11 pr-4 py-3 bg-[#0a0a0a] border border-gray-700 rounded-lg focus:border-cyan-500 focus:outline-none transition-colors text-white font-medium placeholder:text-gray-600"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-white mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-11 pr-4 py-3 bg-[#0a0a0a] border border-gray-700 rounded-lg focus:border-cyan-500 focus:outline-none transition-colors text-white font-medium placeholder:text-gray-600"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-black rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg glow-cyan disabled:opacity-50"
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

            <div className="mt-6 pt-6 border-t border-gray-800">
              <p className="text-xs text-gray-500 text-center mb-3 font-semibold">Quick Login (Demo)</p>
              <button
                type="button"
                onClick={() => onLogin('Guest Player')}
                className="w-full py-2 bg-[#0a0a0a] hover:bg-gray-900 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 border border-gray-700"
              >
                Continue as Guest
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-gray-500 font-semibold mt-6">
            Powered by Kibori 3D Engine • WebGL Gaming Platform
          </p>
        </motion.div>
      </div>
      <AnimatePresence>
        {showKibori && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black"
          >
            <div className="absolute inset-0">
              <iframe 
                src="/landing-pages/kibori.html" 
                className="w-full h-full border-0"
                title="Kibori 3D Arena"
                sandbox="allow-scripts"
              />
            </div>
            <button
              onClick={() => setShowKibori(false)}
              className="absolute top-6 right-6 px-6 py-3 bg-black/80 hover:bg-black/90 backdrop-blur-xl border border-gray-700 text-white font-bold rounded-lg transition-all flex items-center gap-2 z-10"
            >
              <X className="w-5 h-5" />
              Close 3D Arena
            </button>
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 bg-black/80 backdrop-blur-xl border border-cyan-500/30 text-cyan-400 font-bold rounded-lg text-sm">
              🎮 KIBORI 3D CYBER ARENA - Interactive WebGL Experience
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MainApp({ username, onLogout }) {
  const [selectedGame, setSelectedGame] = useState(null);
  const [activeGame, setActiveGame] = useState(null);
  const [showKiboriArena, setShowKiboriArena] = useState(false);

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
    <div className="min-h-screen bg-[#0a0a0a] text-white relative">
      <StarField />

      {/* Header */}
      <header className="border-b border-gray-800 bg-[#0a0a0a]/80 backdrop-blur-xl sticky top-0 z-40 relative">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center glow-cyan-sm">
              <Gamepad2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-sm font-black text-white tracking-wide">ARCADE UNIVERSE</span>
              <p className="text-xs text-gray-400">Welcome, {username}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-md text-xs font-bold text-cyan-400">
              7 GAMES
            </span>
            <button
              onClick={() => setShowKiboriArena(true)}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-black rounded-lg text-sm transition-all glow-cyan-sm flex items-center gap-2"
            >
              <Gamepad2 className="w-4 h-4" />
              3D Arena
            </button>
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-black rounded-lg text-sm transition-all glow-red"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-12 space-y-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-sm font-bold text-gray-400 tracking-widest mb-4"
          >
            MONOCHROME 3D NOIR ARCADE
          </motion.div>

          <div className="space-y-4">
            <h1 className="text-6xl font-black text-white tracking-tight leading-tight">
              SELECT YOUR GAME
            </h1>
            <p className="text-xl text-gray-400 font-medium max-w-2xl mx-auto">
              Free premium 3D gaming experiences with immersive 3D environments, addictive gameplay, and futuristic cyber themes.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: 'SESSIONS', value: '29', icon: <Circle className="w-5 h-5" /> },
            { label: 'TOTAL SCORE', value: '5973', icon: <Trophy className="w-5 h-5" /> },
            { label: 'DAILY STREAK', value: '27m', icon: <Zap className="w-5 h-5" /> },
            { label: 'GAMES TRIED', value: '5/5', icon: <Star className="w-5 h-5" /> },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-6 bg-[#1a1a1a] border border-gray-800 rounded-xl hover:border-cyan-500/30 transition-all"
            >
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                {stat.icon}
                <span className="text-xs font-bold">{stat.label}</span>
              </div>
              <div className="text-3xl font-black text-white">{stat.value}</div>
            </motion.div>
          ))}
        </div>

        {/* Kibori 3D Arena Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-black text-white tracking-wider">🎮 KIBORI 3D CYBER ARENA</h2>
              <span className="px-2 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded text-xs font-bold text-cyan-400">
                LIVE WEBGL
              </span>
            </div>
            <button
              onClick={() => setShowKiboriArena(true)}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-black rounded-lg text-sm transition-all glow-purple flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Open Full Arena
            </button>
          </div>
          
          <div className="relative rounded-2xl overflow-hidden border-2 border-cyan-500/30 bg-[#0a0a0a] shadow-2xl glow-cyan">
            <div className="aspect-video relative">
              <iframe 
                src="/landing-pages/kibori.html" 
                className="w-full h-full border-0"
                title="Kibori 3D Arena Preview"
                sandbox="allow-scripts"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30 pointer-events-none" />
              
              {/* Overlay Info */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div className="px-4 py-2 bg-black/80 backdrop-blur-xl border border-cyan-500/30 rounded-lg">
                  <p className="text-xs font-bold text-cyan-400">Interactive 3D Environment</p>
                  <p className="text-xs text-gray-400">Drag to explore • Real-time WebGL rendering</p>
                </div>
                <button
                  onClick={() => setShowKiboriArena(true)}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-black rounded-lg text-sm transition-all glow-cyan-sm flex items-center gap-2"
                >
                  Explore →
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Games Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-sm font-black text-white tracking-wider">🎮 ALL GAMES</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-800 to-transparent" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {GAMES.map((game, i) => (
              <motion.button
                key={game.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => handleGameClick(game)}
                className="group p-6 bg-[#1a1a1a] border border-gray-800 hover:border-cyan-500 rounded-xl text-left transition-all hover:bg-[#1f1f1f]"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">{game.icon}</div>
                  <div className="px-2 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded text-xs font-bold text-cyan-400">
                    NEW
                  </div>
                </div>
                <h3 className="text-lg font-black text-white mb-2 group-hover:text-cyan-400 transition-colors">
                  {game.name}
                </h3>
                <p className="text-sm text-gray-500 font-semibold mb-4">{game.desc}</p>
                <div className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-black text-sm text-center group-hover:from-cyan-600 group-hover:to-blue-700 transition-all glow-cyan-sm">
                  Play Now →
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </main>

      {/* Kibori 3D Arena Fullscreen Modal */}
      <AnimatePresence>
        {showKiboriArena && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black"
          >
            <div className="absolute inset-0">
              <iframe 
                src="/landing-pages/kibori.html" 
                className="w-full h-full border-0"
                title="Kibori 3D Arena Fullscreen"
                sandbox="allow-scripts"
              />
            </div>
            
            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 z-10 border-b border-gray-800/50 bg-black/30 backdrop-blur-xl">
              <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center glow-cyan-sm">
                    <Gamepad2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <span className="text-sm font-black text-white tracking-wide">KIBORI 3D CYBER ARENA</span>
                    <p className="text-xs text-gray-400">Interactive WebGL Gaming Environment</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowKiboriArena(false)}
                  className="px-6 py-3 bg-black/80 hover:bg-black/90 backdrop-blur-xl border border-gray-700 text-white font-bold rounded-lg transition-all flex items-center gap-2"
                >
                  <X className="w-5 h-5" />
                  Close Arena
                </button>
              </div>
            </div>

            {/* Bottom Info Bar */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 bg-black/80 backdrop-blur-xl border border-cyan-500/30 rounded-lg">
              <p className="text-cyan-400 font-bold text-sm text-center">
                🌟 Drag to rotate • Scroll to zoom • Explore the 3D cyber world
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Modal */}
      <AnimatePresence>
        {selectedGame && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6"
            onClick={() => setSelectedGame(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#1a1a1a] rounded-3xl p-8 max-w-md w-full border border-gray-800 shadow-2xl"
            >
              <div className="text-center space-y-6">
                <div className="text-6xl">{selectedGame.icon}</div>
                <div>
                  <h2 className="text-3xl font-black text-white mb-2">{selectedGame.name}</h2>
                  <p className="text-gray-400 font-semibold">{selectedGame.desc}</p>
                </div>
                <div className="space-y-3">
                  <button 
                    onClick={handleStartGame}
                    className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-black rounded-lg transition-all flex items-center justify-center gap-2 glow-green"
                  >
                    <Gamepad2 className="w-5 h-5" />
                    Start Game
                  </button>
                  <button 
                    onClick={() => setSelectedGame(null)}
                    className="w-full px-6 py-3 bg-[#0a0a0a] hover:bg-gray-900 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 border border-gray-800"
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
