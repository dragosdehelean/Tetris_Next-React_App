"use client";

import { Button, Stack, Typography } from "@mui/material";
import { useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/features/store/hooks";
import { debugSetActive, debugSetScore, endGame, selectGameState } from "@/features/game/gameSlice";

export function TestControls() {
  const params = useSearchParams();
  const isTest = params?.get("test") === "1";
  const dispatch = useAppDispatch();
  const game = useAppSelector(selectGameState);

  if (!isTest) return null;

  const rotation = game.frame?.activePiece?.rotation ?? null;
  const type = game.frame?.activePiece?.type ?? null;

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
      <Button data-testid="debug-set-t" size="small" variant="outlined" onClick={() => dispatch(debugSetActive({ type: "T" }))}>
        Set piece T
      </Button>
      <Typography data-testid="debug-rotation" variant="caption" sx={{ ml: 1 }}>
        rot={rotation ?? "-"} type={type ?? "-"}
      </Typography>
    </Stack>
  );
}
