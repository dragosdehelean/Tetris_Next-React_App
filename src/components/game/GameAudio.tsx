"use client";

import { useEffect, useRef } from "react";
import { useAppSelector } from "@/features/store/hooks";
import { selectGameState } from "@/features/game/gameSlice";
import { selectMuted, selectVolume } from "@/features/settings/settingsSlice";

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
  return { playTone };
}

export function GameAudio() {
  const { frame, status } = useAppSelector(selectGameState);
  const muted = useAppSelector(selectMuted);
  const volume = useAppSelector(selectVolume);
  const prevCleared = useRef(0);
  const prevStatus = useRef(status);
  const { playTone } = useAudio();

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

