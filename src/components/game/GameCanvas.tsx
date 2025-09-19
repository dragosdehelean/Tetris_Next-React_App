"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/features/store/hooks";
import {
  hardDrop,
  hold,
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
import { selectGhostPiece } from "@/features/settings/settingsSlice";
import { selectThemeName } from "@/features/theme/themeSlice";

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
  const padding = 8;

  const width = useMemo(() => cols * cellSize + padding * 2, [cols, cellSize]);
  const height = useMemo(() => rows * cellSize + padding * 2, [rows, cellSize]);

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
      const maxCell = Math.min(28, Math.floor((containerWidth - padding * 2) / cols));
      const next = Math.max(22, maxCell);
      if (Number.isFinite(next) && next !== cellSize) setCellSize(next);
    };

    if (typeof window !== "undefined" && (window as any).ResizeObserver) {
      const RObs: typeof ResizeObserver = (window as any).ResizeObserver;
      ro = new RObs((entries) => {
        for (const entry of entries) {
          const cw = Math.max(0, (entry as any).contentRect?.width || parent.clientWidth || 0);
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
      try { ro && ro.disconnect(); } catch {}
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
        case "c":
        case "C":
          dispatch(hold());
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", onKeyDown, { passive: false });
    return () => window.removeEventListener("keydown", onKeyDown as any);
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
        drawCellByTheme(ctx, padding + x * cellSize, padding + y * cellSize, cellSize, COLORS[val], themeName);
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
        drawCellByTheme(ctx, padding + x * cellSize, padding + y * cellSize, cellSize, COLORS[frame.activePiece.type], themeName);
      }
    }

    // Themed board border inside canvas (around playfield)
    const { stroke, glow, width: lw } = boardBorderForTheme(themeName);
    ctx.save();
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lw;
    if (glow) {
      ctx.shadowColor = glow;
      ctx.shadowBlur = 10;
    }
    const bx = padding + 0.5;
    const by = padding + 0.5;
    const bw = cols * cellSize - 1;
    const bh = rows * cellSize - 1;
    ctx.strokeRect(bx, by, bw, bh);
    ctx.restore();
  }, [frame, width, height, cols, rows, ghostEnabled, themeName]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      data-testid="game-canvas"
      style={{ display: "block", margin: "0 auto", borderRadius: 8 }}
    />
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

  if (theme === "cityscape") {
    // Cityscape Dusk: glassy cyan highlight, minimal glow
    ctx.fillStyle = darken(colorHex, 0.35);
    ctx.fillRect(px, py, s, s);
    const g = ctx.createLinearGradient(0, py, 0, py + s);
    g.addColorStop(0, "rgba(0, 194, 255, 0.22)");
    g.addColorStop(0.5, "rgba(0, 194, 255, 0.10)");
    g.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = g;
    ctx.fillRect(px, py, s, Math.max(1, Math.floor(s * 0.65)));
    ctx.strokeStyle = "rgba(0, 194, 255, 0.6)";
    ctx.lineWidth = 1;
    ctx.strokeRect(px + 0.5, py + 0.5, s - 1, s - 1);
    return;
  }

  // Aurora Borealis: soft aurora-tinted highlight
  ctx.fillStyle = darken(colorHex, 0.4);
  ctx.fillRect(px, py, s, s);
  const gr = ctx.createLinearGradient(px, py, px, py + s);
  gr.addColorStop(0, "rgba(96, 211, 148, 0.18)");
  gr.addColorStop(0.6, "rgba(179, 136, 255, 0.10)");
  gr.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gr;
  ctx.fillRect(px, py, s, Math.max(1, Math.floor(s * 0.7)));
  ctx.strokeStyle = "rgba(96, 211, 148, 0.5)";
  ctx.lineWidth = 1;
  ctx.strokeRect(px + 0.5, py + 0.5, s - 1, s - 1);
}

function boardBorderForTheme(theme: string): { stroke: string; glow?: string; width: number } {
  switch (theme) {
    case "cityscape":
      return { stroke: "rgba(0, 194, 255, 0.85)", glow: "rgba(0, 194, 255, 0.45)", width: 2 };
    case "aurora":
      return { stroke: "rgba(96, 211, 148, 0.9)", glow: "rgba(96, 211, 148, 0.45)", width: 2 };
    case "neon":
    default:
      return { stroke: "rgba(255, 110, 199, 0.95)", glow: "rgba(255, 110, 199, 0.5)", width: 2 };
  }
}
