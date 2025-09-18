import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface SettingsState {
  volume: number; // 0..1
  muted: boolean;
  ghostPiece: boolean;
}

const readNumber = (key: string, def: number) => {
  try {
    const v = localStorage.getItem(key);
    if (v == null) return def;
    const n = Number(v);
    return Number.isFinite(n) ? Math.max(0, Math.min(1, n)) : def;
  } catch {
    return def;
  }
};

const readBool = (key: string, def: boolean) => {
  try {
    const v = localStorage.getItem(key);
    if (v == null) return def;
    return v === "true";
  } catch {
    return def;
  }
};

const initialState: SettingsState = {
  volume: 0.6,
  muted: false,
  ghostPiece: true,
};

const persistedInitial: SettingsState = {
  volume: typeof window === "undefined" ? initialState.volume : readNumber("settings.volume", initialState.volume),
  muted: typeof window === "undefined" ? initialState.muted : readBool("settings.muted", initialState.muted),
  ghostPiece:
    typeof window === "undefined" ? initialState.ghostPiece : readBool("settings.ghostPiece", initialState.ghostPiece),
};

export const settingsSlice = createSlice({
  name: "settings",
  initialState: persistedInitial,
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

