/**
 * Advance Speed Racer - Heads-Up Display (HUD)
 * Real-time telemetry, active power-up badges, speed/rev counter,
 * system controls (Pause, Mute), and responsive mobile controls.
 */

import React from 'react';
import { GameStats, PlayerCar } from '../game/types';
import { Pause, Volume2, VolumeX, Shield, Zap, Trophy, Flag, ChevronLeft, ChevronRight, ChevronsUp, Flame } from 'lucide-react';
import { POWERUP_CONFIG } from '../game/constants';

interface GameHUDProps {
  stats: GameStats;
  player: PlayerCar;
  onPause: () => void;
  onToggleMute: () => void;
  onInput: (input: 'left' | 'right' | 'up' | 'down', isPressed: boolean) => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  stats,
  player,
  onPause,
  onToggleMute,
  onInput,
}) => {
  const isBoosting = player.boostRemainingMs > 0;
  const boostPercent = Math.min(100, Math.max(0, (player.boostRemainingMs / POWERUP_CONFIG.boostDurationMs) * 100));

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-3 sm:p-4 select-none">
      {/* Top Header Telemetry Strip */}
      <div className="w-full flex items-start justify-between gap-2">
        {/* Left: Score & High Score */}
        <div className="hud-glass rounded-xl p-2.5 sm:p-3 pointer-events-auto flex flex-col gap-1 min-w-[130px] sm:min-w-[150px]">
          <div className="flex items-center justify-between text-[11px] text-neutral-400 font-race uppercase tracking-wider">
            <span>Score</span>
            <span className="text-amber-400 font-data">LVL {stats.level}</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-data text-white tabular-nums tracking-tight">
            {stats.score.toLocaleString()}
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 border-t border-neutral-800/80 pt-1 mt-0.5">
            <Trophy className="w-3 h-3 text-amber-400 shrink-0" />
            <span className="truncate">BEST:</span>
            <span className="font-data text-amber-300 font-semibold ml-auto tabular-nums">
              {stats.highScore.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Center: Active Power-up Badges & Distance */}
        <div className="flex flex-col items-center gap-1.5">
          {/* Distance Meter */}
          <div className="hud-glass rounded-lg px-3 py-1 flex items-center gap-1.5 text-xs text-neutral-300 font-data">
            <Flag className="w-3.5 h-3.5 text-emerald-400" />
            <span>{Math.floor(stats.distanceMeters)} m</span>
          </div>

          {/* Active Power-up Status Indicators */}
          <div className="flex items-center gap-2">
            {player.shieldActive && (
              <div className="hud-glass px-2.5 py-1 rounded-lg border border-sky-500/50 flex items-center gap-1.5 text-sky-400 text-xs font-race animate-shield-glow">
                <Shield className="w-3.5 h-3.5 fill-sky-400/20" />
                <span className="hidden sm:inline">SHIELD</span>
              </div>
            )}

            {isBoosting && (
              <div className="hud-glass px-2.5 py-1 rounded-lg border border-amber-500/60 flex items-center gap-1.5 text-amber-400 text-xs font-race">
                <Flame className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                <span className="font-data">{(player.boostRemainingMs / 1000).toFixed(1)}s</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Controls & Speedometer */}
        <div className="flex flex-col items-end gap-2">
          {/* Action buttons (Pause, Mute) */}
          <div className="flex items-center gap-1.5 pointer-events-auto">
            <button
              onClick={onToggleMute}
              aria-label={stats.soundMuted ? 'Unmute Audio' : 'Mute Audio'}
              className="p-2 sm:p-2.5 rounded-lg hud-glass hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            >
              {stats.soundMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            <button
              onClick={onPause}
              aria-label="Pause Game"
              className="p-2 sm:p-2.5 rounded-lg hud-glass hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            >
              <Pause className="w-4 h-4 text-sky-400" />
            </button>
          </div>

          {/* Digital Speedometer Gauge */}
          <div className="hud-glass rounded-xl p-2 sm:p-2.5 flex flex-col items-end min-w-[100px] sm:min-w-[110px]">
            <div className="text-[10px] text-neutral-400 uppercase font-race tracking-wider">
              Speedometer
            </div>
            <div className="flex items-baseline gap-1">
              <span className={`text-xl sm:text-2xl font-bold font-data tabular-nums ${isBoosting ? 'text-amber-400 nitro-glow' : 'text-sky-400 speed-glow'}`}>
                {stats.currentKmh}
              </span>
              <span className="text-[10px] text-neutral-400 font-race uppercase">km/h</span>
            </div>

            {/* Speed Rev Bar */}
            <div className="w-full bg-neutral-900 rounded-full h-1.5 mt-1 overflow-hidden">
              <div
                className={`h-full transition-all duration-75 ${
                  isBoosting
                    ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                    : 'bg-gradient-to-r from-sky-500 to-emerald-400'
                }`}
                style={{ width: `${Math.min(100, (stats.currentKmh / 280) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Nitro Boost Gauge Bar (when active) */}
      {isBoosting && (
        <div className="w-full max-w-xs mx-auto mb-2 hud-glass p-1.5 rounded-lg flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400 fill-amber-400/30" />
          <div className="flex-1 bg-neutral-900 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-rose-500 transition-all duration-75"
              style={{ width: `${boostPercent}%` }}
            />
          </div>
          <span className="text-[10px] font-data text-amber-300 font-bold whitespace-nowrap">
            NITRO
          </span>
        </div>
      )}

      {/* Bottom Row: On-Screen Mobile Steering Controls */}
      {/* Shows on all touch devices, styled to be comfortable and thumb-friendly */}
      <div className="w-full flex items-end justify-between gap-4 pointer-events-auto pb-1 sm:pb-2">
        {/* Left Hand: Steering Left & Right */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              onInput('left', true);
            }}
            onPointerUp={() => onInput('left', false)}
            onPointerLeave={() => onInput('left', false)}
            onPointerCancel={() => onInput('left', false)}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl hud-glass active:bg-sky-600/40 border border-neutral-700 active:border-sky-400 flex items-center justify-center text-white active:scale-95 transition-transform shadow-lg cursor-pointer"
            aria-label="Steer Left"
          >
            <ChevronLeft className="w-8 h-8 text-neutral-200" />
          </button>

          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              onInput('right', true);
            }}
            onPointerUp={() => onInput('right', false)}
            onPointerLeave={() => onInput('right', false)}
            onPointerCancel={() => onInput('right', false)}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl hud-glass active:bg-sky-600/40 border border-neutral-700 active:border-sky-400 flex items-center justify-center text-white active:scale-95 transition-transform shadow-lg cursor-pointer"
            aria-label="Steer Right"
          >
            <ChevronRight className="w-8 h-8 text-neutral-200" />
          </button>
        </div>

        {/* Right Hand: Accelerate & Brake */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              onInput('down', true);
            }}
            onPointerUp={() => onInput('down', false)}
            onPointerLeave={() => onInput('down', false)}
            onPointerCancel={() => onInput('down', false)}
            className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl hud-glass active:bg-rose-600/40 border border-neutral-700 active:border-rose-400 flex flex-col items-center justify-center text-neutral-300 active:scale-95 transition-transform shadow-lg cursor-pointer"
            aria-label="Brake"
          >
            <span className="text-[10px] font-race uppercase tracking-wider text-rose-300 font-bold">Brake</span>
          </button>

          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              onInput('up', true);
            }}
            onPointerUp={() => onInput('up', false)}
            onPointerLeave={() => onInput('up', false)}
            onPointerCancel={() => onInput('up', false)}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl hud-glass active:bg-amber-600/40 border border-neutral-700 active:border-amber-400 flex flex-col items-center justify-center text-white active:scale-95 transition-transform shadow-lg cursor-pointer"
            aria-label="Accelerate"
          >
            <ChevronsUp className="w-6 h-6 text-amber-400" />
            <span className="text-[9px] font-race uppercase font-bold text-amber-300">GAS</span>
          </button>
        </div>
      </div>
    </div>
  );
};
