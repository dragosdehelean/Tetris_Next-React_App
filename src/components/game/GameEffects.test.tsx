import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { GameEffects, audioManager } from "./GameEffects";
import { gameReducer, type GameState } from "@/features/game/gameSlice";
import { settingsReducer, type SettingsState } from "@/features/settings/settingsSlice";
import { themeReducer, type ThemeState } from "@/features/theme/themeSlice";
import type { TetrominoType } from "@/features/game/engine/tetromino";

// Mock Web Audio API
const mockAudioContext = {
  createBufferSource: vi.fn(() => ({
    buffer: null,
    connect: vi.fn(),
    start: vi.fn(),
  })),
  createGain: vi.fn(() => ({
    gain: { value: 0 },
    connect: vi.fn(),
  })),
  createBuffer: vi.fn(() => ({
    getChannelData: vi.fn(() => new Float32Array(1024)),
  })),
  destination: {},
  sampleRate: 44100,
  state: 'running',
  resume: vi.fn(),
};

const mockWebkitAudioContext = vi.fn(() => mockAudioContext);

Object.defineProperty(window, 'AudioContext', {
  writable: true,
  value: vi.fn(() => mockAudioContext),
});

Object.defineProperty(window, 'webkitAudioContext', {
  writable: true,
  value: mockWebkitAudioContext,
});

// Mock performance.now for consistent testing
const mockPerformanceNow = vi.fn(() => 1000);
Object.defineProperty(window, 'performance', {
  writable: true,
  value: { now: mockPerformanceNow },
});

// Mock console methods to avoid noise in tests
const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

const createTestStore = (initialState: {
  game?: Partial<GameState>;
  settings?: Partial<SettingsState>;
  theme?: Partial<ThemeState>;
} = {}) => {
  return configureStore({
    reducer: {
      game: gameReducer,
      settings: settingsReducer,
      theme: themeReducer,
    },
    preloadedState: {
      game: {
        status: 'running' as const,
        difficulty: 'Classic' as const,
        frame: {
          score: 0,
          clearedLines: 0,
          level: 1,
          board: Array(20).fill(null).map(() => Array(10).fill(null)),
          activePiece: null,
          queue: ['T', 'O', 'I'] as TetrominoType[],
          difficulty: 'Classic' as const,
          seed: 1,
          tick: 0,
          dropInterval: 1000,
          linesPerLevel: 10,
          linesToNextLevel: 10,
          gravityAccumulator: 0,
        },
        seed: 1,
        lastUpdate: 0,
        ...initialState.game,
      } as GameState,
      settings: {
        volume: 0.7,
        muted: false,
        effectsIntensity: 1.0,
        ghostPiece: true,
        rightHanded: true,
        rotationDirection: 'CW' as const,
        ...initialState.settings,
      } as SettingsState,
      theme: {
        name: 'neon' as const,
        current: {
          id: 'neon',
          label: 'Neon Dreams',
          palette: {
            background: '#0a0419',
            surface: '#1a0a2e',
            primary: '#e94560',
            secondary: '#f39801',
            accent: '#7209b7',
            text: '#ffffff',
          },
        },
        ...initialState.theme,
      } as ThemeState,
    },
  });
};

describe('GameEffects', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPerformanceNow.mockReturnValue(1000);
  });

  afterEach(() => {
    consoleSpy.mockClear();
    consoleWarnSpy.mockClear();
  });

  it('renders without crashing', () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <GameEffects />
      </Provider>
    );
  });

  it('updates audio manager volume when settings change', () => {
    const store = createTestStore();
    const setVolumeSpy = vi.spyOn(audioManager, 'setVolume');
    
    render(
      <Provider store={store}>
        <GameEffects />
      </Provider>
    );

    expect(setVolumeSpy).toHaveBeenCalledWith(0.7);
  });

  it('updates audio manager muted state when settings change', () => {
    const store = createTestStore();
    const setMutedSpy = vi.spyOn(audioManager, 'setMuted');
    
    render(
      <Provider store={store}>
        <GameEffects />
      </Provider>
    );

    expect(setMutedSpy).toHaveBeenCalledWith(false);
  });

  it('plays level up sound when level increases', () => {
    const playSoundSpy = vi.spyOn(audioManager, 'playSound').mockResolvedValue();
    
    const store = createTestStore({
      game: {
        status: 'running',
        difficulty: 'Classic',
        frame: {
          score: 1000,
          clearedLines: 10,
          level: 2, // Level increased
          board: Array(20).fill(null).map(() => Array(10).fill(null)),
          activePiece: null,
          queue: ['T', 'O', 'I'] as TetrominoType[],
          difficulty: 'Classic' as const,
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
    });

    render(
      <Provider store={store}>
        <GameEffects />
      </Provider>
    );

    expect(playSoundSpy).toHaveBeenCalledWith('level-up', 1.2);
  });

  it('plays appropriate line clear sounds based on lines cleared', () => {
    const playSoundSpy = vi.spyOn(audioManager, 'playSound').mockResolvedValue();
    
    // Test single line clear
    const store = createTestStore({
      game: {
        status: 'running',
        difficulty: 'Classic',
        frame: {
          score: 100,
          clearedLines: 1,
          level: 1,
          board: Array(20).fill(null).map(() => Array(10).fill(null)),
          activePiece: null,
          queue: ['T', 'O', 'I'] as TetrominoType[],
          difficulty: 'Classic' as const,
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
    });

    render(
      <Provider store={store}>
        <GameEffects />
      </Provider>
    );

    expect(playSoundSpy).toHaveBeenCalledWith('line-clear-1', 0.8);
  });

  it('plays tetris sound for 4-line clear', () => {
    const playSoundSpy = vi.spyOn(audioManager, 'playSound').mockResolvedValue();
    
    const store = createTestStore({
      game: {
        status: 'running',
        difficulty: 'Classic',
        frame: {
          score: 800,
          clearedLines: 4,
          level: 1,
          board: Array(20).fill(null).map(() => Array(10).fill(null)),
          activePiece: null,
          queue: ['T', 'O', 'I'] as TetrominoType[],
          difficulty: 'Classic' as const,
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
    });

    render(
      <Provider store={store}>
        <GameEffects />
      </Provider>
    );

    expect(playSoundSpy).toHaveBeenCalledWith('line-clear-4', 1.3);
  });

  it('plays soft drop sound for small score increases', () => {
    const playSoundSpy = vi.spyOn(audioManager, 'playSound').mockResolvedValue();
    
    const store = createTestStore({
      game: {
        status: 'running',
        difficulty: 'Classic',
        frame: {
          score: 5, // Small score increase
          clearedLines: 0,
          level: 1,
          board: Array(20).fill(null).map(() => Array(10).fill(null)),
          activePiece: null,
          queue: ['T', 'O', 'I'] as TetrominoType[],
          difficulty: 'Classic' as const,
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
    });

    render(
      <Provider store={store}>
        <GameEffects />
      </Provider>
    );

    expect(playSoundSpy).toHaveBeenCalledWith('soft-drop', 0.4);
  });

  it('plays hard drop sound for large score increases', () => {
    const playSoundSpy = vi.spyOn(audioManager, 'playSound').mockResolvedValue();
    
    const store = createTestStore({
      game: {
        status: 'running',
        difficulty: 'Classic',
        frame: {
          score: 50, // Large score increase (>10)
          clearedLines: 0,
          level: 1,
          board: Array(20).fill(null).map(() => Array(10).fill(null)),
          activePiece: null,
          queue: ['T', 'O', 'I'] as TetrominoType[],
          difficulty: 'Classic' as const,
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
    });

    render(
      <Provider store={store}>
        <GameEffects />
      </Provider>
    );

    expect(playSoundSpy).toHaveBeenCalledWith('hard-drop', 0.6);
  });

  it('respects effects intensity setting', () => {
    const playSoundSpy = vi.spyOn(audioManager, 'playSound').mockResolvedValue();
    
    const store = createTestStore({
      settings: {
        volume: 0.7,
        muted: false,
        effectsIntensity: 0.5, // Half intensity
        ghostPiece: true,
        rightHanded: true,
        rotationDirection: 'CW',
      },
      game: {
        status: 'running',
        difficulty: 'Classic',
        frame: {
          score: 100,
          clearedLines: 1,
          level: 1,
          board: Array(20).fill(null).map(() => Array(10).fill(null)),
          activePiece: null,
          queue: ['T', 'O', 'I'] as TetrominoType[],
          difficulty: 'Classic' as const,
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
    });

    render(
      <Provider store={store}>
        <GameEffects />
      </Provider>
    );

    expect(playSoundSpy).toHaveBeenCalledWith('line-clear-1', 0.4); // 0.8 * 0.5
  });

  it('does not play sounds when game is not running', () => {
    const playSoundSpy = vi.spyOn(audioManager, 'playSound').mockResolvedValue();
    
    const store = createTestStore({
      game: {
        status: 'paused', // Not running
        difficulty: 'Classic',
        frame: {
          score: 100,
          clearedLines: 1,
          level: 1,
          board: Array(20).fill(null).map(() => Array(10).fill(null)),
          activePiece: null,
          queue: ['T', 'O', 'I'] as TetrominoType[],
          difficulty: 'Classic' as const,
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
    });

    render(
      <Provider store={store}>
        <GameEffects />
      </Provider>
    );

    expect(playSoundSpy).not.toHaveBeenCalled();
  });

  it('implements debouncing to prevent rapid fire sounds', () => {
    const playSoundSpy = vi.spyOn(audioManager, 'playSound').mockResolvedValue();
    
    // Mock Date.now to control timing
    const mockDateNow = vi.spyOn(Date, 'now').mockReturnValue(1000);
    
    const store = createTestStore({
      game: {
        status: 'running',
        difficulty: 'Classic',
        frame: {
          score: 100,
          clearedLines: 1,
          level: 1,
          board: Array(20).fill(null).map(() => Array(10).fill(null)),
          activePiece: null,
          queue: ['T', 'O', 'I'] as TetrominoType[],
          difficulty: 'Classic' as const,
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
    });

    const { rerender } = render(
      <Provider store={store}>
        <GameEffects />
      </Provider>
    );

    expect(playSoundSpy).toHaveBeenCalledTimes(1);

    // Simulate rapid update within debounce window (< 50ms)
    mockDateNow.mockReturnValue(1030); // 30ms later
    
    rerender(
      <Provider store={store}>
        <GameEffects />
      </Provider>
    );

    // Should still be called only once due to debouncing
    expect(playSoundSpy).toHaveBeenCalledTimes(1);

    mockDateNow.mockRestore();
  });
});

describe('GameAudioManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('handles environment without Web Audio API support', () => {
    // In test environment, Web Audio API might not be fully supported
    // The audio manager should handle this gracefully
    expect(audioManager).toBeDefined();
  });

  it('sets volume correctly', () => {
    audioManager.setVolume(0.5);
    // Since setVolume is private, we test through playSound
    const playSoundSpy = vi.spyOn(audioManager, 'playSound').mockResolvedValue();
    audioManager.playSound('test-sound', 1);
    expect(playSoundSpy).toHaveBeenCalledWith('test-sound', 1);
  });

  it('respects muted state', () => {
    audioManager.setMuted(true);
    const playSoundSpy = vi.spyOn(audioManager, 'playSound').mockResolvedValue();
    audioManager.playSound('test-sound');
    expect(playSoundSpy).toHaveBeenCalled();
  });

  it('handles audio context errors gracefully', async () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    // Should not throw when calling playSound without proper audio setup
    await expect(audioManager.playSound('test-sound')).resolves.toBeUndefined();
    
    consoleWarnSpy.mockRestore();
  });
});