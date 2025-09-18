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
              Scop: poziționează piesele astfel încât să completezi linii. Liniile complete sunt eliminate și îți aduc
              puncte.
            </Typography>
            <Typography variant="subtitle2">Controale tastatură</Typography>
            <ul style={{ marginTop: 0 }}>
              <li>Săgeată stânga/dreapta: deplasare pe orizontală</li>
              <li>Săgeată sus: rotire în sensul acelor de ceasornic</li>
              <li>PgUp: rotire invers acelor de ceasornic</li>
              <li>Săgeată jos: soft drop (coborâre mai rapidă)</li>
              <li>Space: hard drop</li>
              <li>C: hold</li>
              <li>P: pauză / continuare</li>
            </ul>

            <Typography variant="subtitle2">Scor și multiplicatori</Typography>
            <Stack component="ul" sx={{ m: 0, pl: 3 }}>
              <li>Punctaj de bază (pentru linii eliminate simultan): 1 linie = 100, 2 = 300, 3 = 500, 4 (Tetris) = 800.</li>
              <li>Formula finală: Puncte = Punctaj de bază × Nivelul curent × Multiplicatorul dificultății.</li>
              <li>Multiplicatorul dificultății: Relaxed ×1, Classic ×2, Expert ×3.</li>
              <li>Soft drop (Săgeată jos): +1 punct pentru fiecare pas coborât, înmulțit cu multiplicatorul dificultății.</li>
              <li>Hard drop (Space): piesa se fixează imediat; nu primești puncte pe pas, ci doar pentru liniile eliminate la fixare.</li>
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
