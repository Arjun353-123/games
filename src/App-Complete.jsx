import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, ExternalLink, X, Trophy, Globe, Zap, LogIn, User, Lock, ArrowRight } from 'lucide-react';
import ThreeDBackground from './components/ThreeDBackground';

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
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-white border-2 border-black flex items-center justify-center shadow-lg">
            <Gamepad2 className="w-10 h-10 text-black" />
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
                  className="w-full pl-11 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none transition-colors text-black font-medium placeholder:text-gray-400"
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
                  className="w-full pl-11 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none transition-colors text-black font-medium placeholder:text-gray-400"
                  required
                />
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-white hover:bg-gray-100 border-2 border-black text-black font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
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
              className="w-full py-2 bg-white hover:bg-gray-100 text-black font-bold rounded-lg transition-all flex items-center justify-center gap-2 border-2 border-black"
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
  const [showKiboriFullscreen, setShowKiboriFullscreen] = useState(false);

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
    <div className="min-h-screen bg-white text-black relative overflow-hidden">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white border-2 border-black flex items-center justify-center">
              <Gamepad2 className="w-6 h-6 text-black" />
            </div>
            <div>
              <span className="text-sm font-bold text-black tracking-wide">KIBORI GAMING</span>
              <p className="text-xs text-black font-semibold">Welcome, {username}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-white border-2 border-black rounded-md text-xs font-semibold text-black">
              8 GAMES
            </span>
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-white hover:bg-gray-100 border-2 border-black text-black font-semibold rounded-lg text-sm transition-all"
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
            className="text-sm font-bold text-black tracking-widest mb-4 uppercase"
          >
            🎮 Premium Gaming Platform
          </motion.div>

          <div className="space-y-4">
            <h1 className="text-6xl font-black text-black tracking-tight leading-tight">
              SELECT YOUR GAME
            </h1>
            <p className="text-xl text-black font-semibold max-w-2xl mx-auto">
              Seven premium 3D arcade experiences with achievements, stats tracking, and stunning gameplay.
            </p>
          </div>
        </div>

        {/* Kibori 3D Arena Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-black">🎮 KIBORI 3D CYBER ARENA</h2>
              <span className="px-3 py-1 bg-white border-2 border-black text-black rounded-full text-xs font-bold">
                LIVE WEBGL
              </span>
            </div>
            <button
              onClick={() => setShowKiboriFullscreen(true)}
              className="px-4 py-2 bg-white hover:bg-gray-100 border-2 border-black text-black font-black rounded-lg text-sm transition-all flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Open Fullscreen
            </button>
          </div>
          
          <div className="relative rounded-2xl overflow-hidden border-2 border-gray-300 bg-white shadow-xl">
            <div className="aspect-video relative">
              <iframe 
                src="/landing-pages/kibori.html" 
                className="w-full h-full border-0"
                title="Kibori 3D Arena"
                sandbox="allow-scripts"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-white/10 pointer-events-none" />
              
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div className="px-4 py-2 bg-white/95 backdrop-blur-sm border-2 border-gray-300 rounded-lg shadow-lg">
                  <p className="text-xs font-black text-black">Interactive 3D Environment</p>
                  <p className="text-xs text-black font-semibold">Drag to rotate • Scroll to zoom</p>
                </div>
                <button
                  onClick={() => setShowKiboriFullscreen(true)}
                  className="px-4 py-2 bg-white hover:bg-gray-100 border-2 border-black text-black font-black rounded-lg text-sm transition-all flex items-center gap-2"
                >
                  Explore →
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { icon: <Gamepad2 className="w-6 h-6" />, label: '8 Games' },
            { icon: <Globe className="w-6 h-6" />, label: 'WebGL 3D' },
            { icon: <Zap className="w-6 h-6" />, label: 'Real-time Physics' },
            { icon: <Trophy className="w-6 h-6" />, label: 'High Scores' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-6 bg-white border-2 border-black rounded-xl text-center hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="text-black mb-3 flex justify-center">
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
            <span className="px-4 py-2 bg-white border-2 border-black text-black rounded-full text-sm font-bold tracking-wider">
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
                className="group p-6 bg-white border-2 border-gray-200 hover:border-gray-400 rounded-2xl text-left transition-all hover:shadow-xl"
              >
                <div className="text-4xl mb-3">{game.icon}</div>
                <h3 className="text-lg font-black text-black mb-2">
                  {game.name}
                </h3>
                <p className="text-xs text-black font-semibold mb-4">{game.desc}</p>
                <div className="px-4 py-2 bg-white border-2 border-black text-black rounded-lg font-black text-sm text-center hover:bg-gray-100 transition-all">
                  Play Now →
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </main>

      {/* Kibori 3D Arena Fullscreen Modal */}
      <AnimatePresence>
        {showKiboriFullscreen && (
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
            
            <div className="absolute top-0 left-0 right-0 z-10 border-b border-gray-200 bg-white/95 backdrop-blur-xl">
              <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white border-2 border-black flex items-center justify-center">
                    <Gamepad2 className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <span className="text-sm font-black text-black tracking-wide">KIBORI 3D CYBER ARENA</span>
                    <p className="text-xs text-black">Interactive WebGL Gaming Environment</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowKiboriFullscreen(false)}
                  className="px-6 py-3 bg-white hover:bg-gray-100 border-2 border-black text-black font-black rounded-lg transition-all flex items-center gap-2"
                >
                  <X className="w-5 h-5" />
                  Close Arena
                </button>
              </div>
            </div>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 bg-white/95 backdrop-blur-xl border-2 border-black rounded-lg">
              <p className="text-black font-bold text-sm text-center">
                🌟 Drag to rotate • Scroll to zoom • Explore the 3D cyber world
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-16">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center text-sm">
          <p className="font-black text-black">KIBORI · 3D CYBER ARCADE & GAMING UNIVERSE</p>
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
                    className="w-full px-6 py-3 bg-white hover:bg-gray-100 border-2 border-black text-black font-black rounded-lg transition-all flex items-center justify-center gap-2"
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
