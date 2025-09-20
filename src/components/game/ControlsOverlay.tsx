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
import {
  selectRightHanded,
  selectRotationDirection,
} from "@/features/settings/settingsSlice";

export function ControlsOverlay() {
  const dispatch = useAppDispatch();
  const game = useAppSelector(selectGameState);
  const rightHanded = useAppSelector(selectRightHanded);
  const rotationDirection = useAppSelector(selectRotationDirection);
  const isRunning = game.status === "running";

  // Determină funcția de rotație bazată pe setări
  const rotateAction = rotationDirection === 'CW' ? rotateClockwise : rotateCounterClockwise;
  const rotateSymbol = rotationDirection === 'CW' ? '⟳' : '⟲';
  const rotateLabel = rotationDirection === 'CW' 
    ? 'Rotație în sensul acelor de ceasornic' 
    : 'Rotație în sens contrar acelor de ceasornic';

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
      {/* Layout pentru dreptaci/stângaci - 2 rânduri optimizate */}
      <Stack spacing={2} alignItems="center">
        
        {/* Rândul 1: Mișcare și rotație [←] [⟳] [→] */}
        <Stack 
          direction="row" 
          spacing={6}
          alignItems="center"
          justifyContent="center"
          sx={{ width: '100%', px: 2 }}
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

          {/* Rotație dinamică bazată pe setări */}
          <Button 
            variant="outlined"
            onClick={() => isRunning && dispatch(rotateAction())} 
            aria-label={rotateLabel}
            disabled={!isRunning}
            sx={{
              ...rotateButtonStyle,
              fontSize: { xs: '1.2rem', sm: '1.4rem' },
              fontWeight: 'bold',
            }}
          >
            {rotateSymbol}
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

        {/* Rândul 2: Drop-uri adaptive bazate pe preferința de mână */}
        <Stack 
          direction="row" 
          spacing={4}
          alignItems="center"
          justifyContent="center"
          sx={{ width: '100%' }}
        >
          {rightHanded ? (
            // Layout dreptaci: [HARD DROP] [SOFT DROP]
            <>
              <Button
                variant="contained"
                onClick={() => isRunning && dispatch(hardDrop())}
                disabled={!isRunning}
                aria-label="Coborâre instantanee"
                sx={{
                  minWidth: { xs: 100, sm: 120 },
                  minHeight: { xs: 44, sm: 48 },
                  fontSize: { xs: '0.7rem', sm: '0.8rem' },
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
            </>
          ) : (
            // Layout stângaci: [SOFT DROP] [HARD DROP]
            <>
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

              <Button
                variant="contained"
                onClick={() => isRunning && dispatch(hardDrop())}
                disabled={!isRunning}
                aria-label="Coborâre instantanee"
                sx={{
                  minWidth: { xs: 100, sm: 120 },
                  minHeight: { xs: 44, sm: 48 },
                  fontSize: { xs: '0.7rem', sm: '0.8rem' },
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
            </>
          )}
        </Stack>
      </Stack>
    </Box>
  );
}

