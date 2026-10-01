import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, RotateCcw, Trophy, Zap, Sparkles } from 'lucide-react';
import { soundFx } from '../utils/audio';
import { saveHighScore } from '../utils/storage';
import MobileControls from '../components/MobileControls';
import useSwipe from '../hooks/useSwipe';
import confetti from 'canvas-confetti';

const GRID_SIZE = 18;

export default function Snake3D({ isKidsMode = false, onBackToMenu, highScore = 0 }) {
  const [gameState, setGameState] = useState('menu'); // 'menu', 'playing', 'gameover'
  const [score, setScore] = useState(0);
  const [snake, setSnake] = useState([
    { x: 8, y: 8 },
    { x: 7, y: 8 },
    { x: 6, y: 8 }
  ]);
  const [food, setFood] = useState({ x: 12, y: 8, type: 'normal' });
  const [direction, setDirection] = useState('RIGHT');
  const [speed, setSpeed] = useState(130);
  const [newRecord, setNewRecord] = useState(false);
  const [skin, setSkin] = useState('neon'); // 'neon', 'dragon', 'rainbow'

  const dirRef = useRef(direction);
  dirRef.current = direction;

  // Generate random food item
  const generateFood = useCallback((currentSnake) => {
    let newX, newY;
    while (true) {
      newX = Math.floor(Math.random() * GRID_SIZE);
      newY = Math.floor(Math.random() * GRID_SIZE);
      const collision = currentSnake.some(s => s.x === newX && s.y === newY);
      if (!collision) break;
    }

    const rand = Math.random();
    let type = 'normal';
    if (rand < 0.2) type = 'golden';
    else if (rand < 0.35) type = 'slow';
    else if (rand < 0.5) type = 'speed';

    return { x: newX, y: newY, type };
  }, []);

  const changeDir = useCallback((newDir) => {
    if (gameState !== 'playing') return;
    const current = dirRef.current;
    if (newDir === 'UP' && current !== 'DOWN') setDirection('UP');
    if (newDir === 'DOWN' && current !== 'UP') setDirection('DOWN');
    if (newDir === 'LEFT' && current !== 'RIGHT') setDirection('LEFT');
    if (newDir === 'RIGHT' && current !== 'LEFT') setDirection('RIGHT');
    soundFx.playMove();
  }, [gameState]);

  // Touch Swipe
  useSwipe({
    onSwipeUp: () => changeDir('UP'),
    onSwipeDown: () => changeDir('DOWN'),
    onSwipeLeft: () => changeDir('LEFT'),
    onSwipeRight: () => changeDir('RIGHT')
  });

  // Keyboard control listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState !== 'playing') return;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') changeDir('UP');
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') changeDir('DOWN');
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') changeDir('LEFT');
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') changeDir('RIGHT');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, changeDir]);

  // Game Loop Interval
  useEffect(() => {
    if (gameState !== 'playing') return;

    const moveSnake = () => {
      setSnake((prevSnake) => {
        const head = { ...prevSnake[0] };

        if (dirRef.current === 'UP') head.y -= 1;
        if (dirRef.current === 'DOWN') head.y += 1;
        if (dirRef.current === 'LEFT') head.x -= 1;
        if (dirRef.current === 'RIGHT') head.x += 1;

        // Wall collision
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
          soundFx.playGameOver();
          setGameState('gameover');
          saveHighScore('snake', score);
          return prevSnake;
        }

        // Self collision
        for (let i = 1; i < prevSnake.length; i++) {
          if (prevSnake[i].x === head.x && prevSnake[i].y === head.y) {
            soundFx.playGameOver();
            setGameState('gameover');
            saveHighScore('snake', score);
            return prevSnake;
          }
        }

        const newSnake = [head, ...prevSnake];

        // Eat food check
        if (head.x === food.x && head.y === food.y) {
          soundFx.playCoin();

          let pts = 10;
          if (food.type === 'golden') pts = 50;

          setScore((s) => {
            const nextScore = s + pts;
            const isNew = saveHighScore('snake', nextScore);
            if (isNew) {
              setNewRecord(true);
              confetti({ particleCount: 50, spread: 60 });
            }
            return nextScore;
          });

          // Adjust speed based on food type
          if (food.type === 'speed') setSpeed((spd) => Math.max(60, spd - 10));
          if (food.type === 'slow') setSpeed((spd) => Math.min(200, spd + 15));

          setFood(generateFood(newSnake));
        } else {
          newSnake.pop(); // Remove tail
        }

        return newSnake;
      });
    };

    const interval = setInterval(moveSnake, speed);
    return () => clearInterval(interval);
  }, [gameState, food, speed, generateFood, score]);

  const handleStartGame = () => {
    const initialSnake = [
      { x: 8, y: 8 },
      { x: 7, y: 8 },
      { x: 6, y: 8 }
    ];
    setSnake(initialSnake);
    setFood(generateFood(initialSnake));
    setDirection('RIGHT');
    setScore(0);
    setSpeed(130);
    setNewRecord(false);
    setGameState('playing');
    soundFx.playClick();
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-950 flex flex-col justify-between p-4">
      {/* Header Bar */}
      <div className="relative z-10 flex justify-between items-center max-w-xl mx-auto w-full">
        <button
          onClick={onBackToMenu}
          className="px-4 py-2 bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md rounded-xl text-white font-semibold text-sm border border-white/10 shadow-lg active:scale-95 transition-all"
        >
          ← EXIT SNAKE
        </button>

        <div className="flex gap-3">
          <div className="px-4 py-2 bg-purple-500/20 backdrop-blur-md rounded-xl border border-purple-400/40 text-purple-300 font-bold">
            HIGH: {highScore}
          </div>
          <div className="px-4 py-2 bg-emerald-500/20 backdrop-blur-md rounded-xl border border-emerald-400/40 text-emerald-300 font-bold text-lg">
            SCORE: {score}
          </div>
        </div>
      </div>

      {/* Main 3D Perspective Cyber Grid Board */}
      <div className="relative z-10 flex-1 flex items-center justify-center my-2">
        <div className="relative max-w-md w-full aspect-square bg-slate-900/90 rounded-3xl p-3 border-2 border-indigo-500/40 shadow-[0_0_40px_rgba(99,102,241,0.25)] flex flex-col justify-between overflow-hidden">
          {/* Grid background */}
          <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:20px_20px] opacity-20 pointer-events-none" />

          <div
            className="w-full h-full grid gap-1 relative z-10"
            style={{
              gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${GRID_SIZE}, minmax(0, 1fr))`
            }}
          >
            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, idx) => {
              const x = idx % GRID_SIZE;
              const y = Math.floor(idx / GRID_SIZE);

              const isHead = snake[0].x === x && snake[0].y === y;
              const isBody = snake.slice(1).some((s) => s.x === x && s.y === y);
              const isFood = food.x === x && food.y === y;

              let cellStyle = 'bg-slate-800/30 rounded-xs';
              if (isHead) {
                cellStyle = isKidsMode
                  ? 'bg-gradient-to-r from-yellow-400 to-amber-500 rounded-lg shadow-lg scale-110 z-20 animate-pulse'
                  : 'bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-lg shadow-[0_0_12px_#34d399] scale-110 z-20';
              } else if (isBody) {
                cellStyle = isKidsMode
                  ? 'bg-amber-400/80 rounded-md scale-95'
                  : 'bg-emerald-500/80 rounded-md shadow-sm';
              } else if (isFood) {
                if (food.type === 'golden') {
                  cellStyle = 'bg-amber-400 rounded-full animate-bounce shadow-[0_0_15px_#f59e0b]';
                } else if (food.type === 'speed') {
                  cellStyle = 'bg-sky-400 rounded-full animate-ping shadow-[0_0_15px_#38bdf8]';
                } else if (food.type === 'slow') {
                  cellStyle = 'bg-purple-400 rounded-full animate-pulse shadow-[0_0_15px_#c084fc]';
                } else {
                  cellStyle = 'bg-rose-500 rounded-full animate-pulse shadow-[0_0_10px_#f43f5e]';
                }
              }

              return <div key={idx} className={`w-full h-full transition-all duration-75 ${cellStyle}`} />;
            })}
          </div>
        </div>
      </div>

      {/* Menu Modal Overlay */}
      {gameState === 'menu' && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-6">
          <div className="max-w-md w-full glass-panel p-8 rounded-3xl text-center border border-emerald-500/30 shadow-2xl">
            <h2 className={`text-4xl font-extrabold mb-2 ${isKidsMode ? 'font-kids text-amber-400' : 'text-emerald-400 font-retro text-2xl'}`}>
              CYBER SNAKE 3D
            </h2>
            <p className="text-slate-300 text-sm mb-6">
              Eat apples & stars to grow! Avoid hitting the laser walls.
            </p>

            <button
              onClick={handleStartGame}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 rounded-2xl text-white font-extrabold text-lg shadow-lg flex items-center justify-center gap-3 transition-all active:scale-95"
            >
              <Play className="w-6 h-6 fill-current" />
              START GAME
            </button>
          </div>
        </div>
      )}

      {/* Game Over Modal */}
      {gameState === 'gameover' && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/85 backdrop-blur-lg p-6">
          <div className="max-w-md w-full glass-panel p-8 rounded-3xl text-center border border-rose-500/30 shadow-2xl">
            <h2 className="text-3xl font-black text-rose-500 mb-2">GAME OVER!</h2>
            {newRecord && (
              <div className="inline-block py-1 px-4 bg-amber-400/20 border border-amber-400/50 text-amber-300 font-bold text-xs rounded-full mb-4 animate-bounce">
                🎉 NEW HIGH RECORD!
              </div>
            )}

            <div className="my-6 p-4 bg-slate-900/80 rounded-2xl border border-white/10 flex justify-between items-center text-slate-200">
              <span>FINAL SCORE</span>
              <span className="text-3xl font-black text-emerald-400">{score}</span>
            </div>

            <div className="flex gap-4">
              <button
                onClick={onBackToMenu}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-2xl text-slate-300 font-bold text-sm"
              >
                MENU
              </button>
              <button
                onClick={handleStartGame}
                className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:brightness-110 rounded-2xl text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                RETRY
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Touch Controls */}
      {gameState === 'playing' && (
        <MobileControls
          onUp={() => changeDir('UP')}
          onDown={() => changeDir('DOWN')}
          onLeft={() => changeDir('LEFT')}
          onRight={() => changeDir('RIGHT')}
          showActions={false}
          isKidsMode={isKidsMode}
        />
      )}
    </div>
  );
}
