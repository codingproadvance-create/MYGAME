/**
 * Advance Speed Racer - Constants & Configurations
 * Defines virtual dimensions, lane positions, colors, and game tuning parameters.
 */

// Virtual game world coordinates (Aspect ratio ~9:16 for arcade vertical racing)
export const VIRTUAL_WIDTH = 500;
export const VIRTUAL_HEIGHT = 860;

// Road layout configurations
export const ROAD_CONFIG = {
  // Road width in pixels within the virtual coordinate system
  roadWidth: 360,
  // Road X start (centered)
  roadX: (VIRTUAL_WIDTH - 360) / 2, // 70
  // 3 Lanes
  numLanes: 3,
  // Lane width
  laneWidth: 360 / 3, // 120
  // Left shoulder / grass width
  shoulderWidth: 70,
  // Kerb strip width
  kerbWidth: 10,
};

// Lane center X positions
export const LANE_CENTERS = [
  ROAD_CONFIG.roadX + ROAD_CONFIG.laneWidth * 0.5, // Lane 0 (Left): ~130
  ROAD_CONFIG.roadX + ROAD_CONFIG.laneWidth * 1.5, // Lane 1 (Center): ~250
  ROAD_CONFIG.roadX + ROAD_CONFIG.laneWidth * 2.5, // Lane 2 (Right): ~370
];

// Player car specifications
export const PLAYER_CONFIG = {
  width: 50,
  height: 96,
  initialY: VIRTUAL_HEIGHT - 160,
  baseSpeed: 7, // virtual road scroll speed (translates to ~120-140 km/h)
  maxSpeed: 16,
  minSpeed: 4,
  acceleration: 0.15,
  steeringSpeed: 9.5, // Horizontal movement speed per frame
  turnTiltMax: 0.16, // Radians to tilt car when steering
};

// Power-up durations & bonuses
export const POWERUP_CONFIG = {
  boostDurationMs: 6500, // 6.5 seconds of nitro
  boostSpeedMultiplier: 1.45,
  starBonusPoints: 500,
  nearMissBonusPoints: 100,
  nearMissDistanceX: 42, // Pixel threshold for close overtaking
  nearMissDistanceY: 55,
};

// Player selectable car colors
export interface CarSkin {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  glow: string;
}

export const CAR_SKINS: CarSkin[] = [
  {
    id: 'crimson',
    name: 'Crimson Fury',
    primary: '#e11d48', // rose-600
    secondary: '#9f1239', // rose-800
    accent: '#ffe4e6',
    glow: 'rgba(225, 29, 72, 0.4)',
  },
  {
    id: 'cyber',
    name: 'Cyber Cyan',
    primary: '#0ea5e9', // sky-500
    secondary: '#0369a1', // sky-700
    accent: '#e0f2fe',
    glow: 'rgba(14, 165, 233, 0.4)',
  },
  {
    id: 'gold',
    name: 'Gold Phoenix',
    primary: '#eab308', // yellow-500
    secondary: '#a16207', // yellow-700
    accent: '#fef08a',
    glow: 'rgba(234, 179, 8, 0.4)',
  },
  {
    id: 'neon',
    name: 'Neon Viper',
    primary: '#22c55e', // green-500
    secondary: '#15803d', // green-700
    accent: '#bbf7d0',
    glow: 'rgba(34, 197, 94, 0.4)',
  },
  {
    id: 'phantom',
    name: 'Phantom Orchid',
    primary: '#a855f7', // purple-500
    secondary: '#6b21a8', // purple-800
    accent: '#f3e8ff',
    glow: 'rgba(168, 85, 247, 0.4)',
  },
];

// Enemy car variants
export interface EnemyVariant {
  type: string;
  width: number;
  height: number;
  primary: string;
  secondary: string;
  roofDetail: 'none' | 'taxi' | 'stripes' | 'rack' | 'van';
  speedFactor: number; // Relative to current level speed
}

export const ENEMY_VARIANTS: EnemyVariant[] = [
  {
    type: 'sports_red',
    width: 48,
    height: 92,
    primary: '#dc2626',
    secondary: '#7f1d1d',
    roofDetail: 'stripes',
    speedFactor: 1.05,
  },
  {
    type: 'sedan_blue',
    width: 48,
    height: 90,
    primary: '#2563eb',
    secondary: '#1e3a8a',
    roofDetail: 'none',
    speedFactor: 0.95,
  },
  {
    type: 'taxi_yellow',
    width: 49,
    height: 92,
    primary: '#f59e0b',
    secondary: '#b45309',
    roofDetail: 'taxi',
    speedFactor: 0.98,
  },
  {
    type: 'muscle_orange',
    width: 50,
    height: 94,
    primary: '#ea580c',
    secondary: '#9a3412',
    roofDetail: 'stripes',
    speedFactor: 1.02,
  },
  {
    type: 'van_purple',
    width: 54,
    height: 104,
    primary: '#7c3aed',
    secondary: '#4c1d95',
    roofDetail: 'van',
    speedFactor: 0.85,
  },
  {
    type: 'coupe_silver',
    width: 47,
    height: 88,
    primary: '#64748b',
    secondary: '#334155',
    roofDetail: 'none',
    speedFactor: 1.08,
  },
];

// LocalStorage key for saving persistence
export const STORAGE_KEY = 'advance_speed_racer_save_data';
