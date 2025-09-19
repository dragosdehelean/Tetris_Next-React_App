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
      {/* Layout conform screenshot-ului */}
      <Stack spacing={1.5} alignItems="center">
        
        {/* Rândul de sus: Stânga, Soft Drop, Dreapta */}
        <Stack 
          direction="row" 
          spacing={7}
          alignItems="center"
          justifyContent="center"
        >
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

          {/* Soft Drop */}
          <Button 
            variant="outlined"
            onClick={() => isRunning && dispatch(softDrop())} 
            aria-label="Coborâre lentă"
            disabled={!isRunning}
            sx={{
              ...moveButtonStyle,
              minWidth: { xs: 44, sm: 48 },
              minHeight: { xs: 44, sm: 48 },
            }}
          >
            ▼
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
        </Stack>

        {/* Rândul de jos: Rotații */}
        <Stack 
          direction="row" 
          spacing={8}
          alignItems="center"
          justifyContent="center"
          sx={{ width: '100%', px: 1 }}
        >
          <Button 
            variant="outlined"
            onClick={() => isRunning && dispatch(rotateCounterClockwise())} 
            aria-label="Rotație invers acelor de ceasornic"
            disabled={!isRunning}
            sx={rotateButtonStyle}
          >
            ⟲
          </Button>
          
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

        {/* Hard Drop - poziționat central sub rotații */}
        <Button 
          variant="contained"
          color="secondary"
          onClick={() => isRunning && dispatch(hardDrop())} 
          aria-label="Plasare instantanee"
          disabled={!isRunning}
          sx={{
            minWidth: { xs: 80, sm: 90 },
            minHeight: { xs: 40, sm: 44 },
            borderRadius: 3,
            fontSize: { xs: '0.8rem', sm: '0.9rem' },
            fontWeight: 600,
            mt: 0.5,
          }}
        >
          HARD DROP
        </Button>
      </Stack>
    </Box>
  );
}

