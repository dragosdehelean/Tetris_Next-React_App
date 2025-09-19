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
      sx={{ 
        display: { xs: "flex", md: "none" }, 
        flexWrap: "wrap", 
        justifyContent: "center",
        px: 0.5
      }}
    >
      {/* Movement controls */}
      <Stack direction="row" gap={0.8} sx={{ order: 1 }}>
        <Button 
          size="small" 
          variant="outlined" 
          onClick={() => isRunning && dispatch(moveLeft())} 
          aria-label="left"
          sx={{ minWidth: 40, minHeight: 40, fontSize: '1rem', p: 0.5 }}
        >
          ←
        </Button>
        <Button 
          size="small" 
          variant="outlined" 
          onClick={() => isRunning && dispatch(moveRight())} 
          aria-label="right"
          sx={{ minWidth: 40, minHeight: 40, fontSize: '1rem', p: 0.5 }}
        >
          →
        </Button>
        <Button 
          size="small" 
          variant="outlined" 
          onClick={() => isRunning && dispatch(softDrop())} 
          aria-label="down"
          sx={{ minWidth: 40, minHeight: 40, fontSize: '1rem', p: 0.5 }}
        >
          ↓
        </Button>
      </Stack>

      {/* Rotation controls */}
      <Stack direction="row" gap={0.8} sx={{ order: 2 }}>
        <Button 
          size="small" 
          variant="outlined" 
          onClick={() => isRunning && dispatch(rotateCounterClockwise())} 
          aria-label="rotate-ccw"
          sx={{ minWidth: 40, minHeight: 40, fontSize: '1rem', p: 0.5 }}
        >
          ↺
        </Button>
        <Button 
          size="small" 
          variant="outlined" 
          onClick={() => isRunning && dispatch(rotateClockwise())} 
          aria-label="rotate-cw"
          sx={{ minWidth: 40, minHeight: 40, fontSize: '1rem', p: 0.5 }}
        >
          ↻
        </Button>
      </Stack>

      {/* Action controls */}
      <Stack direction="row" gap={0.8} sx={{ order: 3 }}>
        <Button 
          size="small" 
          variant="contained" 
          onClick={() => isRunning && dispatch(hardDrop())} 
          aria-label="hard-drop"
          sx={{ minWidth: 46, minHeight: 40, px: 1, fontSize: '0.75rem' }}
        >
          Drop
        </Button>
        <Button 
          size="small" 
          variant="outlined" 
          onClick={() => isRunning && dispatch(hold())} 
          aria-label="hold"
          sx={{ minWidth: 46, minHeight: 40, px: 1, fontSize: '0.75rem' }}
        >
          Hold
        </Button>
        <Button 
          size="small" 
          variant="outlined" 
          onClick={onPauseToggle} 
          aria-label="pause-toggle"
          sx={{ minWidth: 46, minHeight: 40, px: 1, fontSize: '0.75rem' }}
        >
          {game.status === "paused" ? "Reia" : "Pauza"}
        </Button>
      </Stack>
    </Stack>
  );
}

