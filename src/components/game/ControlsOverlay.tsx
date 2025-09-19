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
      gap={1.5}
      direction="row"
      data-testid="controls-overlay"
      sx={{ 
        display: { xs: "flex", md: "none" }, 
        flexWrap: "wrap", 
        justifyContent: "center",
        px: 1 
      }}
    >
      {/* Movement controls */}
      <Stack direction="row" gap={1} sx={{ order: 1 }}>
        <Button 
          size="medium" 
          variant="outlined" 
          onClick={() => isRunning && dispatch(moveLeft())} 
          aria-label="left"
          sx={{ minWidth: 48, minHeight: 48, fontSize: '1.2rem' }}
        >
          ←
        </Button>
        <Button 
          size="medium" 
          variant="outlined" 
          onClick={() => isRunning && dispatch(moveRight())} 
          aria-label="right"
          sx={{ minWidth: 48, minHeight: 48, fontSize: '1.2rem' }}
        >
          →
        </Button>
        <Button 
          size="medium" 
          variant="outlined" 
          onClick={() => isRunning && dispatch(softDrop())} 
          aria-label="down"
          sx={{ minWidth: 48, minHeight: 48, fontSize: '1.2rem' }}
        >
          ↓
        </Button>
      </Stack>

      {/* Rotation controls */}
      <Stack direction="row" gap={1} sx={{ order: 2 }}>
        <Button 
          size="medium" 
          variant="outlined" 
          onClick={() => isRunning && dispatch(rotateCounterClockwise())} 
          aria-label="rotate-ccw"
          sx={{ minWidth: 48, minHeight: 48, fontSize: '1.2rem' }}
        >
          ↺
        </Button>
        <Button 
          size="medium" 
          variant="outlined" 
          onClick={() => isRunning && dispatch(rotateClockwise())} 
          aria-label="rotate-cw"
          sx={{ minWidth: 48, minHeight: 48, fontSize: '1.2rem' }}
        >
          ↻
        </Button>
      </Stack>

      {/* Action controls */}
      <Stack direction="row" gap={1} sx={{ order: 3 }}>
        <Button 
          size="medium" 
          variant="contained" 
          onClick={() => isRunning && dispatch(hardDrop())} 
          aria-label="hard-drop"
          sx={{ minWidth: 56, minHeight: 48, px: 2 }}
        >
          Drop
        </Button>
        <Button 
          size="medium" 
          variant="outlined" 
          onClick={() => isRunning && dispatch(hold())} 
          aria-label="hold"
          sx={{ minWidth: 56, minHeight: 48, px: 2 }}
        >
          Hold
        </Button>
        <Button 
          size="medium" 
          variant="outlined" 
          onClick={onPauseToggle} 
          aria-label="pause-toggle"
          sx={{ minWidth: 56, minHeight: 48, px: 2 }}
        >
          {game.status === "paused" ? "Reia" : "Pauza"}
        </Button>
      </Stack>
    </Stack>
  );
}

