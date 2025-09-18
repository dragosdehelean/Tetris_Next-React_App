"use client";

import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { useMemo, type ReactNode } from "react";
import { Provider } from "react-redux";
import { makeStore, type AppStore } from "@/features/store/store";

const synthwaveTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#8a2be2",
    },
    secondary: {
      main: "#ff6ec7",
    },
    background: {
      default: "#0b0425",
      paper: "#13072e",
    },
    text: {
      primary: "#f4f3ff",
      secondary: "#c1b8ff",
    },
  },
  typography: {
    fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif",
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 999,
        },
      },
    },
  },
});

interface ProvidersProps {
  children: ReactNode;
  storeOverride?: AppStore;
}

export function Providers({ children, storeOverride }: ProvidersProps) {
  const store = useMemo(() => storeOverride ?? makeStore(), [storeOverride]);

  return (
    <Provider store={store}>
      <ThemeProvider theme={synthwaveTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </Provider>
  );
}