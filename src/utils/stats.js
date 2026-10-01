const STATS_KEY = 'arcade_universe_stats_v1';
const FAVORITES_KEY = 'arcade_universe_favorites_v1';
const ACHIEVEMENTS_KEY = 'arcade_universe_achievements_v1';

const DEFAULT_STATS = {
  gamesPlayed: 0,
  totalPlayMinutes: 0,
  lastPlayedDate: null,
  streakDays: 0,
  gamesTried: [],
  sessionStart: null,
};

export const ACHIEVEMENT_DEFS = [
  { id: 'first_play', title: 'First Launch', desc: 'Play your first game', icon: '🚀', check: (s) => s.gamesPlayed >= 1 },
  { id: 'explorer', title: 'Game Explorer', desc: 'Try all 5 arcade games', icon: '🗺️', check: (s) => s.gamesTried.length >= 5 },
  { id: 'marathon', title: 'Marathon Gamer', desc: 'Play 10 game sessions', icon: '🏃', check: (s) => s.gamesPlayed >= 10 },
  { id: 'streak_3', title: 'On Fire', desc: '3-day play streak', icon: '🔥', check: (s) => s.streakDays >= 3 },
  { id: 'streak_7', title: 'Dedicated', desc: '7-day play streak', icon: '💎', check: (s) => s.streakDays >= 7 },
  { id: 'high_scorer', title: 'High Scorer', desc: 'Set any personal best', icon: '🏆', check: (s) => s.hasHighScore },
  { id: 'kids_mode', title: 'Kid at Heart', desc: 'Switch to Kids mode', icon: '🎈', check: (s) => s.usedKidsMode },
  { id: 'noir_mode', title: 'Night Owl', desc: 'Switch to Noir mode', icon: '🌙', check: (s) => s.usedNoirMode },
  { id: 'century', title: 'Century Club', desc: 'Combined high scores over 500', icon: '⭐', check: (s) => s.totalHighScore >= 500 },
  { id: 'legend', title: 'Arcade Legend', desc: 'Combined high scores over 2000', icon: '👑', check: (s) => s.totalHighScore >= 2000 },
];

export const getStats = () => {
  try {
    const data = localStorage.getItem(STATS_KEY);
    return data ? { ...DEFAULT_STATS, ...JSON.parse(data) } : { ...DEFAULT_STATS };
  } catch {
    return { ...DEFAULT_STATS };
  }
};

export const saveStats = (stats) => {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error(e);
  }
};

export const recordGameStart = (gameId) => {
  const stats = getStats();
  const today = new Date().toDateString();

  stats.gamesPlayed += 1;
  if (!stats.gamesTried.includes(gameId)) {
    stats.gamesTried = [...stats.gamesTried, gameId];
  }

  if (stats.lastPlayedDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (stats.lastPlayedDate === yesterday.toDateString()) {
      stats.streakDays = (stats.streakDays || 0) + 1;
    } else if (stats.lastPlayedDate !== today) {
      stats.streakDays = 1;
    }
    stats.lastPlayedDate = today;
  }

  stats.sessionStart = Date.now();
  saveStats(stats);
  return stats;
};

export const recordGameEnd = () => {
  const stats = getStats();
  if (stats.sessionStart) {
    const minutes = Math.max(1, Math.round((Date.now() - stats.sessionStart) / 60000));
    stats.totalPlayMinutes = (stats.totalPlayMinutes || 0) + minutes;
    stats.sessionStart = null;
    saveStats(stats);
  }
  return stats;
};

export const recordModeUsed = (mode) => {
  const stats = getStats();
  if (mode === 'kids') stats.usedKidsMode = true;
  if (mode === 'noir') stats.usedNoirMode = true;
  saveStats(stats);
};

export const getFavorites = () => {
  try {
    const data = localStorage.getItem(FAVORITES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const toggleFavorite = (gameId) => {
  const favorites = getFavorites();
  const next = favorites.includes(gameId)
    ? favorites.filter((id) => id !== gameId)
    : [...favorites, gameId];
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  } catch (e) {
    console.error(e);
  }
  return next;
};

export const getUnlockedAchievements = () => {
  try {
    const data = localStorage.getItem(ACHIEVEMENTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const checkAndUnlockAchievements = (highScores = {}) => {
  const stats = getStats();
  const totalHighScore = Object.values(highScores).reduce((a, b) => a + (b || 0), 0);
  const hasHighScore = Object.values(highScores).some((s) => s > 0);

  const context = { ...stats, totalHighScore, hasHighScore };
  const unlocked = getUnlockedAchievements();
  const newlyUnlocked = [];

  ACHIEVEMENT_DEFS.forEach((ach) => {
    if (!unlocked.includes(ach.id) && ach.check(context)) {
      unlocked.push(ach.id);
      newlyUnlocked.push(ach);
    }
  });

  if (newlyUnlocked.length > 0) {
    try {
      localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(unlocked));
    } catch (e) {
      console.error(e);
    }
  }

  return { unlocked, newlyUnlocked };
};
