/**
 * Advance Speed Racer - Game Over Modal Component
 * Displays post-collision results, telemetry statistics,
 * high score achievements, and rematch buttons.
 */

import React from 'react';
import { GameStats } from '../game/types';
import { RotateCcw, Home, Trophy, Gauge, Flag, Zap, Sparkles } from 'lucide-react';

interface GameOverModalProps {
  stats: GameStats;
  onRestart: () => void;
  onHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  onRestart,
  onHome,
}) => {
  const isNewHighScore = stats.score >= stats.highScore && stats.score > 0;

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-neutral-950/90 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-sm rounded-2xl bg-neutral-900 border border-neutral-800 p-6 flex flex-col items-center text-center shadow-2xl animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Crash alert badge */}
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase text-rose-500 font-race mb-1">
          <span>Crash Alert</span>
        </div>

        <h2 className="text-4xl font-bold font-race text-rose-500 tracking-tight drop-shadow-md">
          GAME OVER
        </h2>

        {/* New Record Banner if applicable */}
        {isNewHighScore && (
          <div className="mt-2 py-1 px-3 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold font-race flex items-center gap-1.5 animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>NEW HIGH SCORE RECORD!</span>
          </div>
        )}

        {/* Main Scores Card */}
        <div className="w-full my-4 p-4 rounded-xl bg-neutral-950/80 border border-neutral-800 flex flex-col gap-3">
          {/* Final Score */}
          <div>
            <div className="text-xs text-neutral-400 font-race uppercase tracking-wider">
              Final Score
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold font-data text-white tracking-tight tabular-nums">
              {stats.score.toLocaleString()}
            </div>
          </div>

          <div className="h-px bg-neutral-800 w-full" />

          {/* High Score & Best Level */}
          <div className="flex items-center justify-between text-xs text-neutral-300">
            <span className="flex items-center gap-1.5 text-neutral-400 font-race uppercase">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              All-Time Best
            </span>
            <span className="font-bold font-data text-amber-300 text-sm tabular-nums">
              {stats.highScore.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Telemetry Breakdown Grid */}
        <div className="grid grid-cols-2 gap-2 w-full mb-5 text-left">
          <div className="p-2.5 rounded-lg bg-neutral-950/60 border border-neutral-800/80">
            <div className="flex items-center gap-1 text-[11px] text-neutral-400 font-race uppercase">
              <Flag className="w-3 h-3 text-emerald-400" />
              Distance
            </div>
            <div className="text-sm sm:text-base font-bold font-data text-white tabular-nums mt-0.5">
              {Math.floor(stats.distanceMeters)} m
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-neutral-950/60 border border-neutral-800/80">
            <div className="flex items-center gap-1 text-[11px] text-neutral-400 font-race uppercase">
              <Gauge className="w-3 h-3 text-sky-400" />
              Level Reached
            </div>
            <div className="text-sm sm:text-base font-bold font-data text-sky-300 tabular-nums mt-0.5">
              Level {stats.level}
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-neutral-950/60 border border-neutral-800/80">
            <div className="flex items-center gap-1 text-[11px] text-neutral-400 font-race uppercase">
              <Zap className="w-3 h-3 text-amber-400" />
              Overtakes
            </div>
            <div className="text-sm sm:text-base font-bold font-data text-white tabular-nums mt-0.5">
              {stats.carsOvertaken} cars
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-neutral-950/60 border border-neutral-800/80">
            <div className="flex items-center gap-1 text-[11px] text-neutral-400 font-race uppercase">
              <Sparkles className="w-3 h-3 text-purple-400" />
              Near Misses
            </div>
            <div className="text-sm sm:text-base font-bold font-data text-purple-300 tabular-nums mt-0.5">
              {stats.nearMissCount}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-2.5 w-full">
          <button
            onClick={onRestart}
            className="w-full py-3.5 px-5 rounded-xl font-bold font-race text-base tracking-wide uppercase bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white shadow-lg shadow-rose-900/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Restart Race</span>
          </button>

          <button
            onClick={onHome}
            className="w-full py-3 px-5 rounded-xl font-semibold font-race text-sm tracking-wide uppercase bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Back to Home</span>
          </button>
        </div>
      </div>
    </div>
  );
};
