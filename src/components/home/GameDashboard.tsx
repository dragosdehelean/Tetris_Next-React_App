"use client";

import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import { useCallback, useMemo, useState } from "react";
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
import { selectThemeName } from "@/features/theme/themeSlice";
import { THEME_OPTIONS } from "@/features/theme/themeOptions";
import { GameCanvas } from "@/components/game/GameCanvas";
import { LeaderboardPanel } from "@/components/game/LeaderboardPanel";
import { TestControls } from "@/components/test/TestControls";
import { InstructionsButton } from "@/components/game/InstructionsDialog";
import { ControlsOverlay } from "@/components/game/ControlsOverlay";
import SettingsDialog from "@/components/home/SettingsDialog";
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
  const [settingsOpen, setSettingsOpen] = useState(false);

  const primaryCta = useMemo(() => {
    switch (game.status) {
      case "running":
        return { label: "Pauza", onClick: () => dispatch(pauseGame()) } as const;
      case "paused":
        return { label: "Reia", onClick: () => dispatch(resumeGame()) } as const;
      case "gameOver":
        return { label: "Restart", onClick: () => dispatch(startGame({ difficulty: game.difficulty })) } as const;
      default:
        return { label: "Start", onClick: () => dispatch(startGame({ difficulty: game.difficulty })) } as const;
    }
  }, [dispatch, game.difficulty, game.status]);

  const handleThemeSwitch = useCallback(() => {
    setSettingsOpen(true);
  }, []);

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
    <Stack gap={2} sx={{ maxWidth: 600, mx: "auto", textAlign: "center", py: { xs: 1.5, md: 8 }, px: { xs: 1, sm: 0 } }}>
      <Stack gap={0.8}>
        <Chip label={`Dificultate: ${game.difficulty}`} color="secondary" variant="outlined" sx={{ fontWeight: 600, alignSelf: "center", fontSize: { xs: '0.75rem', sm: '0.875rem' } }} />
        <Typography component="h1" variant="h3" fontWeight={700} sx={{ fontSize: { xs: '1.5rem', sm: '2.5rem', md: '3rem' } }}>Tetris Odyssey</Typography>
        <Typography color="text.secondary" sx={{ fontSize: { xs: 12, sm: 16 }, px: { xs: 0.5, sm: 0 } }}>MVP Tetris cu dificultăți adaptabile și performanță ridicată. Apasă Start și intră în joc.</Typography>
      </Stack>

      {/* Panou joc cu HUD sub canvas */}
      <Box sx={{
        borderRadius: 4,
        border: "1px solid",
        borderColor: "var(--board-border-color, var(--color-panel-border))",
        background: "var(--color-surface-overlay, rgba(19,7,46,0.65))",
        backdropFilter: "blur(12px)",
        boxShadow: "0 0 22px var(--board-border-glow, transparent)",
        p: { xs: 1, sm: 2 }, mt: 0, mb: 1,
      }}>
        {/* Canvas centrat */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <GameCanvas />
        </Box>

        {/* HUD pill sub canvas */}
        <Box
          sx={{
            mt: 1,
            mx: { xs: 1, sm: 0 }, // Add horizontal margin for mobile
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: { xs: 0.6, sm: 1 },
            flexWrap: "wrap",
            px: { xs: 0.8, sm: 1.2 },
            py: { xs: 0.3, sm: 0.6 },
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
        
        {/* Game controls directly under canvas for mobile */}
        <Box sx={{ display: { xs: "block", md: "none" }, mt: 1.5 }}>
          <ControlsOverlay />
        </Box>
      </Box>

      {/* Main action buttons - compact single row for mobile */}
      <Stack direction="row" gap={{ xs: 1, sm: 1.2 }} justifyContent="center" alignItems="center" flexWrap="wrap" sx={{ mt: 0, px: { xs: 1, sm: 0 } }}>
        <Button variant="contained" size="medium" color="primary" onClick={primaryCta.onClick} data-testid="primary-action-button" sx={{ px: 3, minHeight: 44, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
          {primaryCta.label}
        </Button>
        <Button variant="outlined" color="secondary" size="medium" onClick={handleRestart} data-testid="restart-button" sx={{ px: 2.5, minHeight: 44, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
          Restart
        </Button>
        <InstructionsButton />
        <Button 
          variant="outlined" 
          color="secondary" 
          size="medium" 
          onClick={handleThemeSwitch} 
          data-testid="settings-button" 
          sx={{ 
            px: 3, 
            minHeight: 44, 
            fontSize: { xs: '0.875rem', sm: '1rem' },
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          ⚙️ Setări
        </Button>
      </Stack>

      <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Tema: {themeMeta.label}</Typography>

      <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />

      <LeaderboardPanel />
      <TestControls />
    </Stack>
  );
}

function HudStat({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" alignItems="baseline" gap={0.4} sx={{ px: { xs: 0.3, sm: 0.5 } }}>
      <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 0.6, fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
        {label}:
      </Typography>
      <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
        {value}
      </Typography>
    </Stack>
  );
}
