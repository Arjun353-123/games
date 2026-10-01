import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, CornerDownRight, Zap } from 'lucide-react';
import { soundFx } from '../utils/audio';

export default function MobileControls({
  onUp,
  onDown,
  onLeft,
  onRight,
  onAction1,
  onAction2,
  action1Label = 'JUMP',
  action2Label = 'SLIDE',
  showActions = true,
  isKidsMode = false
}) {
  const trigger = (fn) => {
    soundFx.playClick();
    if (fn) fn();
  };

  return (
    <div className="fixed bottom-4 left-0 right-0 z-40 px-4 flex justify-between items-end pointer-events-none md:hidden">
      {/* Directional Pad */}
      <div className="relative w-36 h-36 bg-slate-900/80 backdrop-blur-md rounded-full p-2 border border-white/20 shadow-2xl pointer-events-auto flex items-center justify-center">
        {/* Up Button */}
        <button
          onClick={() => trigger(onUp)}
          className={`absolute top-2 w-10 h-10 rounded-full flex items-center justify-center text-white active:scale-95 transition-transform ${
            isKidsMode ? 'bg-sky-500 hover:bg-sky-400' : 'bg-blue-600/80 hover:bg-blue-500'
          }`}
          aria-label="Up"
        >
          <ArrowUp className="w-6 h-6" />
        </button>

        {/* Left Button */}
        <button
          onClick={() => trigger(onLeft)}
          className={`absolute left-2 w-10 h-10 rounded-full flex items-center justify-center text-white active:scale-95 transition-transform ${
            isKidsMode ? 'bg-amber-500 hover:bg-amber-400' : 'bg-indigo-600/80 hover:bg-indigo-500'
          }`}
          aria-label="Left"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        {/* Right Button */}
        <button
          onClick={() => trigger(onRight)}
          className={`absolute right-2 w-10 h-10 rounded-full flex items-center justify-center text-white active:scale-95 transition-transform ${
            isKidsMode ? 'bg-emerald-500 hover:bg-emerald-400' : 'bg-purple-600/80 hover:bg-purple-500'
          }`}
          aria-label="Right"
        >
          <ArrowRight className="w-6 h-6" />
        </button>

        {/* Down Button */}
        <button
          onClick={() => trigger(onDown)}
          className={`absolute bottom-2 w-10 h-10 rounded-full flex items-center justify-center text-white active:scale-95 transition-transform ${
            isKidsMode ? 'bg-rose-500 hover:bg-rose-400' : 'bg-pink-600/80 hover:bg-pink-500'
          }`}
          aria-label="Down"
        >
          <ArrowDown className="w-6 h-6" />
        </button>

        <div className="w-6 h-6 rounded-full bg-white/20 border border-white/40" />
      </div>

      {/* Action Buttons (Jump / Slide) */}
      {showActions && (
        <div className="flex gap-3 pointer-events-auto items-end">
          {onAction2 && (
            <button
              onClick={() => trigger(onAction2)}
              className={`px-4 py-3 rounded-2xl font-bold text-sm text-white shadow-lg active:scale-95 transition-transform flex flex-col items-center justify-center gap-1 ${
                isKidsMode
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 border-2 border-orange-200'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 border border-purple-300/40'
              }`}
            >
              <CornerDownRight className="w-5 h-5" />
              <span>{action2Label}</span>
            </button>
          )}

          {onAction1 && (
            <button
              onClick={() => trigger(onAction1)}
              className={`px-5 py-4 rounded-2xl font-bold text-sm text-white shadow-lg active:scale-95 transition-transform flex flex-col items-center justify-center gap-1 ${
                isKidsMode
                  ? 'bg-gradient-to-r from-emerald-400 to-teal-500 border-2 border-emerald-200'
                  : 'bg-gradient-to-r from-blue-600 to-cyan-500 border border-cyan-300/40'
              }`}
            >
              <Zap className="w-6 h-6" />
              <span>{action1Label}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
