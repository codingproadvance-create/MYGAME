/**
 * Advance Speed Racer - Core Game Engine
 * Manages game loop, physics, vehicle spawning, collisions, scoring,
 * power-ups, audio coordination, and localStorage persistence.
 */

import {
  VIRTUAL_WIDTH,
  VIRTUAL_HEIGHT,
  ROAD_CONFIG,
  LANE_CENTERS,
  PLAYER_CONFIG,
  POWERUP_CONFIG,
  CAR_SKINS,
  ENEMY_VARIANTS,
  STORAGE_KEY,
} from './constants';
import {
  GameState,
  PlayerCar,
  EnemyCar,
  PowerUpItem,
  SceneryItem,
  Particle,
  FloatingText,
  GameStats,
  SavedGameData,
} from './types';
import {
  drawRoad,
  drawScenery,
  drawPlayerCar,
  drawEnemyCar,
  drawPowerUp,
  drawParticles,
  drawFloatingTexts,
} from './canvasDrawing';
import { soundManager } from './audio';

export class GameEngine {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;

  public state: GameState = 'TITLE_MENU';
  private animationFrameId: number | null = null;
  private lastTime: number = 0;
  private tickCount: number = 0;

  // Road animation offset
  private roadOffset: number = 0;

  // Entities
  public player: PlayerCar;
  public enemies: EnemyCar[] = [];
  public powerUps: PowerUpItem[] = [];
  public scenery: SceneryItem[] = [];
  public particles: Particle[] = [];
  public floatingTexts: FloatingText[] = [];

  // Spawning clocks
  private nextEnemySpawnTimer: number = 70;
  private nextPowerUpSpawnTimer: number = 320;
  private nextScenerySpawnTimer: number = 35;
  private enemyIdCounter: number = 1;
  private powerUpIdCounter: number = 1;
  private sceneryIdCounter: number = 1;

  // Active inputs
  private keys: { [key: string]: boolean } = {
    left: false,
    right: false,
    up: false,
    down: false,
  };

  // Screen shake effect on impact or boost
  public screenShakeIntensity: number = 0;

  // Game Statistics
  public stats: GameStats = {
    score: 0,
    highScore: 0,
    bestLevel: 1,
    bestDistance: 0,
    totalRaces: 0,
    level: 1,
    distanceMeters: 0,
    currentKmh: 120,
    carsOvertaken: 0,
    nearMissCount: 0,
    powerUpsCollected: 0,
    soundMuted: false,
  };

  // State change notification listener for UI
  private onStateChange: ((engine: GameEngine) => void) | null = null;

  constructor() {
    this.player = this.createDefaultPlayer();
    this.loadSaveData();
    this.initScenery();
  }

  private createDefaultPlayer(): PlayerCar {
    return {
      x: LANE_CENTERS[1],
      y: PLAYER_CONFIG.initialY,
      targetX: LANE_CENTERS[1],
      width: PLAYER_CONFIG.width,
      height: PLAYER_CONFIG.height,
      tiltAngle: 0,
      speed: PLAYER_CONFIG.baseSpeed,
      baseSpeed: PLAYER_CONFIG.baseSpeed,
      shieldActive: false,
      boostRemainingMs: 0,
      skinId: CAR_SKINS[0].id,
    };
  }

  /**
   * Initializes initial roadside trees and lamps across the canvas.
   */
  private initScenery(): void {
    this.scenery = [];
    for (let y = 50; y < VIRTUAL_HEIGHT; y += 120) {
      this.spawnSceneryAtY(y);
    }
  }

  private spawnSceneryAtY(y: number): void {
    const isLeft = Math.random() < 0.5;
    const typeRoll = Math.random();

    let type: SceneryItem['type'];
    if (typeRoll < 0.6) {
      type = isLeft ? 'tree_left' : 'tree_right';
    } else if (typeRoll < 0.88) {
      type = isLeft ? 'light_left' : 'light_right';
    } else {
      type = isLeft ? 'sign_left' : 'sign_right';
    }

    const x = isLeft
      ? Math.random() * (ROAD_CONFIG.roadX - 25) + 15
      : ROAD_CONFIG.roadX + ROAD_CONFIG.roadWidth + 20 + Math.random() * (VIRTUAL_WIDTH - (ROAD_CONFIG.roadX + ROAD_CONFIG.roadWidth) - 35);

    this.scenery.push({
      id: this.sceneryIdCounter++,
      type,
      x,
      y,
      size: type.startsWith('tree') ? 34 + Math.random() * 16 : 24,
    });
  }

  /**
   * Attach canvas element and start render/update loop.
   */
  public attachCanvas(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }

  public setListener(callback: (engine: GameEngine) => void): void {
    this.onStateChange = callback;
  }

  private notify(): void {
    if (this.onStateChange) {
      this.onStateChange(this);
    }
  }

  /**
   * Loads persisted high score and settings from localStorage.
   */
  private loadSaveData(): void {
    try {
      const dataStr = localStorage.getItem(STORAGE_KEY);
      if (dataStr) {
        const data: SavedGameData = JSON.parse(dataStr);
        this.stats.highScore = data.highScore || 0;
        this.stats.bestLevel = data.bestLevel || 1;
        this.stats.bestDistance = data.bestDistance || 0;
        this.stats.totalRaces = data.totalRaces || 0;
        this.stats.soundMuted = !!data.soundMuted;
        this.player.skinId = data.selectedSkinId || CAR_SKINS[0].id;
        soundManager.setMuted(this.stats.soundMuted);
      }
    } catch {
      // Ignore JSON error
    }
  }

  /**
   * Persists high score and stats to localStorage.
   */
  public saveGameData(): void {
    try {
      const data: SavedGameData = {
        highScore: Math.max(this.stats.highScore, this.stats.score),
        bestLevel: Math.max(this.stats.bestLevel, this.stats.level),
        bestDistance: Math.max(this.stats.bestDistance, Math.floor(this.stats.distanceMeters)),
        totalRaces: this.stats.totalRaces,
        soundMuted: this.stats.soundMuted,
        selectedSkinId: this.player.skinId,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      this.stats.highScore = data.highScore;
      this.stats.bestLevel = data.bestLevel;
      this.stats.bestDistance = data.bestDistance;
    } catch {
      // Ignore
    }
  }

  public setCarSkin(skinId: string): void {
    this.player.skinId = skinId;
    this.saveGameData();
    this.notify();
  }

  public toggleMute(): void {
    this.stats.soundMuted = !this.stats.soundMuted;
    soundManager.setMuted(this.stats.soundMuted);
    this.saveGameData();
    this.notify();
  }

  /**
   * Starts a new game session.
   */
  public startNewGame(): void {
    soundManager.init();
    soundManager.playButton();
    soundManager.startEngine();
    soundManager.startBgm();

    this.state = 'PLAYING';
    this.stats.score = 0;
    this.stats.level = 1;
    this.stats.distanceMeters = 0;
    this.stats.carsOvertaken = 0;
    this.stats.nearMissCount = 0;
    this.stats.powerUpsCollected = 0;
    this.stats.totalRaces++;

    this.player = this.createDefaultPlayer();
    this.enemies = [];
    this.powerUps = [];
    this.particles = [];
    this.floatingTexts = [];
    this.nextEnemySpawnTimer = 40;
    this.nextPowerUpSpawnTimer = 250;
    this.screenShakeIntensity = 0;

    this.saveGameData();
    this.notify();
  }

  public pauseGame(): void {
    if (this.state === 'PLAYING') {
      soundManager.playButton();
      soundManager.stopEngine();
      this.state = 'PAUSED';
      this.notify();
    }
  }

  public resumeGame(): void {
    if (this.state === 'PAUSED') {
      soundManager.playButton();
      soundManager.startEngine();
      this.state = 'PLAYING';
      this.notify();
    }
  }

  public restartGame(): void {
    this.startNewGame();
  }

  public goToTitle(): void {
    soundManager.playButton();
    soundManager.stopEngine();
    soundManager.stopBgm();
    this.state = 'TITLE_MENU';
    this.saveGameData();
    this.notify();
  }

  /**
   * Input steering handling (Keyboard & On-Screen Buttons).
   */
  public setInput(input: 'left' | 'right' | 'up' | 'down', isPressed: boolean): void {
    this.keys[input] = isPressed;
  }

  /**
   * Mobile touch direct X positioning or swipe.
   */
  public handleTouchMove(canvasRelativeX: number): void {
    if (this.state !== 'PLAYING') return;
    const minX = ROAD_CONFIG.roadX + this.player.width / 2 + 4;
    const maxX = ROAD_CONFIG.roadX + ROAD_CONFIG.roadWidth - this.player.width / 2 - 4;
    this.player.targetX = Math.max(minX, Math.min(maxX, canvasRelativeX));
  }

  /**
   * Main game loop running via requestAnimationFrame.
   */
  public startLoop(): void {
    if (this.animationFrameId !== null) return;

    this.lastTime = performance.now();
    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1);
      this.lastTime = currentTime;

      this.tickCount++;

      if (this.state === 'PLAYING') {
        this.update(dt);
      }

      this.render();

      this.animationFrameId = requestAnimationFrame(loop);
    };

    this.animationFrameId = requestAnimationFrame(loop);
  }

  public stopLoop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Physics, entity movement, spawning, collisions, and state update.
   */
  private update(dt: number): void {
    // 1. Difficulty & Level progression (Every 1000 points = Level Up)
    const newLevel = Math.max(1, Math.floor(this.stats.score / 1000) + 1);
    if (newLevel > this.stats.level) {
      this.stats.level = newLevel;
      soundManager.playLevelUp();
      this.addFloatingText(`★ LEVEL ${newLevel}! ★`, VIRTUAL_WIDTH / 2, VIRTUAL_HEIGHT * 0.45, '#38bdf8', 1.4);
    }

    // Level-based speed factor
    const levelSpeedBonus = (this.stats.level - 1) * 1.1;

    // 2. Power-up timer countdown (Nitro boost)
    if (this.player.boostRemainingMs > 0) {
      this.player.boostRemainingMs -= dt * 1000;
      if (this.player.boostRemainingMs <= 0) {
        this.player.boostRemainingMs = 0;
      }
    }

    const isBoosting = this.player.boostRemainingMs > 0;
    const boostMultiplier = isBoosting ? POWERUP_CONFIG.boostSpeedMultiplier : 1.0;

    // 3. Player speed acceleration / braking
    let targetSpeed = (PLAYER_CONFIG.baseSpeed + levelSpeedBonus) * boostMultiplier;
    if (this.keys.up) {
      targetSpeed += 2.5; // Accelerate
    }
    if (this.keys.down) {
      targetSpeed -= 2.0; // Brake
    }

    this.player.speed += (targetSpeed - this.player.speed) * (PLAYER_CONFIG.acceleration * 1.5);
    this.player.speed = Math.max(PLAYER_CONFIG.minSpeed, Math.min(PLAYER_CONFIG.maxSpeed + levelSpeedBonus, this.player.speed));

    // Calculate km/h for HUD
    this.stats.currentKmh = Math.floor(this.player.speed * 17.5);

    // Audio RPM modulation
    const speedRatio = this.player.speed / PLAYER_CONFIG.baseSpeed;
    soundManager.updateEngine(speedRatio, isBoosting);

    // 4. Player horizontal steering
    const minX = ROAD_CONFIG.roadX + this.player.width / 2 + 5;
    const maxX = ROAD_CONFIG.roadX + ROAD_CONFIG.roadWidth - this.player.width / 2 - 5;

    let moveX = 0;
    if (this.keys.left) moveX -= 1;
    if (this.keys.right) moveX += 1;

    if (moveX !== 0) {
      this.player.targetX += moveX * PLAYER_CONFIG.steeringSpeed;
      this.player.targetX = Math.max(minX, Math.min(maxX, this.player.targetX));
    }

    // Smooth inertia interpolation towards targetX
    const dx = this.player.targetX - this.player.x;
    this.player.x += dx * 0.22;

    // Tilt angle for turn banking (-0.16 to +0.16 rad)
    const targetTilt = Math.max(-PLAYER_CONFIG.turnTiltMax, Math.min(PLAYER_CONFIG.turnTiltMax, (dx / 30) * PLAYER_CONFIG.turnTiltMax));
    this.player.tiltAngle += (targetTilt - this.player.tiltAngle) * 0.25;

    // 5. Road continuous scroll
    this.roadOffset += this.player.speed;
    this.stats.distanceMeters += (this.player.speed * 0.35);

    // Score accumulation: base points per frame + extra if boosting
    const scoreGain = Math.floor((this.player.speed * 0.16) * (isBoosting ? 2.0 : 1.0));
    this.stats.score += scoreGain;

    if (this.stats.score > this.stats.highScore) {
      this.stats.highScore = this.stats.score;
    }

    // 6. Scenery updates
    this.scenery.forEach((item) => {
      item.y += this.player.speed;
    });
    this.scenery = this.scenery.filter((item) => item.y < VIRTUAL_HEIGHT + 100);

    this.nextScenerySpawnTimer -= this.player.speed * 0.15;
    if (this.nextScenerySpawnTimer <= 0) {
      this.spawnSceneryAtY(-60);
      this.nextScenerySpawnTimer = 30 + Math.random() * 20;
    }

    // 7. Enemy spawning with fair lane protection
    this.nextEnemySpawnTimer -= 1;
    if (this.nextEnemySpawnTimer <= 0) {
      this.spawnEnemyCar();
      // Spawn interval shortens with level
      const minInterval = Math.max(38, 75 - this.stats.level * 6);
      this.nextEnemySpawnTimer = minInterval + Math.random() * 30;
    }

    // 8. Enemy traffic physics & AI lane shifts
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      // Enemy speed relative to player
      const relativeSpeed = this.player.speed - enemy.speed;
      enemy.y += relativeSpeed;

      // Smooth horizontal lane transition if shifting
      if (enemy.changingLaneTimer > 0) {
        enemy.x += (enemy.targetX - enemy.x) * 0.08;
        enemy.changingLaneTimer -= dt;
      }

      // Check if enemy overtakes or is overtaken
      if (!enemy.isOvertaken && enemy.y > this.player.y + this.player.height * 0.4) {
        enemy.isOvertaken = true;
        this.stats.carsOvertaken++;
        this.stats.score += 50; // Overtake points
      }

      // Near-Miss Bonus Detection (passing very close without crashing)
      if (
        !enemy.nearMissAwarded &&
        Math.abs(this.player.y - enemy.y) < POWERUP_CONFIG.nearMissDistanceY &&
        Math.abs(this.player.x - enemy.x) < POWERUP_CONFIG.nearMissDistanceX &&
        Math.abs(this.player.x - enemy.x) > (this.player.width + enemy.width) / 2 - 3
      ) {
        enemy.nearMissAwarded = true;
        this.stats.nearMissCount++;
        this.stats.score += POWERUP_CONFIG.nearMissBonusPoints;
        soundManager.playNearMiss();
        this.addFloatingText('+100 NEAR MISS!', this.player.x, this.player.y - 45, '#f59e0b', 1.0);
      }

      // Remove enemies that fall far behind or far ahead
      if (enemy.y > VIRTUAL_HEIGHT + 200 || enemy.y < -350) {
        this.enemies.splice(i, 1);
        continue;
      }

      // 9. Collision Detection between Player and Enemy Car
      if (this.checkCarCollision(this.player, enemy)) {
        if (this.player.shieldActive) {
          // Shield absorbs the collision!
          this.player.shieldActive = false;
          soundManager.playShieldDeflect();
          this.triggerCrashExplosion(enemy.x, enemy.y, '#38bdf8', 18);
          this.addFloatingText('SHIELD BROKEN!', this.player.x, this.player.y - 50, '#38bdf8', 1.2);
          this.screenShakeIntensity = 10;
          // Blast enemy car away
          enemy.speed = -4;
          enemy.y += 60;
        } else {
          // Fatal Crash! Game Over!
          this.triggerGameOver(enemy);
          return;
        }
      }
    }

    // 10. Power-ups spawning & collection
    this.nextPowerUpSpawnTimer -= 1;
    if (this.nextPowerUpSpawnTimer <= 0) {
      this.spawnPowerUp();
      this.nextPowerUpSpawnTimer = 340 + Math.random() * 200;
    }

    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const p = this.powerUps[i];
      p.y += this.player.speed;
      p.pulseTimer += dt;

      // Collision with player
      const dist = Math.hypot(this.player.x - p.x, this.player.y - p.y);
      if (dist < (this.player.width / 2 + p.width / 2)) {
        this.collectPowerUp(p);
        this.powerUps.splice(i, 1);
        continue;
      }

      if (p.y > VIRTUAL_HEIGHT + 100) {
        this.powerUps.splice(i, 1);
      }
    }

    // 11. Particles & Floating Texts
    this.updateParticles(dt);
    this.updateFloatingTexts(dt);

    // Screen shake decay
    if (this.screenShakeIntensity > 0) {
      this.screenShakeIntensity = Math.max(0, this.screenShakeIntensity - dt * 25);
    }
  }

  /**
   * Spawns an enemy car in one of the 3 lanes.
   * Ensures fair play: never spawns directly on top of the player or within
   * unsafe proximity of existing cars in that lane.
   */
  private spawnEnemyCar(): void {
    const availableLanes = [0, 1, 2].sort(() => Math.random() - 0.5);

    for (const lane of availableLanes) {
      const targetLaneX = LANE_CENTERS[lane];

      // Check distance from existing cars in this lane near top
      const isLaneBlocked = this.enemies.some(
        (e) => e.lane === lane && e.y < 120
      );

      if (isLaneBlocked) continue;

      // Select variant based on level
      const variantIdx = Math.floor(Math.random() * ENEMY_VARIANTS.length);
      const variant = ENEMY_VARIANTS[variantIdx];

      // Base enemy speed varies slightly
      const baseEnemySpeed = 3.8 + (this.stats.level - 1) * 0.65;
      const enemySpeed = baseEnemySpeed * variant.speedFactor;

      const newEnemy: EnemyCar = {
        id: this.enemyIdCounter++,
        x: targetLaneX,
        y: -110 - Math.random() * 50,
        targetX: targetLaneX,
        width: variant.width,
        height: variant.height,
        speed: enemySpeed,
        lane,
        variantIndex: variantIdx,
        isOvertaken: false,
        nearMissAwarded: false,
        changingLaneTimer: 0,
      };

      // In higher levels (Level 3+), chance for an enemy to change lanes after a delay!
      if (this.stats.level >= 3 && Math.random() < 0.35) {
        setTimeout(() => {
          if (this.state === 'PLAYING' && this.enemies.includes(newEnemy)) {
            const nextLane = lane === 0 ? 1 : lane === 2 ? 1 : Math.random() < 0.5 ? 0 : 2;
            newEnemy.lane = nextLane;
            newEnemy.targetX = LANE_CENTERS[nextLane];
            newEnemy.changingLaneTimer = 2.5;
          }
        }, 1200 + Math.random() * 2000);
      }

      this.enemies.push(newEnemy);
      break;
    }
  }

  /**
   * Spawns a power-up in a random lane ahead.
   */
  private spawnPowerUp(): void {
    const lane = Math.floor(Math.random() * 3);
    const x = LANE_CENTERS[lane];

    // Power-up type weighted: Stars 45%, Shields 30%, Boost 25%
    const roll = Math.random();
    let type: PowerUpItem['type'] = 'STAR';
    if (roll < 0.45) {
      type = 'STAR';
    } else if (roll < 0.75) {
      type = 'SHIELD';
    } else {
      type = 'BOOST';
    }

    this.powerUps.push({
      id: this.powerUpIdCounter++,
      type,
      x,
      y: -60,
      width: 36,
      height: 36,
      pulseTimer: 0,
    });
  }

  private collectPowerUp(p: PowerUpItem): void {
    soundManager.playPowerUp(p.type);
    this.stats.powerUpsCollected++;

    if (p.type === 'STAR') {
      this.stats.score += POWERUP_CONFIG.starBonusPoints;
      this.addFloatingText('+500 BONUS!', this.player.x, this.player.y - 45, '#eab308', 1.3);
      this.triggerSparks(p.x, p.y, '#eab308', 16);
    } else if (p.type === 'SHIELD') {
      this.player.shieldActive = true;
      this.addFloatingText('SHIELD EQUIPPED!', this.player.x, this.player.y - 45, '#38bdf8', 1.2);
      this.triggerSparks(p.x, p.y, '#38bdf8', 16);
    } else if (p.type === 'BOOST') {
      this.player.boostRemainingMs = POWERUP_CONFIG.boostDurationMs;
      this.addFloatingText('NITRO BOOST!', this.player.x, this.player.y - 45, '#f59e0b', 1.3);
      this.triggerSparks(p.x, p.y, '#f59e0b', 22);
      this.screenShakeIntensity = 6;
    }
  }

  /**
   * Bounding box collision detection with 4px arcade forgiveness tolerance.
   */
  private checkCarCollision(player: PlayerCar, enemy: EnemyCar): boolean {
    const tolerance = 4;
    const pLeft = player.x - player.width / 2 + tolerance;
    const pRight = player.x + player.width / 2 - tolerance;
    const pTop = player.y - player.height / 2 + tolerance;
    const pBottom = player.y + player.height / 2 - tolerance;

    const eLeft = enemy.x - enemy.width / 2 + tolerance;
    const eRight = enemy.x + enemy.width / 2 - tolerance;
    const eTop = enemy.y - enemy.height / 2 + tolerance;
    const eBottom = enemy.y + enemy.height / 2 - tolerance;

    return (
      pLeft < eRight &&
      pRight > eLeft &&
      pTop < eBottom &&
      pBottom > eTop
    );
  }

  private triggerGameOver(impactEnemy: EnemyCar): void {
    this.state = 'GAME_OVER';
    soundManager.stopEngine();
    soundManager.stopBgm();
    soundManager.playCrash();

    // Violent crash explosion with fire shards & black smoke
    this.triggerCrashExplosion(this.player.x, this.player.y, '#ef4444', 35);
    this.triggerCrashExplosion(impactEnemy.x, impactEnemy.y, '#f97316', 25);
    this.screenShakeIntensity = 16;

    this.saveGameData();
    this.notify();
  }

  private triggerCrashExplosion(x: number, y: number, mainColor: string, count: number): void {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 8;
      const colors = [mainColor, '#fbbf24', '#f97316', '#334155', '#ffffff'];
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 2 + Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1.0,
        decay: 0.02 + Math.random() * 0.03,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
      });
    }
  }

  private triggerSparks(x: number, y: number, color: string, count: number): void {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 4;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 2 + Math.random() * 3,
        color,
        alpha: 1.0,
        decay: 0.03 + Math.random() * 0.04,
      });
    }
  }

  private addFloatingText(text: string, x: number, y: number, color: string, scale: number = 1.0): void {
    this.floatingTexts.push({
      id: Math.random(),
      text,
      x,
      y,
      color,
      alpha: 1.0,
      scale,
    });
  }

  private updateParticles(dt: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;
      if (p.rotation !== undefined && p.rotationSpeed !== undefined) {
        p.rotation += p.rotationSpeed;
      }
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  private updateFloatingTexts(dt: number): void {
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y -= 45 * dt; // Float upward
      ft.alpha -= 0.8 * dt; // Fade out
      if (ft.alpha <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  /**
   * Main render pass into canvas.
   */
  public render(): void {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;

    ctx.save();

    // Screen Shake effect
    if (this.screenShakeIntensity > 0) {
      const shakeX = (Math.random() - 0.5) * this.screenShakeIntensity;
      const shakeY = (Math.random() - 0.5) * this.screenShakeIntensity;
      ctx.translate(shakeX, shakeY);
    }

    // Clear canvas
    ctx.clearRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

    // 1. Draw highway road surface and markings
    drawRoad(ctx, VIRTUAL_WIDTH, VIRTUAL_HEIGHT, this.roadOffset, this.stats.level);

    // 2. Draw roadside scenery (trees, streetlamps, signs)
    drawScenery(ctx, this.scenery);

    // 3. Draw power-ups
    for (const p of this.powerUps) {
      drawPowerUp(ctx, p, this.tickCount);
    }

    // 4. Draw enemy traffic
    for (const enemy of this.enemies) {
      drawEnemyCar(ctx, enemy);
    }

    // 5. Draw player sports car
    drawPlayerCar(ctx, this.player, this.tickCount);

    // 6. Draw particles (exhaust, smoke, fire, sparks)
    drawParticles(ctx, this.particles);

    // 7. Draw floating popups (+500, NEAR MISS!)
    drawFloatingTexts(ctx, this.floatingTexts);

    ctx.restore();
  }
}
