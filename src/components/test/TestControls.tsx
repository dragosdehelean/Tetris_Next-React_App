"use client";

import { Button, Stack } from "@mui/material";
import { useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/features/store/hooks";
import { debugSetScore, endGame, selectGameState } from "@/features/game/gameSlice";

export function TestControls() {
  const params = useSearchParams();
  const isTest = params?.get("test") === "1";
  const dispatch = useAppDispatch();
  const game = useAppSelector(selectGameState);

  if (!isTest) return null;

  return (
    <Stack direction="row" gap={1} sx={{ mt: 2 }}>
      <Button
        data-testid="force-score"
        size="small"
        variant="outlined"
        onClick={() => game.frame && dispatch(debugSetScore({ score: 1234, linesCleared: 10, level: 3 }))}
      >
        Set score (test)
      </Button>
      <Button data-testid="force-gameover" size="small" variant="contained" color="warning" onClick={() => dispatch(endGame())}>
        Force Game Over
      </Button>
    </Stack>
  );
}

