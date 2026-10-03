/**
 * Advance Speed Racer - Type Definitions
 */

export type GameState = 'TITLE_MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

export type PowerUpType = 'SHIELD' | 'BOOST' | 'STAR';

export interface PlayerCar {
  x: number;
  y: number;
  targetX: number;
  width: number;
  height: number;
  tiltAngle: number;
  speed: number;
  baseSpeed: number;
  shieldActive: boolean;
  boostRemainingMs: number;
  skinId: string;
}

export interface EnemyCar {
  id: number;
  x: number;
  y: number;
  targetX: number;
  width: number;
  height: number;
  speed: number;
  lane: number;
  variantIndex: number;
  isOvertaken: boolean;
  nearMissAwarded: boolean;
  changingLaneTimer: number; // > 0 if currently switching lanes
}

export interface PowerUpItem {
  id: number;
  type: PowerUpType;
  x: number;
  y: number;
  width: number;
  height: number;
  pulseTimer: number;
}

export interface SceneryItem {
  id: number;
  type: 'tree_left' | 'tree_right' | 'light_left' | 'light_right' | 'sign_left' | 'sign_right';
  x: number;
  y: number;
  size: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  decay: number;
  rotation?: number;
  rotationSpeed?: number;
}

export interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
  alpha: number;
  scale: number;
}

export interface GameStats {
  score: number;
  highScore: number;
  bestLevel: number;
  bestDistance: number;
  totalRaces: number;
  level: number;
  distanceMeters: number;
  currentKmh: number;
  carsOvertaken: number;
  nearMissCount: number;
  powerUpsCollected: number;
  soundMuted: boolean;
}

export interface SavedGameData {
  highScore: number;
  bestLevel: number;
  bestDistance: number;
  totalRaces: number;
  soundMuted: boolean;
  selectedSkinId: string;
}
