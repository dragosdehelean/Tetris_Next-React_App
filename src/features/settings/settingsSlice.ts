import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface SettingsState {
  volume: number; // 0..1
  muted: boolean;
  ghostPiece: boolean;
}

const initialState: SettingsState = {
  volume: 0.6,
  muted: false,
  ghostPiece: true,
};

export const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setVolume(state, action: PayloadAction<number>) {
      const v = Math.max(0, Math.min(1, action.payload));
      state.volume = v;
      try {
        localStorage.setItem("settings.volume", String(v));
      } catch {}
    },
    setMuted(state, action: PayloadAction<boolean>) {
      state.muted = action.payload;
      try {
        localStorage.setItem("settings.muted", String(state.muted));
      } catch {}
    },
    setGhostPiece(state, action: PayloadAction<boolean>) {
      state.ghostPiece = action.payload;
      try {
        localStorage.setItem("settings.ghostPiece", String(state.ghostPiece));
      } catch {}
    },
  },
});

export const { setVolume, setMuted, setGhostPiece } = settingsSlice.actions;
export const settingsReducer = settingsSlice.reducer;

export const selectSettings = (state: { settings: SettingsState }) => state.settings;
export const selectVolume = (state: { settings: SettingsState }) => state.settings.volume;
export const selectMuted = (state: { settings: SettingsState }) => state.settings.muted;
export const selectGhostPiece = (state: { settings: SettingsState }) => state.settings.ghostPiece;
