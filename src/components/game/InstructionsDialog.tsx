"use client";

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from "@mui/material";
import { useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/features/store/hooks";
import { pauseGame, resumeGame, selectGameState } from "@/features/game/gameSlice";

export function InstructionsButton() {
  const [open, setOpen] = useState(false);
  const dispatch = useAppDispatch();
  const game = useAppSelector(selectGameState);
  const shouldResumeOnClose = useRef(false);

  const handleOpen = () => {
    if (game.status === "running") {
      shouldResumeOnClose.current = true;
      dispatch(pauseGame());
    } else {
      shouldResumeOnClose.current = false;
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    if (shouldResumeOnClose.current && game.status === "paused") {
      dispatch(resumeGame());
    }
    shouldResumeOnClose.current = false;
  };

  return (
    <>
      <Button variant="outlined" color="secondary" onClick={handleOpen} data-testid="instructions-open">
        Instructiuni
      </Button>
      <Dialog open={open} onClose={handleClose} aria-labelledby="instructions-title">
        <DialogTitle id="instructions-title">Instructiuni de joc</DialogTitle>
        <DialogContent>
          <Stack gap={2}>
            <Typography variant="body2" color="text.secondary">
              Scop: pozitioneaza piesele pentru a completa linii. Liniile complete sunt sterse si acorda puncte.
            </Typography>
            <Typography variant="subtitle2">Controale tastatura</Typography>
            <ul style={{ marginTop: 0 }}>
              <li>Stanga/Dreapta: deplasare</li>
              <li>Sageata sus: rotire CW</li>
              <li>PgUp: rotire CCW</li>
              <li>Sageata jos: soft drop</li>
              <li>Space: hard drop</li>
              <li>C: hold</li>
              <li>P: pauza/resume</li>
            </ul>

            <Typography variant="subtitle2">Scor si multiplicatori</Typography>
            <Stack component="ul" sx={{ m: 0, pl: 3 }}>
              <li>
                Baza pe linii: Single 100, Double 300, Triple 500, Tetris 800 (puncte de baza)
              </li>
              <li>
                Formula: Puncte = Baza × Nivel × Multiplicator dificultate
              </li>
              <li>
                Multiplicatori dificultate: Relaxed ×1, Classic ×2, Expert ×3
              </li>
              <li>
                Soft drop: +1 × multiplicator per pas (in jos)
              </li>
              <li>
                Hard drop: blocheaza instant piesa (fara bonus pe pas), puncte din liniile curatate
              </li>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} autoFocus data-testid="instructions-close">
            Inchide
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
