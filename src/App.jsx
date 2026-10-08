import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import BackgroundMedia from './components/BackgroundMedia';
import SplashScreen from './components/SplashScreen';
import StatsDashboard from './components/StatsDashboard';
import SettingsModal from './components/SettingsModal';
import AchievementsModal from './components/AchievementsModal';
import AchievementToast from './components/AchievementToast';
import TempleRunner3D from './games/TempleRunner3D';
import Snake3D from './games/Snake3D';
import TicTacToe3D from './games/TicTacToe3D';
import CyberBird from './games/CyberBird';
import BrickBreaker from './games/BrickBreaker';
import ViceCity3D from './games/ViceCity3D';
import CyberRacer3D from './games/CyberRacer3D';
import KiboriSceneModal from './components/KiboriScene';
import KiboriWorkshopShowcase from './components/KiboriWorkshopShowcase';
import { soundFx } from './utils/audio';
import { getHighScores, getSettings, saveSettings } from './utils/storage';
import {
  getStats, recordGameStart, recordGameEnd, recordModeUsed,
  getFavorites, toggleFavorite, getUnlockedAchievements, checkAndUnlockAchievements
} from './utils/stats';
import {
  Play, Trophy, Sparkles, Flame, Moon, X, Search, Heart, Star,
  Award, Filter, Gamepad2
} from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All Games' },
  { id: 'openWorld', label: 'Open World' },
  { id: 'racing', label: 'Racing' },
  { id: '3d', label: '3D Action' },
  { id: 'arcade', label: 'Arcade' },
  { id: 'multiplayer', label: 'Multiplayer' },
];

const GAME_CARDS = [
  {
    id: 'kibori',
    title: 'KIBORI: 3D CYBER ARENA',
    tag: '3D ARENA',
    badge: '3D CYBER ARENA',
    category: '3d',
    popular: true,
    description: 'Cinematic next-generation 3D gaming arena featuring eight interactive cyber environments, glowing neon particle physics, real-time shaders, and high-performance gameplay.',
    icon: '🎮',
    scoreKey: 'kibori',
  },
  {
    id: 'viceCity',
    title: 'VICE CITY 1986: 3D OPEN WORLD',
    tag: 'OPEN WORLD',
    badge: '3D OPEN WORLD',
    category: 'openWorld',
    popular: true,
    description: 'Miami 1986 open world! Hijack supercars, police cruisers & military tanks, evade 5-star police chases, complete missions, and blast heavy weapons with 80s synth radio!',
    icon: '🌴',
    scoreKey: 'viceCity',
  },
  {
    id: 'cyberRacer',
    title: 'NEON RACER 3D: SUPER DRIFT',
    tag: 'SPEED DRIFT',
    badge: 'SYNTH RACER',
    category: 'racing',
    popular: true,
    description: 'High-speed synthwave highway racing! Dodge traffic, trigger nitrous boost, drift through neon tracks, and chase high scores into the retro sunset.',
    icon: '🏎️',
    scoreKey: 'cyberRacer',
  },
  {
    id: 'templeRun',
    title: 'TEMPLE RUNNER 3D',
    tag: '3D RUNNER',
    badge: '3D RUNNER',
    category: '3d',
    popular: true,
    description: 'Sprint across floating ancient stone bridges, dodge laser obstacles, and collect glowing energy diamonds at maximum velocity!',
    icon: '🏃‍♂️',
    scoreKey: 'templeRun',
  },
  {
    id: 'snake',
    title: 'CYBER SNAKE 3D',
    tag: 'CYBER GRID',
    badge: 'RETRO 3D',
    category: '3d',
    popular: false,
    description: 'Navigate a glowing 3D cyber grid, eat power apples & stars, avoid laser walls and growing tail hazards!',
    icon: '🐍',
    scoreKey: 'snake',
  },
  {
    id: 'ox',
    title: 'NEON OX (TIC-TAC-TOE)',
    tag: 'AI BATTLE',
    badge: 'MULTIPLAYER & AI',
    category: 'multiplayer',
    popular: false,
    description: '3D flip grid OX game! Play 3x3 or 5x5 Mega Grid against smart AI or a friend locally.',
    icon: '❌⭕',
    scoreKey: 'ticTacToeWins',
  },
  {
    id: 'cyberBird',
    title: 'FLAPPY CYBER BIRD',
    tag: 'TAP ARCADE',
    badge: 'ARCADE TAP',
    category: 'arcade',
    popular: false,
    description: 'Tap screen or spacebar to fly through animated laser gates with high-octane physics.',
    icon: '🐦',
    scoreKey: 'cyberBird',
  },
  {
    id: 'brickBreaker',
    title: 'BRICK BREAKER 3D',
    tag: 'PADDLE ACTION',
    badge: 'ACTION PADDLE',
    category: 'arcade',
    popular: false,
    description: 'Smash glowing neon brick formations with bouncing laser balls and powerups.',
    icon: '🧱',
    scoreKey: 'brickBreaker',
  },
];

function getGradient(gameId, isKidsMode, isNoirMode) {
  const map = {
    kibori: 'from-cyan-500 via-indigo-600 to-purple-600 text-white',
    viceCity: isKidsMode ? 'from-pink-400 to-cyan-400' : isNoirMode ? 'from-zinc-100 to-neutral-400 text-black' : 'from-fuchsia-600 via-pink-500 to-cyan-400',
    cyberRacer: isKidsMode ? 'from-amber-400 to-orange-500' : isNoirMode ? 'from-zinc-200 to-neutral-300 text-black' : 'from-cyan-500 to-blue-600',
    templeRun: isKidsMode ? 'from-rose-500 to-amber-500' : isNoirMode ? 'from-zinc-100 to-neutral-300 text-black' : 'from-blue-600 to-cyan-500',
    snake: isKidsMode ? 'from-amber-400 to-emerald-500' : isNoirMode ? 'from-neutral-200 to-zinc-400 text-black' : 'from-emerald-500 to-teal-600',
    ox: isKidsMode ? 'from-purple-500 to-pink-500' : isNoirMode ? 'from-zinc-300 to-neutral-100 text-black' : 'from-purple-600 to-pink-600',
    cyberBird: isKidsMode ? 'from-sky-400 to-indigo-500' : isNoirMode ? 'from-neutral-100 to-zinc-300 text-black' : 'from-cyan-500 to-blue-600',
    brickBreaker: isKidsMode ? 'from-pink-500 to-rose-400' : isNoirMode ? 'from-zinc-200 to-white text-black' : 'from-indigo-600 to-purple-600',
  };
  return map[gameId] || 'from-blue-600 to-cyan-500';
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeGame, setActiveGame] = useState(null);
  const [showKiboriModal, setShowKiboriModal] = useState(false);
  const [settings, setSettings] = useState(getSettings());
  const [highScores, setHighScores] = useState(getHighScores());
  const [stats, setStats] = useState(getStats());
  const [favorites, setFavorites] = useState(getFavorites());
  const [unlockedAchievements, setUnlockedAchievements] = useState(getUnlockedAchievements());
  const [showHighScoresModal, setShowHighScoresModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);
  const [toastAchievement, setToastAchievement] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [tiltDegrees, setTiltDegrees] = useState({});
  const [recentGames, setRecentGames] = useState([]);

  const isKidsMode = settings.mode === 'kids';
  const isNoirMode = settings.mode === 'noir';
  const reduceMotion = settings.reduceMotion;

  useEffect(() => {
    setHighScores(getHighScores());
    const { unlocked, newlyUnlocked } = checkAndUnlockAchievements(getHighScores());
    setUnlockedAchievements(unlocked);
    if (newlyUnlocked.length > 0) {
      setToastAchievement(newlyUnlocked[0]);
      setTimeout(() => setToastAchievement(null), 4000);
    }
  }, [activeGame]);

  const refreshAchievements = useCallback(() => {
    const scores = getHighScores();
    const { unlocked, newlyUnlocked } = checkAndUnlockAchievements(scores);
    setUnlockedAchievements(unlocked);
    if (newlyUnlocked.length > 0) {
      setToastAchievement(newlyUnlocked[0]);
      setTimeout(() => setToastAchievement(null), 4000);
    }
  }, []);

  const handleToggleMode = () => {
    soundFx.playClick();
    const modes = ['kibori', 'kids', 'noir'];
    const currentMode = settings.mode === 'college' ? 'kibori' : (settings.mode || 'kibori');
    const currentIdx = modes.indexOf(currentMode);
    const nextMode = modes[(currentIdx + 1) % modes.length];
    const updated = { ...settings, mode: nextMode };
    setSettings(updated);
    saveSettings(updated);
    recordModeUsed(nextMode);
    refreshAchievements();
  };

  const handleOpenKiboriStage = () => {
    soundFx.playClick();
    const stageEl = document.getElementById('kibori-workshop-stage');
    if (stageEl) {
      stageEl.scrollIntoView({ behavior: 'smooth' });
    } else {
      setShowKiboriModal(true);
    }
  };

  const handleToggleSound = () => {
    const isMuted = soundFx.toggleMute();
    const updated = { ...settings, sound: !isMuted };
    setSettings(updated);
    saveSettings(updated);
  };

  const handleChangeBgType = (bgType) => {
    soundFx.playClick();
    const updated = { ...settings, bgType };
    setSettings(updated);
    saveSettings(updated);
  };

  const handleUpdateSettings = (updated) => {
    setSettings(updated);
    saveSettings(updated);
  };

  const handleSelectGame = (gameId) => {
    soundFx.playClick();
    if (gameId === 'kibori') {
      const stageEl = document.getElementById('kibori-workshop-stage');
      if (stageEl) {
        stageEl.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    recordGameStart(gameId);
    setStats(getStats());
    setActiveGame(gameId);
    setRecentGames((prev) => [gameId, ...prev.filter((id) => id !== gameId)].slice(0, 3));
    refreshAchievements();
  };

  const handleBackToMenu = () => {
    recordGameEnd();
    setStats(getStats());
    setActiveGame(null);
    setHighScores(getHighScores());
    refreshAchievements();
  };

  const handleToggleFavorite = (e, gameId) => {
    e.stopPropagation();
    soundFx.playClick();
    setFavorites(toggleFavorite(gameId));
  };

  const handleCardMouseMove = (e, gameId) => {
    if (reduceMotion) return;
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;
    setTiltDegrees((prev) => ({ ...prev, [gameId]: { rotateX, rotateY } }));
  };

  const handleCardMouseLeave = (gameId) => {
    setTiltDegrees((prev) => ({ ...prev, [gameId]: { rotateX: 0, rotateY: 0 } }));
  };

  const filteredGames = useMemo(() => {
    let games = [...GAME_CARDS];

    if (showFavoritesOnly) {
      games = games.filter((g) => favorites.includes(g.id));
    }

    if (activeCategory !== 'all') {
      games = games.filter((g) => g.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      games = games.filter(
        (g) => g.title.toLowerCase().includes(q) || g.description.toLowerCase().includes(q) || g.badge.toLowerCase().includes(q)
      );
    }

    games.sort((a, b) => {
      const aFav = favorites.includes(a.id) ? 1 : 0;
      const bFav = favorites.includes(b.id) ? 1 : 0;
      if (aFav !== bFav) return bFav - aFav;
      if (a.popular !== b.popular) return b.popular - a.popular;
      return 0;
    });

    return games;
  }, [searchQuery, activeCategory, showFavoritesOnly, favorites]);

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: reduceMotion ? 0 : i * 0.08, duration: 0.4, ease: 'easeOut' },
    }),
  };

  return (
    <div className={`min-h-screen relative flex flex-col transition-colors duration-300 ${
      isKidsMode ? 'text-slate-900 font-kids bg-slate-100' : isNoirMode ? 'text-white font-sans bg-black' : 'text-[#f2ece2] font-sans bg-[#0a0806]'
    }`}>
      {showSplash && (
        <SplashScreen mode={settings.mode} onComplete={() => setShowSplash(false)} />
      )}

      <BackgroundMedia bgType={settings.bgType} mode={settings.mode} />

      <Navbar
        mode={settings.mode}
        onToggleMode={handleToggleMode}
        soundMuted={soundFx.muted}
        onToggleSound={handleToggleSound}
        bgType={settings.bgType}
        onChangeBgType={handleChangeBgType}
        onOpenHighScores={() => { soundFx.playClick(); setShowHighScoresModal(true); }}
        onOpenSettings={() => { soundFx.playClick(); setShowSettingsModal(true); }}
        onOpenAchievements={() => { soundFx.playClick(); setShowAchievementsModal(true); }}
        onOpenKibori={handleOpenKiboriStage}
        achievementCount={unlockedAchievements.length}
      />

      {/* Kibori 3D Cyber Arena Scene (Modal or Active Experience) */}
      {showKiboriModal && (
        <KiboriSceneModal onClose={() => setShowKiboriModal(false)} />
      )}
      {activeGame === 'kibori' && (
        <KiboriSceneModal onClose={handleBackToMenu} />
      )}

      {/* Active Games */}
      {activeGame === 'viceCity' && <ViceCity3D isKidsMode={isKidsMode} highScore={highScores.viceCity} onBackToMenu={handleBackToMenu} />}
      {activeGame === 'cyberRacer' && <CyberRacer3D isKidsMode={isKidsMode} highScore={highScores.cyberRacer} onBackToMenu={handleBackToMenu} />}
      {activeGame === 'templeRun' && <TempleRunner3D isKidsMode={isKidsMode} highScore={highScores.templeRun} onBackToMenu={handleBackToMenu} />}
      {activeGame === 'snake' && <Snake3D isKidsMode={isKidsMode} highScore={highScores.snake} onBackToMenu={handleBackToMenu} />}
      {activeGame === 'ox' && <TicTacToe3D isKidsMode={isKidsMode} highScore={highScores.ticTacToeWins} onBackToMenu={handleBackToMenu} />}
      {activeGame === 'cyberBird' && <CyberBird isKidsMode={isKidsMode} highScore={highScores.cyberBird} onBackToMenu={handleBackToMenu} />}
      {activeGame === 'brickBreaker' && <BrickBreaker isKidsMode={isKidsMode} highScore={highScores.brickBreaker} onBackToMenu={handleBackToMenu} />}

      {/* Arcade Hub */}
      {!activeGame && !showSplash && (
        <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto p-4 md:p-8">
          {/* Hero */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center my-6 md:my-8 space-y-4"
          >
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs md:text-sm font-bold border ${
              isKidsMode
                ? 'bg-pink-100 text-pink-600 border-pink-300'
                : isNoirMode
                ? 'bg-white/10 text-white border-white/40'
                : 'bg-cyan-500/15 text-cyan-300 border-cyan-400/40 shadow-[0_0_20px_rgba(6,182,212,0.25)]'
            } ${!reduceMotion ? 'animate-pulse-slow' : ''}`}>
              {isKidsMode ? <Sparkles className="w-4 h-4" /> : isNoirMode ? <Moon className="w-4 h-4" /> : <Gamepad2 className="w-4 h-4 text-cyan-400" />}
              <span>
                {isKidsMode
                  ? 'WELCOME TO KIDS PLAYLAND! 🎈'
                  : isNoirMode
                  ? 'MONOCHROME 3D NOIR ARCADE 🖤'
                  : 'KIBORI · 3D CYBER ARCADE & GAMING UNIVERSE 🎮'}
              </span>
            </div>

            <h1 className={`text-4xl md:text-6xl font-black tracking-tight ${
              isKidsMode
                ? 'text-slate-800 font-kids'
                : isNoirMode
                ? 'text-white neon-text-noir font-retro text-3xl md:text-5xl'
                : 'font-heading text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-purple-400 tracking-wider text-4xl md:text-6xl drop-shadow-[0_4px_24px_rgba(6,182,212,0.3)]'
            }`}>
              {isKidsMode ? 'SELECT YOUR GAME' : isNoirMode ? 'SELECT YOUR GAME' : 'KIBORI 3D CYBER ARCADE'}
            </h1>

            <p className={`${
              isKidsMode ? 'text-slate-600' : isNoirMode ? 'text-zinc-400' : 'text-slate-300/80 font-light'
            } max-w-2xl mx-auto text-sm md:text-base leading-relaxed`}>
              Eight interactive 3D gaming realms and experiences with high-octane physics, real-time WebGL shaders, and global high score leaderboards.
            </p>
          </motion.div>

          {/* Stats Dashboard */}
          <StatsDashboard stats={stats} highScores={highScores} isKidsMode={isKidsMode} isNoirMode={isNoirMode} />

          {/* Live Interactive 3D Cyber Gaming Arena Stage in Dashboard */}
          {!isKidsMode && !isNoirMode && (
            <KiboriWorkshopShowcase onLaunchFullscreen={() => setShowKiboriModal(true)} />
          )}

          {/* Search & Filters */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-3 mb-6"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search games & crafts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-11 pr-4 py-3 rounded-2xl border text-sm font-medium outline-none transition-all search-glow ${
                  isNoirMode
                    ? 'bg-zinc-900/80 text-white border-white/20 placeholder:text-zinc-500'
                    : isKidsMode
                    ? 'bg-white/90 text-slate-800 border-pink-200 placeholder:text-pink-300'
                    : 'bg-[#16120d]/85 text-[#f2ece2] border-[#f2ece2]/15 placeholder:text-[#f2ece2]/40 focus:border-[#c8611a]'
                }`}
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { soundFx.playClick(); setActiveCategory(cat.id); }}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap border transition-all active:scale-95 ${
                    activeCategory === cat.id
                      ? isNoirMode
                        ? 'bg-white text-black border-white'
                        : isKidsMode
                        ? 'bg-pink-500 text-white border-pink-400'
                        : 'bg-[#c8611a] text-black border-[#e5a93b] font-black shadow-[0_0_15px_rgba(200,97,26,0.4)]'
                      : isNoirMode
                      ? 'bg-zinc-900 text-zinc-400 border-white/10 hover:border-white/30'
                      : isKidsMode
                      ? 'bg-white text-slate-700 border-pink-200'
                      : 'bg-[#16120d]/70 text-[#f2ece2]/70 border-[#f2ece2]/10 hover:border-[#c8611a]/40 hover:text-[#f2ece2]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}

              <button
                onClick={() => { soundFx.playClick(); setShowFavoritesOnly(!showFavoritesOnly); }}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap border transition-all active:scale-95 flex items-center gap-1.5 ${
                  showFavoritesOnly
                    ? 'bg-rose-500/20 text-rose-400 border-rose-400/50'
                    : isNoirMode
                    ? 'bg-zinc-900 text-zinc-400 border-white/10'
                    : isKidsMode
                    ? 'bg-white text-slate-700 border-pink-200'
                    : 'bg-[#16120d]/70 text-[#f2ece2]/70 border-[#f2ece2]/10 hover:border-[#c8611a]/30'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                Favorites
              </button>
            </div>
          </motion.div>

          {/* Recently Played */}
          {recentGames.length > 0 && !searchQuery && activeCategory === 'all' && !showFavoritesOnly && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
              <p className="text-xs font-bold uppercase tracking-widest text-[#e5a93b]/70 mb-3 flex items-center gap-2">
                <Gamepad2 className="w-3.5 h-3.5" /> Recently Played
              </p>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {recentGames.map((gameId) => {
                  const game = GAME_CARDS.find((g) => g.id === gameId);
                  if (!game) return null;
                  return (
                    <button
                      key={gameId}
                      onClick={() => handleSelectGame(gameId)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-2xl border whitespace-nowrap transition-all hover:scale-[1.02] active:scale-95 ${
                        isNoirMode
                          ? 'glass-panel-noir border-white/20'
                          : isKidsMode
                          ? 'glass-panel-kids border-pink-200'
                          : 'bg-[#16120d]/85 text-[#f2ece2] border-[#f2ece2]/10 hover:border-[#c8611a]/50 shadow-md'
                      }`}
                    >
                      <span className="text-2xl">{game.icon}</span>
                      <span className="text-sm font-bold">{game.title.split(' ').slice(0, 2).join(' ')}</span>
                      <Play className="w-3.5 h-3.5 opacity-60" />
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Games Grid */}
          {filteredGames.length === 0 ? (
            <div className="text-center py-16">
              <Filter className="w-12 h-12 text-[#f2ece2]/30 mx-auto mb-4" />
              <p className="text-[#f2ece2]/60 font-bold">No games match your search</p>
              <button
                onClick={() => { setSearchQuery(''); setActiveCategory('all'); setShowFavoritesOnly(false); }}
                className="mt-4 text-sm text-[#e5a93b] hover:underline font-bold"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 perspective-1000">
              {filteredGames.map((game, i) => {
                const tilt = tiltDegrees[game.id] || { rotateX: 0, rotateY: 0 };
                const isFav = favorites.includes(game.id);
                const gradient = getGradient(game.id, isKidsMode, isNoirMode);
                const glowClass = settings.cardGlow !== false
                  ? isKidsMode ? 'card-glow card-glow-kids' : isNoirMode ? 'card-glow card-glow-noir' : 'card-glow'
                  : '';

                return (
                  <motion.div
                    key={game.id}
                    custom={i}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover={reduceMotion ? {} : { scale: 1.02 }}
                    onClick={() => handleSelectGame(game.id)}
                    onMouseMove={(e) => handleCardMouseMove(e, game.id)}
                    onMouseLeave={() => handleCardMouseLeave(game.id)}
                    style={{
                      transform: reduceMotion ? undefined : `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
                      transition: 'transform 0.15s ease-out',
                    }}
                    className={`group relative rounded-3xl p-6 border cursor-pointer overflow-hidden preserve-3d shadow-2xl ${glowClass} ${
                      isKidsMode
                        ? 'glass-panel-kids hover:border-pink-400'
                        : isNoirMode
                        ? 'glass-panel-noir hover:border-white hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]'
                        : 'bg-[#0b1026]/90 border-cyan-500/20 hover:border-cyan-400/60 hover:shadow-[0_12px_40px_rgba(6,182,212,0.25)] backdrop-blur-md'
                    }`}
                  >
                    {/* Favorite button */}
                    <button
                      onClick={(e) => handleToggleFavorite(e, game.id)}
                      className={`absolute top-4 right-4 p-2 rounded-xl border transition-all z-10 ${
                        isFav ? 'bg-rose-500/20 text-rose-400 border-rose-400/40' : 'bg-slate-900/60 text-slate-500 border-white/10 hover:text-rose-400 opacity-0 group-hover:opacity-100'
                      } ${isFav ? 'opacity-100' : ''}`}
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                    </button>

                    <div className="flex justify-between items-center mb-4 pr-8">
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wider ${
                          isKidsMode
                            ? 'bg-pink-100 text-pink-700'
                            : isNoirMode
                            ? 'bg-white/20 text-white border border-white/40'
                            : 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-mono'
                        }`}>
                          {game.badge}
                        </span>
                        {game.tag && !isKidsMode && (
                          <span className="font-mono text-purple-300 text-[10px] font-bold tracking-wider select-none px-2 py-0.5 rounded bg-purple-950/60 border border-purple-500/30">
                            {game.tag}
                          </span>
                        )}
                      </div>
                      {game.popular && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400">
                          <Star className="w-3 h-3 fill-current" /> POPULAR
                        </span>
                      )}
                    </div>

                    <div className={`text-5xl mb-3 transition-transform ${!reduceMotion ? 'group-hover:scale-110' : ''}`}>
                      {game.icon}
                    </div>

                    <h3 className={`text-xl font-black mb-2 ${
                      isKidsMode
                        ? 'text-slate-800'
                        : isNoirMode
                        ? 'text-white'
                        : 'font-heading text-white group-hover:text-cyan-300 transition-colors'
                    }`}>
                      {game.title}
                    </h3>

                    <p className={`text-xs mb-4 leading-relaxed ${
                      isKidsMode ? 'text-slate-600' : isNoirMode ? 'text-zinc-400' : 'text-slate-300/70 font-light'
                    }`}>
                      {game.description}
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      {highScores[game.scoreKey] > 0 ? (
                        <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${
                          isKidsMode
                            ? 'text-amber-600 bg-amber-50 border-amber-200'
                            : isNoirMode
                            ? 'text-white bg-white/10 border-white/30'
                            : 'text-amber-300 bg-amber-500/10 border-amber-500/30 font-mono'
                        }`}>
                          <Trophy className="w-3.5 h-3.5" /> Best: {highScores[game.scoreKey]}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">No record yet</span>
                      )}
                    </div>

                    <button className={`w-full py-3 rounded-2xl font-black text-sm shadow-lg flex items-center justify-center gap-2 ${
                      isKidsMode
                        ? `bg-gradient-to-r ${gradient} text-white`
                        : isNoirMode
                        ? 'bg-white text-black'
                        : 'bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 text-white font-extrabold hover:brightness-110 shadow-[0_4px_16px_rgba(6,182,212,0.35)]'
                    } transition-all`}>
                      <Play className="w-4 h-4 fill-current" />
                      <span>PLAY NOW</span>
                    </button>
                  </motion.div>
                );
              })}
            </div>
          )}

          <footer className="mt-12 text-center text-xs text-slate-400 border-t border-white/10 pt-6 space-y-1">
            <p>KIBORI · 3D CYBER ARCADE & GAMING UNIVERSE • {unlockedAchievements.length} Achievements Unlocked</p>
            <p className="text-slate-500">Built with React, ThreeUI, Three.js & Tailwind CSS</p>
          </footer>
        </main>
      )}

      {/* High Scores Modal */}
      <AnimatePresence>
        {showHighScoresModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-6"
            onClick={() => setShowHighScoresModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className={`max-w-md w-full p-6 rounded-3xl border shadow-2xl relative ${
                isNoirMode
                  ? 'glass-panel-noir border-white/40'
                  : 'bg-[#0a0f24]/95 border-amber-500/40 shadow-[0_20px_60px_rgba(0,0,0,0.9)] backdrop-blur-xl text-white'
              }`}
            >
              <button
                onClick={() => { soundFx.playClick(); setShowHighScoresModal(false)} }
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-amber-500/20 text-amber-300 rounded-2xl border border-amber-400/40">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-heading font-black text-white tracking-wider">
                    HIGH SCORES LEADERBOARD
                  </h3>
                  <p className="text-xs text-slate-400">All-time record scores across games</p>
                </div>
              </div>

              <div className="space-y-3 mb-6 max-h-[50vh] overflow-y-auto pr-1">
                {GAME_CARDS.map((game) => {
                  const score = highScores[game.scoreKey] || 0;
                  const maxScore = Math.max(...Object.values(highScores), 1);
                  const pct = Math.round((score / maxScore) * 100);
                  return (
                    <div key={game.id} className="p-3 bg-[#0d1430]/80 rounded-2xl border border-white/10">
                      <div className="flex justify-between items-center text-sm mb-2">
                        <span className="flex items-center gap-2 font-medium text-slate-200">
                          <span>{game.icon}</span>
                          <span>{game.title.split(' ').slice(0, 2).join(' ')}</span>
                          {game.tag && (
                            <span className="text-[10px] font-mono text-cyan-400 font-bold">{game.tag}</span>
                          )}
                        </span>
                        <span className="font-mono font-black text-amber-300 text-base">{score}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-black/40 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, delay: 0.2 }}
                          className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-cyan-400 rounded-full"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => { soundFx.playClick(); setShowHighScoresModal(false); }}
                className="w-full py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 hover:brightness-110 text-black font-extrabold rounded-2xl text-sm transition-all shadow-[0_4px_16px_rgba(245,158,11,0.3)] font-mono"
              >
                CLOSE LEADERBOARD
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <SettingsModal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} settings={settings} onUpdateSettings={handleUpdateSettings} mode={settings.mode} />
      <AchievementsModal isOpen={showAchievementsModal} onClose={() => setShowAchievementsModal(false)} unlockedIds={unlockedAchievements} mode={settings.mode} />
      <AchievementToast achievement={toastAchievement} onDismiss={() => setToastAchievement(null)} />
    </div>
  );
}
