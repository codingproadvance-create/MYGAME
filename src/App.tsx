/**
 * Advance Speed Racer - Main Application Entry
 * Renders the canvas view, manages game state synchronization,
 * input listeners, responsive scaling, and UI overlays.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from './game/GameEngine';
import { VIRTUAL_WIDTH, VIRTUAL_HEIGHT } from './game/constants';
import { TitleScreen } from './components/TitleScreen';
import { GameHUD } from './components/GameHUD';
import { PauseModal } from './components/PauseModal';
import { GameOverModal } from './components/GameOverModal';
import { InstructionsModal } from './components/InstructionsModal';
import { StudentGuideModal } from './components/StudentGuideModal';
import {
  Trophy,
  Shield,
  Zap,
  Star,
  BookOpen,
  Keyboard,
  Smartphone,
  Gauge,
  Flag,
} from 'lucide-react';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // React state mirroring engine state to trigger UI re-renders
  const [, setTick] = useState(0);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showStudentGuide, setShowStudentGuide] = useState(false);

  // Initialize engine once
  if (!engineRef.current) {
    engineRef.current = new GameEngine();
  }
  const engine = engineRef.current;

  // Subscribe to engine state updates
  useEffect(() => {
    engine.setListener(() => {
      setTick((t) => (t + 1) % 10000);
    });
  }, [engine]);

  // Canvas setup and game loop lifecycle
  useEffect(() => {
    if (canvasRef.current) {
      engine.attachCanvas(canvasRef.current);
      engine.startLoop();
    }

    return () => {
      engine.stopLoop();
    };
  }, [engine]);

  // Keyboard controls listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default page scroll for arrow keys and space
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        engine.setInput('left', true);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        engine.setInput('right', true);
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        engine.setInput('up', true);
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        engine.setInput('down', true);
      } else if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        if (engine.state === 'PLAYING') {
          engine.pauseGame();
        } else if (engine.state === 'PAUSED') {
          engine.resumeGame();
        }
      } else if (e.key === 'm' || e.key === 'M') {
        engine.toggleMute();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        engine.setInput('left', false);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        engine.setInput('right', false);
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        engine.setInput('up', false);
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        engine.setInput('down', false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [engine]);

  // Canvas direct touch / drag steering handler
  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (!canvasRef.current || engine.state !== 'PLAYING') return;
      const touch = e.touches[0];
      const rect = canvasRef.current.getBoundingClientRect();
      const relativeX = (touch.clientX - rect.left) * (VIRTUAL_WIDTH / rect.width);
      engine.handleTouchMove(relativeX);
    },
    [engine]
  );

  return (
    <div className="relative w-screen h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center overflow-hidden select-none">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(30,58,138,0.18)_0%,rgba(10,10,15,0.98)_80%)] pointer-events-none" />

      {/* Main Container: Wide Desktop 1440px layout with companion info panels */}
      <div className="relative z-10 w-full h-full max-w-7xl mx-auto flex items-center justify-center lg:justify-between px-2 sm:px-6 py-2 sm:py-4 gap-6">
        {/* Left Desktop Side Panel (Rules & Power-Ups) */}
        <div className="hidden lg:flex flex-col gap-4 w-72 shrink-0">
          {/* Brand Card */}
          <div className="p-5 rounded-2xl bg-neutral-900/70 border border-neutral-800/80 backdrop-blur-md">
            <div className="text-[11px] font-bold uppercase tracking-widest text-sky-400 font-race mb-1">
              Arcade Edition
            </div>
            <h2 className="text-2xl font-bold font-race text-white tracking-wide">
              ADVANCE SPEED RACER
            </h2>
            <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
              Precision 3-lane vertical racer built with HTML5 Canvas and synthesized Web Audio.
            </p>
          </div>

          {/* Power-Ups Intel */}
          <div className="p-4 rounded-2xl bg-neutral-900/70 border border-neutral-800/80 backdrop-blur-md flex flex-col gap-3">
            <div className="text-xs font-bold uppercase tracking-wider text-amber-400 font-race">
              Power-Up System
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400">
                <Shield className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <div className="font-semibold text-white">Shield Deflector</div>
                <div className="text-neutral-400 text-[11px]">Absorbs 1 collision</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Zap className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <div className="font-semibold text-white">Nitro Speed Boost</div>
                <div className="text-neutral-400 text-[11px]">Max speed & 2x score</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400">
                <Star className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <div className="font-semibold text-white">Bonus Star</div>
                <div className="text-neutral-400 text-[11px]">+500 Instant score</div>
              </div>
            </div>
          </div>

          {/* Quick Guide Trigger */}
          <button
            onClick={() => setShowStudentGuide(true)}
            className="w-full py-3 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-sky-300 hover:text-white font-race text-xs tracking-wider uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <BookOpen className="w-4 h-4 text-sky-400" />
            <span>Student Code Guide</span>
          </button>
        </div>

        {/* Center: The Game Viewport & Canvas Screen */}
        <div
          onTouchMove={handleTouchMove}
          className="relative w-full h-full max-w-[480px] sm:max-w-[500px] max-h-[920px] aspect-[9/16] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl shadow-sky-950/40 border border-neutral-800 bg-neutral-950 flex items-center justify-center"
        >
          {/* HTML5 Canvas */}
          <canvas
            ref={canvasRef}
            width={VIRTUAL_WIDTH}
            height={VIRTUAL_HEIGHT}
            className="w-full h-full object-contain block"
          />

          {/* Active Overlay Screens */}
          {engine.state === 'TITLE_MENU' && (
            <TitleScreen
              stats={engine.stats}
              selectedSkinId={engine.player.skinId}
              onSelectSkin={(id) => engine.setCarSkin(id)}
              onStartGame={() => engine.startNewGame()}
              onOpenInstructions={() => setShowInstructions(true)}
              onToggleMute={() => engine.toggleMute()}
            />
          )}

          {engine.state === 'PLAYING' && (
            <GameHUD
              stats={engine.stats}
              player={engine.player}
              onPause={() => engine.pauseGame()}
              onToggleMute={() => engine.toggleMute()}
              onInput={(dir, pressed) => engine.setInput(dir, pressed)}
            />
          )}

          {engine.state === 'PAUSED' && (
            <>
              <GameHUD
                stats={engine.stats}
                player={engine.player}
                onPause={() => engine.pauseGame()}
                onToggleMute={() => engine.toggleMute()}
                onInput={(dir, pressed) => engine.setInput(dir, pressed)}
              />
              <PauseModal
                stats={engine.stats}
                onResume={() => engine.resumeGame()}
                onRestart={() => engine.restartGame()}
                onHome={() => engine.goToTitle()}
                onToggleMute={() => engine.toggleMute()}
              />
            </>
          )}

          {engine.state === 'GAME_OVER' && (
            <GameOverModal
              stats={engine.stats}
              onRestart={() => engine.restartGame()}
              onHome={() => engine.goToTitle()}
            />
          )}

          {/* Instructions Modal */}
          {showInstructions && (
            <InstructionsModal onClose={() => setShowInstructions(false)} />
          )}

          {/* Student Code & Architecture Guide Modal */}
          {showStudentGuide && (
            <StudentGuideModal onClose={() => setShowStudentGuide(false)} />
          )}
        </div>

        {/* Right Desktop Side Panel (Live Career Telemetry & Controls) */}
        <div className="hidden lg:flex flex-col gap-4 w-72 shrink-0">
          {/* Career Stats */}
          <div className="p-4 rounded-2xl bg-neutral-900/70 border border-neutral-800/80 backdrop-blur-md flex flex-col gap-3">
            <div className="text-xs font-bold uppercase tracking-wider text-sky-400 font-race">
              Career Records
            </div>

            <div className="flex items-center justify-between text-xs py-1 border-b border-neutral-800">
              <span className="flex items-center gap-1.5 text-neutral-400 font-race uppercase">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                High Score
              </span>
              <span className="font-bold font-data text-amber-300 tabular-nums">
                {engine.stats.highScore.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs py-1 border-b border-neutral-800">
              <span className="flex items-center gap-1.5 text-neutral-400 font-race uppercase">
                <Gauge className="w-3.5 h-3.5 text-sky-400" />
                Best Level
              </span>
              <span className="font-bold font-data text-sky-300 tabular-nums">
                Level {engine.stats.bestLevel}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs py-1">
              <span className="flex items-center gap-1.5 text-neutral-400 font-race uppercase">
                <Flag className="w-3.5 h-3.5 text-emerald-400" />
                Races Played
              </span>
              <span className="font-bold font-data text-white tabular-nums">
                {engine.stats.totalRaces}
              </span>
            </div>
          </div>

          {/* Controls Quick Ref */}
          <div className="p-4 rounded-2xl bg-neutral-900/70 border border-neutral-800/80 backdrop-blur-md flex flex-col gap-2.5">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-300 font-race flex items-center gap-1.5">
              <Keyboard className="w-4 h-4 text-sky-400" />
              Keyboard Controls
            </div>

            <div className="space-y-1.5 text-xs text-neutral-400">
              <div className="flex items-center justify-between">
                <span>Steer Left / Right:</span>
                <span className="font-data text-white font-semibold">A / D or ← / →</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Accelerate / Brake:</span>
                <span className="font-data text-white font-semibold">W / S or ↑ / ↓</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Pause / Resume:</span>
                <span className="font-data text-white font-semibold">P or Esc</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Mute / Unmute:</span>
                <span className="font-data text-white font-semibold">M</span>
              </div>
            </div>
          </div>

          {/* Touch Support Card */}
          <div className="p-4 rounded-2xl bg-neutral-900/70 border border-neutral-800/80 backdrop-blur-md flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0">
              <Smartphone className="w-4 h-4" />
            </div>
            <div className="text-xs text-neutral-400">
              <div className="font-semibold text-white font-race uppercase">Mobile Touch</div>
              Touch & drag horizontally on the road to direct the sports car.
            </div>
          </div>
        </div>
      </div>

      {/* Floating Student Code Guide button on mobile/tablet view */}
      <div className="lg:hidden absolute bottom-3 right-3 z-30 pointer-events-auto">
        <button
          onClick={() => setShowStudentGuide(true)}
          className="p-2.5 rounded-full hud-glass hover:bg-neutral-800 text-sky-400 border border-sky-500/30 shadow-lg cursor-pointer"
          title="Student Code Guide"
        >
          <BookOpen className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
