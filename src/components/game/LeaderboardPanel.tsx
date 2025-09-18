"use client";

import { Stack, Typography } from "@mui/material";
import { useAppSelector } from "@/features/store/hooks";
import { selectGameState } from "@/features/game/gameSlice";
import { useGetScoresQuery } from "@/features/scores/localScoresApi";

export function LeaderboardPanel() {
  const { difficulty } = useAppSelector(selectGameState);
  const { data } = useGetScoresQuery(difficulty);

  return (
    <Stack gap={1} sx={{ textAlign: "left" }} data-testid="leaderboard">
      <Typography variant="h6">Top scoruri ({difficulty})</Typography>
      <Stack component="ol" sx={{ m: 0, pl: 3 }}>
        {(data ?? []).length === 0 ? (
          <Typography component="li" color="text.secondary">Nicio intrare încă</Typography>
        ) : (
          data!.map((s) => (
            <Typography key={s.id} component="li">
              {new Date(s.timestamp).toLocaleDateString()} — {s.value.toLocaleString()}p, linii {s.linesCleared}, nivel {s.levelReached}
            </Typography>
          ))
        )}
      </Stack>
    </Stack>
  );
}
