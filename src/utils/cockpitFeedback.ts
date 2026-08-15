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
// real recordings (Mixkit free license): ignition + engine hum loop
import engineLoopUrl from '../assets/sounds/engine-loop.mp3';
import engineStartUrl from '../assets/sounds/engine-start.mp3';

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
  // sample-based engine (preferred): real recordings, playbackRate follows RPM
  private loopBuffer: AudioBuffer | null = null;
  private startBuffer: AudioBuffer | null = null;
  private loopLoading = false;
  private loopSource: AudioBufferSourceNode | null = null;
  private loopGain: GainNode | null = null;
  private squealSource: AudioBufferSourceNode | null = null;
  private squealGain: GainNode | null = null;
  muted = false;

  /** decode both samples once; swap the running synth fallback when ready */
  private loadSamples(ctx: AudioContext) {
    if ((this.loopBuffer && this.startBuffer) || this.loopLoading) return;
    this.loopLoading = true;
    const decode = (url: string) =>
      fetch(url).then((r) => r.arrayBuffer()).then((buf) => ctx.decodeAudioData(buf));
    Promise.allSettled([decode(engineLoopUrl), decode(engineStartUrl)])
      .then(([loop, start]) => {
        if (loop.status === 'fulfilled') this.loopBuffer = loop.value;
        if (start.status === 'fulfilled') this.startBuffer = start.value;
        if (this.osc && this.loopBuffer) {
          this.stopEngine(true);
          this.startLoop(ctx);
        }
      })
      .finally(() => {
        this.loopLoading = false;
      });
  }

  private startLoop(ctx: AudioContext, delaySec = 0) {
    if (!this.loopBuffer) return;
    this.stopLoop(true);
    const t0 = ctx.currentTime + delaySec;
    this.loopSource = ctx.createBufferSource();
    this.loopSource.buffer = this.loopBuffer;
    this.loopSource.loop = true;
    // loop inside the steady middle of the clip to avoid the edge fades
    this.loopSource.loopStart = 0.3;
    this.loopSource.loopEnd = this.loopBuffer.duration - 0.3;
    this.loopSource.playbackRate.value = 0.85;
    this.loopGain = ctx.createGain();
    this.loopGain.gain.setValueAtTime(0.0001, t0);
    this.loopGain.gain.linearRampToValueAtTime(0.5, t0 + 0.6);
    this.loopSource.connect(this.loopGain).connect(ctx.destination);
    this.loopSource.start(t0, 0.3);
  }

  /** brake friction squeal: resonant filtered noise, intensity follows speed */
  brakeSqueal(speed: number) {
    if (this.muted || speed < 15) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    this.stopSqueal();
    const dur = Math.min(1.4, 0.4 + speed / 60);
    const buffer = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    this.squealSource = ctx.createBufferSource();
    this.squealSource.buffer = buffer;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(2600, ctx.currentTime);
    bp.frequency.linearRampToValueAtTime(1900, ctx.currentTime + dur);
    bp.Q.value = 9;
    this.squealGain = ctx.createGain();
    const vol = Math.min(0.09, 0.02 + speed / 900);
    this.squealGain.gain.setValueAtTime(vol, ctx.currentTime);
    this.squealGain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + dur);
    this.squealSource.connect(bp).connect(this.squealGain).connect(ctx.destination);
    this.squealSource.start();
  }

  stopSqueal() {
    try {
      this.squealSource?.stop();
    } catch { /* already stopped */ }
    this.squealSource = null;
    this.squealGain = null;
  }

  private stopLoop(immediate = false) {
    if (!this.ctx || !this.loopSource) return;
    const t = this.ctx.currentTime;
    try {
      if (this.loopGain && !immediate) this.loopGain.gain.linearRampToValueAtTime(0.0001, t + 0.25);
      this.loopSource.stop(immediate ? t : t + 0.3);
    } catch {
      /* already stopped */
    }
    this.loopSource = null;
    this.loopGain = null;
  }

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
    this.loadSamples(ctx);

    if (this.startBuffer) {
      // real ignition recording
      const src = ctx.createBufferSource();
      const g = ctx.createGain();
      src.buffer = this.startBuffer;
      g.gain.value = 0.7;
      src.connect(g).connect(ctx.destination);
      src.start();
    } else {
      // synth starter whirr fallback
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
    }

    if (this.loopBuffer) {
      // real engine hum, pitch-shifted with RPM; ease in under the ignition tail
      this.startLoop(ctx, this.startBuffer ? 1.1 : 0);
      return;
    }

    // synth fallback while the sample decodes (or if it fails)
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
    this.gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.6);
    this.osc.connect(this.filter);
    this.osc2.connect(this.filter);
    this.filter.connect(this.gain).connect(ctx.destination);
    this.osc.start(ctx.currentTime + 0.3);
    this.osc2.start(ctx.currentTime + 0.3);
  }

  /** call every sim tick; pitch (and loudness) track RPM.
   *  setTargetAtTime instead of ramp-events: no automation pileup, no
   *  ordering fights with the start fade. Self-heals a dropped loop. */
  setRpm(rpm: number) {
    if (!this.ctx || this.muted) return;
    // engine is supposed to be running: if every source is gone, restart the loop
    if (!this.loopSource && !this.osc && this.loopBuffer) {
      this.startLoop(this.ctx);
    }
    const t = this.ctx.currentTime;
    if (this.loopSource && this.loopGain) {
      // idle recorded ~800rpm; scale playback rate with RPM for the rev sound
      const rate = Math.min(2.2, Math.max(0.75, 0.8 + (Math.max(0, rpm - 700) / 4000) * 1.3));
      this.loopSource.playbackRate.setTargetAtTime(rate, t, 0.08);
      this.loopGain.gain.setTargetAtTime(Math.min(0.8, 0.42 + (rpm / 4500) * 0.35), t, 0.1);
      return;
    }
    if (!this.osc || !this.osc2 || !this.filter) return;
    const f = 40 + (rpm / 4500) * 140;
    this.osc.frequency.setTargetAtTime(f, t, 0.08);
    this.osc2.frequency.setTargetAtTime(f * 0.5, t, 0.08);
    this.filter.frequency.setTargetAtTime(180 + (rpm / 4500) * 700, t, 0.08);
  }

  stopEngine(immediate = false) {
    if (!this.ctx) return;
    this.stopLoop(immediate);
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
    const t = ctx.currentTime;
    // dying sputter: pitch drops away before the engine falls silent
    if (this.loopSource && this.loopGain) {
      this.loopSource.playbackRate.cancelScheduledValues(t);
      this.loopSource.playbackRate.linearRampToValueAtTime(0.25, t + 0.45);
      this.loopGain.gain.linearRampToValueAtTime(0.0001, t + 0.5);
      try {
        this.loopSource.stop(t + 0.55);
      } catch {
        /* already stopped */
      }
      this.loopSource = null;
      this.loopGain = null;
    } else if (this.osc && this.filter) {
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
