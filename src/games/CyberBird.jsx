import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, RotateCcw, Trophy, Zap, ShieldAlert, Sparkles } from 'lucide-react';
import { soundFx } from '../utils/audio';
import { saveHighScore } from '../utils/storage';
import confetti from 'canvas-confetti';

export default function CyberBird({ isKidsMode = false, onBackToMenu, highScore = 0 }) {
  const [gameState, setGameState] = useState('menu'); // 'menu', 'playing', 'gameover'
  const [difficulty, setDifficulty] = useState('easy'); // 'easy', 'medium', 'harder'
  const [score, setScore] = useState(0);
  const [newRecord, setNewRecord] = useState(false);

  const canvasRef = useRef(null);
  const gameRef = useRef({
    birdY: 200,
    velocity: 0,
    pipes: [],
    frame: 0
  });

  // Difficulty Constants configuration
  const diffConfig = {
    easy: { gap: 210, speed: 2.0, freq: 110, gravity: 0.32, jump: -7.0, label: 'EASY 🟢 (HUGE SPACE GAP)' },
    medium: { gap: 160, speed: 2.8, freq: 90, gravity: 0.40, jump: -7.5, label: 'MEDIUM 🟡' },
    harder: { gap: 125, speed: 3.8, freq: 75, gravity: 0.46, jump: -8.0, label: 'HARDER 🔴' }
  };

  const activeCfg = diffConfig[difficulty] || diffConfig.easy;

  const flap = useCallback(() => {
    if (gameState !== 'playing') return;
    gameRef.current.velocity = activeCfg.jump;
    soundFx.playJump();
  }, [gameState, activeCfg]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        flap();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [flap]);

  useEffect(() => {
    if (gameState !== 'playing') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animId;

    const g = gameRef.current;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      g.frame++;

      // Update Bird Physics
      g.velocity += activeCfg.gravity;
      g.birdY += g.velocity;

      // Clear Canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw Grid Background
      ctx.strokeStyle = isKidsMode ? 'rgba(255, 182, 193, 0.2)' : 'rgba(59, 130, 246, 0.15)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // Spawn Pipes with Difficulty Gap Space
      if (g.frame % activeCfg.freq === 0) {
        const gap = activeCfg.gap;
        const topHeight = Math.floor(Math.random() * (canvas.height - gap - 80)) + 30;
        g.pipes.push({
          x: canvas.width,
          top: topHeight,
          bottom: canvas.height - topHeight - gap,
          passed: false
        });
      }

      // Draw & Move Pipes
      for (let i = g.pipes.length - 1; i >= 0; i--) {
        const pipe = g.pipes[i];
        pipe.x -= activeCfg.speed;

        // Top Laser Gate Pipe
        ctx.fillStyle = isKidsMode ? '#ff7675' : '#8b5cf6';
        ctx.shadowColor = isKidsMode ? '#ff7675' : '#c084fc';
        ctx.shadowBlur = 10;
        ctx.fillRect(pipe.x, 0, 48, pipe.top);

        // Bottom Laser Gate Pipe
        ctx.fillRect(pipe.x, canvas.height - pipe.bottom, 48, pipe.bottom);
        ctx.shadowBlur = 0;

        // Check Score Pass
        if (!pipe.passed && pipe.x < 80) {
          pipe.passed = true;
          soundFx.playCoin();
          setScore((s) => {
            const nextS = s + 1;
            const isNew = saveHighScore('cyberBird', nextS);
            if (isNew) {
              setNewRecord(true);
              confetti({ particleCount: 50, spread: 60 });
            }
            return nextS;
          });
        }

        // Collision Check
        const birdX = 80;
        const birdRadius = 14;
        if (
          birdX + birdRadius > pipe.x &&
          birdX - birdRadius < pipe.x + 48 &&
          (g.birdY - birdRadius < pipe.top || g.birdY + birdRadius > canvas.height - pipe.bottom)
        ) {
          soundFx.playGameOver();
          setGameState('gameover');
          saveHighScore('cyberBird', score);
          return;
        }

        // Remove off-screen pipes
        if (pipe.x < -60) g.pipes.splice(i, 1);
      }

      // Ground & Ceiling collision check
      if (g.birdY > canvas.height - 20 || g.birdY < 10) {
        soundFx.playGameOver();
        setGameState('gameover');
        saveHighScore('cyberBird', score);
        return;
      }

      // Draw Cyber Bird
      ctx.fillStyle = isKidsMode ? '#f1c40f' : '#06b6d4';
      ctx.shadowColor = isKidsMode ? '#f39c12' : '#38bdf8';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(80, g.birdY, 14, 0, Math.PI * 2);
      ctx.fill();

      // Bird Eye & Wing
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(84, g.birdY - 4, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 0;
    };

    animate();

    return () => cancelAnimationFrame(animId);
  }, [gameState, isKidsMode, score, activeCfg]);

  const startGame = () => {
    gameRef.current.birdY = 200;
    gameRef.current.velocity = 0;
    gameRef.current.pipes = [];
    gameRef.current.frame = 0;
    setScore(0);
    setNewRecord(false);
    setGameState('playing');
    soundFx.playClick();
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-950 flex flex-col justify-between p-4" onClick={flap}>
      {/* Header */}
      <div className="relative z-10 flex justify-between items-center max-w-xl mx-auto w-full">
        <button
          onClick={(e) => { e.stopPropagation(); onBackToMenu(); }}
          className="px-4 py-2 bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md rounded-xl text-white font-semibold text-sm border border-white/10 shadow-lg active:scale-95 transition-all"
        >
          ← EXIT BIRD
        </button>

        <div className="flex gap-3">
          <div className="px-4 py-2 bg-purple-500/20 backdrop-blur-md rounded-xl border border-purple-400/40 text-purple-300 font-bold">
            HIGH: {highScore}
          </div>
          <div className="px-4 py-2 bg-cyan-500/20 backdrop-blur-md rounded-xl border border-cyan-400/40 text-cyan-300 font-bold text-lg">
            SCORE: {score}
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative z-10 flex-1 flex items-center justify-center my-2">
        <div className="relative max-w-md w-full aspect-[3/4] bg-slate-900/90 rounded-3xl overflow-hidden border-2 border-purple-500/40 shadow-[0_0_50px_rgba(168,85,247,0.2)]">
          <canvas ref={canvasRef} width={360} height={480} className="w-full h-full block" />
        </div>
      </div>

      {/* Start Modal with Difficulty Level Selector */}
      {gameState === 'menu' && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-6">
          <div className="max-w-md w-full glass-panel p-8 rounded-3xl text-center border border-purple-500/30 shadow-2xl">
            <h2 className="text-4xl font-extrabold mb-2 text-purple-400 font-retro text-2xl">
              FLAPPY CYBER BIRD
            </h2>
            <p className="text-slate-300 text-sm mb-6">
              Tap the screen or press Spacebar to fly through laser gates!
            </p>

            {/* Difficulty Level Selector */}
            <div className="mb-6 bg-slate-900/80 p-3 rounded-2xl border border-purple-500/30">
              <label className="block text-xs font-black text-cyan-400 mb-2 uppercase tracking-wider">
                🎯 GAME DIFFICULTY LEVEL:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'easy', label: 'EASY 🟢', gap: '210px Space' },
                  { id: 'medium', label: 'MEDIUM 🟡', gap: '160px Space' },
                  { id: 'harder', label: 'HARDER 🔴', gap: '125px Space' }
                ].map((lvl) => (
                  <button
                    key={lvl.id}
                    onClick={(e) => { e.stopPropagation(); soundFx.playClick(); setDifficulty(lvl.id); }}
                    className={`py-2 px-1 rounded-xl text-xs font-extrabold transition-all flex flex-col items-center justify-center ${
                      difficulty === lvl.id
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border border-purple-300 shadow-md scale-105'
                        : 'bg-slate-800/60 text-slate-300 border border-white/10 hover:bg-slate-700/60'
                    }`}
                  >
                    <span>{lvl.label}</span>
                    <span className="text-[9px] opacity-75 font-normal">{lvl.gap}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); startGame(); }}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:brightness-110 rounded-2xl text-white font-extrabold text-lg shadow-lg flex items-center justify-center gap-3 active:scale-95 transition-all"
            >
              <Play className="w-6 h-6 fill-current" />
              FLY NOW ({difficulty.toUpperCase()})
            </button>
          </div>
        </div>
      )}

      {/* Game Over Modal */}
      {gameState === 'gameover' && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/85 backdrop-blur-lg p-6">
          <div className="max-w-md w-full glass-panel p-8 rounded-3xl text-center border border-rose-500/30 shadow-2xl">
            <h2 className="text-3xl font-black text-rose-500 mb-2">BIRD CRASHED!</h2>
            {newRecord && (
              <div className="inline-block py-1 px-4 bg-amber-400/20 border border-amber-400/50 text-amber-300 font-bold text-xs rounded-full mb-4 animate-bounce">
                🎉 NEW HIGH RECORD!
              </div>
            )}

            <div className="my-6 p-4 bg-slate-900/80 rounded-2xl border border-white/10 flex justify-between items-center text-slate-200">
              <span>FINAL SCORE ({difficulty.toUpperCase()})</span>
              <span className="text-3xl font-black text-purple-400">{score}</span>
            </div>

            <div className="flex gap-4">
              <button
                onClick={(e) => { e.stopPropagation(); onBackToMenu(); }}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-2xl text-slate-300 font-bold text-sm"
              >
                MENU
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); startGame(); }}
                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-500 hover:brightness-110 rounded-2xl text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                FLAP AGAIN
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

