"use client";

import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import { useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/features/store/hooks";
import {
  startGame,
  pauseGame,
  resumeGame,
  selectGameState,
  selectScore,
  selectLevel,
  selectLinesCleared,
} from "@/features/game/gameSlice";
import { selectThemeName, setTheme } from "@/features/theme/themeSlice";
import { THEME_NAMES, THEME_OPTIONS } from "@/features/theme/themeOptions";
import { GameCanvas } from "@/components/game/GameCanvas";
import { SettingsPanel } from "@/components/game/SettingsPanel";
import { LeaderboardPanel } from "@/components/game/LeaderboardPanel";
import { ControlsOverlay } from "@/components/game/ControlsOverlay";

export function GameDashboard() {
  const dispatch = useAppDispatch();
  const game = useAppSelector(selectGameState);
  const score = useAppSelector(selectScore);
  const level = useAppSelector(selectLevel);
  const linesCleared = useAppSelector(selectLinesCleared);
  const themeName = useAppSelector(selectThemeName);
  const themeMeta = THEME_OPTIONS.find((theme) => theme.id === themeName) ?? THEME_OPTIONS[0];

  const primaryCta = useMemo(() => {
    switch (game.status) {
      case "running":
        return { label: "Pauza", onClick: () => dispatch(pauseGame()) } as const;
      case "paused":
        return { label: "Reia jocul", onClick: () => dispatch(resumeGame()) } as const;
      case "gameOver":
        return { label: "Reporneste", onClick: () => dispatch(startGame({ difficulty: game.difficulty })) } as const;
      default:
        return { label: "Incepe jocul", onClick: () => dispatch(startGame({ difficulty: game.difficulty })) } as const;
    }
  }, [dispatch, game.difficulty, game.status]);

  const handleThemeSwitch = useCallback(() => {
    const currentIndex = THEME_NAMES.indexOf(themeName);
    const nextTheme = THEME_NAMES[(currentIndex + 1) % THEME_NAMES.length];
    dispatch(setTheme(nextTheme));
  }, [dispatch, themeName]);

  return (
    <Stack gap={4} sx={{ maxWidth: 720, mx: "auto", textAlign: "center", py: { xs: 8, md: 12 } }}>
      <Stack gap={2}>
        <Chip label={`Dificultate: ${game.difficulty}`} color="secondary" variant="outlined" sx={{ fontWeight: 600, alignSelf: "center" }} />
        <Typography component="h1" variant="h2" fontWeight={700}>Tetris Neon Odyssey</Typography>
        <Typography color="text.secondary">
          MVP Tetris cu dificultati adaptabile si performanta ridicata. Apasa Start si intra in joc.
        </Typography>
      </Stack>

      <Stack direction={{ xs: "column", sm: "row" }} gap={2} justifyContent="center" alignItems="center">
        <StatCard label="Scor" value={score.toLocaleString()} />
        <StatCard label="Nivel" value={level.toString()} />
        <StatCard label="Linii" value={linesCleared.toString()} />
      </Stack>

      <Stack direction={{ xs: "column", sm: "row" }} gap={2} justifyContent="center" alignItems="center">
        <Button variant="contained" size="large" color="primary" onClick={primaryCta.onClick} sx={{ alignSelf: "center", px: 6 }}>
          {primaryCta.label}
        </Button>
        <Button variant="outlined" color="secondary" onClick={handleThemeSwitch} data-testid="theme-switch" sx={{ px: 4 }}>
          Schimba tema ({themeMeta.label})
        </Button>
      </Stack>

      <Box sx={{ borderRadius: 4, border: "1px solid", borderColor: "var(--color-panel-border)", background: "var(--color-surface-overlay, rgba(19,7,46,0.65))", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(12px)", p: 2 }}>
        <GameCanvas />
      </Box>

      <Box sx={{ display: { xs: "block", md: "none" } }}>
        <ControlsOverlay />
      </Box>

      <Typography variant="body2" color="text.secondary">Tema curenta: {themeMeta.label} - {themeMeta.description}</Typography>

      <SettingsPanel />
      <LeaderboardPanel />
    </Stack>
  );
}

interface StatCardProps { label: string; value: string }

function StatCard({ label, value }: StatCardProps) {
  return (
    <Stack gap={1} sx={{ minWidth: 140, px: 3, py: 2, borderRadius: 3, border: "1px solid", borderColor: "var(--color-panel-border)", background: "var(--color-card-gradient)", boxShadow: `0 0 24px var(--color-card-shadow)` }}>
      <Typography variant="overline" color="text.secondary" letterSpacing={1}>{label}</Typography>
      <Typography variant="h5" fontWeight={700}>{value}</Typography>
    </Stack>
  );
}
