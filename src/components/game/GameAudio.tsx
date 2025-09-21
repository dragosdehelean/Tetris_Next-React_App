"use client";

import { useCallback, useEffect, useRef } from "react";
import { useAppSelector } from "@/features/store/hooks";
import { selectGameState } from "@/features/game/gameSlice";
import { selectMuted, selectVolume } from "@/features/settings/settingsSlice";
import { selectThemeName } from "@/features/theme/themeSlice";

// Type for AudioContext constructor
interface WindowWithAudio extends Window {
  AudioContext?: typeof AudioContext;
  webkitAudioContext?: typeof AudioContext;
}

function useAudio() {
  const ctxRef = useRef<AudioContext | null>(null);
  const ensure = useCallback(() => {
    if (!ctxRef.current) {
      const windowWithAudio = window as WindowWithAudio;
      const Ctx = windowWithAudio.AudioContext || windowWithAudio.webkitAudioContext;
      ctxRef.current = Ctx ? new Ctx() : null;
    }
    return ctxRef.current;
  }, []);
  const playTone = useCallback((freq: number, durationMs: number, volume: number) => {
    const ctx = ensure();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.value = volume;
    osc.connect(gain).connect(ctx.destination);
    const now = ctx.currentTime;
    osc.start(now);
    osc.stop(now + durationMs / 1000);
  }, [ensure]);
  return { playTone, ensure };
}

// Real music files downloaded from OpenGameArt.org (CC0/CC-BY licensed)
const THEME_PLAYLISTS: Record<string, string[]> = {
  neon: [
    "/audio/neon/neon_dreams.mp3",        // neocrey - NEON (synthwave)
    "/audio/neon/synthwave_drive.mp3",    // Into the Night (synthwave drive)
    "/audio/neon/cyber_nights.mp3"        // A Distant Sunrise (ambient synthwave)
  ],
  cityscape: [
    "/audio/cityscape/cityscape_dusk.mp3", // A Cup of Tea (lo-fi chill)
    "/audio/cityscape/urban_groove.mp3",   // Lo-fi Hip Hop (urban beats)
    "/audio/cityscape/jazzhop_evening.mp3" // Coffee Jazz Lofi (evening vibes)
  ],
  aurora: [
    "/audio/aurora/aurora_borealis.mp3",   // Space Ambient (atmospheric)
    "/audio/aurora/northern_lights.mp3",   // Dear Diary (melodic ambient)
    "/audio/aurora/celestial_calm.mp3"     // Ambient Relaxing Loop (peaceful)
  ],
  hypernova: [], // Procedural soundtrack driven by HypernovaSoundscape
};

class HypernovaSoundscape {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private drones: OscillatorNode[] = [];
  private droneGains: GainNode[] = [];
  private noiseSource: AudioBufferSourceNode | null = null;
  private noiseGain: GainNode | null = null;
  private shimmerInterval: ReturnType<typeof setInterval> | null = null;
  private driftInterval: ReturnType<typeof setInterval> | null = null;
  private volume = 0;
  private readonly ensureContext: () => AudioContext | null;
  private readonly baseFrequencies = [72, 108, 144];

  constructor(ensureContext: () => AudioContext | null) {
    this.ensureContext = ensureContext;
  }

  start(volume: number) {
    const ctx = this.ensureContext();
    if (!ctx) {
      return;
    }
    void ctx.resume?.().catch(() => {});
    this.ctx = ctx;
    this.volume = volume;

    if (!this.master) {
      this.master = ctx.createGain();
      this.master.gain.value = 0;
      this.master.connect(ctx.destination);
      this.createDrones();
      this.createNoisePad();
      this.scheduleDrift();
      this.scheduleShimmer();
    }

    this.setVolume(volume);
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    if (!this.ctx || !this.master) {
      return;
    }
    const now = this.ctx.currentTime;
    const target = this.volume * 0.7;
    this.master.gain.setTargetAtTime(target, now, 0.6);

    const baseLevels = [0.42, 0.28, 0.22];
    this.droneGains.forEach((gain, index) => {
      const weight = baseLevels[index] ?? 0.2;
      gain.gain.setTargetAtTime(target * weight, now, 0.6);
    });
    if (this.noiseGain) {
      this.noiseGain.gain.setTargetAtTime(target * 0.3, now, 0.6);
    }
  }

  stop() {
    if (!this.ctx || !this.master) {
      return;
    }
    const ctx = this.ctx;
    const now = ctx.currentTime;
    this.master.gain.setTargetAtTime(0.0001, now, 0.4);
    if (this.noiseGain) {
      this.noiseGain.gain.setTargetAtTime(0.0001, now, 0.4);
    }

    this.clearTimers();

    this.drones.forEach((osc) => {
      try {
        osc.stop(now + 0.5);
      } catch {}
      try {
        osc.disconnect();
      } catch {}
    });
    this.droneGains.forEach((gain) => {
      try {
        gain.disconnect();
      } catch {}
    });
    this.drones = [];
    this.droneGains = [];

    if (this.noiseSource) {
      try {
        this.noiseSource.stop(now + 0.5);
      } catch {}
      try {
        this.noiseSource.disconnect();
      } catch {}
      this.noiseSource = null;
    }
    if (this.noiseGain) {
      try {
        this.noiseGain.disconnect();
      } catch {}
      this.noiseGain = null;
    }

    const master = this.master;
    this.master = null;
    this.volume = 0;
    setTimeout(() => {
      try {
        master?.disconnect();
      } catch {}
    }, 600);
  }

  private createDrones() {
    if (!this.ctx || !this.master) {
      return;
    }
    this.drones = [];
    this.droneGains = [];
    this.baseFrequencies.forEach((freq, index) => {
      const osc = this.ctx!.createOscillator();
      osc.type = index === 0 ? "triangle" : index === 1 ? "sine" : "sawtooth";
      osc.frequency.value = freq;
      const gain = this.ctx!.createGain();
      gain.gain.value = 0;
      osc.connect(gain).connect(this.master!);
      osc.start();
      this.drones.push(osc);
      this.droneGains.push(gain);
    });
  }

  private createNoisePad() {
    if (!this.ctx || !this.master) {
      return;
    }
    const duration = 4;
    const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * duration, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const t = i / data.length;
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 2) * 0.5;
    }
    this.noiseSource = this.ctx.createBufferSource();
    this.noiseSource.buffer = buffer;
    this.noiseSource.loop = true;
    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 800;
    filter.Q.value = 0.9;
    this.noiseGain = this.ctx.createGain();
    this.noiseGain.gain.value = 0;
    this.noiseSource.connect(filter).connect(this.noiseGain).connect(this.master);
    this.noiseSource.start();
  }

  private scheduleDrift() {
    if (typeof window === "undefined" || !this.ctx) {
      return;
    }
    if (this.driftInterval) {
      clearInterval(this.driftInterval);
    }
    this.driftInterval = setInterval(() => {
      if (!this.ctx) return;
      this.drones.forEach((osc, idx) => {
        const base = this.baseFrequencies[idx % this.baseFrequencies.length];
        const detune = (Math.random() - 0.5) * 14;
        osc.frequency.setTargetAtTime(base + detune, this.ctx!.currentTime, 4.5);
      });
    }, 7000);
  }

  private scheduleShimmer() {
    if (typeof window === "undefined" || !this.ctx || !this.master) {
      return;
    }
    if (this.shimmerInterval) {
      clearInterval(this.shimmerInterval);
    }
    this.shimmerInterval = setInterval(() => {
      if (!this.ctx || !this.master) return;
      const osc = this.ctx.createOscillator();
      osc.type = "sine";
      const gain = this.ctx.createGain();
      osc.connect(gain).connect(this.master);
      const now = this.ctx.currentTime;
      const steps = [0, 3, 7, 10, 12];
      const freq = 220 * Math.pow(2, steps[Math.floor(Math.random() * steps.length)] / 12);
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(this.master.gain.value * 0.45, now + 0.15);
      gain.gain.setTargetAtTime(0.0001, now + 1.1, 0.5);
      osc.start(now);
      osc.stop(now + 1.6);
    }, 3200);
  }

  private clearTimers() {
    if (this.driftInterval) {
      clearInterval(this.driftInterval);
      this.driftInterval = null;
    }
    if (this.shimmerInterval) {
      clearInterval(this.shimmerInterval);
      this.shimmerInterval = null;
    }
  }
}

export function GameAudio() {
  const { frame, status } = useAppSelector(selectGameState);
  const muted = useAppSelector(selectMuted);
  const volume = useAppSelector(selectVolume);
  const theme = useAppSelector(selectThemeName);
  const prevCleared = useRef(0);
  const prevStatus = useRef(status);
  const { playTone, ensure } = useAudio();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentIndexRef = useRef(0);
  const hypernovaLoopRef = useRef<HypernovaSoundscape | null>(null);

  // Theme BGM player (HTMLAudioElement)
  useEffect(() => {
    const list = THEME_PLAYLISTS[theme] ?? [];
    // Ensure element
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = "auto";
      audioRef.current.loop = false;
      audioRef.current.addEventListener("ended", () => {
        // advance
        const l = THEME_PLAYLISTS[theme] ?? [];
        if (l.length === 0) return;
        currentIndexRef.current = (currentIndexRef.current + 1) % l.length;
        safePlay(l[currentIndexRef.current], volume, muted, audioRef.current!);
      });
      audioRef.current.addEventListener("error", () => {
        // skip broken track
        const l = THEME_PLAYLISTS[theme] ?? [];
        if (l.length === 0) return;
        currentIndexRef.current = (currentIndexRef.current + 1) % l.length;
        safePlay(l[currentIndexRef.current], volume, muted, audioRef.current!);
      });
    }

    const audio = audioRef.current;
    if (muted || volume <= 0.001 || status !== "running" || list.length === 0) {
      try { audio.pause(); } catch {}
      return;
    }

    // pick index deterministically per theme to avoid always same start
    currentIndexRef.current = Math.abs(theme.split("").reduce((a, c) => a + c.charCodeAt(0), 0)) % list.length;
    safePlay(list[currentIndexRef.current], volume, muted, audio);

    return () => {
      try { audio.pause(); } catch {}
    };
  }, [muted, status, theme, volume]);

  useEffect(() => {
    const loop = (hypernovaLoopRef.current ??= new HypernovaSoundscape(() => ensure()));
    if (theme === "hypernova" && status === "running" && !muted && volume > 0.001) {
      loop.start(volume);
    } else {
      loop.stop();
    }

    return () => {
      loop.stop();
    };
  }, [ensure, muted, status, theme, volume]);

  useEffect(() => {
    if (!frame) return;
    const delta = frame.clearedLines - prevCleared.current;
    if (delta > 0 && !muted) {
      // small arpeggio based on number of lines cleared
      const base = 440;
      for (let i = 0; i < delta; i += 1) {
        setTimeout(() => playTone(base + i * 120, 80, volume * 0.2), i * 60);
      }
    }
    prevCleared.current = frame.clearedLines;
  }, [frame, muted, playTone, volume]);

  useEffect(() => {
    if (status !== prevStatus.current && status === "gameOver" && !muted) {
      playTone(220, 500, volume * 0.3);
      setTimeout(() => playTone(110, 300, volume * 0.2), 160);
    }
    prevStatus.current = status;
  }, [muted, playTone, status, volume]);

  return null;
}

function safePlay(src: string, volume: number, muted: boolean, el: HTMLAudioElement) {
  try {
    el.src = src;
    el.currentTime = 0;
    el.volume = Math.min(0.6, Math.max(0, volume * 0.6));
    if (!muted) void el.play();
  } catch {
    // ignore
  }
}
