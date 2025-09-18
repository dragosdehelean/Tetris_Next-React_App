"use client";

import { useEffect, useRef } from "react";
import { useAppSelector } from "@/features/store/hooks";
import { selectGameState } from "@/features/game/gameSlice";
import { useAddScoreMutation } from "@/features/scores/localScoresApi";

export function GameLifecycle() {
  const { status, frame, difficulty } = useAppSelector(selectGameState);
  const prevStatus = useRef(status);
  const [addScore] = useAddScoreMutation();

  useEffect(() => {
    if (prevStatus.current !== status && status === "gameOver" && frame) {
      void addScore({
        id: `${Date.now()}`,
        value: frame.score,
        linesCleared: frame.clearedLines,
        levelReached: frame.level,
        difficulty,
        timestamp: new Date().toISOString(),
      });
    }
    prevStatus.current = status;
  }, [addScore, difficulty, frame, status]);

  return null;
}

