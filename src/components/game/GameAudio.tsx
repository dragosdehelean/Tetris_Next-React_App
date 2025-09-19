"use client";

import { useEffect, useRef } from "react";
import { useAppSelector } from "@/features/store/hooks";
import { selectGameState } from "@/features/game/gameSlice";
import { selectMuted, selectVolume } from "@/features/settings/settingsSlice";
import { selectThemeName } from "@/features/theme/themeSlice";

function useAudio() {
  const ctxRef = useRef<AudioContext | null>(null);
  const ensure = () => {
    if (!ctxRef.current) {
      const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
      ctxRef.current = Ctx ? new Ctx() : null;
    }
    return ctxRef.current;
  };
  const playTone = (freq: number, durationMs: number, volume: number) => {
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
  };
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
};

export function GameAudio() {
  const { frame, status } = useAppSelector(selectGameState);
  const muted = useAppSelector(selectMuted);
  const volume = useAppSelector(selectVolume);
  const theme = useAppSelector(selectThemeName);
  const prevCleared = useRef(0);
  const prevStatus = useRef(status);
  const { playTone } = useAudio();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentIndexRef = useRef(0);

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
