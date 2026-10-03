/**
 * Advance Speed Racer - Title / Home Screen Component
 * Professional arcade presentation with garage car customizer,
 * career records, audio controls, and instructions access.
 */

import React from 'react';
import { CAR_SKINS } from '../game/constants';
import { GameStats } from '../game/types';
import { Play, HelpCircle, Volume2, VolumeX, Trophy, Gauge, Flag, Sparkles } from 'lucide-react';

interface TitleScreenProps {
  stats: GameStats;
  selectedSkinId: string;
  onSelectSkin: (id: string) => void;
  onStartGame: () => void;
  onOpenInstructions: () => void;
  onToggleMute: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  stats,
  selectedSkinId,
  onSelectSkin,
  onStartGame,
  onOpenInstructions,
  onToggleMute,
}) => {
  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-between p-6 bg-gradient-to-b from-neutral-950/90 via-neutral-950/80 to-neutral-950/95 backdrop-blur-sm text-neutral-100 overflow-y-auto">
      {/* Top Header Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs tracking-wider uppercase text-neutral-400 font-race">
          <Flag className="w-4 h-4 text-rose-500" />
          <span>Speedway Division 2026</span>
        </div>

        <button
          onClick={onToggleMute}
          aria-label={stats.soundMuted ? 'Unmute Audio' : 'Mute Audio'}
          className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700 transition-colors cursor-pointer"
        >
          {stats.soundMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
        </button>
      </div>

      {/* Main Logo & Title Hero */}
      <div className="flex flex-col items-center text-center my-auto py-4">
        <div className="inline-flex items-center gap-2 mb-2 text-xs font-semibold tracking-widest uppercase text-sky-400 font-data">
          <span>High Performance Arcade</span>
          <span>·</span>
          <span>HTML5 Canvas</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight font-race text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-amber-400 to-sky-400 drop-shadow-md">
          ADVANCE SPEED RACER
        </h1>

        <p className="mt-2 text-sm sm:text-base text-neutral-400 max-w-md font-sans">
          Dodge high-speed traffic, grab shields and nitro boosts, and dominate the 3-lane expressway!
        </p>

        {/* Garage: Car Paint Customization */}
        <div className="w-full max-w-sm mt-6 p-4 rounded-xl bg-neutral-900/80 border border-neutral-800/80">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Garage Livery
            </span>
            <span className="text-neutral-300 font-data">
              {CAR_SKINS.find((s) => s.id === selectedSkinId)?.name}
            </span>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {CAR_SKINS.map((skin) => {
              const isSelected = skin.id === selectedSkinId;
              return (
                <button
                  key={skin.id}
                  onClick={() => onSelectSkin(skin.id)}
                  className={`h-11 rounded-lg flex flex-col items-center justify-center border transition-all cursor-pointer relative ${
                    isSelected
                      ? 'border-white scale-105 shadow-md shadow-neutral-950'
                      : 'border-neutral-800 hover:border-neutral-600 opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: skin.primary }}
                  title={skin.name}
                >
                  <div
                    className="w-3.5 h-3.5 rounded-full border border-black/30"
                    style={{ backgroundColor: skin.secondary }}
                  />
                  {isSelected && (
                    <div className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Career Records Board */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-sm mt-4 text-center">
          <div className="p-2.5 rounded-lg bg-neutral-900/60 border border-neutral-800">
            <div className="flex items-center justify-center gap-1 text-[11px] text-neutral-400 font-race uppercase">
              <Trophy className="w-3 h-3 text-amber-400" />
              High Score
            </div>
            <div className="text-base sm:text-lg font-bold font-data text-amber-300">
              {stats.highScore.toLocaleString()}
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-neutral-900/60 border border-neutral-800">
            <div className="flex items-center justify-center gap-1 text-[11px] text-neutral-400 font-race uppercase">
              <Gauge className="w-3 h-3 text-sky-400" />
              Best Level
            </div>
            <div className="text-base sm:text-lg font-bold font-data text-sky-300">
              Lv. {stats.bestLevel}
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-neutral-900/60 border border-neutral-800">
            <div className="flex items-center justify-center gap-1 text-[11px] text-neutral-400 font-race uppercase">
              <Flag className="w-3 h-3 text-emerald-400" />
              Best Run
            </div>
            <div className="text-base sm:text-lg font-bold font-data text-emerald-300">
              {Math.floor(stats.bestDistance)}m
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-sm mt-6">
          <button
            onClick={onStartGame}
            className="w-full py-3.5 px-6 rounded-xl font-bold font-race text-base sm:text-lg tracking-wide uppercase bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white shadow-lg shadow-rose-900/40 hover:shadow-rose-900/60 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Start Race</span>
          </button>

          <button
            onClick={onOpenInstructions}
            className="w-full sm:w-auto py-3.5 px-5 rounded-xl font-semibold font-race text-sm tracking-wide uppercase bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white transition-colors flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
          >
            <HelpCircle className="w-4 h-4 text-sky-400" />
            <span>How to Play</span>
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-xs text-neutral-500 border-t border-neutral-800/80 pt-3">
        <span>Controls: Arrow Keys / A & D · Mobile Touch</span>
        <span className="font-data">v1.0.0</span>
      </div>
    </div>
  );
};
