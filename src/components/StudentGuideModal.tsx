/**
 * Advance Speed Racer - Pedagogical Architecture & Student Guide Modal
 * Breaks down the complete inner workings of the game engine,
 * physics, collision detection, and student customization tips.
 */

import React from 'react';
import { X, BookOpen, Code2, Compass, Cpu, Database, Flame, Wrench } from 'lucide-react';

interface StudentGuideModalProps {
  onClose: () => void;
}

export const StudentGuideModal: React.FC<StudentGuideModalProps> = ({ onClose }) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/90 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl bg-neutral-900 border border-neutral-800 p-6 flex flex-col text-neutral-100 shadow-2xl my-auto max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-sky-400" />
            <h2 className="text-xl font-bold font-race text-white tracking-wide">
              STUDENT CODE & ENGINE GUIDE
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Guide"
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Breakdown Sections */}
        <div className="flex flex-col gap-5 py-4 text-xs sm:text-sm text-neutral-300">
          {/* 1. How the Game Works */}
          <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800">
            <h3 className="font-bold text-sky-400 font-race flex items-center gap-2 mb-1.5 text-sm uppercase">
              <Compass className="w-4 h-4" />
              1. How the Game Works (The Game Loop)
            </h3>
            <p className="leading-relaxed text-neutral-400">
              The game relies on a continuous 60 FPS loop managed by <code className="text-amber-300 font-mono">requestAnimationFrame</code>. Every frame:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-neutral-400">
              <li><strong className="text-neutral-200">Input:</strong> Captures keyboard keys and mobile touch coordinates.</li>
              <li><strong className="text-neutral-200">Update:</strong> Calculates elapsed delta time (<code className="text-sky-300 font-mono">dt</code>), moves road markings, advances enemy cars, checks collisions, updates particles, and increments score.</li>
              <li><strong className="text-neutral-200">Render:</strong> Erases the HTML5 Canvas and redraws the road, roadside scenery, power-ups, traffic, and player car in sequential z-index layers.</li>
            </ul>
          </div>

          {/* 2. How Car Movement Works */}
          <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800">
            <h3 className="font-bold text-emerald-400 font-race flex items-center gap-2 mb-1.5 text-sm uppercase">
              <Cpu className="w-4 h-4" />
              2. How Car Movement Works (Inertia & Tilting)
            </h3>
            <p className="leading-relaxed text-neutral-400">
              Instead of snapping the car abruptly when an arrow key is pressed, the game utilizes <strong className="text-neutral-200">Linear Interpolation (Lerp)</strong>:
            </p>
            <div className="p-2.5 my-2 rounded-lg bg-neutral-900 font-mono text-[11px] text-emerald-300">
              const dx = player.targetX - player.x;<br />
              player.x += dx * 0.22; // Smooth damping inertia<br />
              player.tiltAngle = (dx / 30) * maxTilt; // Banking rotation
            </div>
            <p className="text-neutral-400">
              This creates the realistic weight, responsive acceleration, and aerodynamic chassis banking observed in sports cars.
            </p>
          </div>

          {/* 3. Collision Detection */}
          <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800">
            <h3 className="font-bold text-rose-400 font-race flex items-center gap-2 mb-1.5 text-sm uppercase">
              <Code2 className="w-4 h-4" />
              3. How Collision Detection Works (AABB)
            </h3>
            <p className="leading-relaxed text-neutral-400">
              The game performs <strong className="text-neutral-200">Axis-Aligned Bounding Box (AABB)</strong> intersection testing. We calculate the left, right, top, and bottom edges of both vehicles with a 4-pixel tolerance margin so near-misses feel fair and exciting rather than frustrating.
            </p>
            <div className="p-2.5 my-2 rounded-lg bg-neutral-900 font-mono text-[11px] text-rose-300">
              if (pLeft &lt; eRight && pRight &gt; eLeft && pTop &lt; eBottom && pBottom &gt; eTop) &#123;<br />
              &nbsp;&nbsp;if (player.shieldActive) &#123; player.shieldActive = false; &#125;<br />
              &nbsp;&nbsp;else &#123; triggerGameOver(); &#125;<br />
              &#125;
            </div>
          </div>

          {/* 4. Score System */}
          <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800">
            <h3 className="font-bold text-amber-400 font-race flex items-center gap-2 mb-1.5 text-sm uppercase">
              <Flame className="w-4 h-4" />
              4. How the Score System Works
            </h3>
            <ul className="list-disc pl-5 space-y-1 text-neutral-400">
              <li><strong className="text-neutral-200">Velocity Points:</strong> Continuous points generated based on driving speed (<code className="text-amber-300 font-mono">speed * 0.16</code>).</li>
              <li><strong className="text-neutral-200">Overtake Reward:</strong> +50 points whenever you pass a car safely.</li>
              <li><strong className="text-neutral-200">Near Miss Bonus:</strong> +100 bonus points for threading through traffic within 42px.</li>
              <li><strong className="text-neutral-200">Golden Star Power-Up:</strong> +500 instant points.</li>
              <li><strong className="text-neutral-200">Nitro Boost:</strong> Doubles all point accumulation while active!</li>
            </ul>
          </div>

          {/* 5. Difficulty Progression */}
          <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800">
            <h3 className="font-bold text-purple-400 font-race flex items-center gap-2 mb-1.5 text-sm uppercase">
              <Flame className="w-4 h-4" />
              5. How Difficulty Increases
            </h3>
            <p className="text-neutral-400">
              Every 1,000 points, <code className="text-purple-300 font-mono">level = Math.floor(score / 1000) + 1</code>. With each level:
            </p>
            <ul className="list-disc pl-5 mt-1 space-y-1 text-neutral-400">
              <li>Player and highway scroll speeds increase.</li>
              <li>Enemy car spawn intervals shrink from 75 frames down to 38 frames.</li>
              <li>At Level 3+, enemy cars gain AI to activate blinkers and switch lanes!</li>
            </ul>
          </div>

          {/* 6. LocalStorage */}
          <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800">
            <h3 className="font-bold text-sky-400 font-race flex items-center gap-2 mb-1.5 text-sm uppercase">
              <Database className="w-4 h-4" />
              6. How LocalStorage Saves High Scores
            </h3>
            <p className="text-neutral-400">
              The browser's synchronous <code className="text-sky-300 font-mono">localStorage.setItem()</code> saves a JSON string under the key <code className="text-sky-300 font-mono">advance_speed_racer_save_data</code>. When the player visits or refreshes the page, <code className="text-sky-300 font-mono">localStorage.getItem()</code> automatically reloads high scores, best level, sound preferences, and car paint choices.
            </p>
          </div>

          {/* 7. Student Customization Ideas */}
          <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800">
            <h3 className="font-bold text-emerald-400 font-race flex items-center gap-2 mb-1.5 text-sm uppercase">
              <Wrench className="w-4 h-4" />
              7. How Students Can Customize the Game
            </h3>
            <ul className="list-disc pl-5 space-y-1 text-neutral-400">
              <li><strong className="text-neutral-200">Add New Cars:</strong> Open <code className="text-emerald-300 font-mono">src/game/constants.ts</code> and add new entries to <code className="text-emerald-300 font-mono">CAR_SKINS</code> or <code className="text-emerald-300 font-mono">ENEMY_VARIANTS</code> with custom hex colors and dimensions.</li>
              <li><strong className="text-neutral-200">Tune Physics:</strong> Adjust <code className="text-emerald-300 font-mono">PLAYER_CONFIG.steeringSpeed</code> or <code className="text-emerald-300 font-mono">baseSpeed</code> for drift or arcade speeds.</li>
              <li><strong className="text-neutral-200">Create New Power-Ups:</strong> Add a <code className="text-emerald-300 font-mono">MAGNET</code> or <code className="text-emerald-300 font-mono">SLOW_MOTION</code> item in <code className="text-emerald-300 font-mono">src/game/types.ts</code> and update the switch case in <code className="text-emerald-300 font-mono">collectPowerUp()</code>.</li>
              <li><strong className="text-emerald-300 font-mono">Sound Synthesis:</strong> Edit oscillator frequencies in <code className="text-emerald-300 font-mono">src/game/audio.ts</code> to compose your own custom 8-bit sound effects.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <button
          onClick={onClose}
          className="mt-2 w-full py-3 px-4 rounded-xl font-bold font-race text-sm tracking-wide uppercase bg-sky-600 hover:bg-sky-500 text-white transition-colors cursor-pointer"
        >
          Close Guide & Return
        </button>
      </div>
    </div>
  );
};
