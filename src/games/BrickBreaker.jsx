import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, RotateCcw, Trophy, Zap } from 'lucide-react';
import { soundFx } from '../utils/audio';
import { saveHighScore } from '../utils/storage';
import confetti from 'canvas-confetti';

export default function BrickBreaker({ isKidsMode = false, onBackToMenu, highScore = 0 }) {
  const [gameState, setGameState] = useState('menu');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [newRecord, setNewRecord] = useState(false);

  const canvasRef = useRef(null);
  const gameRef = useRef({
    paddleX: 180,
    paddleWidth: 80,
    ballX: 180,
    ballY: 340,
    ballSpeedX: 4,
    ballSpeedY: -4,
    bricks: []
  });

  // Initialize Bricks
  const initBricks = useCallback(() => {
    const bricks = [];
    const rows = 4;
    const cols = 6;
    const brickWidth = 52;
    const brickHeight = 20;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        bricks.push({
          x: c * (brickWidth + 6) + 12,
          y: r * (brickHeight + 6) + 40,
          width: brickWidth,
          height: brickHeight,
          status: 1,
          color: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6'][r % 4]
        });
      }
    }
    return bricks;
  }, []);

  // Mouse / Touch Drag paddle
  const handlePointerMove = (e) => {
    if (gameState !== 'playing') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    gameRef.current.paddleX = Math.max(0, Math.min(canvas.width - gameRef.current.paddleWidth, x - gameRef.current.paddleWidth / 2));
  };

  useEffect(() => {
    if (gameState !== 'playing') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animId;
    const g = gameRef.current;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Clear Canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw Grid Background
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Move Ball
      g.ballX += g.ballSpeedX;
      g.ballY += g.ballSpeedY;

      // Wall Bounce
      if (g.ballX + 6 > canvas.width || g.ballX - 6 < 0) {
        g.ballSpeedX = -g.ballSpeedX;
        soundFx.playMove();
      }
      if (g.ballY - 6 < 0) {
        g.ballSpeedY = -g.ballSpeedY;
        soundFx.playMove();
      }

      // Paddle Collision
      if (
        g.ballY + 6 >= canvas.height - 25 &&
        g.ballY - 6 <= canvas.height - 15 &&
        g.ballX >= g.paddleX &&
        g.ballX <= g.paddleX + g.paddleWidth
      ) {
        g.ballSpeedY = -Math.abs(g.ballSpeedY);
        soundFx.playJump();
      }

      // Ball Out of Bottom
      if (g.ballY > canvas.height) {
        setLives((l) => {
          const nextL = l - 1;
          if (nextL <= 0) {
            soundFx.playGameOver();
            setGameState('gameover');
            saveHighScore('brickBreaker', score);
          } else {
            // Reset Ball & Paddle
            g.ballX = canvas.width / 2;
            g.ballY = canvas.height - 60;
            g.ballSpeedY = -4;
            g.ballSpeedX = Math.random() > 0.5 ? 4 : -4;
          }
          return nextL;
        });
      }

      // Brick Collision Check
      let activeBricks = 0;
      g.bricks.forEach((b) => {
        if (b.status === 1) {
          activeBricks++;
          if (
            g.ballX > b.x &&
            g.ballX < b.x + b.width &&
            g.ballY > b.y &&
            g.ballY < b.y + b.height
          ) {
            g.ballSpeedY = -g.ballSpeedY;
            b.status = 0;
            soundFx.playCoin();
            setScore((s) => {
              const nextS = s + 20;
              saveHighScore('brickBreaker', nextS);
              return nextS;
            });
          }

          // Draw Brick
          ctx.fillStyle = b.color;
          ctx.shadowColor = b.color;
          ctx.shadowBlur = 8;
          ctx.fillRect(b.x, b.y, b.width, b.height);
          ctx.shadowBlur = 0;
        }
      });

      // Win Stage Check
      if (activeBricks === 0) {
        soundFx.playWin();
        confetti({ particleCount: 100, spread: 80 });
        g.bricks = initBricks();
        g.ballSpeedX *= 1.1;
        g.ballSpeedY *= 1.1;
      }

      // Draw Paddle
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 12;
      ctx.fillRect(g.paddleX, canvas.height - 20, g.paddleWidth, 12);
      ctx.shadowBlur = 0;

      // Draw Ball
      ctx.fillStyle = '#facc15';
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(g.ballX, g.ballY, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    };

    animate();

    return () => cancelAnimationFrame(animId);
  }, [gameState, initBricks, score]);

  const startGame = () => {
    gameRef.current.paddleX = 140;
    gameRef.current.ballX = 180;
    gameRef.current.ballY = 320;
    gameRef.current.ballSpeedX = 4;
    gameRef.current.ballSpeedY = -4;
    gameRef.current.bricks = initBricks();
    setScore(0);
    setLives(3);
    setNewRecord(false);
    setGameState('playing');
    soundFx.playClick();
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-950 flex flex-col justify-between p-4">
      {/* Header */}
      <div className="relative z-10 flex justify-between items-center max-w-xl mx-auto w-full">
        <button
          onClick={onBackToMenu}
          className="px-4 py-2 bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md rounded-xl text-white font-semibold text-sm border border-white/10 shadow-lg active:scale-95 transition-all"
        >
          ← EXIT BRICKS
        </button>

        <div className="flex gap-3">
          <div className="px-4 py-2 bg-rose-500/20 backdrop-blur-md rounded-xl border border-rose-400/40 text-rose-300 font-bold">
            LIVES: {'❤️'.repeat(lives)}
          </div>
          <div className="px-4 py-2 bg-blue-500/20 backdrop-blur-md rounded-xl border border-blue-400/40 text-blue-300 font-bold text-lg">
            SCORE: {score}
          </div>
        </div>
      </div>

      {/* Canvas Board */}
      <div className="relative z-10 flex-1 flex items-center justify-center my-2">
        <div
          className="relative max-w-md w-full aspect-[3/4] bg-slate-900/90 rounded-3xl overflow-hidden border-2 border-sky-500/40 shadow-[0_0_50px_rgba(56,189,248,0.2)] touch-none cursor-pointer"
          onPointerMove={handlePointerMove}
        >
          <canvas ref={canvasRef} width={360} height={460} className="w-full h-full block" />
        </div>
      </div>

      {/* Menu Overlay */}
      {gameState === 'menu' && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-6">
          <div className="max-w-md w-full glass-panel p-8 rounded-3xl text-center border border-sky-500/30 shadow-2xl">
            <h2 className="text-4xl font-extrabold mb-2 text-sky-400 font-retro text-2xl">
              BRICK BREAKER 3D
            </h2>
            <p className="text-slate-300 text-sm mb-6">
              Drag paddle to bounce ball and smash neon blocks!
            </p>

            <button
              onClick={startGame}
              className="w-full py-4 bg-gradient-to-r from-sky-500 to-blue-600 hover:brightness-110 rounded-2xl text-white font-extrabold text-lg shadow-lg flex items-center justify-center gap-3 active:scale-95 transition-all"
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
            <h2 className="text-3xl font-black text-rose-500 mb-2">PADDLE LOST!</h2>

            <div className="my-6 p-4 bg-slate-900/80 rounded-2xl border border-white/10 flex justify-between items-center text-slate-200">
              <span>FINAL SCORE</span>
              <span className="text-3xl font-black text-sky-400">{score}</span>
            </div>

            <div className="flex gap-4">
              <button
                onClick={onBackToMenu}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-2xl text-slate-300 font-bold text-sm"
              >
                MENU
              </button>
              <button
                onClick={startGame}
                className="flex-1 py-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:brightness-110 rounded-2xl text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                RETRY
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
