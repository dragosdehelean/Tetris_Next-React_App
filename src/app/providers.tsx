"use client";

import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { Provider } from "react-redux";
import { useSearchParams } from "next/navigation";
import { makeStore, type AppStore } from "@/features/store/store";
import { useAppDispatch, useAppSelector } from "@/features/store/hooks";
import { selectThemeName, setTheme } from "@/features/theme/themeSlice";
import { DEFAULT_THEME, THEME_PALETTES, type ThemeName, isThemeName } from "@/features/theme/themeOptions";

interface ProvidersProps {
  children: ReactNode;
  storeOverride?: AppStore;
}

export function Providers({ children, storeOverride }: ProvidersProps) {
  const store = useMemo(() => storeOverride ?? makeStore(), [storeOverride]);

  return (
    <Provider store={store}>
      <AppThemeProvider>{children}</AppThemeProvider>
    </Provider>
  );
}

function AppThemeProvider({ children }: { children: ReactNode }) {
  const themeName = useAppSelector(selectThemeName);
  const palette = THEME_PALETTES[themeName] ?? THEME_PALETTES[DEFAULT_THEME];

  const muiTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: "dark",
          primary: { main: palette.primary },
          secondary: { main: palette.secondary },
          background: { default: palette.background, paper: palette.surface },
          text: { primary: palette.textPrimary, secondary: palette.textSecondary },
        },
        typography: {
          fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif",
        },
        shape: { borderRadius: 12 },
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
      }),
    [palette.background, palette.primary, palette.secondary, palette.surface, palette.textPrimary, palette.textSecondary],
  );

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <ThemeSynchronizer themeName={themeName} />
      {children}
    </ThemeProvider>
  );
}

function ThemeSynchronizer({ themeName }: { themeName: ThemeName }) {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const hasInitialized = useRef(false);

  const queryTheme = (() => {
    const paramValue = searchParams?.get("theme");
    if (paramValue) {
      return paramValue;
    }
    if (typeof window !== "undefined") {
      return new URL(window.location.href).searchParams.get("theme") ?? undefined;
    }
    return undefined;
  })();

  useEffect(() => {
    if (hasInitialized.current) {
      return;
    }

    if (queryTheme && isThemeName(queryTheme) && queryTheme !== themeName) {
      dispatch(setTheme(queryTheme));
      hasInitialized.current = true;
      return;
    }

    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("app-theme");
      if (stored && isThemeName(stored) && stored !== themeName) {
        dispatch(setTheme(stored));
        hasInitialized.current = true;
        return;
      }
    }

    hasInitialized.current = true;
  }, [dispatch, queryTheme, themeName]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", themeName ?? DEFAULT_THEME);
      try {
        window.localStorage.setItem("app-theme", themeName);
      } catch {
        /* ignore */
      }
    }
  }, [themeName]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    if (queryTheme === themeName) {
      return;
    }

    const url = new URL(window.location.href);
    if (!url.searchParams.has("theme") && themeName === DEFAULT_THEME) {
      return;
    }

    url.searchParams.set("theme", themeName);
    const path = url.pathname;
    const search = url.searchParams.toString();
    const hash = url.hash;
    const next = search ? `${path}?${search}${hash}` : `${path}${hash}`;
    window.history.replaceState(null, "", next);
  }, [queryTheme, themeName]);

  return null;
}