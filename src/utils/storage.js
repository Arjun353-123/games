const HIGH_SCORES_KEY = 'arcade_universe_high_scores_v1';
const SETTINGS_KEY = 'arcade_universe_settings_v1';

export const getHighScores = () => {
  try {
    const data = localStorage.getItem(HIGH_SCORES_KEY);
    return data ? JSON.parse(data) : {
      templeRun: 0,
      snake: 0,
      ticTacToeWins: 0,
      cyberBird: 0,
      brickBreaker: 0,
    };
  } catch (e) {
    return { templeRun: 0, snake: 0, ticTacToeWins: 0, cyberBird: 0, brickBreaker: 0 };
  }
};

export const saveHighScore = (game, score) => {
  const scores = getHighScores();
  if (!scores[game] || score > scores[game]) {
    scores[game] = score;
    try {
      localStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(scores));
    } catch (e) {
      console.error(e);
    }
    return true; // New High Score!
  }
  return false;
};

export const getSettings = () => {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? JSON.parse(data) : {
      mode: 'college',
      sound: true,
      bgm: true,
      bgType: '3d-particles',
      touchControls: false,
      reduceMotion: false,
      cardGlow: true,
    };
  } catch (e) {
    return { mode: 'college', sound: true, bgm: true, bgType: '3d-particles', touchControls: false, reduceMotion: false, cardGlow: true };
  }
};

export const saveSettings = (settings) => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error(e);
  }
};
