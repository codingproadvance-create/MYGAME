/**
 * Advance Speed Racer - Canvas 2D Rendering Engine
 * High-performance vector drawing routines for the 3-lane highway,
 * player sports car, enemy traffic, power-ups, scenery, and particle FX.
 */

import {
  ROAD_CONFIG,
  CAR_SKINS,
  ENEMY_VARIANTS,
  VIRTUAL_WIDTH,
  VIRTUAL_HEIGHT,
} from './constants';
import {
  PlayerCar,
  EnemyCar,
  PowerUpItem,
  SceneryItem,
  Particle,
  FloatingText,
} from './types';

/**
 * Draws the 3-lane highway with moving curbs, lane dividers, asphalt texture, and guardrails.
 */
export function drawRoad(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  roadOffset: number,
  level: number
): void {
  const { roadX, roadWidth, shoulderWidth, kerbWidth, laneWidth } = ROAD_CONFIG;

  // 1. Roadside terrain (Left and Right grass/terrain)
  // Dynamic grass hue shifts slightly with levels (daytime -> sunset -> night)
  let grassColor = '#1e3922'; // Lush emerald verge
  let terrainDetail = '#152918';
  if (level >= 3 && level < 5) {
    grassColor = '#242b1f'; // Dusk amber twilight verge
    terrainDetail = '#191e16';
  } else if (level >= 5) {
    grassColor = '#0f172a'; // Midnight synthwave verge
    terrainDetail = '#0b1120';
  }

  // Draw left roadside
  ctx.fillStyle = grassColor;
  ctx.fillRect(0, 0, roadX, height);
  // Draw right roadside
  ctx.fillRect(roadX + roadWidth, 0, width - (roadX + roadWidth), height);

  // Grass texture stripes (moving parallax)
  ctx.fillStyle = terrainDetail;
  const stripeH = 80;
  const stripeOffset = (roadOffset * 0.4) % stripeH;
  for (let y = -stripeH + stripeOffset; y < height + stripeH; y += stripeH) {
    ctx.fillRect(0, y, roadX - kerbWidth, stripeH * 0.4);
    ctx.fillRect(roadX + roadWidth + kerbWidth, y, width - (roadX + roadWidth + kerbWidth), stripeH * 0.4);
  }

  // 2. Asphalt Road Base
  const roadGrad = ctx.createLinearGradient(roadX, 0, roadX + roadWidth, 0);
  roadGrad.addColorStop(0, '#1c1e24');
  roadGrad.addColorStop(0.5, '#252932');
  roadGrad.addColorStop(1, '#1c1e24');
  ctx.fillStyle = roadGrad;
  ctx.fillRect(roadX, 0, roadWidth, height);

  // 3. Red & White Striped Kerbs (Curb Rumble Strips)
  const kerbSegH = 40;
  const kerbOffset = roadOffset % kerbSegH;
  const totalKerbSegs = Math.ceil(height / kerbSegH) + 2;

  for (let i = -1; i < totalKerbSegs; i++) {
    const y = i * kerbSegH + kerbOffset;
    const isRed = (Math.floor((y - roadOffset) / kerbSegH) % 2 + 2) % 2 === 0;
    const kerbColor = isRed ? '#dc2626' : '#f8fafc';

    ctx.fillStyle = kerbColor;
    // Left curb
    ctx.fillRect(roadX - kerbWidth, y, kerbWidth, kerbSegH);
    // Right curb
    ctx.fillRect(roadX + roadWidth, y, kerbWidth, kerbSegH);
  }

  // 4. Outer Guardrails / Metal Barriers
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(roadX - kerbWidth - 1, 0);
  ctx.lineTo(roadX - kerbWidth - 1, height);
  ctx.moveTo(roadX + roadWidth + kerbWidth + 1, 0);
  ctx.lineTo(roadX + roadWidth + kerbWidth + 1, height);
  ctx.stroke();

  // Guardrail post accents
  ctx.fillStyle = '#94a3b8';
  const postSpacing = 90;
  const postOffset = roadOffset % postSpacing;
  for (let y = -postSpacing + postOffset; y < height + postSpacing; y += postSpacing) {
    ctx.fillRect(roadX - kerbWidth - 5, y - 4, 4, 8);
    ctx.fillRect(roadX + roadWidth + kerbWidth + 1, y - 4, 4, 8);
  }

  // 5. Road Shoulder Solid White Lines
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(roadX + 4, 0);
  ctx.lineTo(roadX + 4, height);
  ctx.moveTo(roadX + roadWidth - 4, 0);
  ctx.lineTo(roadX + roadWidth - 4, height);
  ctx.stroke();

  // 6. Dashed Lane Dividers (3 lanes = 2 dividers)
  const dashLength = 48;
  const dashGap = 36;
  const dashTotal = dashLength + dashGap;
  const dashShift = roadOffset % dashTotal;

  ctx.strokeStyle = '#f8fafc';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.setLineDash([dashLength, dashGap]);
  ctx.lineDashOffset = -dashShift;

  ctx.beginPath();
  // Lane 1 divider (between lane 0 and lane 1)
  const divider1X = roadX + laneWidth;
  ctx.moveTo(divider1X, -dashTotal);
  ctx.lineTo(divider1X, height + dashTotal);

  // Lane 2 divider (between lane 1 and lane 2)
  const divider2X = roadX + laneWidth * 2;
  ctx.moveTo(divider2X, -dashTotal);
  ctx.lineTo(divider2X, height + dashTotal);
  ctx.stroke();

  // Reset line dash
  ctx.setLineDash([]);
}

/**
 * Draws roadside scenery objects: stylized trees, street lamps, and road signs.
 */
export function drawScenery(ctx: CanvasRenderingContext2D, sceneryList: SceneryItem[]): void {
  for (const item of sceneryList) {
    ctx.save();
    ctx.translate(item.x, item.y);

    if (item.type.startsWith('tree')) {
      // Tree shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.beginPath();
      ctx.ellipse(0, 10, item.size * 0.8, item.size * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Trunk
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-item.size * 0.12, -item.size * 0.2, item.size * 0.24, item.size * 0.6);

      // Foliage layers (layered circular clusters for 3D look)
      ctx.fillStyle = '#15803d'; // Darker base green
      ctx.beginPath();
      ctx.arc(0, -item.size * 0.4, item.size * 0.65, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#22c55e'; // Vibrant top green
      ctx.beginPath();
      ctx.arc(-item.size * 0.15, -item.size * 0.55, item.size * 0.45, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#4ade80'; // Highlight
      ctx.beginPath();
      ctx.arc(item.size * 0.12, -item.size * 0.6, item.size * 0.3, 0, Math.PI * 2);
      ctx.fill();
    } else if (item.type.startsWith('light')) {
      // Street lamp pole
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 15);
      ctx.lineTo(0, -25);
      // Arm reaching toward road
      const armDir = item.type.includes('left') ? 1 : -1;
      ctx.lineTo(armDir * 18, -25);
      ctx.stroke();

      // Lamp head
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(armDir * 14 - 3, -28, 8, 6);

      // Night glow cone on ground
      const glowGrad = ctx.createRadialGradient(
        armDir * 20, 10, 2,
        armDir * 20, 10, 45
      );
      glowGrad.addColorStop(0, 'rgba(254, 240, 138, 0.25)');
      glowGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.ellipse(armDir * 20, 10, 45, 25, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (item.type.startsWith('sign')) {
      // Highway Speed / Distance marker
      ctx.fillStyle = '#64748b';
      ctx.fillRect(-2, -5, 4, 25);

      // Sign plate
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(-14, -28, 28, 22);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-13, -27, 26, 20);

      // Chevron arrow or 100 limit text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px "Chakra Petch", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SPEED', 0, -18);
      ctx.fillText('MAX', 0, -10);
    }

    ctx.restore();
  }
}

/**
 * Draws the player's sports car with custom skin, metallic reflections,
 * turn banking, headlights, exhaust flames, and active energy shield.
 */
export function drawPlayerCar(
  ctx: CanvasRenderingContext2D,
  player: PlayerCar,
  tick: number
): void {
  const skin = CAR_SKINS.find((s) => s.id === player.skinId) || CAR_SKINS[0];
  const { x, y, width, height, tiltAngle, boostRemainingMs, shieldActive } = player;
  const isBoosting = boostRemainingMs > 0;

  ctx.save();
  ctx.translate(x, y);

  // Realistic car turn tilt/banking
  ctx.rotate(tiltAngle);

  // 1. Headlight beams projected onto road ahead
  const beamLength = isBoosting ? 260 : 190;
  const beamWidth = 65;

  const leftBeam = ctx.createLinearGradient(-16, -height / 2, -26, -height / 2 - beamLength);
  leftBeam.addColorStop(0, 'rgba(254, 249, 195, 0.55)');
  leftBeam.addColorStop(1, 'rgba(254, 249, 195, 0)');
  ctx.fillStyle = leftBeam;
  ctx.beginPath();
  ctx.moveTo(-16, -height / 2 + 5);
  ctx.lineTo(-16 - beamWidth * 0.45, -height / 2 - beamLength);
  ctx.lineTo(-16 + beamWidth * 0.55, -height / 2 - beamLength);
  ctx.closePath();
  ctx.fill();

  const rightBeam = ctx.createLinearGradient(16, -height / 2, 26, -height / 2 - beamLength);
  rightBeam.addColorStop(0, 'rgba(254, 249, 195, 0.55)');
  rightBeam.addColorStop(1, 'rgba(254, 249, 195, 0)');
  ctx.fillStyle = rightBeam;
  ctx.beginPath();
  ctx.moveTo(16, -height / 2 + 5);
  ctx.lineTo(16 - beamWidth * 0.55, -height / 2 - beamLength);
  ctx.lineTo(16 + beamWidth * 0.45, -height / 2 - beamLength);
  ctx.closePath();
  ctx.fill();

  // 2. Drop shadow under chassis
  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
  ctx.beginPath();
  ctx.roundRect(-width / 2 - 2, -height / 2 + 6, width + 4, height - 2, 14);
  ctx.fill();

  // 3. Wheels & Tyres (4 corners)
  const wheelW = 9;
  const wheelH = 22;
  ctx.fillStyle = '#0f172a'; // Dark tire rubber
  const wheelPositions = [
    { x: -width / 2 - 2, y: -height / 2 + 15 }, // Front-left
    { x: width / 2 + 2 - wheelW, y: -height / 2 + 15 }, // Front-right
    { x: -width / 2 - 2, y: height / 2 - 28 }, // Rear-left
    { x: width / 2 + 2 - wheelW, y: height / 2 - 28 }, // Rear-right
  ];

  for (const w of wheelPositions) {
    ctx.fillRect(w.x, w.y, wheelW, wheelH);
    // Silver brake calipers & rim center
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(w.x + 2, w.y + 4, wheelW - 4, wheelH - 8);
    ctx.fillStyle = '#0f172a';
  }

  // 4. Exhaust Flames (when boosting or high speed)
  if (isBoosting) {
    const flameH = 25 + Math.sin(tick * 0.8) * 12;
    const flameGrad = ctx.createLinearGradient(0, height / 2, 0, height / 2 + flameH);
    flameGrad.addColorStop(0, '#67e8f9'); // Cyan nitro core
    flameGrad.addColorStop(0.4, '#38bdf8');
    flameGrad.addColorStop(1, 'rgba(14, 165, 233, 0)');

    ctx.fillStyle = flameGrad;
    // Left exhaust flame
    ctx.beginPath();
    ctx.moveTo(-14, height / 2 - 2);
    ctx.lineTo(-9, height / 2 - 2);
    ctx.lineTo(-11.5, height / 2 + flameH);
    ctx.closePath();
    ctx.fill();

    // Right exhaust flame
    ctx.beginPath();
    ctx.moveTo(9, height / 2 - 2);
    ctx.lineTo(14, height / 2 - 2);
    ctx.lineTo(11.5, height / 2 + flameH);
    ctx.closePath();
    ctx.fill();
  }

  // 5. Main Aerodynamic Car Body
  const halfW = width / 2;
  const halfH = height / 2;

  // Body gradient
  const bodyGrad = ctx.createLinearGradient(-halfW, 0, halfW, 0);
  bodyGrad.addColorStop(0, skin.secondary);
  bodyGrad.addColorStop(0.2, skin.primary);
  bodyGrad.addColorStop(0.5, skin.accent);
  bodyGrad.addColorStop(0.8, skin.primary);
  bodyGrad.addColorStop(1, skin.secondary);

  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  // Aerodynamic nose
  ctx.moveTo(0, -halfH);
  ctx.bezierCurveTo(halfW * 0.7, -halfH, halfW, -halfH * 0.7, halfW, -halfH * 0.2);
  // Waistline taper
  ctx.lineTo(halfW * 0.95, 0);
  ctx.lineTo(halfW, halfH * 0.6);
  // Rear bumper
  ctx.bezierCurveTo(halfW, halfH * 0.95, halfW * 0.6, halfH, 0, halfH);
  ctx.bezierCurveTo(-halfW * 0.6, halfH, -halfW, halfH * 0.95, -halfW, halfH * 0.6);
  ctx.lineTo(-halfW * 0.95, 0);
  ctx.lineTo(-halfW, -halfH * 0.2);
  ctx.bezierCurveTo(-halfW, -halfH * 0.7, -halfW * 0.7, -halfH, 0, -halfH);
  ctx.closePath();
  ctx.fill();

  // Subtle chassis outer stroke
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // 6. Hood Air Ducts / Vents
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.moveTo(-10, -halfH * 0.6);
  ctx.lineTo(-4, -halfH * 0.45);
  ctx.lineTo(-6, -halfH * 0.45);
  ctx.lineTo(-12, -halfH * 0.6);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(10, -halfH * 0.6);
  ctx.lineTo(4, -halfH * 0.45);
  ctx.lineTo(6, -halfH * 0.45);
  ctx.lineTo(12, -halfH * 0.6);
  ctx.closePath();
  ctx.fill();

  // 7. Windshield (Front Cockpit Window)
  const glassGrad = ctx.createLinearGradient(0, -halfH * 0.35, 0, -halfH * 0.05);
  glassGrad.addColorStop(0, '#090d16');
  glassGrad.addColorStop(0.7, '#1e293b');
  glassGrad.addColorStop(1, '#38bdf8'); // Sky reflection

  ctx.fillStyle = glassGrad;
  ctx.beginPath();
  ctx.moveTo(-halfW * 0.65, -halfH * 0.32);
  ctx.lineTo(halfW * 0.65, -halfH * 0.32);
  ctx.lineTo(halfW * 0.75, -halfH * 0.05);
  ctx.lineTo(-halfW * 0.75, -halfH * 0.05);
  ctx.closePath();
  ctx.fill();

  // Windshield specular highlight streak
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-halfW * 0.3, -halfH * 0.3);
  ctx.lineTo(halfW * 0.1, -halfH * 0.08);
  ctx.stroke();

  // 8. Roof & Rear Window
  ctx.fillStyle = skin.secondary;
  ctx.fillRect(-halfW * 0.55, -halfH * 0.05, halfW * 1.1, halfH * 0.42);

  // Rear windshield
  ctx.fillStyle = '#090d16';
  ctx.beginPath();
  ctx.moveTo(-halfW * 0.62, halfH * 0.38);
  ctx.lineTo(halfW * 0.62, halfH * 0.38);
  ctx.lineTo(halfW * 0.5, halfH * 0.6);
  ctx.lineTo(-halfW * 0.5, halfH * 0.6);
  ctx.closePath();
  ctx.fill();

  // 9. Rear Racing Spoiler / Wing
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-halfW * 0.9, halfH * 0.8, halfW * 1.8, 7);
  // Spoiler struts
  ctx.fillStyle = '#64748b';
  ctx.fillRect(-12, halfH * 0.7, 4, 8);
  ctx.fillRect(8, halfH * 0.7, 4, 8);

  // 10. Front Xenon Headlights
  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.arc(-halfW * 0.65, -halfH + 6, 4, 0, Math.PI * 2);
  ctx.arc(halfW * 0.65, -halfH + 6, 4, 0, Math.PI * 2);
  ctx.fill();

  // 11. Rear Ruby LED Taillights
  ctx.fillStyle = '#ef4444';
  ctx.shadowColor = '#ef4444';
  ctx.shadowBlur = 8;
  ctx.fillRect(-halfW * 0.8, halfH - 4, 12, 4);
  ctx.fillRect(halfW * 0.8 - 12, halfH - 4, 12, 4);
  ctx.shadowBlur = 0; // Reset shadow

  // 12. Active Shield Energy Bubble
  if (shieldActive) {
    const shieldRadius = Math.max(width, height) * 0.68;
    const pulse = Math.sin(tick * 0.15) * 3;
    const shieldGrad = ctx.createRadialGradient(
      0, 0, shieldRadius * 0.5,
      0, 0, shieldRadius + pulse
    );
    shieldGrad.addColorStop(0, 'rgba(56, 189, 248, 0.05)');
    shieldGrad.addColorStop(0.7, 'rgba(56, 189, 248, 0.25)');
    shieldGrad.addColorStop(1, 'rgba(56, 189, 248, 0.75)');

    ctx.fillStyle = shieldGrad;
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.arc(0, 0, shieldRadius + pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Rotating shield energy nodes
    for (let i = 0; i < 3; i++) {
      const angle = tick * 0.05 + (i * Math.PI * 2) / 3;
      const nx = Math.cos(angle) * (shieldRadius + pulse);
      const ny = Math.sin(angle) * (shieldRadius + pulse);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(nx, ny, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

/**
 * Draws an enemy traffic vehicle with distinctive body type,
 * roof accessories (taxi sign, muscle stripes, van body), and rear taillights.
 */
export function drawEnemyCar(ctx: CanvasRenderingContext2D, enemy: EnemyCar): void {
  const variant = ENEMY_VARIANTS[enemy.variantIndex] || ENEMY_VARIANTS[0];
  const { x, y, width, height } = enemy;
  const halfW = width / 2;
  const halfH = height / 2;

  ctx.save();
  ctx.translate(x, y);

  // Drop shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.beginPath();
  ctx.roundRect(-halfW - 2, -halfH + 4, width + 4, height, 10);
  ctx.fill();

  // Wheels
  const wheelW = 8;
  const wheelH = 18;
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-halfW - 2, -halfH + 12, wheelW, wheelH);
  ctx.fillRect(halfW + 2 - wheelW, -halfH + 12, wheelW, wheelH);
  ctx.fillRect(-halfW - 2, halfH - 24, wheelW, wheelH);
  ctx.fillRect(halfW + 2 - wheelW, halfH - 24, wheelW, wheelH);

  // Vehicle Body
  const bodyGrad = ctx.createLinearGradient(-halfW, 0, halfW, 0);
  bodyGrad.addColorStop(0, variant.secondary);
  bodyGrad.addColorStop(0.3, variant.primary);
  bodyGrad.addColorStop(0.7, variant.primary);
  bodyGrad.addColorStop(1, variant.secondary);

  ctx.fillStyle = bodyGrad;

  if (variant.roofDetail === 'van') {
    // Delivery van / truck boxy body
    ctx.beginPath();
    ctx.roundRect(-halfW, -halfH, width, height, 8);
    ctx.fill();

    // Van rear doors seam
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, -halfH * 0.1);
    ctx.lineTo(0, halfH - 2);
    ctx.stroke();
  } else {
    // Standard car chassis
    ctx.beginPath();
    ctx.roundRect(-halfW, -halfH, width, height, 12);
    ctx.fill();
  }

  // Racing stripes on muscle car
  if (variant.roofDetail === 'stripes') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-7, -halfH, 4, height);
    ctx.fillRect(3, -halfH, 4, height);
  }

  // Front Windshield
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(-halfW * 0.72, -halfH * 0.45, width * 0.72, height * 0.22, 4);
  ctx.fill();

  // Windshield glass gloss
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-halfW * 0.4, -halfH * 0.42);
  ctx.lineTo(halfW * 0.2, -halfH * 0.26);
  ctx.stroke();

  // Rear Windshield
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(-halfW * 0.65, halfH * 0.15, width * 0.65, height * 0.18, 4);
  ctx.fill();

  // Taxi sign on top
  if (variant.roofDetail === 'taxi') {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(-14, -6, 28, 12, 3);
    ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 8px "Chakra Petch", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TAXI', 0, 3);
  }

  // Headlights (Facing upward because car is traveling down highway toward player or overtaking)
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(-halfW + 4, -halfH + 2, 7, 3);
  ctx.fillRect(halfW - 11, -halfH + 2, 7, 3);

  // Red Taillights (Facing downward toward player)
  ctx.fillStyle = '#ef4444';
  ctx.shadowColor = '#dc2626';
  ctx.shadowBlur = 6;
  ctx.fillRect(-halfW + 4, halfH - 4, 9, 3);
  ctx.fillRect(halfW - 13, halfH - 4, 9, 3);
  ctx.shadowBlur = 0;

  // Lane change indicator blinker
  if (enemy.changingLaneTimer > 0) {
    const isBlinking = Math.floor(Date.now() / 150) % 2 === 0;
    if (isBlinking) {
      const isRight = enemy.targetX > enemy.x;
      ctx.fillStyle = '#fbbf24';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 8;
      ctx.fillRect(isRight ? halfW - 8 : -halfW + 2, halfH - 6, 6, 6);
      ctx.shadowBlur = 0;
    }
  }

  ctx.restore();
}

/**
 * Draws collectible power-ups:
 * - 🛡 Shield
 * - ⚡ Speed Boost
 * - ⭐ Bonus Score
 */
export function drawPowerUp(
  ctx: CanvasRenderingContext2D,
  powerUp: PowerUpItem,
  tick: number
): void {
  const { type, x, y, width, height } = powerUp;
  const radius = width / 2;
  const pulse = Math.sin(tick * 0.1 + powerUp.id) * 3;

  ctx.save();
  ctx.translate(x, y);

  if (type === 'SHIELD') {
    // Cyan glowing shield orb
    const shieldGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, radius + pulse);
    shieldGrad.addColorStop(0, '#ffffff');
    shieldGrad.addColorStop(0.5, '#38bdf8');
    shieldGrad.addColorStop(1, 'rgba(2, 132, 199, 0.2)');

    ctx.fillStyle = shieldGrad;
    ctx.beginPath();
    ctx.arc(0, 0, radius + pulse, 0, Math.PI * 2);
    ctx.fill();

    // Shield crest icon
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(0, -9);
    ctx.lineTo(8, -4);
    ctx.lineTo(6, 6);
    ctx.lineTo(0, 10);
    ctx.lineTo(-6, 6);
    ctx.lineTo(-8, -4);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.lineTo(5, -2);
    ctx.lineTo(4, 5);
    ctx.lineTo(0, 8);
    ctx.lineTo(-4, 5);
    ctx.lineTo(-5, -2);
    ctx.closePath();
    ctx.fill();
  } else if (type === 'BOOST') {
    // Amber / Orange Nitro Lightning Orb
    const boostGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, radius + pulse);
    boostGrad.addColorStop(0, '#ffffff');
    boostGrad.addColorStop(0.5, '#f59e0b');
    boostGrad.addColorStop(1, 'rgba(217, 119, 6, 0.2)');

    ctx.fillStyle = boostGrad;
    ctx.beginPath();
    ctx.arc(0, 0, radius + pulse, 0, Math.PI * 2);
    ctx.fill();

    // Lightning bolt icon
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(2, -10);
    ctx.lineTo(-6, 0);
    ctx.lineTo(-1, 0);
    ctx.lineTo(-3, 10);
    ctx.lineTo(6, -1);
    ctx.lineTo(1, -1);
    ctx.closePath();
    ctx.fill();
  } else if (type === 'STAR') {
    // Golden Star with rotating sparkle
    const starGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, radius + pulse);
    starGrad.addColorStop(0, '#fef08a');
    starGrad.addColorStop(0.6, '#eab308');
    starGrad.addColorStop(1, 'rgba(202, 138, 4, 0.2)');

    ctx.fillStyle = starGrad;
    ctx.beginPath();
    ctx.arc(0, 0, radius + pulse, 0, Math.PI * 2);
    ctx.fill();

    // 5-point Star geometry
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    const spikes = 5;
    const outerR = 11;
    const innerR = 5;
    let rot = (Math.PI / 2) * 3;
    const step = Math.PI / spikes;

    ctx.moveTo(0, -outerR);
    for (let i = 0; i < spikes; i++) {
      let sx = Math.cos(rot) * outerR;
      let sy = Math.sin(rot) * outerR;
      ctx.lineTo(sx, sy);
      rot += step;

      sx = Math.cos(rot) * innerR;
      sy = Math.sin(rot) * innerR;
      ctx.lineTo(sx, sy);
      rot += step;
    }
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Draws active particles: crash explosions, smoke puffs, and nitro sparks.
 */
export function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]): void {
  for (const p of particles) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.alpha);
    ctx.fillStyle = p.color;

    if (p.rotation !== undefined) {
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillRect(-p.radius, -p.radius, p.radius * 2, p.radius * 2);
    } else {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

/**
 * Draws floating score numbers & bonus banners (+500, SHIELD!, LEVEL UP!).
 */
export function drawFloatingTexts(
  ctx: CanvasRenderingContext2D,
  floatingTexts: FloatingText[]
): void {
  for (const ft of floatingTexts) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, ft.alpha);
    ctx.font = `bold ${Math.floor(18 * ft.scale)}px "Chakra Petch", sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = ft.color;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 6;
    ctx.fillText(ft.text, ft.x, ft.y);
    ctx.restore();
  }
}
