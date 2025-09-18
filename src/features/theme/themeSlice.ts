import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DEFAULT_THEME, isThemeName, type ThemeName } from "@/features/theme/themeOptions";

export interface ThemeState {
  current: ThemeName;
}

const initialState: ThemeState = {
  current: DEFAULT_THEME,
};

export const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<string>) {
      const payload = action.payload;
      if (isThemeName(payload)) {
        state.current = payload;
      }
    },
  },
});

export const { setTheme } = themeSlice.actions;
export const themeReducer = themeSlice.reducer;
export const selectThemeName = (state: { theme: ThemeState }) => state.theme.current;