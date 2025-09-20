"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/features/store/hooks";
import {
  hardDrop,
  moveLeft,
  moveRight,
  pauseGame,
  resumeGame,
  rotateClockwise,
  rotateCounterClockwise,
  selectFrame,
  selectGameState,
  softDrop,
  tick,
} from "@/features/game/gameSlice";
import { getPieceCells } from "@/features/game/engine/piece";
import type { TetrominoType } from "@/features/game/engine/tetromino";
import { getDroppedCoordinates } from "@/features/game/engine/board";
import { GameVisualEffects } from "@/components/game/GameVisualEffects";
import { audioManager } from "@/components/game/GameEffects";

// Type for line-clear effect tracking
interface LineClearTracker {
  last: number;
  t?: number;
}

// Extended window interface for line-clear tracking
interface WindowWithLineClear extends Window {
  __lc?: LineClearTracker;
}

// Type for ResizeObserver entry
interface ResizeObserverEntryWithContentRect {
  contentRect: {
    width: number;
    height: number;
  };
}
import { selectGhostPiece } from "@/features/settings/settingsSlice";
import { selectThemeName } from "@/features/theme/themeSlice";
import { THEME_PALETTES, type ThemeName } from "@/features/theme/themeOptions";

const COLORS: Record<TetrominoType, string> = {
  I: "#00e5ff",
  J: "#6c5ce7",
  L: "#fd9644",
  O: "#f9ca24",
  S: "#2ed573",
  T: "#e056fd",
  Z: "#ff4757",
};

const GRID_COLOR = "rgba(255,255,255,0.05)";
function boardBgForTheme(theme: string): string {
  switch (theme) {
    case "cityscape":
      return "rgba(6, 29, 50, 0.6)";
    case "aurora":
      return "rgba(20, 26, 51, 0.62)";
    case "neon":
    default:
      return "rgba(10, 4, 25, 0.6)";
  }
}

export function GameCanvas() {
  const dispatch = useAppDispatch();
  const frame = useAppSelector(selectFrame);
  const game = useAppSelector(selectGameState);
  const ghostEnabled = useAppSelector(selectGhostPiece);
  const themeName = useAppSelector(selectThemeName);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  const cols = 10;
  const rows = 20;
  const [cellSize, setCellSize] = useState<number>(28); // responsive
  const [isMobile, setIsMobile] = useState<boolean>(false);
  
  // Mobile-optimized padding
  const padding = isMobile ? 4 : 8;

  const width = useMemo(() => cols * cellSize + (isMobile ? 4 : 8) * 2, [cols, cellSize, isMobile]);
  const height = useMemo(() => rows * cellSize + (isMobile ? 4 : 8) * 2, [rows, cellSize, isMobile]);

  const startLoop = useCallback(() => {
    if (rafRef.current) return;
    lastTimeRef.current = performance.now();
    const loop = () => {
      const now = performance.now();
      const last = lastTimeRef.current ?? now;
      const elapsed = now - last;
      lastTimeRef.current = now;
      if (game.status === "running") {
        dispatch(tick({ elapsed }));
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
  }, [dispatch, game.status]);

  const stopLoop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    lastTimeRef.current = null;
  }, []);

  useEffect(() => {
    if (game.status === "running") {
      startLoop();
    } else {
      stopLoop();
    }
    return () => stopLoop();
  }, [game.status, startLoop, stopLoop]);

  useEffect(() => {
    // Responsive sizing: fit canvas to its container width
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement ?? null;
    if (!parent) return;

    let ro: ResizeObserver | undefined;
    const handleSize = (containerWidth: number) => {
      // Mobile-optimized sizing with smaller cells for better screen fit
      const isMobileDevice = containerWidth < 600;
      setIsMobile(isMobileDevice);
      
      const baseMaxCell = isMobileDevice ? 26 : 28;
      const baseMinCell = isMobileDevice ? 22 : 22;
      const currentPadding = isMobileDevice ? 4 : 8;
      
      const maxCell = Math.min(baseMaxCell, Math.floor((containerWidth - currentPadding * 2) / cols));
      const next = Math.max(baseMinCell, maxCell);
      if (Number.isFinite(next) && next !== cellSize) setCellSize(next);
    };

    if (typeof window !== "undefined" && window.ResizeObserver) {
      ro = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const entryWithContentRect = entry as ResizeObserverEntryWithContentRect;
          const cw = Math.max(0, entryWithContentRect.contentRect?.width || parent.clientWidth || 0);
          if (cw > 0) handleSize(cw);
        }
      });
      ro.observe(parent);
    }

    const onResize = () => handleSize(parent.clientWidth);
    window.addEventListener("resize", onResize);
    onResize();
    return () => {
      window.removeEventListener("resize", onResize);
      try { 
        if (ro) ro.disconnect(); 
      } catch {
        // Ignore disconnect errors
      }
    };
  }, [cols, padding, cellSize]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key;
      const isRunning = game.status === "running";
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " ", "PageUp"].includes(key)) {
        e.preventDefault();
      }
      if (key.toLowerCase() === "p") {
        e.preventDefault();
        if (game.status === "running") dispatch(pauseGame());
        else if (game.status === "paused") dispatch(resumeGame());
        return;
      }
      if (!isRunning) return;
      switch (key) {
        case "ArrowLeft":
          dispatch(moveLeft());
          break;
        case "ArrowRight":
          dispatch(moveRight());
          break;
        case "ArrowDown":
          dispatch(softDrop());
          break;
        case "ArrowUp":
        case "x":
        case "X":
          // Visually clockwise in y-down canvas coordinates corresponds to index -1 in our shapes
          dispatch(rotateCounterClockwise());
          break;
        case "z":
        case "Z":
          dispatch(rotateCounterClockwise());
          break;
        case "PageUp":
          // PageUp maps to visual CCW, which is index +1 here
          dispatch(rotateClockwise());
          break;
        case " ":
          dispatch(hardDrop());
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", onKeyDown, { passive: false });
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [dispatch, game.status]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !frame) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = boardBgForTheme(themeName);
    ctx.fillRect(0, 0, width, height);

    // Grid
    ctx.strokeStyle = GRID_COLOR;
    ctx.lineWidth = 1;
    for (let x = 0; x <= cols; x++) {
      const gx = padding + x * cellSize;
      ctx.beginPath();
      ctx.moveTo(gx + 0.5, padding + 0.5);
      ctx.lineTo(gx + 0.5, padding + rows * cellSize + 0.5);
      ctx.stroke();
    }
    for (let y = 0; y <= rows; y++) {
      const gy = padding + y * cellSize;
      ctx.beginPath();
      ctx.moveTo(padding + 0.5, gy + 0.5);
      ctx.lineTo(padding + cols * cellSize + 0.5, gy + 0.5);
      ctx.stroke();
    }

    // Board cells
    for (let y = 0; y < frame.board.length; y++) {
      for (let x = 0; x < frame.board[y].length; x++) {
        const val = frame.board[y][x];
        if (!val) continue;
        drawCellByTheme(ctx, padding + x * cellSize, padding + y * cellSize, cellSize, COLORS[val], themeName, val);
      }
    }

    // Ghost piece overlay
    if (frame.activePiece && ghostEnabled) {
      const coords = getPieceCells(frame.activePiece);
      const ghost = getDroppedCoordinates(frame.board, coords);
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      for (const { x, y } of ghost) {
        if (y < 0) continue;
        ctx.fillRect(padding + x * cellSize + 1, padding + y * cellSize + 1, cellSize - 2, cellSize - 2);
      }
    }

    // Active piece overlay
    if (frame.activePiece) {
      const coords = getPieceCells(frame.activePiece);
      for (const { x, y } of coords) {
        if (y < 0) continue;
        const currentPadding = isMobile ? 6 : 8;
        drawCellByTheme(
          ctx,
          currentPadding + x * cellSize,
          currentPadding + y * cellSize,
          cellSize,
          COLORS[frame.activePiece.type],
          themeName,
          frame.activePiece.type,
        );
      }
    }

    // Line-clear pulse overlay (theme-colored, quick fade)
    if (typeof performance !== "undefined") {
      const windowWithLC = window as WindowWithLineClear;
      windowWithLC.__lc = windowWithLC.__lc || { last: 0 };
      const last = windowWithLC.__lc.last;
      if (frame.clearedLines > last) {
        windowWithLC.__lc.t = performance.now();
        windowWithLC.__lc.last = frame.clearedLines;
      }
      const t0 = windowWithLC.__lc.t;
      if (t0) {
        const elapsed = performance.now() - t0;
        const dur = 360;
        if (elapsed < dur) {
          const pal = THEME_PALETTES[themeName as ThemeSkin] ?? THEME_PALETTES.neon;
          const alpha = Math.max(0, 1 - elapsed / dur) * 0.12;
          const g = ctx.createLinearGradient(padding, padding, padding + cols * cellSize, padding + rows * cellSize);
          g.addColorStop(0, rgba(pal.primary, alpha));
          g.addColorStop(1, rgba(pal.secondary, alpha));
          ctx.fillStyle = g;
          ctx.fillRect(padding, padding, cols * cellSize, rows * cellSize);
        }
      }
    }

    // Themed board border inside canvas (around playfield), rounded + gradient
    const style = boardBorderStyle(themeName as ThemeName);
    const bx = padding + 0.5;
    const by = padding + 0.5;
    const bw = cols * cellSize - 1;
    const bh = rows * cellSize - 1;
    const radius = Math.max(4, Math.min(10, Math.floor(cellSize * 0.35)));

    ctx.save();
    roundedRectPath(ctx, bx, by, bw, bh, radius);
    const grad = ctx.createLinearGradient(bx, by, bx + bw, by + bh);
    grad.addColorStop(0, style.strokeA);
    grad.addColorStop(1, style.strokeB);
    ctx.strokeStyle = grad;
    ctx.lineWidth = style.width;
    ctx.shadowColor = style.glow;
    ctx.shadowBlur = 14;
    ctx.stroke();

    // Crisp inner stroke for definition
    roundedRectPath(ctx, bx, by, bw, bh, radius);
    ctx.shadowBlur = 0;
    ctx.lineWidth = 1;
    ctx.strokeStyle = style.crisp;
    ctx.stroke();

    // Corner glow dots (subtle)
    const dots = [
      [bx + radius, by + radius],
      [bx + bw - radius, by + radius],
      [bx + radius, by + bh - radius],
      [bx + bw - radius, by + bh - radius],
    ] as const;
    ctx.fillStyle = style.dot;
    ctx.shadowColor = style.glow;
    ctx.shadowBlur = 10;
    for (const [dx, dy] of dots) {
      ctx.beginPath();
      ctx.arc(dx, dy, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }, [frame, width, height, cols, rows, ghostEnabled, themeName, cellSize, isMobile, padding]);

  return (
    <>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        data-testid="game-canvas"
        style={{ display: "block", margin: "0 auto", borderRadius: 8 }}
        onTouchStart={(e) => {
          // Activate audio context on mobile touch
          e.preventDefault();
          if (typeof window !== 'undefined' && 'ontouchstart' in window) {
            // Force enable audio context for mobile
            audioManager.playSound('soft-drop', 0.1).catch(() => {
              console.log('Audio activation attempted on mobile touch');
            });
          }
        }}
        onMouseDown={() => {
          // Also handle mouse events for testing on desktop
          if (typeof window !== 'undefined') {
            audioManager.playSound('soft-drop', 0.1).catch(() => {
              console.log('Audio activation attempted on mouse down');
            });
          }
        }}
      />
      <GameVisualEffects canvasRef={canvasRef} />
    </>
  );
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const m = hex.replace("#", "");
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  return { r, g, b };
}

function rgbToCss(r: number, g: number, b: number, a = 1): string {
  return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${a})`;
}

function lighten(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  const f = (v: number) => Math.max(0, Math.min(255, v + 255 * amount));
  return rgbToCss(f(r), f(g), f(b));
}

function darken(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  const f = (v: number) => Math.max(0, Math.min(255, v * (1 - amount)));
  return rgbToCss(f(r), f(g), f(b));
}

type ThemeSkin = "neon" | "cityscape" | "aurora";

function drawCellByTheme(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  colorHex: string,
  theme: ThemeSkin | string,
  pieceType?: TetrominoType,
): void {
  const px = x + 1;
  const py = y + 1;
  const s = size - 2;
  if (theme === "neon") {
    // Neon Odyssey: glow stroke + dim interior
    ctx.save();
    ctx.fillStyle = darken(colorHex, 0.6);
    ctx.fillRect(px, py, s, s);
    ctx.shadowColor = lighten(colorHex, 0.3);
    ctx.shadowBlur = 12;
    ctx.strokeStyle = colorHex;
    ctx.lineWidth = 2;
    ctx.strokeRect(px + 1, py + 1, s - 2, s - 2);
    ctx.restore();
    return;
  }

  if (theme === "cityscape" || theme === "aurora") {
    // Deterministic variant based on cell coords
    const cx = Math.floor(x / size);
    const cy = Math.floor(y / size);
    const seed = Math.abs((cx * 73856093) ^ (cy * 19349663));
    if (theme === "cityscape") {
      const motif = cityscapeMotifForPiece(pieceType);
      const orient = seed % 3; // small orientation/variant tweaks
      const variant = motif * 10 + orient;
      const tile = getThemeTile("cityscape", s, colorHex, variant);
      ctx.drawImage(tile, px, py);
      return;
    }
    // aurora motifs by piece type
    const motifA = auroraMotifForPiece(pieceType);
    const orientA = seed % 3;
    const variantA = motifA * 10 + orientA;
    const tileA = getThemeTile("aurora", s, colorHex, variantA);
    ctx.drawImage(tileA, px, py);
    return;
  }

  // Fallback
  ctx.fillStyle = colorHex;
  ctx.fillRect(px, py, s, s);
}

const tileCache = new Map<string, HTMLCanvasElement>();

function getThemeTile(theme: ThemeSkin, size: number, colorHex: string, variant = 0): HTMLCanvasElement {
  const key = `${theme}|${size}|${colorHex}|v${variant}`;
  const existing = tileCache.get(key);
  if (existing) return existing;

  const c = document.createElement("canvas");
  c.width = size; c.height = size;
  const cx = c.getContext("2d")!;

  if (theme === "cityscape") {
    // Cityscape motifs: 0 neon billboard, 1 traffic light, 2 windows, 3 headlight streak,
    // 4 bokeh/starry, 5 brick+window. All bright and engaging.
    cx.save();
    roundedRectPath(cx, 0.5, 0.5, size - 1, size - 1, Math.max(3, Math.floor(size * 0.22)));
    cx.clip();

    const pal = THEME_PALETTES.cityscape;

    // Vivid base (blue -> cyan)
    const base = cx.createLinearGradient(0, 0, 0, size);
    base.addColorStop(0, rgba("#073153", 0.98));
    base.addColorStop(1, rgba(pal.primary, 0.25));
    cx.fillStyle = base;
    cx.fillRect(0, 0, size, size);

    // Piece color tint for identity
    cx.globalCompositeOperation = "lighter";
    cx.fillStyle = rgba(colorHex, 0.32);
    cx.fillRect(0, 0, size, size);

    // Decode motif + orientation from variant
    const motif = Math.floor(variant / 10) % 10; // 0..9
    const orient = variant % 10; // 0..9

    // Motifs
    switch (motif) {
      case 0: {
        // Hazard stripes (construction/urban signage) – distinct and warm
        cx.globalCompositeOperation = "source-over";
        // Dark asphalt base
        const base = cx.createLinearGradient(0, 0, 0, size);
        base.addColorStop(0, rgba("#0e141a", 1));
        base.addColorStop(1, rgba("#1a2630", 1));
        cx.fillStyle = base;
        cx.fillRect(0, 0, size, size);

        // Diagonal yellow stripes
        cx.save();
        cx.translate(size / 2, size / 2);
        cx.rotate(Math.PI / 4);
        const stripeW = Math.max(3, Math.floor(size * 0.22));
        const total = size * 2;
        for (let x = -total; x < total; x += stripeW * 2) {
          const g = cx.createLinearGradient(0, -size, 0, size);
          g.addColorStop(0, rgba("#ffd166", 0.95));
          g.addColorStop(1, rgba("#ff9f1a", 0.95));
          cx.fillStyle = g;
          cx.fillRect(x, -size, stripeW, size * 2);
        }
        cx.restore();

        // Rivets in corners (metallic)
        const riv = (bx: number, by: number) => {
          const rg = cx.createRadialGradient(bx, by, 0, bx, by, Math.max(1.2, size * 0.10));
          rg.addColorStop(0, rgba("#ffffff", 0.9));
          rg.addColorStop(1, rgba("#7f8a93", 0.2));
          cx.fillStyle = rg;
          cx.beginPath(); cx.arc(bx, by, Math.max(1, size * 0.07), 0, Math.PI * 2); cx.fill();
        };
        riv(2.5, 2.5); riv(size - 2.5, 2.5); riv(2.5, size - 2.5); riv(size - 2.5, size - 2.5);
        break;
      }
      case 1: {
        // Traffic light (centered with housing)
        const cxm = Math.floor(size * 0.5);
        const hy = Math.floor(size * 0.12);
        const hh = Math.floor(size * 0.76);
        const hw = Math.max(4, Math.floor(size * 0.34));
        const hx = Math.floor(cxm - hw / 2);
        const hr = Math.max(2, Math.floor(size * 0.12));

        // Housing
        cx.globalCompositeOperation = "source-over";
        const housingBg = cx.createLinearGradient(0, hy, 0, hy + hh);
        housingBg.addColorStop(0, rgba("#0b141c", 0.95));
        housingBg.addColorStop(1, rgba("#172736", 0.95));
        cx.fillStyle = housingBg;
        roundedRectPath(cx, hx, hy, hw, hh, hr);
        cx.fill();
        cx.strokeStyle = rgba("#8fb9d8", 0.25);
        cx.lineWidth = 1;
        cx.stroke();

        // Lights (centered)
        const lights = ["#ff3b30", "#ffcc00", "#34c759"]; // red, amber, green
        const positions = [hy + hh * 0.2, hy + hh * 0.5, hy + hh * 0.8];
        const r = Math.max(1.6, hh * 0.13);
        cx.globalCompositeOperation = "lighter";
        for (let i = 0; i < 3; i++) {
          const y = positions[i];
          const g = cx.createRadialGradient(cxm, y, 0, cxm, y, r * 2.1);
          g.addColorStop(0, rgba(lights[i], 0.95));
          g.addColorStop(0.4, rgba(lights[i], 0.6));
          g.addColorStop(1, "rgba(0,0,0,0)");
          cx.fillStyle = g;
          cx.beginPath();
          cx.arc(cxm, y, r, 0, Math.PI * 2);
          cx.fill();
        }
        break;
      }
      case 2: {
        // Windows on facade (unused by mapping, kept for variety)
        const warm = ["#ffd166", "#ffe9a9", "#fff2c8"];
        const cols = 2, rows = 2;
        for (let j = 0; j < rows; j++) {
          for (let i = 0; i < cols; i++) {
            const wx = Math.floor(size * (0.18 + i * 0.38));
            const wy = Math.floor(size * (0.18 + j * 0.38));
            const ww = Math.max(2, Math.floor(size * 0.18));
            const wh = ww;
            const g = cx.createLinearGradient(0, wy, 0, wy + wh);
            g.addColorStop(0, rgba(warm[(i + j) % warm.length], 0.95));
            g.addColorStop(1, rgba("#ff9f1a", 0.5));
            cx.fillStyle = g;
            cx.fillRect(wx, wy, ww, wh);
          }
        }
        break;
      }
      case 3: {
        // Luxury headlights front + chrome grille (distinct from street)
        cx.globalCompositeOperation = "source-over";
        // Deep night base
        const night = cx.createLinearGradient(0, 0, 0, size);
        night.addColorStop(0, rgba("#071421", 1));
        night.addColorStop(1, rgba("#0b2236", 1));
        cx.fillStyle = night;
        cx.fillRect(0, 0, size, size);

        // Headlights (left/right)
        cx.globalCompositeOperation = "lighter";
        const off = Math.max(3, Math.floor(size * 0.18));
        const hy = Math.floor(size * 0.55);
        const light = (lx: number) => {
          const g = cx.createRadialGradient(lx, hy, 0, lx, hy, size * 0.6);
          g.addColorStop(0.0, rgba("#ffffff", 0.95));
          g.addColorStop(0.2, rgba("#d9f7ff", 0.8));
          g.addColorStop(1.0, "rgba(0,0,0,0)");
          cx.fillStyle = g;
          cx.beginPath(); cx.arc(lx, hy, size * 0.28, 0, Math.PI * 2); cx.fill();
        };
        light(off); light(size - off);

        // Chrome grille bars
        cx.globalCompositeOperation = "source-over";
        const bars = 4 + (orient % 2);
        for (let i = 0; i < bars; i++) {
          const gy = Math.floor(size * (0.25 + i * 0.12));
          const g = cx.createLinearGradient(0, gy, size, gy);
          g.addColorStop(0, rgba("#e7eef5", 0.9));
          g.addColorStop(0.5, rgba("#8ea3b3", 0.9));
          g.addColorStop(1, rgba("#dfe7ef", 0.9));
          cx.fillStyle = g;
          cx.fillRect(2, gy, size - 4, 1.6);
        }

        // Center emblem
        cx.fillStyle = rgba("#c0d7ea", 0.9);
        cx.beginPath(); cx.arc(size / 2, Math.floor(size * 0.42), Math.max(0.8, size * 0.08), 0, Math.PI * 2); cx.fill();
        break;
      }
      case 4: {
        // Night sky: crisp stars + crescent moon (more iconic)
        cx.globalCompositeOperation = "source-over";
        const sky = cx.createLinearGradient(0, 0, 0, size);
        sky.addColorStop(0, rgba("#061427", 1));
        sky.addColorStop(1, rgba("#0b1e33", 1));
        cx.fillStyle = sky;
        cx.fillRect(0, 0, size, size);

        // Stars (spiky)
        function star(x: number, y: number, r: number) {
          cx.save();
          cx.translate(x, y);
          cx.globalCompositeOperation = "lighter";
          const g = cx.createRadialGradient(0, 0, 0, 0, 0, r * 2);
          g.addColorStop(0, rgba("#ffffff", 1));
          g.addColorStop(1, "rgba(255,255,255,0)");
          cx.fillStyle = g;
          cx.beginPath(); cx.arc(0, 0, r, 0, Math.PI * 2); cx.fill();
          cx.strokeStyle = rgba("#e8f4ff", 0.9);
          cx.lineWidth = 0.8;
          cx.beginPath(); cx.moveTo(-r*1.4, 0); cx.lineTo(r*1.4, 0); cx.stroke();
          cx.beginPath(); cx.moveTo(0, -r*1.4); cx.lineTo(0, r*1.4); cx.stroke();
          cx.restore();
        }
        star(size * 0.22, size * 0.22, Math.max(0.8, size * 0.08));
        star(size * 0.70, size * 0.30, Math.max(0.7, size * 0.07));
        star(size * 0.50, size * 0.75, Math.max(0.6, size * 0.06));

        // Crescent moon (filled)
        const mx = size * 0.80; const my = size * 0.26; const mr = size * 0.12;
        cx.fillStyle = rgba("#f3fbff", 0.95);
        cx.beginPath(); cx.arc(mx, my, mr, 0, Math.PI * 2); cx.fill();
        cx.globalCompositeOperation = "destination-out";
        cx.beginPath(); cx.arc(mx + mr * 0.35, my - mr * 0.1, mr, 0, Math.PI * 2); cx.fill();
        cx.globalCompositeOperation = "source-over";
        break;
      }
      case 5: {
        // BRICKS: clear brick-red pattern with mortar gaps
        cx.globalCompositeOperation = "source-over";
        // Mortar background
        cx.fillStyle = rgba("#f2d6c9", 0.95);
        cx.fillRect(0, 0, size, size);
        const gap = Math.max(1, Math.floor(size * 0.06));
        const cols = 3;
        const rows = 2;
        const brickW = Math.floor((size - gap * (cols + 1)) / cols);
        const brickH = Math.floor((size - gap * (rows + 1)) / rows);
        for (let r = 0; r < rows; r++) {
          const offset = r % 2 === 1 ? Math.floor(brickW / 2) : 0; // staggered
          for (let ccol = -1; ccol < cols + 1; ccol++) {
            const bx = gap + ccol * (brickW + gap) + offset;
            const by = gap + r * (brickH + gap);
            if (bx + brickW < 0 || bx > size - gap) continue;
            const g = cx.createLinearGradient(0, by, 0, by + brickH);
            g.addColorStop(0, rgba("#e87950", 0.98));
            g.addColorStop(1, rgba("#8b2c1f", 0.98));
            cx.fillStyle = g;
            cx.fillRect(bx, by, brickW, brickH);
            // Brick edge darkening
            cx.strokeStyle = rgba("#5a1c14", 0.65);
            cx.lineWidth = 0.6;
            cx.strokeRect(bx + 0.3, by + 0.3, brickW - 0.6, brickH - 0.6);
          }
        }
        break;
      }
      case 6: {
        // PIPES: metallic chrome tube with clamp bands and bolts
        cx.globalCompositeOperation = "source-over";
        const m = Math.max(2, Math.floor(size * 0.12));
        const ry = Math.max(3, Math.floor(m * 0.6));
        // Base chrome gradient
        const pipe = cx.createLinearGradient(0, 0, 0, size);
        pipe.addColorStop(0, rgba("#dfe9f3", 0.98));
        pipe.addColorStop(0.4, rgba("#9fb6c8", 0.98));
        pipe.addColorStop(0.6, rgba("#e8f2fb", 0.98));
        pipe.addColorStop(1, rgba("#7b92a4", 0.98));
        cx.fillStyle = pipe;
        roundedRectPath(cx, m, Math.floor(m * 0.3), size - 2 * m, size - Math.floor(m * 0.6), ry);
        cx.fill();
        // Specular highlights
        const spec = cx.createLinearGradient(0, 0, 0, size);
        spec.addColorStop(0.2, rgba("#ffffff", 0.65));
        spec.addColorStop(0.5, rgba("#ffffff", 0.0));
        spec.addColorStop(0.8, rgba("#ffffff", 0.45));
        cx.fillStyle = spec;
        cx.fillRect(m + 1, Math.floor(m * 0.35), Math.max(2, Math.floor((size - 2 * m) * 0.12)), size - Math.floor(m * 0.7));
        // Clamp bands
        const bandY1 = Math.floor(size * 0.35);
        const bandY2 = Math.floor(size * 0.65);
        cx.fillStyle = rgba("#3e4f5b", 0.9);
        cx.fillRect(m, bandY1, size - 2 * m, 2);
        cx.fillRect(m, bandY2, size - 2 * m, 2);
        // Bolts on bands
        cx.fillStyle = rgba("#cfd9e3", 0.95);
        const boltR = Math.max(0.8, size * 0.06);
        const boltOffset = Math.max(3, Math.floor((size - 2 * m) * 0.25));
        const centers = [m + boltOffset, size - m - boltOffset];
        for (const cxp of centers) {
          cx.beginPath(); cx.arc(cxp, bandY1 + 1, boltR, 0, Math.PI * 2); cx.fill();
          cx.beginPath(); cx.arc(cxp, bandY2 + 1, boltR, 0, Math.PI * 2); cx.fill();
        }
        break;
      }
      case 7: {
        // Skyscraper facade: vertical warm windows columns
        cx.globalCompositeOperation = "source-over";
        const facade = cx.createLinearGradient(0, 0, 0, size);
        facade.addColorStop(0, rgba("#0b2236", 1));
        facade.addColorStop(1, rgba("#143c5e", 1));
        cx.fillStyle = facade;
        cx.fillRect(0, 0, size, size);
        const cols = 3;
        for (let i = 0; i < cols; i++) {
          const wx = Math.floor(size * (0.12 + i * 0.28));
          const ww = Math.max(2, Math.floor(size * 0.12));
          for (let j = 0; j < 3; j++) {
            const wy = Math.floor(size * (0.12 + j * 0.28));
            const wh = Math.max(2, Math.floor(size * 0.12));
            const warm = cx.createLinearGradient(0, wy, 0, wy + wh);
            warm.addColorStop(0, rgba("#fff4c2", 0.95));
            warm.addColorStop(1, rgba("#ffbd45", 0.85));
            cx.fillStyle = warm;
            cx.fillRect(wx, wy, ww, wh);
          }
        }
        // Roof highlight
        cx.fillStyle = rgba("#b2e9ff", 0.35);
        cx.fillRect(0, 1, size, 1);
        break;
      }
      case 8: {
        // Crosswalk zebra: bold white stripes on asphalt + cat's eye reflectors
        cx.globalCompositeOperation = "source-over";
        const asphalt = cx.createLinearGradient(0, 0, 0, size);
        asphalt.addColorStop(0, rgba("#0d141b", 1));
        asphalt.addColorStop(1, rgba("#15202a", 1));
        cx.fillStyle = asphalt;
        cx.fillRect(0, 0, size, size);

        // Stripes (horizontal), slight shift with orient
        const shift = (orient % 3) * Math.max(1, Math.floor(size * 0.05));
        const stripeH = Math.max(3, Math.floor(size * 0.22));
        for (let y = -stripeH * 2 + shift; y < size + stripeH; y += stripeH * 2) {
          const g = cx.createLinearGradient(0, y, 0, y + stripeH);
          g.addColorStop(0, rgba("#ffffff", 0.98));
          g.addColorStop(1, rgba("#e2ecf5", 0.98));
          cx.fillStyle = g;
          cx.fillRect(0, y, size, stripeH);
        }

        // Cat's eye reflectors (small warm dots near edges)
        cx.globalCompositeOperation = "lighter";
        const dots = [
          [size * 0.12, size * 0.9],
          [size * 0.88, size * 0.1],
        ];
        for (const [dx, dy] of dots) {
          const dg = cx.createRadialGradient(dx, dy, 0, dx, dy, size * 0.12);
          dg.addColorStop(0, rgba("#ffd166", 1));
          dg.addColorStop(1, rgba("#ff9f1a", 0));
          cx.fillStyle = dg;
          cx.beginPath();
          cx.arc(dx, dy, size * 0.06, 0, Math.PI * 2);
          cx.fill();
        }
        break;
      }
    }

    // Outer rim glow for cohesive neon look
    cx.globalCompositeOperation = "source-over";
    cx.shadowColor = rgba(pal.primary, 0.75);
    cx.shadowBlur = 10;
    cx.strokeStyle = rgba(pal.primary, 0.95);
    cx.lineWidth = 1.4;
    cx.strokeRect(1, 1, size - 2, size - 2);
    cx.shadowBlur = 0;

    cx.restore();
  } else if (theme === "aurora") {
    // Aurora motifs per piece: 0 pillars,1 comet,2 campfire,3 lantern,4 ribbons,5 horizon,6 crystals
    cx.save();
    roundedRectPath(cx, 0.5, 0.5, size - 1, size - 1, Math.max(3, Math.floor(size * 0.24)));
    cx.clip();

    const pal = THEME_PALETTES.aurora;

    // Base night gradient with slight aurora tint
    const base = cx.createLinearGradient(0, 0, size, size);
    base.addColorStop(0, rgba("#0c1023", 1));
    base.addColorStop(1, rgba(pal.surface, 0.9));
    cx.fillStyle = base;
    cx.fillRect(0, 0, size, size);

    const motif = Math.floor(variant / 10) % 10;
    const orient = variant % 10;

    cx.globalCompositeOperation = "lighter";
    switch (motif) {
      case 0: {
        // Aurora rune (diamond + chevrons) – clearer than vertical bars
        const cxm = size * 0.5, cym = size * 0.52;
        const dx = size * 0.28, dy = size * 0.32;
        const grad = cx.createLinearGradient(0, 0, size, size);
        grad.addColorStop(0, rgba(pal.primary, 0.9));
        grad.addColorStop(1, rgba(pal.secondary, 0.85));
        cx.fillStyle = grad;

        // Outer diamond
        cx.beginPath();
        cx.moveTo(cxm, cym - dy);
        cx.lineTo(cxm + dx, cym);
        cx.lineTo(cxm, cym + dy);
        cx.lineTo(cxm - dx, cym);
        cx.closePath();
        cx.fill();
        cx.strokeStyle = rgba("#ffffff", 0.25);
        cx.lineWidth = 1;
        cx.stroke();

        // Inner warm core
        const core = cx.createRadialGradient(cxm, cym, 0, cxm, cym, size * 0.22);
        core.addColorStop(0, rgba("#fff2c2", 0.95));
        core.addColorStop(1, "rgba(0,0,0,0)");
        cx.fillStyle = core;
        cx.beginPath(); cx.arc(cxm, cym, size * 0.2, 0, Math.PI * 2); cx.fill();

        // Chevrons (aurora streaks)
        cx.strokeStyle = rgba(pal.primary, 0.8);
        cx.lineWidth = 1.2;
        const ang = (orient - 1) * (Math.PI / 12);
        cx.save();
        cx.translate(cxm, cym);
        cx.rotate(ang);
        cx.beginPath();
        cx.moveTo(-size * 0.35, -size * 0.08);
        cx.lineTo(size * 0.35, -size * 0.08);
        cx.stroke();
        cx.beginPath();
        cx.moveTo(-size * 0.28, size * 0.08);
        cx.lineTo(size * 0.28, size * 0.08);
        cx.stroke();
        cx.restore();
        break;
      }
      case 1: {
        // Comet swirl (tail + bright head)
        const headX = orient === 0 ? size * 0.25 : orient === 1 ? size * 0.75 : size * 0.5;
        const headY = size * 0.3;
        const r = size * 0.22;
        const head = cx.createRadialGradient(headX, headY, 0, headX, headY, r);
        head.addColorStop(0, rgba("#ffffff", 0.9));
        head.addColorStop(1, rgba(pal.secondary, 0.2));
        cx.fillStyle = head;
        cx.beginPath(); cx.arc(headX, headY, r, 0, Math.PI * 2); cx.fill();
        cx.strokeStyle = rgba(pal.primary, 0.65);
        cx.lineWidth = 1.3;
        cx.beginPath();
        cx.moveTo(headX - r * 1.2, headY + r * 0.2);
        cx.quadraticCurveTo(size * 0.2, size * 0.8, size * 0.1, size * 0.9);
        cx.stroke();
        break;
      }
      case 2: {
        // Campfire (revamped): crossed logs + vivid flame + asymmetric embers
        cx.globalCompositeOperation = "source-over";
        // Crossed logs
        const len = Math.floor(size * 0.9);
        const th = Math.max(3, Math.floor(size * 0.12));
        const logGrad = cx.createLinearGradient(0, 0, len, 0);
        logGrad.addColorStop(0, rgba("#5b3a25", 0.98));
        logGrad.addColorStop(0.5, rgba("#7a4c2c", 0.98));
        logGrad.addColorStop(1, rgba("#4a2f1f", 0.98));
        cx.save();
        cx.translate(size * 0.5, size * 0.84);
        cx.rotate(Math.PI / 10);
        cx.fillStyle = logGrad;
        cx.fillRect(-len / 2, -th / 2, len, th);
        cx.restore();
        cx.save();
        cx.translate(size * 0.5, size * 0.86);
        cx.rotate(-Math.PI / 10);
        cx.fillStyle = logGrad;
        cx.fillRect(-len / 2, -th / 2, len, th);
        cx.restore();

        // Flame body
        cx.globalCompositeOperation = "lighter";
        const apexY = size * 0.38;
        const flameLG = cx.createLinearGradient(0, size * 0.95, 0, apexY);
        flameLG.addColorStop(0, rgba("#ff6a00", 0.95));
        flameLG.addColorStop(0.5, rgba("#ffb347", 0.95));
        flameLG.addColorStop(1, rgba("#ffd166", 0.95));
        cx.fillStyle = flameLG;
        cx.beginPath();
        cx.moveTo(size * 0.22, size * 0.92);
        cx.quadraticCurveTo(size * 0.38, size * 0.70, size * 0.50, apexY);
        cx.quadraticCurveTo(size * 0.62, size * 0.70, size * 0.78, size * 0.92);
        cx.closePath();
        cx.fill();
        // Inner hot core
        const core = cx.createRadialGradient(size * 0.5, size * 0.72, 0, size * 0.5, size * 0.72, size * 0.22);
        core.addColorStop(0, rgba("#ffffff", 0.95));
        core.addColorStop(1, rgba("#ffe59a", 0.0));
        cx.fillStyle = core;
        cx.beginPath(); cx.arc(size * 0.5, size * 0.72, size * 0.24, 0, Math.PI * 2); cx.fill();

        // Asymmetric embers
        const ember = (sx: number, sy: number, rr: number) => {
          const g = cx.createRadialGradient(sx, sy, 0, sx, sy, rr);
          g.addColorStop(0, rgba("#fff2cc", 0.95));
          g.addColorStop(1, "rgba(0,0,0,0)");
          cx.fillStyle = g;
          cx.beginPath(); cx.arc(sx, sy, rr, 0, Math.PI * 2); cx.fill();
        };
        ember(size * 0.33, size * 0.46, size * 0.06);
        ember(size * 0.58, size * 0.36, size * 0.05);
        ember(size * 0.46, size * 0.28, size * 0.04);
        break;
      }
      case 3: {
        // Lantern orb (warm center with ring)
        const cxm = size * 0.5, cym = size * 0.5;
        const orb = cx.createRadialGradient(cxm, cym, 0, cxm, cym, size * 0.45);
        orb.addColorStop(0, rgba("#fff2c2", 1));
        orb.addColorStop(0.5, rgba("#ffd166", 0.9));
        orb.addColorStop(1, rgba(pal.secondary, 0.25));
        cx.fillStyle = orb;
        cx.beginPath(); cx.arc(cxm, cym, size * 0.4, 0, Math.PI * 2); cx.fill();
        // Ring
        cx.strokeStyle = rgba(pal.primary, 0.6);
        cx.lineWidth = 1;
        cx.beginPath(); cx.arc(cxm, cym, size * 0.42, 0, Math.PI * 2); cx.stroke();
        break;
      }
      case 4: {
        // Aurora wave (single luminous S-curve + warm accent)
        cx.save();
        cx.translate(size / 2, size / 2);
        cx.rotate((orient - 1) * (Math.PI / 14));

        // Main cool wave
        const lw = Math.max(3, Math.floor(size * 0.22));
        const grad = cx.createLinearGradient(-size, 0, size, 0);
        grad.addColorStop(0.0, rgba(pal.primary, 0.9));
        grad.addColorStop(0.5, rgba("#c9f7ff", 0.9));
        grad.addColorStop(1.0, rgba(pal.secondary, 0.85));
        cx.strokeStyle = grad;
        cx.lineCap = "round";
        cx.lineJoin = "round";
        cx.lineWidth = lw;
        cx.beginPath();
        cx.moveTo(-size * 0.55, -size * 0.15);
        cx.quadraticCurveTo(0, -size * 0.45, size * 0.55, size * 0.12);
        cx.stroke();

        // Warm accent wave (thinner, offset)
        cx.strokeStyle = rgba("#ffd166", 0.85);
        cx.lineWidth = Math.max(2, Math.floor(size * 0.10));
        cx.beginPath();
        cx.moveTo(-size * 0.48, size * 0.10);
        cx.quadraticCurveTo(0, -size * 0.18, size * 0.45, size * 0.28);
        cx.stroke();

        // Sparkles at ends
        const sp = (sx: number, sy: number, rr: number) => {
          const g = cx.createRadialGradient(sx, sy, 0, sx, sy, rr);
          g.addColorStop(0, rgba("#ffffff", 0.9));
          g.addColorStop(1, "rgba(0,0,0,0)");
          cx.fillStyle = g;
          cx.beginPath(); cx.arc(sx, sy, rr, 0, Math.PI * 2); cx.fill();
        };
        sp(-size * 0.5, -size * 0.12, size * 0.08);
        sp(size * 0.5, size * 0.12, size * 0.07);
        cx.restore();
        break;
      }
      case 5: {
        // Horizon + moon
        const haze = cx.createLinearGradient(0, size * 0.7, 0, size * 0.3);
        haze.addColorStop(0, rgba(pal.primary, 0.1));
        haze.addColorStop(1, rgba(pal.secondary, 0.25));
        cx.fillStyle = haze;
        cx.fillRect(0, size * 0.3, size, size * 0.4);
        cx.fillStyle = rgba("#ffffff", 0.95);
        cx.fillRect(0, size * 0.7, size, 1);
        // Moon
        const mx = size * (0.3 + orient * 0.2), my = size * 0.35;
        const mr = size * 0.12;
        cx.fillStyle = rgba("#f3fbff", 0.95);
        cx.beginPath(); cx.arc(mx, my, mr, 0, Math.PI * 2); cx.fill();
        cx.globalCompositeOperation = "destination-out";
        cx.beginPath(); cx.arc(mx + mr * 0.35, my - mr * 0.1, mr, 0, Math.PI * 2); cx.fill();
        cx.globalCompositeOperation = "lighter";
        break;
      }
      case 6: {
        // Crystal facets (warm/cool criss-cross)
        const f1 = cx.createLinearGradient(0, size, size, 0);
        f1.addColorStop(0.3, rgba("#ffffff", 0));
        f1.addColorStop(0.5, rgba(pal.primary, 0.8));
        f1.addColorStop(0.7, rgba("#ffd166", 0.6));
        cx.fillStyle = f1;
        cx.fillRect(0, 0, size, size);
        const f2 = cx.createLinearGradient(size, 0, 0, size);
        f2.addColorStop(0.3, rgba("#ffffff", 0));
        f2.addColorStop(0.5, rgba(pal.secondary, 0.8));
        f2.addColorStop(0.7, rgba("#ff9f1a", 0.55));
        cx.fillStyle = f2;
        cx.fillRect(0, 0, size, size);
        break;
      }
    }

    // Keep piece identity
    cx.fillStyle = rgba(colorHex, 0.25);
    cx.fillRect(0, 0, size, size);

    // Inner crisp rim with gradient
    cx.globalCompositeOperation = "source-over";
    const rim = cx.createLinearGradient(0, 0, size, size);
    rim.addColorStop(0, rgba(pal.primary, 0.9));
    rim.addColorStop(1, rgba(pal.secondary, 0.9));
    cx.strokeStyle = rim;
    cx.lineWidth = 1;
    cx.strokeRect(0.5, 0.5, size - 1, size - 1);
    cx.restore();
  }

  tileCache.set(key, c);
  return c;
}

function roundedRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.max(0, Math.min(r, Math.min(w, h) / 2));
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
  ctx.lineTo(x + rr, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
  ctx.lineTo(x, y + rr);
  ctx.quadraticCurveTo(x, y, x + rr, y);
}

function boardBorderStyle(theme: ThemeName): { strokeA: string; strokeB: string; glow: string; crisp: string; dot: string; width: number } {
  const pal = THEME_PALETTES[theme] ?? THEME_PALETTES.neon;
  const a = pal.secondary; // accent
  const b = pal.primary; // primary
  return {
    strokeA: rgba(a, 0.95),
    strokeB: rgba(b, 0.95),
    glow: rgba(a, 0.45),
    crisp: rgba("#ffffff", 0.12),
    dot: rgba(a, 0.9),
    width: 2,
  };
}

function rgba(hex: string, alpha: number): string {
  if (hex.startsWith("rgba") || hex.startsWith("rgb")) return hex; // passed as rgba already
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function cityscapeMotifForPiece(type?: TetrominoType): number {
  switch (type) {
    case "I":
      return 8; // crosswalk zebra (clar și iconic)
    case "J":
      return 1; // traffic light
    case "L":
      return 6; // pipes (țevi industriale)
    case "O":
      return 5; // bricks + warm
    case "S":
      return 4; // stars + moon
    case "T":
      return 7; // skyscraper facade
    case "Z":
      return 0; // neon billboard/sign
    default:
      return 0;
  }
}

function auroraMotifForPiece(type?: TetrominoType): number {
  switch (type) {
    case "I":
      return 0; // pillars
    case "J":
      return 1; // comet
    case "L":
      return 2; // campfire
    case "O":
      return 3; // lantern orb
    case "S":
      return 4; // ribbons cross
    case "T":
      return 5; // horizon + moon
    case "Z":
      return 6; // crystal facets
    default:
      return 4;
  }
}
