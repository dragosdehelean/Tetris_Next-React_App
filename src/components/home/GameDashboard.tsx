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
import { TestControls } from "@/components/test/TestControls";
import { InstructionsButton } from "@/components/game/InstructionsDialog";
import { ControlsOverlay } from "@/components/game/ControlsOverlay";
import { useAddScoreMutation } from "@/features/scores/localScoresApi";

export function GameDashboard() {
  const dispatch = useAppDispatch();
  const game = useAppSelector(selectGameState);
  const score = useAppSelector(selectScore);
  const level = useAppSelector(selectLevel);
  const linesCleared = useAppSelector(selectLinesCleared);
  const themeName = useAppSelector(selectThemeName);
  const themeMeta = THEME_OPTIONS.find((theme) => theme.id === themeName) ?? THEME_OPTIONS[0];
  const [addScore] = useAddScoreMutation();

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

  const handleRestart = useCallback(async () => {
    const frame = game.frame;
    if (frame) {
      try {
        await addScore({
          id: `${Date.now()}`,
          value: frame.score,
          linesCleared: frame.clearedLines,
          levelReached: frame.level,
          difficulty: game.difficulty,
          timestamp: new Date().toISOString(),
        }).unwrap();
      } catch {
        // noop local persistence
      }
    }
    dispatch(startGame({ difficulty: game.difficulty }));
  }, [addScore, dispatch, game.difficulty, game.frame]);

  return (
    <Stack gap={3} sx={{ maxWidth: 600, mx: "auto", textAlign: "center", py: { xs: 4, md: 8 } }}>
      <Stack gap={1.5}>
        <Chip label={`Dificultate: ${game.difficulty}`} color="secondary" variant="outlined" sx={{ fontWeight: 600, alignSelf: "center" }} />
        <Typography component="h1" variant="h3" fontWeight={700}>Tetris Odyssey</Typography>
        <Typography color="text.secondary" sx={{ fontSize: { xs: 14, sm: 16 } }}>MVP Tetris cu dificultăți adaptabile și performanță ridicată. Apasă Start și intră în joc.</Typography>
      </Stack>

      {/* Panou joc cu HUD sub canvas */}
      <Box sx={{
        borderRadius: 4,
        border: "1px solid",
        borderColor: "var(--board-border-color, var(--color-panel-border))",
        background: "var(--color-surface-overlay, rgba(19,7,46,0.65))",
        backdropFilter: "blur(12px)",
        boxShadow: "0 0 22px var(--board-border-glow, transparent)",
        p: { xs: 1.5, sm: 2 }, mt: 0, mb: 1,
      }}>
        {/* Canvas centrat */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <GameCanvas />
        </Box>

        {/* HUD pill sub canvas */}
        <Box
          sx={{
            mt: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            flexWrap: "wrap",
            px: 1.2,
            py: 0.6,
            borderRadius: 999,
            border: "1px solid var(--board-border-color)",
            boxShadow: "0 0 12px var(--board-border-glow)",
            background: "rgba(0,0,0,0.18)",
          }}
        >
          <HudStat label="Scor" value={score.toLocaleString()} />
          <HudStat label="Nivel" value={level.toString()} />
          <HudStat label="Linii" value={linesCleared.toString()} />
        </Box>
      </Box>

      {/* Rând de controale dedesubtul jocului, compact și fără text pe două rânduri */}
      <Stack direction={{ xs: "column", sm: "row" }} gap={1.2} justifyContent="center" alignItems="center" sx={{ mt: 0 }}>
        <Button variant="contained" size="large" color="primary" onClick={primaryCta.onClick} sx={{ alignSelf: "center", px: 5, whiteSpace: "nowrap" }}>
          {primaryCta.label}
        </Button>
        <Button variant="outlined" color="secondary" onClick={handleRestart} data-testid="restart-button" sx={{ px: 4, whiteSpace: "nowrap" }}>
          Restart (salvare)
        </Button>
        <Button variant="outlined" color="secondary" onClick={handleThemeSwitch} data-testid="theme-switch" sx={{ px: 4, whiteSpace: "nowrap" }}>
          Schimba tema
        </Button>
        <Box sx={{ display: "flex" }}>
          <InstructionsButton />
        </Box>
      </Stack>

      <Box sx={{ display: { xs: "block", md: "none" } }}>
        <ControlsOverlay />
      </Box>

      <Typography variant="body2" color="text.secondary">Tema curenta: {themeMeta.label} - {themeMeta.description}</Typography>

      <SettingsPanel />
      <LeaderboardPanel />
      <TestControls />
    </Stack>
  );
}

function HudStat({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" alignItems="baseline" gap={0.5} sx={{ px: 0.5 }}>
      <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 0.6 }}>
        {label}:
      </Typography>
      <Typography variant="subtitle2" fontWeight={700}>
        {value}
      </Typography>
    </Stack>
  );
}
