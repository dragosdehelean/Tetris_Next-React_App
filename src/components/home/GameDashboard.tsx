"use client";

import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import { useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/features/store/hooks";
import { startGame, pauseGame, resumeGame, selectGameState } from "@/features/game/gameSlice";

export function GameDashboard() {
  const dispatch = useAppDispatch();
  const game = useAppSelector(selectGameState);

  const primaryCta = useMemo(() => {
    switch (game.status) {
      case "running":
        return {
          label: "Pauză",
          onClick: () => dispatch(pauseGame()),
        } as const;
      case "paused":
        return {
          label: "Reia jocul",
          onClick: () => dispatch(resumeGame()),
        } as const;
      case "gameOver":
        return {
          label: "Repornește",
          onClick: () => dispatch(startGame({ difficulty: game.difficulty })),
        } as const;
      default:
        return {
          label: "Începe jocul",
          onClick: () => dispatch(startGame({ difficulty: game.difficulty })),
        } as const;
    }
  }, [dispatch, game.difficulty, game.status]);

  return (
    <Stack
      gap={4}
      sx={{
        maxWidth: 640,
        mx: "auto",
        textAlign: "center",
        py: { xs: 8, md: 12 },
      }}
    >
      <Stack gap={2}>
        <Chip
          label={`Dificultate: ${game.difficulty}`}
          color="secondary"
          variant="outlined"
          sx={{ fontWeight: 600, alignSelf: "center" }}
        />
        <Typography component="h1" variant="h2" fontWeight={700}>
          Tetris Neon Odyssey
        </Typography>
        <Typography color="text.secondary">
          MVP-ul Tetris propune o interpretare synthwave cu dificultăți adaptabile,
          scoruri locale și accent pe performanță. Apasă start pentru a intra în ritm.
        </Typography>
      </Stack>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        gap={2}
        justifyContent="center"
        alignItems="center"
      >
        <StatCard label="Scor" value={game.score.toLocaleString()} />
        <StatCard label="Nivel" value={game.level.toString()} />
        <StatCard label="Linii" value={game.linesCleared.toString()} />
      </Stack>

      <Button
        variant="contained"
        size="large"
        color="primary"
        onClick={primaryCta.onClick}
        sx={{ alignSelf: "center", px: 6 }}
      >
        {primaryCta.label}
      </Button>

      <Box
        sx={{
          height: 320,
          borderRadius: 4,
          border: "1px solid",
          borderColor: "primary.main",
          background:
            "radial-gradient(circle at top, rgba(138,43,226,0.25), transparent 60%), rgba(11,4,37,0.65)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography color="text.secondary">
          Canvas joc – implementare în fazele următoare
        </Typography>
      </Box>
    </Stack>
  );
}

interface StatCardProps {
  label: string;
  value: string;
}

function StatCard({ label, value }: StatCardProps) {
  return (
    <Stack
      gap={1}
      sx={{
        minWidth: 140,
        px: 3,
        py: 2,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "secondary.main",
        background:
          "linear-gradient(135deg, rgba(255,110,199,0.18), rgba(19,7,46,0.6))",
        boxShadow: "0 0 24px rgba(255,110,199,0.25)",
      }}
    >
      <Typography variant="overline" color="text.secondary" letterSpacing={1}>
        {label}
      </Typography>
      <Typography variant="h5" fontWeight={700}>
        {value}
      </Typography>
    </Stack>
  );
}