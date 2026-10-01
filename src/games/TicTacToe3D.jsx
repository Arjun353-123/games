import React, { useState, useEffect, useCallback } from 'react';
import { RotateCcw, User, Bot, Sparkles, Trophy, Settings } from 'lucide-react';
import { soundFx } from '../utils/audio';
import { saveHighScore } from '../utils/storage';
import confetti from 'canvas-confetti';

export default function TicTacToe3D({ isKidsMode = false, onBackToMenu, highScore = 0 }) {
  const [gridSize, setGridSize] = useState(3); // 3 or 5
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [gameMode, setGameMode] = useState('ai'); // 'ai' or 'pvp'
  const [aiDifficulty, setAiDifficulty] = useState(isKidsMode ? 'easy' : 'hard');
  const [winner, setWinner] = useState(null); // 'X', 'O', 'DRAW', or null
  const [winningLine, setWinningLine] = useState([]);
  const [streak, setStreak] = useState(0);

  // Initialize board when size changes
  const resetBoard = useCallback((size = gridSize) => {
    setBoard(Array(size * size).fill(null));
    setIsXNext(true);
    setWinner(null);
    setWinningLine([]);
  }, [gridSize]);

  useEffect(() => {
    resetBoard(gridSize);
  }, [gridSize, resetBoard]);

  // Check Win Condition
  const checkWin = useCallback((currentBoard, size) => {
    const lines = [];

    if (size === 3) {
      // Rows, Columns, Diagonals for 3x3
      lines.push(
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
        [0, 4, 8], [2, 4, 6]             // Diags
      );
    } else {
      // 5x5 Need 4 in a row to win
      const winLength = 4;
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          const idx = r * 5 + c;

          // Horizontal
          if (c <= 5 - winLength) {
            lines.push([idx, idx + 1, idx + 2, idx + 3]);
          }
          // Vertical
          if (r <= 5 - winLength) {
            lines.push([idx, idx + 5, idx + 10, idx + 15]);
          }
          // Diagonal Down-Right
          if (r <= 5 - winLength && c <= 5 - winLength) {
            lines.push([idx, idx + 6, idx + 12, idx + 18]);
          }
          // Diagonal Down-Left
          if (r <= 5 - winLength && c >= winLength - 1) {
            lines.push([idx, idx + 4, idx + 8, idx + 12]);
          }
        }
      }
    }

    for (let line of lines) {
      const first = currentBoard[line[0]];
      if (first && line.every((index) => currentBoard[index] === first)) {
        return { winner: first, line };
      }
    }

    if (currentBoard.every((cell) => cell !== null)) {
      return { winner: 'DRAW', line: [] };
    }

    return null;
  }, []);

  // AI Move logic
  const makeAIMove = useCallback((currentBoard) => {
    const emptyIndices = currentBoard
      .map((val, idx) => (val === null ? idx : null))
      .filter((val) => val !== null);

    if (emptyIndices.length === 0) return;

    let chosenIndex;

    if (aiDifficulty === 'easy' || Math.random() < 0.3) {
      // Easy Random AI
      chosenIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    } else {
      // Smart AI: Check if AI can win immediately or needs to block player
      let blockIndex = null;
      let winIndex = null;

      for (let idx of emptyIndices) {
        // Check win
        const boardCopyWin = [...currentBoard];
        boardCopyWin[idx] = 'O';
        const winRes = checkWin(boardCopyWin, gridSize);
        if (winRes && winRes.winner === 'O') {
          winIndex = idx;
          break;
        }

        // Check block
        const boardCopyBlock = [...currentBoard];
        boardCopyBlock[idx] = 'X';
        const blockRes = checkWin(boardCopyBlock, gridSize);
        if (blockRes && blockRes.winner === 'X') {
          blockIndex = idx;
        }
      }

      if (winIndex !== null) chosenIndex = winIndex;
      else if (blockIndex !== null) chosenIndex = blockIndex;
      else chosenIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    }

    if (chosenIndex !== undefined) {
      setTimeout(() => {
        setBoard((prev) => {
          if (prev[chosenIndex] !== null) return prev;
          const next = [...prev];
          next[chosenIndex] = 'O';
          soundFx.playMove();

          const result = checkWin(next, gridSize);
          if (result) {
            setWinner(result.winner);
            setWinningLine(result.line);
            if (result.winner === 'O') soundFx.playGameOver();
            else if (result.winner === 'DRAW') soundFx.playClick();
          } else {
            setIsXNext(true);
          }

          return next;
        });
      }, 350);
    }
  }, [aiDifficulty, checkWin, gridSize]);

  // Player Click Handler
  const handleCellClick = (idx) => {
    if (board[idx] || winner || (!isXNext && gameMode === 'ai')) return;

    soundFx.playClick();
    const newBoard = [...board];
    newBoard[idx] = isXNext ? 'X' : 'O';
    setBoard(newBoard);

    const result = checkWin(newBoard, gridSize);

    if (result) {
      setWinner(result.winner);
      setWinningLine(result.line);

      if (result.winner === 'X') {
        soundFx.playWin();
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        setStreak((s) => {
          const nextS = s + 1;
          saveHighScore('ticTacToeWins', nextS);
          return nextS;
        });
      } else if (result.winner === 'O') {
        soundFx.playGameOver();
        setStreak(0);
      }
    } else {
      setIsXNext(!isXNext);
      if (gameMode === 'ai' && isXNext) {
        makeAIMove(newBoard);
      }
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-950 flex flex-col justify-between p-4">
      {/* Header Controls */}
      <div className="relative z-10 flex justify-between items-center max-w-xl mx-auto w-full">
        <button
          onClick={onBackToMenu}
          className="px-4 py-2 bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md rounded-xl text-white font-semibold text-sm border border-white/10 shadow-lg active:scale-95 transition-all"
        >
          ← EXIT OX
        </button>

        <div className="flex gap-3 items-center">
          <div className="px-4 py-2 bg-amber-500/20 backdrop-blur-md rounded-xl border border-amber-400/40 text-amber-300 font-bold flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>STREAK: {streak}</span>
          </div>

          <button
            onClick={() => resetBoard(gridSize)}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-white/10 shadow-md active:scale-95 transition-all"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Settings Row (Grid Size & Opponent Selector) */}
      <div className="relative z-10 flex flex-wrap justify-center gap-3 my-2 max-w-md mx-auto w-full">
        <div className="bg-slate-900/80 p-1 rounded-2xl border border-white/10 flex">
          <button
            onClick={() => { setGridSize(3); soundFx.playClick(); }}
            className={`px-4 py-1.5 rounded-xl font-bold text-xs transition-all ${
              gridSize === 3 ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            3x3 GRID
          </button>
          <button
            onClick={() => { setGridSize(5); soundFx.playClick(); }}
            className={`px-4 py-1.5 rounded-xl font-bold text-xs transition-all ${
              gridSize === 5 ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            5x5 MEGA
          </button>
        </div>

        <div className="bg-slate-900/80 p-1 rounded-2xl border border-white/10 flex">
          <button
            onClick={() => { setGameMode('ai'); soundFx.playClick(); resetBoard(); }}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
              gameMode === 'ai' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bot className="w-4 h-4" />
            VS AI
          </button>
          <button
            onClick={() => { setGameMode('pvp'); soundFx.playClick(); resetBoard(); }}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
              gameMode === 'pvp' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            2-PLAYER
          </button>
        </div>
      </div>

      {/* Main 3D Neon Tile OX Board */}
      <div className="relative z-10 flex-1 flex items-center justify-center my-2">
        <div className="relative max-w-md w-full aspect-square bg-slate-900/80 rounded-3xl p-4 border-2 border-cyan-500/40 shadow-[0_0_50px_rgba(6,182,212,0.2)] flex flex-col justify-between overflow-hidden">
          {/* Status Indicator */}
          <div className="text-center mb-3">
            {winner ? (
              <span className={`text-xl font-black ${winner === 'X' ? 'text-cyan-400' : winner === 'O' ? 'text-pink-400' : 'text-amber-400'}`}>
                {winner === 'DRAW' ? "IT'S A TIE!" : `${winner === 'X' ? 'PLAYER X' : 'PLAYER O'} WINS! 🎉`}
              </span>
            ) : (
              <span className="text-sm font-bold text-slate-300 flex items-center justify-center gap-2">
                TURN: 
                <span className={`text-base font-black px-2 py-0.5 rounded-md ${isXNext ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/40' : 'bg-pink-500/20 text-pink-400 border border-pink-400/40'}`}>
                  {isXNext ? 'PLAYER X (NEON LASER)' : gameMode === 'ai' ? 'AI ROBOT O' : 'PLAYER O (NEON RING)'}
                </span>
              </span>
            )}
          </div>

          <div
            className="w-full h-full grid gap-2.5 relative z-10"
            style={{
              gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${gridSize}, minmax(0, 1fr))`
            }}
          >
            {board.map((cell, idx) => {
              const isWinningCell = winningLine.includes(idx);

              return (
                <button
                  key={idx}
                  onClick={() => handleCellClick(idx)}
                  className={`w-full h-full rounded-2xl flex items-center justify-center font-black transition-all transform active:scale-90 shadow-md border ${
                    cell === null
                      ? 'bg-slate-800/60 border-white/10 hover:bg-slate-800 hover:border-cyan-400/50'
                      : cell === 'X'
                      ? 'bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                      : 'bg-gradient-to-br from-pink-500/20 to-purple-600/30 border-pink-400 text-pink-300 shadow-[0_0_15px_rgba(236,72,153,0.4)]'
                  } ${isWinningCell ? 'animate-bounce border-4 border-amber-400 bg-amber-400/30' : ''}`}
                >
                  {cell === 'X' && <span className="text-4xl md:text-5xl neon-text-glow">✕</span>}
                  {cell === 'O' && <span className="text-4xl md:text-5xl neon-text-glow">◯</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Reset & Play Again Button */}
      {winner && (
        <div className="relative z-10 flex justify-center pb-4">
          <button
            onClick={() => resetBoard()}
            className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 rounded-2xl text-white font-extrabold text-sm shadow-xl flex items-center gap-2 active:scale-95 transition-all"
          >
            <RotateCcw className="w-5 h-5" />
            PLAY AGAIN
          </button>
        </div>
      )}
    </div>
  );
}
