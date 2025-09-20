import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface SettingsState {
  volume: number; // 0..1
  muted: boolean;
  ghostPiece: boolean;
  rightHanded: boolean; // true pentru dreptaci, false pentru stângaci
  rotationDirection: 'CW' | 'CCW'; // direcția de rotație preferată
  effectsIntensity: number; // 0..1 - intensitatea efectelor vizuale și sonore
}

const initialState: SettingsState = {
  volume: 0.6,
  muted: false,
  ghostPiece: true,
  rightHanded: true,
  rotationDirection: 'CW',
  effectsIntensity: 0.8,
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
    setRightHanded(state, action: PayloadAction<boolean>) {
      state.rightHanded = action.payload;
      try {
        localStorage.setItem("settings.rightHanded", String(state.rightHanded));
      } catch {}
    },
    setRotationDirection(state, action: PayloadAction<'CW' | 'CCW'>) {
      state.rotationDirection = action.payload;
      try {
        localStorage.setItem("settings.rotationDirection", action.payload);
      } catch {}
    },
    setEffectsIntensity(state, action: PayloadAction<number>) {
      const intensity = Math.max(0, Math.min(1, action.payload));
      state.effectsIntensity = intensity;
      try {
        localStorage.setItem("settings.effectsIntensity", String(intensity));
      } catch {}
    },
  },
});

export const { setVolume, setMuted, setGhostPiece, setRightHanded, setRotationDirection, setEffectsIntensity } = settingsSlice.actions;
export const settingsReducer = settingsSlice.reducer;

export const selectSettings = (state: { settings: SettingsState }) => state.settings;
export const selectVolume = (state: { settings: SettingsState }) => state.settings.volume;
export const selectMuted = (state: { settings: SettingsState }) => state.settings.muted;
export const selectGhostPiece = (state: { settings: SettingsState }) => state.settings.ghostPiece;
export const selectRightHanded = (state: { settings: SettingsState }) => state.settings.rightHanded;
export const selectRotationDirection = (state: { settings: SettingsState }) => state.settings.rotationDirection;
export const selectEffectsIntensity = (state: { settings: SettingsState }) => state.settings.effectsIntensity;
