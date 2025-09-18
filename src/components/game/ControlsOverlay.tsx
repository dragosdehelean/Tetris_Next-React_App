"use client";

import { Button, Stack } from "@mui/material";
import { useAppDispatch, useAppSelector } from "@/features/store/hooks";
import {
  moveLeft,
  moveRight,
  softDrop,
  hardDrop,
  rotateClockwise,
  rotateCounterClockwise,
  hold,
  pauseGame,
  resumeGame,
  selectGameState,
} from "@/features/game/gameSlice";

export function ControlsOverlay() {
  const dispatch = useAppDispatch();
  const game = useAppSelector(selectGameState);
  const isRunning = game.status === "running";

  const onPauseToggle = () => {
    if (game.status === "running") dispatch(pauseGame());
    else if (game.status === "paused") dispatch(resumeGame());
  };

  return (
    <Stack
      gap={1}
      direction="row"
      data-testid="controls-overlay"
      sx={{ display: { xs: "flex", md: "none" }, flexWrap: "wrap", justifyContent: "center" }}
    >
      <Button size="small" variant="outlined" onClick={() => isRunning && dispatch(moveLeft())} aria-label="left">
        ←
      </Button>
      <Button size="small" variant="outlined" onClick={() => isRunning && dispatch(moveRight())} aria-label="right">
        →
      </Button>
      <Button size="small" variant="outlined" onClick={() => isRunning && dispatch(softDrop())} aria-label="down">
        ↓
      </Button>
      <Button size="small" variant="outlined" onClick={() => isRunning && dispatch(rotateCounterClockwise())} aria-label="rotate-ccw">
        ↺
      </Button>
      <Button size="small" variant="outlined" onClick={() => isRunning && dispatch(rotateClockwise())} aria-label="rotate-cw">
        ↻
      </Button>
      <Button size="small" variant="contained" onClick={() => isRunning && dispatch(hardDrop())} aria-label="hard-drop">
        Drop
      </Button>
      <Button size="small" variant="outlined" onClick={() => isRunning && dispatch(hold())} aria-label="hold">
        Hold
      </Button>
      <Button size="small" variant="outlined" onClick={onPauseToggle} aria-label="pause-toggle">
        {game.status === "paused" ? "Reia" : "Pauza"}
      </Button>
    </Stack>
  );
}

