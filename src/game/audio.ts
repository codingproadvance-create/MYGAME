/**
 * Advance Speed Racer - Synthesized Web Audio Engine
 * Uses the browser's native Web Audio API to create authentic arcade racing sound
 * effects and background rhythm without external media files or network latency.
 */

class SoundSystem {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  // Continuous engine sound nodes
  private engineOsc: OscillatorNode | null = null;
  private engineFilter: BiquadFilterNode | null = null;
  private engineGain: GainNode | null = null;
  private engineSubOsc: OscillatorNode | null = null;

  // Background arcade rhythm loop
  private bgmIntervalId: number | null = null;
  private bgmStep: number = 0;
  private bgmGain: GainNode | null = null;

  constructor() {
    // AudioContext will be lazily initialized on first user interaction
  }

  /**
   * Initializes or resumes the AudioContext after user gesture.
   */
  public init(): void {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (muted) {
      if (this.engineGain && this.ctx) {
        this.engineGain.gain.setValueAtTime(0, this.ctx.currentTime);
      }
      if (this.bgmGain && this.ctx) {
        this.bgmGain.gain.setValueAtTime(0, this.ctx.currentTime);
      }
    } else {
      if (this.bgmGain && this.ctx) {
        this.bgmGain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      }
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Starts the continuous sports car engine rumble.
   */
  public startEngine(): void {
    this.init();
    if (!this.ctx || this.engineOsc) return;

    try {
      const now = this.ctx.currentTime;

      // Primary engine tone (sawtooth creates combustion harmonic roar)
      this.engineOsc = this.ctx.createOscillator();
      this.engineOsc.type = 'sawtooth';
      this.engineOsc.frequency.setValueAtTime(55, now);

      // Low sub rumble
      this.engineSubOsc = this.ctx.createOscillator();
      this.engineSubOsc.type = 'triangle';
      this.engineSubOsc.frequency.setValueAtTime(28, now);

      // Lowpass filter for smooth muffler tone
      this.engineFilter = this.ctx.createBiquadFilter();
      this.engineFilter.type = 'lowpass';
      this.engineFilter.frequency.setValueAtTime(320, now);
      this.engineFilter.Q.setValueAtTime(3, now);

      // Gain controller
      this.engineGain = this.ctx.createGain();
      this.engineGain.gain.setValueAtTime(this.isMuted ? 0 : 0.08, now);

      // Connect nodes
      this.engineOsc.connect(this.engineFilter);
      this.engineSubOsc.connect(this.engineFilter);
      this.engineFilter.connect(this.engineGain);
      this.engineGain.connect(this.ctx.destination);

      this.engineOsc.start(now);
      this.engineSubOsc.start(now);
    } catch {
      // Graceful fallback if Web Audio is restricted
    }
  }

  /**
   * Modulates engine RPM based on current speed and nitro boost.
   */
  public updateEngine(speedRatio: number, isBoosting: boolean): void {
    if (!this.ctx || !this.engineOsc || !this.engineFilter || !this.engineGain) return;
    if (this.isMuted) {
      this.engineGain.gain.setValueAtTime(0, this.ctx.currentTime);
      return;
    }

    const now = this.ctx.currentTime;
    const clampedRatio = Math.max(0.2, Math.min(1.6, speedRatio));

    // Pitch shifts up as car speeds up
    const baseFreq = 52 + clampedRatio * 90 + (isBoosting ? 45 : 0);
    this.engineOsc.frequency.setTargetAtTime(baseFreq, now, 0.05);

    if (this.engineSubOsc) {
      this.engineSubOsc.frequency.setTargetAtTime(baseFreq * 0.5, now, 0.05);
    }

    // Filter opens up for throaty exhaust roar at high speeds
    const cutoff = 260 + clampedRatio * 650 + (isBoosting ? 500 : 0);
    this.engineFilter.frequency.setTargetAtTime(cutoff, now, 0.05);

    const targetGain = isBoosting ? 0.14 : 0.08 + clampedRatio * 0.04;
    this.engineGain.gain.setTargetAtTime(targetGain, now, 0.05);
  }

  /**
   * Stops the engine sound.
   */
  public stopEngine(): void {
    if (!this.ctx) return;
    try {
      if (this.engineOsc) {
        this.engineOsc.stop();
        this.engineOsc.disconnect();
        this.engineOsc = null;
      }
      if (this.engineSubOsc) {
        this.engineSubOsc.stop();
        this.engineSubOsc.disconnect();
        this.engineSubOsc = null;
      }
      if (this.engineFilter) {
        this.engineFilter.disconnect();
        this.engineFilter = null;
      }
      if (this.engineGain) {
        this.engineGain.disconnect();
        this.engineGain = null;
      }
    } catch {
      // Ignore cleanup error
    }
  }

  /**
   * Synthesized high-energy synthwave background music rhythm loop.
   */
  public startBgm(): void {
    this.init();
    if (this.bgmIntervalId !== null || !this.ctx) return;

    try {
      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(this.isMuted ? 0 : 0.18, this.ctx.currentTime);
      this.bgmGain.connect(this.ctx.destination);

      // Bassline note frequencies (F minor electro progression)
      const bassNotes = [
        174.61, 174.61, 207.65, 174.61, 233.08, 174.61, 207.65, 261.63,
        155.56, 155.56, 174.61, 155.56, 207.65, 155.56, 174.61, 233.08,
        138.59, 138.59, 174.61, 138.59, 207.65, 138.59, 174.61, 207.65,
        130.81, 130.81, 155.56, 130.81, 196.00, 130.81, 155.56, 174.61,
      ];

      const stepDurationMs = 135; // ~111 BPM 16th notes

      this.bgmIntervalId = window.setInterval(() => {
        if (!this.ctx || this.isMuted) return;

        const now = this.ctx.currentTime;
        const noteIdx = this.bgmStep % bassNotes.length;
        const freq = bassNotes[noteIdx];

        // 1. Synth Bass Note
        const bassOsc = this.ctx.createOscillator();
        const bassNoteGain = this.ctx.createGain();
        bassOsc.type = 'sawtooth';
        bassOsc.frequency.setValueAtTime(freq * 0.5, now);

        const bassFilter = this.ctx.createBiquadFilter();
        bassFilter.type = 'lowpass';
        bassFilter.frequency.setValueAtTime(450, now);
        bassFilter.frequency.exponentialRampToValueAtTime(120, now + 0.12);

        bassNoteGain.gain.setValueAtTime(0.22, now);
        bassNoteGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        bassOsc.connect(bassFilter);
        bassFilter.connect(bassNoteGain);
        if (this.bgmGain) bassNoteGain.connect(this.bgmGain);

        bassOsc.start(now);
        bassOsc.stop(now + 0.13);

        // 2. Arcade Kick Drum on beats 0, 4, 8, 12...
        if (this.bgmStep % 4 === 0) {
          const kickOsc = this.ctx.createOscillator();
          const kickGain = this.ctx.createGain();
          kickOsc.type = 'sine';
          kickOsc.frequency.setValueAtTime(140, now);
          kickOsc.frequency.exponentialRampToValueAtTime(35, now + 0.08);

          kickGain.gain.setValueAtTime(0.35, now);
          kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

          kickOsc.connect(kickGain);
          if (this.bgmGain) kickGain.connect(this.bgmGain);

          kickOsc.start(now);
          kickOsc.stop(now + 0.1);
        }

        // 3. Hi-Hat noise pulse on offbeats
        if (this.bgmStep % 2 === 1) {
          this.playHiHat(now);
        }

        this.bgmStep++;
      }, stepDurationMs);
    } catch {
      // Audio fallback
    }
  }

  private playHiHat(time: number): void {
    if (!this.ctx || this.isMuted) return;
    try {
      const bufferSize = this.ctx.sampleRate * 0.03;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(7000, time);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.06, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);

      noise.connect(filter);
      filter.connect(gain);
      if (this.bgmGain) gain.connect(this.bgmGain);

      noise.start(time);
      noise.stop(time + 0.03);
    } catch {
      // Ignore
    }
  }

  public stopBgm(): void {
    if (this.bgmIntervalId !== null) {
      clearInterval(this.bgmIntervalId);
      this.bgmIntervalId = null;
    }
    if (this.bgmGain) {
      try {
        this.bgmGain.disconnect();
      } catch {
        // Ignore
      }
      this.bgmGain = null;
    }
  }

  /**
   * Sound effect: Heavy metal crash & vehicle collision explosion.
   */
  public playCrash(): void {
    this.init();
    if (!this.ctx || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;

      // 1. Noise burst for initial impact crunch
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.65);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.15));
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(900, now);
      filter.frequency.exponentialRampToValueAtTime(100, now + 0.5);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.65, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      noiseSource.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);

      noiseSource.start(now);

      // 2. Low sub-bass thud
      const thud = this.ctx.createOscillator();
      const thudGain = this.ctx.createGain();
      thud.type = 'triangle';
      thud.frequency.setValueAtTime(120, now);
      thud.frequency.exponentialRampToValueAtTime(25, now + 0.4);

      thudGain.gain.setValueAtTime(0.8, now);
      thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      thud.connect(thudGain);
      thudGain.connect(this.ctx.destination);

      thud.start(now);
      thud.stop(now + 0.5);
    } catch {
      // Audio fallback
    }
  }

  /**
   * Sound effect: Shield deflecting a hit safely.
   */
  public playShieldDeflect(): void {
    this.init();
    if (!this.ctx || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.35);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.36);
    } catch {
      // Ignore
    }
  }

  /**
   * Sound effect: Power-up collection (Shield, Nitro Boost, Star).
   */
  public playPowerUp(type: 'SHIELD' | 'BOOST' | 'STAR'): void {
    this.init();
    if (!this.ctx || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;

      if (type === 'STAR') {
        // Melodic ascending triad chime
        const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.06);

          gain.gain.setValueAtTime(0.25, now + idx * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.2);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(now + idx * 0.06);
          osc.stop(now + idx * 0.06 + 0.22);
        });
      } else if (type === 'BOOST') {
        // Futuristic jet rocket surge
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.35);

        gain.gain.setValueAtTime(0.28, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1800, now);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.42);
      } else if (type === 'SHIELD') {
        // Protective harmonic energy resonance
        const freqs = [330, 495, 660];
        freqs.forEach((freq) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);
          osc.frequency.linearRampToValueAtTime(freq * 1.25, now + 0.3);

          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(now);
          osc.stop(now + 0.42);
        });
      }
    } catch {
      // Audio fallback
    }
  }

  /**
   * Sound effect: Near miss bonus (overtaking closely).
   */
  public playNearMiss(): void {
    this.init();
    if (!this.ctx || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(1100, now + 0.12);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.16);
    } catch {
      // Ignore
    }
  }

  /**
   * Sound effect: Level Up victory fanfare.
   */
  public playLevelUp(): void {
    this.init();
    if (!this.ctx || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [440, 554.37, 659.25, 880]; // A major
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1400, now + idx * 0.08);

        gain.gain.setValueAtTime(0.18, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.38);
      });
    } catch {
      // Ignore
    }
  }

  /**
   * Crisp UI click sound for buttons.
   */
  public playButton(): void {
    this.init();
    if (!this.ctx || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // Ignore
    }
  }
}

export const soundManager = new SoundSystem();
