"use client";

import { FormControlLabel, Slider, Stack, Switch, Typography } from "@mui/material";
import { useAppDispatch, useAppSelector } from "@/features/store/hooks";
import { selectMuted, selectVolume, selectGhostPiece, setMuted, setVolume, setGhostPiece } from "@/features/settings/settingsSlice";

export function SettingsPanel() {
  const dispatch = useAppDispatch();
  const volume = useAppSelector(selectVolume);
  const muted = useAppSelector(selectMuted);
  const ghost = useAppSelector(selectGhostPiece);

  return (
    <Stack gap={2} sx={{ textAlign: "left" }}>
      <Typography variant="h6">Setări</Typography>
      <Stack direction="row" gap={2} alignItems="center">
        <Typography variant="body2" sx={{ minWidth: 100 }}>Volum</Typography>
        <Slider
          aria-label="volume"
          value={Math.round(volume * 100)}
          onChange={(_, v) => typeof v === "number" && dispatch(setVolume(v / 100))}
          valueLabelDisplay="auto"
          sx={{ maxWidth: 240 }}
        />
        <FormControlLabel control={<Switch checked={muted} onChange={(_, c) => dispatch(setMuted(c))} />} label="Mute" />
      </Stack>
      <FormControlLabel control={<Switch checked={ghost} onChange={(_, c) => dispatch(setGhostPiece(c))} />} label="Ghost piece" />
    </Stack>
  );
}
