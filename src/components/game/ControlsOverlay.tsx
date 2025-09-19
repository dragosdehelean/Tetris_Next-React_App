"use client";

import { Button, Stack, Box } from "@mui/material";
import { useAppDispatch, useAppSelector } from "@/features/store/hooks";
import {
  moveLeft,
  moveRight,
  softDrop,
  hardDrop,
  rotateClockwise,
  rotateCounterClockwise,
  selectGameState,
} from "@/features/game/gameSlice";

export function ControlsOverlay() {
  const dispatch = useAppDispatch();
  const game = useAppSelector(selectGameState);
  const isRunning = game.status === "running";

  // Stiluri pentru butoanele de mișcare (triunghiuri)
  const moveButtonStyle = {
    minWidth: { xs: 48, sm: 52 },
    minHeight: { xs: 48, sm: 52 },
    borderRadius: 3,
    fontSize: { xs: '1.4rem', sm: '1.6rem' },
    fontWeight: 700,
    border: '2px solid',
    borderColor: 'primary.main',
    background: 'rgba(255,255,255,0.08)',
    backdropFilter: 'blur(8px)',
    transition: 'all 0.15s ease-in-out',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '&:hover': {
      background: 'rgba(255,255,255,0.15)',
      transform: 'scale(1.05)',
    },
    '&:active': {
      transform: 'scale(0.95)',
      background: 'rgba(255,255,255,0.25)',
    },
  };

  // Stiluri pentru butoanele de rotație
  const rotateButtonStyle = {
    ...moveButtonStyle,
    fontSize: { xs: '1.2rem', sm: '1.4rem' },
  };



  return (
    <Box
      data-testid="controls-overlay"
      sx={{ 
        display: { xs: "block", md: "none" },
        width: '100%',
        px: 1,
      }}
    >
      {/* Layout Gaming Classic - 2 rânduri ergonomice */}
      <Stack spacing={2} alignItems="center">
        
        {/* Rândul 1: Butoane de mișcare și rotație [⟲] [◀] [▶] [⟳] */}
        <Stack 
          direction="row" 
          spacing={5}
          alignItems="center"
          justifyContent="center"
          sx={{ width: '100%', px: 2 }}
        >
          {/* Rotație CCW */}
          <Button 
            variant="outlined"
            onClick={() => isRunning && dispatch(rotateCounterClockwise())} 
            aria-label="Rotație invers acelor de ceasornic"
            disabled={!isRunning}
            sx={rotateButtonStyle}
          >
            ⟲
          </Button>

          {/* Stânga */}
          <Button 
            variant="outlined"
            onClick={() => isRunning && dispatch(moveLeft())} 
            aria-label="Mișcare stânga"
            disabled={!isRunning}
            sx={moveButtonStyle}
          >
            ◀
          </Button>

          {/* Dreapta */}
          <Button 
            variant="outlined"
            onClick={() => isRunning && dispatch(moveRight())} 
            aria-label="Mișcare dreapta"
            disabled={!isRunning}
            sx={moveButtonStyle}
          >
            ▶
          </Button>

          {/* Rotație CW */}
          <Button 
            variant="outlined"
            onClick={() => isRunning && dispatch(rotateClockwise())} 
            aria-label="Rotație în sensul acelor de ceasornic"
            disabled={!isRunning}
            sx={rotateButtonStyle}
          >
            ⟳
          </Button>
        </Stack>

        {/* Rândul 2: Soft Drop (mijloc) și Hard Drop (dreapta) */}
        <Box sx={{ 
          position: 'relative', 
          width: '100%', 
          display: 'flex', 
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          {/* Soft Drop - fix pe mijlocul rândului */}
          <Button 
            variant="outlined"
            onClick={() => isRunning && dispatch(softDrop())} 
            aria-label="Coborâre lentă"
            disabled={!isRunning}
            sx={{
              ...moveButtonStyle,
              minWidth: { xs: 48, sm: 52 },
              minHeight: { xs: 48, sm: 52 },
            }}
          >
            ▼
          </Button>

          {/* Hard Drop - poziționat la dreapta */}
          <Button
            variant="contained"
            onClick={() => isRunning && dispatch(hardDrop())}
            disabled={!isRunning}
            aria-label="Coborâre instantanee"
            sx={{
              position: 'absolute',
              right: 0,
              minWidth: { xs: 120, sm: 140 },
              minHeight: { xs: 48, sm: 52 },
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: 'white',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.25)',
                transform: 'translateY(-1px)',
                boxShadow: '0 6px 16px rgba(0, 0, 0, 0.4)',
              },
              '&:active': {
                transform: 'translateY(0)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
              },
              '&:disabled': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: 'rgba(255, 255, 255, 0.3)',
                cursor: 'not-allowed',
              },
            }}
          >
            HARD DROP
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}

