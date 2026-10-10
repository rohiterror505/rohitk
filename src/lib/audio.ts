"use client";

/* ─────────────────────────────────────────────────────────────────────────
   A tiny generative soundtrack + soft sound effects, fully synthesized
   with the Web Audio API. No audio files, nothing downloaded, no autoplay —
   sound only exists after an explicit tap on the music button.
   ───────────────────────────────────────────────────────────────────────── */

export type SfxName =
  | "portal"
  | "chime"
  | "whoosh"
  | "sparkle"
  | "paper"
  | "pop"
  | "wish";

const PENTATONIC = [220.0, 261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25];
const PENTATONIC_HIGH = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.51];

class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private musicBus: GainNode | null = null;
  private sfxBus: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private padNodes: OscillatorNode[] = [];
  private padLfo: OscillatorNode | null = null;
  private melodyTimer: ReturnType<typeof setTimeout> | null = null;
  private disableTimer: ReturnType<typeof setTimeout> | null = null;
  enabled = false;

  private ensureContext(): AudioContext {
    if (this.ctx) return this.ctx;
    const AC =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) throw new Error("Web Audio not supported");

    const ctx = new AC();
    this.ctx = ctx;

    this.master = ctx.createGain();
    this.master.gain.value = 0;
    this.master.connect(ctx.destination);

    this.musicBus = ctx.createGain();
    this.musicBus.gain.value = 0.85;
    this.musicBus.connect(this.master);

    // a dreamy feedback delay makes everything feel like it floats
    const delay = ctx.createDelay(1.0);
    delay.delayTime.value = 0.38;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.34;
    const wet = ctx.createGain();
    wet.gain.value = 0.3;
    this.musicBus.connect(delay);
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(wet);
    wet.connect(this.master);

    this.sfxBus = ctx.createGain();
    this.sfxBus.gain.value = 0.8;
    this.sfxBus.connect(this.master);

    return ctx;
  }

  /* ────────────────────────── master toggle ────────────────────────── */

  async enable(): Promise<void> {
    const ctx = this.ensureContext();
    if (this.disableTimer) {
      clearTimeout(this.disableTimer);
      this.disableTimer = null;
    }
    await ctx.resume();
    this.enabled = true;
    const t = ctx.currentTime;
    this.master?.gain.cancelScheduledValues(t);
    this.master?.gain.setTargetAtTime(1, t, 0.4);
    this.startMusic();
  }

  disable(): void {
    if (!this.ctx || !this.enabled) return;
    this.enabled = false;
    const t = this.ctx.currentTime;
    this.master?.gain.cancelScheduledValues(t);
    this.master?.gain.setTargetAtTime(0, t, 0.25);
    if (this.melodyTimer) {
      clearTimeout(this.melodyTimer);
      this.melodyTimer = null;
    }
    this.disableTimer = setTimeout(() => {
      this.stopMusic();
      this.ctx?.suspend().catch(() => undefined);
    }, 900);
  }

  async toggle(): Promise<boolean> {
    if (this.enabled) {
      this.disable();
      return false;
    }
    await this.enable();
    return true;
  }

  /* ───────────────────────────── music ───────────────────────────── */

  private startMusic() {
    if (!this.ctx || !this.musicBus) return;
    this.stopMusic();
    const ctx = this.ctx;

    // a soft, slowly breathing pad: A2 · E3 · C4
    const padFreqs = [110.0, 164.81, 261.63];
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 640;
    filter.Q.value = 0.4;
    const padGain = ctx.createGain();
    padGain.gain.value = 0.055;
    filter.connect(padGain);
    padGain.connect(this.musicBus);

    this.padLfo = ctx.createOscillator();
    this.padLfo.frequency.value = 0.06;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 220;
    this.padLfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    this.padLfo.start();

    this.padNodes = padFreqs.map((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.value = freq;
      osc.detune.value = i === 1 ? 4 : -3;
      osc.connect(filter);
      osc.start();
      return osc;
    });

    const loop = () => {
      if (!this.enabled) return;
      this.melodyNote();
      this.melodyTimer = setTimeout(loop, 1500 + Math.random() * 2600);
    };
    this.melodyTimer = setTimeout(loop, 700);
  }

  private stopMusic() {
    this.padNodes.forEach((osc) => {
      try {
        osc.stop();
      } catch {
        /* already stopped */
      }
    });
    this.padNodes = [];
    try {
      this.padLfo?.stop();
    } catch {
      /* already stopped */
    }
    this.padLfo = null;
    if (this.melodyTimer) {
      clearTimeout(this.melodyTimer);
      this.melodyTimer = null;
    }
  }

  /** One gentle bell-like note, chosen from a dreamy pentatonic scale. */
  private melodyNote() {
    const quietTwinkle = Math.random() < 0.22;
    const scale = quietTwinkle ? PENTATONIC_HIGH : PENTATONIC;
    const freq = scale[Math.floor(Math.random() * scale.length)];
    this.note(freq, quietTwinkle ? 0.018 : 0.05, quietTwinkle ? 2.6 : 3.4, "sine", 0, "music");
    if (!quietTwinkle && Math.random() < 0.4) {
      this.note(freq * 2, 0.012, 2.0, "sine", 0.02, "music");
    }
  }

  /* ──────────────────────────── helpers ──────────────────────────── */

  private noise(): AudioBuffer {
    const ctx = this.ctx!;
    if (this.noiseBuffer) return this.noiseBuffer;
    const length = ctx.sampleRate * 1.2;
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
    this.noiseBuffer = buffer;
    return buffer;
  }

  private note(
    freq: number,
    gain: number,
    duration: number,
    type: OscillatorType = "sine",
    delay = 0,
    bus: "music" | "sfx" = "sfx"
  ) {
    if (!this.ctx || !this.enabled) return;
    const ctx = this.ctx;
    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(g);
    g.connect(bus === "music" ? this.musicBus! : this.sfxBus!);
    osc.start(t);
    osc.stop(t + duration + 0.05);
  }

  private noiseBurst(
    gain: number,
    duration: number,
    filterType: BiquadFilterType,
    filterFreq: number,
    delay = 0
  ) {
    if (!this.ctx || !this.enabled) return;
    const ctx = this.ctx;
    const t = ctx.currentTime + delay;
    const source = ctx.createBufferSource();
    source.buffer = this.noise();
    const filter = ctx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.value = filterFreq;
    filter.Q.value = 0.8;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    source.connect(filter);
    filter.connect(g);
    g.connect(this.sfxBus!);
    source.start(t);
    source.stop(t + duration + 0.05);
  }

  private sweep(
    from: number,
    to: number,
    gain: number,
    duration: number,
    delay = 0
  ) {
    if (!this.ctx || !this.enabled) return;
    const ctx = this.ctx;
    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(from, t);
    osc.frequency.exponentialRampToValueAtTime(to, t + duration);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + duration * 0.35);
    g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(g);
    g.connect(this.sfxBus!);
    osc.start(t);
    osc.stop(t + duration + 0.05);
  }

  /* ────────────────────────── sound effects ────────────────────────── */

  playSfx(name: SfxName) {
    if (!this.enabled || !this.ctx) return;
    switch (name) {
      case "portal":
        this.sweep(160, 640, 0.09, 1.5);
        this.sweep(320, 1280, 0.045, 1.6, 0.15);
        this.note(220, 0.05, 1.4, "triangle", 0.1);
        this.note(329.63, 0.04, 1.6, "triangle", 0.35);
        this.note(440, 0.035, 1.8, "sine", 0.6);
        break;
      case "chime":
        this.note(987.77, 0.11, 1.2);
        this.note(1318.51, 0.06, 0.9, "sine", 0.07);
        break;
      case "whoosh":
        this.noiseBurst(0.16, 0.55, "lowpass", 650);
        this.sweep(190, 60, 0.1, 0.35, 0.05);
        break;
      case "sparkle":
        [659.25, 783.99, 987.77, 1174.66, 1318.51, 1567.98].forEach((f, i) =>
          this.note(f, 0.06, 0.8, "sine", i * 0.07)
        );
        break;
      case "paper":
        this.noiseBurst(0.05, 0.22, "bandpass", 2400);
        this.note(220, 0.04, 1.1, "triangle", 0.08);
        this.note(329.63, 0.03, 1.3, "triangle", 0.2);
        this.note(440, 0.025, 1.5, "sine", 0.32);
        break;
      case "pop":
        this.sweep(300, 90, 0.09, 0.14);
        this.noiseBurst(0.07, 0.1, "highpass", 2000);
        break;
      case "wish":
        [440, 523.25, 659.25].forEach((f, i) =>
          this.note(f, 0.05, 1.4, "sine", i * 0.16)
        );
        this.note(880, 0.02, 1.8, "sine", 0.5);
        break;
    }
  }
}

export const audio = new AudioEngine();