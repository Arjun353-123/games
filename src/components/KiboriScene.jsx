import React from 'react';
import { KiboriLandingPage } from "@designcodeio/threeui";
import { Gamepad2, X } from 'lucide-react';
import "@designcodeio/threeui/style.css";

export function Scene() {
  return (
    <div className="shader-frame w-full h-full min-h-screen">
      <KiboriLandingPage />
    </div>
  );
}

export default function KiboriSceneModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#060814] text-white select-none">
      {/* Top Header Bar */}
      <header className="flex items-center justify-between px-6 py-3.5 border-b border-cyan-500/20 bg-[#060814]/95 backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
          <Gamepad2 className="w-5 h-5 text-cyan-400" />
          <span className="text-sm font-extrabold tracking-wider text-white">KIBORI — 3D CYBER ARENA</span>
          <span className="hidden sm:inline-block text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-mono">
            3D ENGINE LIVE
          </span>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="/login.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold px-3.5 py-1.5 rounded-full border border-white/20 hover:border-cyan-400 text-slate-300 hover:text-white transition-colors"
          >
            Player Sign In ↗
          </a>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer flex items-center gap-1.5"
          >
            <X className="w-3.5 h-3.5" />
            <span>Close Arena</span>
          </button>
        </div>
      </header>

      {/* Main 3D Canvas / Frame */}
      <main className="relative flex-1 w-full h-full overflow-hidden">
        <Scene />
      </main>
    </div>
  );
}
