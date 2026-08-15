/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 *
 * cockpitFeedback.ts (DRI-11): procedural engine audio + haptics for the
 * cockpit trainer. All sound is synthesized with WebAudio (no assets), so the
 * engine pitch can track RPM continuously. Haptics use @capacitor/haptics on
 * native and navigator.vibrate on the web where available. Everything no-ops
 * gracefully (jsdom, iOS web vibration, denied audio).
 */
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

// ---------- haptics ----------

function vibratePattern(pattern: number | number[]) {
  try {
    if (Capacitor.isNativePlatform()) {
      // map to impact strengths on native
      const total = Array.isArray(pattern) ? pattern.reduce((a, b) => a + b, 0) : pattern;
      void Haptics.impact({ style: total > 150 ? ImpactStyle.Heavy : total > 60 ? ImpactStyle.Medium : ImpactStyle.Light });
    } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  } catch {
    /* haptics unavailable */
  }
}

export const haptic = {
  tick: () => vibratePattern(15),          // gear engaged, pedal latched
  start: () => vibratePattern([30, 40, 60]), // starter motor
  grind: () => vibratePattern([40, 30, 40]),
  stall: () => vibratePattern(250),         // heavy thud
};

// ---------- procedural engine audio ----------

class EngineSound {
  private ctx: AudioContext | null = null;
  private osc: OscillatorNode | null = null;
  private osc2: OscillatorNode | null = null;
  private gain: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  muted = false;

  /** must be called from a user gesture (autoplay policy) */
  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined' || !('AudioContext' in window || 'webkitAudioContext' in window)) return null;
    if (!this.ctx) {
      const Ctor = (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
      this.ctx = new Ctor();
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
    return this.ctx;
  }

  startEngine() {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    this.stopEngine(true);

    // starter whirr: quick upward sweep before idle settles
    const starter = ctx.createOscillator();
    const starterGain = ctx.createGain();
    starter.type = 'sawtooth';
    starter.frequency.setValueAtTime(35, ctx.currentTime);
    starter.frequency.linearRampToValueAtTime(90, ctx.currentTime + 0.45);
    starterGain.gain.setValueAtTime(0.12, ctx.currentTime);
    starterGain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    starter.connect(starterGain).connect(ctx.destination);
    starter.start();
    starter.stop(ctx.currentTime + 0.55);

    // sustained engine: two detuned saws through a lowpass = rumble
    this.osc = ctx.createOscillator();
    this.osc2 = ctx.createOscillator();
    this.gain = ctx.createGain();
    this.filter = ctx.createBiquadFilter();
    this.osc.type = 'sawtooth';
    this.osc2.type = 'square';
    this.osc.frequency.value = 55;
    this.osc2.frequency.value = 55 * 0.5;
    this.filter.type = 'lowpass';
    this.filter.frequency.value = 240;
    this.gain.gain.setValueAtTime(0.0001, ctx.currentTime + 0.3);
    this.gain.gain.linearRampToValueAtTime(0.07, ctx.currentTime + 0.6);
    this.osc.connect(this.filter);
    this.osc2.connect(this.filter);
    this.filter.connect(this.gain).connect(ctx.destination);
    this.osc.start(ctx.currentTime + 0.3);
    this.osc2.start(ctx.currentTime + 0.3);
  }

  /** call every sim tick; pitch and brightness track RPM */
  setRpm(rpm: number) {
    if (!this.ctx || !this.osc || !this.osc2 || !this.filter || this.muted) return;
    const t = this.ctx.currentTime;
    const f = 40 + (rpm / 4500) * 140; // 40Hz idle-ish .. 180Hz redline
    this.osc.frequency.linearRampToValueAtTime(f, t + 0.1);
    this.osc2.frequency.linearRampToValueAtTime(f * 0.5, t + 0.1);
    this.filter.frequency.linearRampToValueAtTime(180 + (rpm / 4500) * 700, t + 0.1);
  }

  stopEngine(immediate = false) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    try {
      if (this.gain && !immediate) this.gain.gain.linearRampToValueAtTime(0.0001, t + 0.25);
      this.osc?.stop(immediate ? t : t + 0.3);
      this.osc2?.stop(immediate ? t : t + 0.3);
    } catch {
      /* already stopped */
    }
    this.osc = this.osc2 = null;
    this.gain = null;
    this.filter = null;
  }

  stall() {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    // dying sputter: fast downward sweep + noise thud
    if (this.osc && this.filter) {
      const t = ctx.currentTime;
      this.osc.frequency.cancelScheduledValues(t);
      this.osc.frequency.linearRampToValueAtTime(18, t + 0.35);
      this.gain?.gain.linearRampToValueAtTime(0.0001, t + 0.4);
    }
    this.stopEngine();
    this.thud(90, 0.3, 0.2);
  }

  grind() {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    // harsh band-passed noise burst
    const len = 0.28;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * len, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const src = ctx.createBufferSource();
    const bp = ctx.createBiquadFilter();
    const g = ctx.createGain();
    bp.type = 'bandpass';
    bp.frequency.value = 900;
    bp.Q.value = 2;
    g.gain.value = 0.16;
    src.buffer = buffer;
    src.connect(bp).connect(g).connect(ctx.destination);
    src.start();
  }

  click() {
    if (this.muted) return;
    this.thud(320, 0.05, 0.08);
  }

  private thud(freq: number, dur: number, vol: number) {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(freq * 0.4, ctx.currentTime + dur);
    g.gain.setValueAtTime(vol, ctx.currentTime);
    g.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + dur);
    osc.connect(g).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + dur + 0.02);
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (muted) this.stopEngine();
  }

  dispose() {
    this.stopEngine(true);
    void this.ctx?.close().catch(() => {});
    this.ctx = null;
  }
}

export const engineSound = new EngineSound();
