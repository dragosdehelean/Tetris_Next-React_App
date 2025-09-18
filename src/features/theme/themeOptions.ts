export const THEME_NAMES = ["neon", "cityscape", "aurora"] as const;

export type ThemeName = (typeof THEME_NAMES)[number];

export interface ThemeOption {
  id: ThemeName;
  label: string;
  description: string;
}

export interface ThemePalette {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  textPrimary: string;
  textSecondary: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: "neon",
    label: "Neon Odyssey",
    description: "Palette synthwave vibrant, accent pe magenta și mov electric.",
  },
  {
    id: "cityscape",
    label: "Cityscape Dusk",
    description: "Tonuri de albastru și cyan inspirate de un skyline iluminat seara.",
  },
  {
    id: "aurora",
    label: "Aurora Borealis",
    description: "Verde polar cu accente violet pentru o atmosferă nordică.",
  },
];

export const THEME_PALETTES: Record<ThemeName, ThemePalette> = {
  neon: {
    primary: "#8a2be2",
    secondary: "#ff6ec7",
    background: "#0b0425",
    surface: "#13072e",
    textPrimary: "#f4f3ff",
    textSecondary: "#c1b8ff",
  },
  cityscape: {
    primary: "#00c2ff",
    secondary: "#ffb347",
    background: "#021422",
    surface: "#061d32",
    textPrimary: "#e7f3ff",
    textSecondary: "#99b6cc",
  },
  aurora: {
    primary: "#60d394",
    secondary: "#b388ff",
    background: "#0c1023",
    surface: "#141a33",
    textPrimary: "#f1f5ff",
    textSecondary: "#bcd0d9",
  },
};

export const DEFAULT_THEME: ThemeName = "neon";

export const isThemeName = (value: unknown): value is ThemeName =>
  typeof value === "string" && (THEME_NAMES as readonly string[]).includes(value);