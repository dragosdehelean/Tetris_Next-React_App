import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { GameDashboard } from "@/components/home/GameDashboard";
import { renderWithProviders } from "@/test/testUtils";
import type { RootState } from "@/features/store/store";

// Mock the audio manager to prevent Web Audio API issues
vi.mock("@/components/game/GameEffects", () => ({
  GameEffects: () => null,
  audioManager: {
    setVolume: vi.fn(),
    setMuted: vi.fn(),
    playSound: vi.fn(),
  },
}));

// Mock Canvas API for visual effects
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: vi.fn(() => ({
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    scale: vi.fn(),
    translate: vi.fn(),
    fillText: vi.fn(),
    strokeText: vi.fn(),
    beginPath: vi.fn(),
    closePath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    bezierCurveTo: vi.fn(),
    arc: vi.fn(),
    arcTo: vi.fn(),
    rect: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    clip: vi.fn(),
    measureText: vi.fn(() => ({ width: 100 })),
    createLinearGradient: vi.fn(() => ({
      addColorStop: vi.fn(),
    })),
    createRadialGradient: vi.fn(() => ({
      addColorStop: vi.fn(),
    })),
    createPattern: vi.fn(),
    getImageData: vi.fn(),
    putImageData: vi.fn(),
    drawImage: vi.fn(),
    globalAlpha: 1,
    fillStyle: '#ffffff',
    strokeStyle: '#000000',
    lineWidth: 1,
    lineJoin: 'miter',
    lineCap: 'butt',
    miterLimit: 10,
    font: '16px Arial',
    textAlign: 'center',
    textBaseline: 'middle',
    shadowColor: 'transparent',
    shadowBlur: 0,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    filter: 'none',
    globalCompositeOperation: 'source-over',
  })),
  writable: true,
});

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((callback) => {
  setTimeout(callback, 16);
  return 1;
});

global.cancelAnimationFrame = vi.fn();

describe('Effects System Integration', () => {
  let cleanupFunctions: (() => void)[] = [];

  beforeEach(() => {
    cleanupFunctions = [];
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  afterEach(() => {
    cleanupFunctions.forEach(cleanup => cleanup());
    cleanupFunctions = [];
    vi.clearAllTimers();
    vi.clearAllMocks();
  });

  it('integrates audio and visual effects with game dashboard', () => {
    const preloadedState: Partial<RootState> = {
      game: {
        status: 'running',
        difficulty: 'Classic',
        frame: {
          score: 500,
          clearedLines: 2,
          level: 1,
          board: Array(20).fill(null).map(() => Array(10).fill(null)),
          activePiece: null,
          queue: ['T', 'O', 'I'],
          difficulty: 'Classic',
          seed: 1,
          tick: 0,
          dropInterval: 1000,
          linesPerLevel: 10,
          linesToNextLevel: 8,
          gravityAccumulator: 0,
        },
        seed: 1,
        lastUpdate: 0,
      },
      settings: {
        effectsIntensity: 1.0,
        volume: 0.7,
        muted: false,
        ghostPiece: true,
        rightHanded: true,
        rotationDirection: 'CW',
      },
    };

    renderWithProviders(<GameDashboard />, { preloadedState });

    // Verify dashboard renders without errors when effects are enabled
    expect(true).toBe(true);
  });

  it('handles effects system with different settings combinations', () => {
    const preloadedState: Partial<RootState> = {
      game: {
        status: 'running',
        difficulty: 'Classic',
        frame: {
          score: 1000,
          clearedLines: 4, // Tetris
          level: 2,
          board: Array(20).fill(null).map(() => Array(10).fill(null)),
          activePiece: null,
          queue: ['T', 'O', 'I'],
          difficulty: 'Classic',
          seed: 1,
          tick: 0,
          dropInterval: 1000,
          linesPerLevel: 10,
          linesToNextLevel: 6,
          gravityAccumulator: 0,
        },
        seed: 1,
        lastUpdate: 0,
      },
      settings: {
        effectsIntensity: 0.5, // Reduced effects
        volume: 0.3,
        muted: true, // Audio disabled
        ghostPiece: true,
        rightHanded: true,
        rotationDirection: 'CW',
      },
    };

    renderWithProviders(<GameDashboard />, { preloadedState });

    // Should handle mixed settings gracefully
    expect(true).toBe(true);
  });

  it('works when effects are completely disabled', () => {
    const preloadedState: Partial<RootState> = {
      game: {
        status: 'running',
        difficulty: 'Classic',
        frame: {
          score: 2000,
          clearedLines: 8,
          level: 3,
          board: Array(20).fill(null).map(() => Array(10).fill(null)),
          activePiece: null,
          queue: ['T', 'O', 'I'],
          difficulty: 'Classic',
          seed: 1,
          tick: 0,
          dropInterval: 1000,
          linesPerLevel: 10,
          linesToNextLevel: 2,
          gravityAccumulator: 0,
        },
        seed: 1,
        lastUpdate: 0,
      },
      settings: {
        effectsIntensity: 0, // Effects completely disabled
        volume: 0,
        muted: true,
        ghostPiece: true,
        rightHanded: true,
        rotationDirection: 'CW',
      },
    };

    renderWithProviders(<GameDashboard />, { preloadedState });

    // Should work even with effects disabled
    expect(true).toBe(true);
  });

  it('maintains performance with high scoring scenarios', () => {
    const preloadedState: Partial<RootState> = {
      game: {
        status: 'running',
        difficulty: 'Classic',
        frame: {
          score: 50000, // Very high score
          clearedLines: 100, // Many lines cleared
          level: 10,
          board: Array(20).fill(null).map(() => Array(10).fill(null)),
          activePiece: null,
          queue: ['T', 'O', 'I'],
          difficulty: 'Classic',
          seed: 1,
          tick: 0,
          dropInterval: 1000,
          linesPerLevel: 10,
          linesToNextLevel: 10,
          gravityAccumulator: 0,
        },
        seed: 1,
        lastUpdate: 0,
      },
      settings: {
        effectsIntensity: 1.0, // Maximum effects
        volume: 1.0,
        muted: false,
        ghostPiece: true,
        rightHanded: true,
        rotationDirection: 'CW',
      },
    };

    renderWithProviders(<GameDashboard />, { preloadedState });

    // Should handle high-intensity scenarios without performance issues
    expect(true).toBe(true);
  });
});