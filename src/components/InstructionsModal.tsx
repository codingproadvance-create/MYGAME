/**
 * Advance Speed Racer - Instructions & Game Guide Modal
 * Pedagogical guide detailing keyboard & mobile controls, power-ups,
 * and strategic scoring maneuvers.
 */

import React from 'react';
import { X, Shield, Zap, Star, Smartphone, Keyboard, Sparkles, Award } from 'lucide-react';

interface InstructionsModalProps {
  onClose: () => void;
}

export const InstructionsModal: React.FC<InstructionsModalProps> = ({ onClose }) => {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-neutral-950/90 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-md rounded-2xl bg-neutral-900 border border-neutral-800 p-6 flex flex-col text-neutral-100 shadow-2xl animate-in fade-in zoom-in-95 duration-200 my-auto max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold font-race text-white tracking-wide">
              HOW TO PLAY
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Instructions"
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content sections */}
        <div className="flex flex-col gap-4 py-4 text-sm">
          {/* Controls */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400 font-race flex items-center gap-1.5 mb-2">
              <Keyboard className="w-4 h-4" />
              Keyboard Controls (Desktop)
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-neutral-950/60 border border-neutral-800/80">
                <span className="font-semibold text-neutral-200">Left Arrow / A</span>
                <p className="text-neutral-400 mt-0.5">Steer Left</p>
              </div>
              <div className="p-2 rounded-lg bg-neutral-950/60 border border-neutral-800/80">
                <span className="font-semibold text-neutral-200">Right Arrow / D</span>
                <p className="text-neutral-400 mt-0.5">Steer Right</p>
              </div>
              <div className="p-2 rounded-lg bg-neutral-950/60 border border-neutral-800/80">
                <span className="font-semibold text-neutral-200">Up Arrow / W</span>
                <p className="text-neutral-400 mt-0.5">Accelerate / Boost</p>
              </div>
              <div className="p-2 rounded-lg bg-neutral-950/60 border border-neutral-800/80">
                <span className="font-semibold text-neutral-200">Down Arrow / S</span>
                <p className="text-neutral-400 mt-0.5">Brake / Slow Down</p>
              </div>
            </div>
            <p className="text-[11px] text-neutral-500 mt-1 font-mono">Press 'P' or Esc to Pause.</p>
          </div>

          {/* Touch / Mobile */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400 font-race flex items-center gap-1.5 mb-2">
              <Smartphone className="w-4 h-4" />
              Mobile Touch & Swipe Controls
            </h3>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Use the on-screen steering arrows at the bottom, or simply <strong className="text-white">touch and drag your finger</strong> horizontally anywhere on the road to guide your car directly.
            </p>
          </div>

          {/* Power-Ups */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 font-race flex items-center gap-1.5 mb-2">
              <Sparkles className="w-4 h-4" />
              Collectible Power-Ups
            </h3>
            <div className="flex flex-col gap-2">
              <div className="flex items-start gap-3 p-2.5 rounded-lg bg-neutral-950/60 border border-neutral-800/80">
                <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400 shrink-0">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-sky-300">🛡 Shield Deflector</div>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Surrounds your sports car with an energy barrier that absorbs 1 collision safely.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-lg bg-neutral-950/60 border border-neutral-800/80">
                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-amber-300">⚡ Nitro Speed Boost</div>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Surges your car with rocket acceleration, twin blue flame trails, and 2x score multiplier for 6.5 seconds!
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-lg bg-neutral-950/60 border border-neutral-800/80">
                <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 shrink-0">
                  <Star className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-yellow-300">⭐ Golden Bonus Star</div>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Grants +500 instant bonus points and triggers a golden coin shower.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Scoring & Difficulty Tips */}
          <div className="p-3 rounded-lg bg-neutral-950/80 border border-neutral-800 text-xs">
            <div className="font-bold text-neutral-200 mb-1 font-race uppercase">
              Pro Racing Maneuver
            </div>
            <p className="text-neutral-400">
              <strong className="text-amber-400">Near Miss Bonus:</strong> Overtake enemy traffic closely without touching them to earn <span className="text-white font-mono">+100 Near Miss</span> points!
            </p>
            <p className="text-neutral-400 mt-1">
              <strong className="text-sky-400">Level Progression:</strong> Every 1,000 points levels up the race, speeding up traffic and introducing lane-changing enemy vehicles.
            </p>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-3 px-4 rounded-xl font-bold font-race text-sm tracking-wide uppercase bg-sky-600 hover:bg-sky-500 text-white transition-colors cursor-pointer"
        >
          Got It, Let's Race!
        </button>
      </div>
    </div>
  );
};
