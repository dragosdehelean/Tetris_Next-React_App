"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
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
const BG_COLOR = "rgba(10, 4, 25, 0.6)";

export function GameCanvas() {
  const dispatch = useAppDispatch();
  const frame = useAppSelector(selectFrame);
  const game = useAppSelector(selectGameState);
  const ghostEnabled = useAppSelector(selectGhostPiece);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  const cols = 10;
  const rows = 20;
  const cellSize = 18; // px per cell
  const padding = 8;

  const width = useMemo(() => cols * cellSize + padding * 2, [cols]);
  const height = useMemo(() => rows * cellSize + padding * 2, [rows]);

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
    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key;
      const isRunning = game.status === "running";
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "] .includes(key)) {
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
          dispatch(rotateClockwise());
          break;
        case "z":
        case "Z":
          dispatch(rotateCounterClockwise());
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
    ctx.fillStyle = BG_COLOR;
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
        ctx.fillStyle = COLORS[val];
        ctx.fillRect(padding + x * cellSize + 1, padding + y * cellSize + 1, cellSize - 2, cellSize - 2);
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
      ctx.fillStyle = COLORS[frame.activePiece.type];
      for (const { x, y } of coords) {
        if (y < 0) continue;
        ctx.fillRect(padding + x * cellSize + 1, padding + y * cellSize + 1, cellSize - 2, cellSize - 2);
      }
    }
  }, [frame, width, height, cols, rows, ghostEnabled]);

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
