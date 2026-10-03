/**
 * Advance Speed Racer - Pause Modal Component
 * Displays when the game is paused. Allows resuming, restarting,
 * changing sound settings, or returning to the main menu.
 */

import React from 'react';
import { GameStats } from '../game/types';
import { Play, RotateCcw, Home, Volume2, VolumeX } from 'lucide-react';

interface PauseModalProps {
  stats: GameStats;
  onResume: () => void;
  onRestart: () => void;
  onHome: () => void;
  onToggleMute: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  stats,
  onResume,
  onRestart,
  onHome,
  onToggleMute,
}) => {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-neutral-950/85 backdrop-blur-md">
      <div className="w-full max-w-sm rounded-2xl bg-neutral-900 border border-neutral-800 p-6 flex flex-col items-center text-center shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Title */}
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase text-sky-400 font-race mb-1">
          <span>Speedway Pit Stop</span>
        </div>

        <h2 className="text-3xl font-bold font-race text-white tracking-wide">
          GAME PAUSED
        </h2>

        {/* Current Run Score Recap */}
        <div className="grid grid-cols-2 gap-3 w-full my-5 p-3 rounded-xl bg-neutral-950/70 border border-neutral-800/80">
          <div>
            <div className="text-[11px] text-neutral-400 font-race uppercase">Current Score</div>
            <div className="text-lg font-bold font-data text-white tabular-nums">
              {stats.score.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-neutral-400 font-race uppercase">Distance</div>
            <div className="text-lg font-bold font-data text-emerald-400 tabular-nums">
              {Math.floor(stats.distanceMeters)} m
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 w-full">
          {/* Resume */}
          <button
            onClick={onResume}
            className="w-full py-3 px-5 rounded-xl font-bold font-race text-base tracking-wide uppercase bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-900/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Resume Game</span>
          </button>

          {/* Restart */}
          <button
            onClick={onRestart}
            className="w-full py-3 px-5 rounded-xl font-semibold font-race text-sm tracking-wide uppercase bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white border border-neutral-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span>Restart Race</span>
          </button>

          {/* Audio toggle & Home */}
          <div className="grid grid-cols-2 gap-2 w-full pt-1">
            <button
              onClick={onToggleMute}
              className="py-2.5 px-3 rounded-xl font-medium text-xs font-race uppercase bg-neutral-800/80 hover:bg-neutral-800 border border-neutral-700/80 text-neutral-300 hover:text-white flex items-center justify-center gap-2 cursor-pointer"
            >
              {stats.soundMuted ? (
                <>
                  <VolumeX className="w-4 h-4 text-rose-400" />
                  <span>Unmute</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                  <span>Mute</span>
                </>
              )}
            </button>

            <button
              onClick={onHome}
              className="py-2.5 px-3 rounded-xl font-medium text-xs font-race uppercase bg-neutral-800/80 hover:bg-neutral-800 border border-neutral-700/80 text-neutral-300 hover:text-white flex items-center justify-center gap-2 cursor-pointer"
            >
              <Home className="w-4 h-4 text-neutral-400" />
              <span>Main Menu</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
