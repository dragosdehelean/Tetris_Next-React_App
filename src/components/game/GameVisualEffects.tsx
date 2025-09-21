"use client";

import { useEffect, useRef } from "react";
import { useAppSelector } from "@/features/store/hooks";
import { selectFrame, selectGameState } from "@/features/game/gameSlice";
import { selectEffectsIntensity } from "@/features/settings/settingsSlice";
import { selectThemeName } from "@/features/theme/themeSlice";
import { THEME_PALETTES, type ThemeName } from "@/features/theme/themeOptions";

// Types for visual effects
interface ScorePopup {
  id: string;
  points: number;
  x: number;
  y: number;
  startTime: number;
  type: 'line-clear' | 'soft-drop' | 'hard-drop' | 'level-up' | 'tetris';
  linesCleared?: number;
}

interface ScreenEffect {
  id: string;
  type: 'flash' | 'pulse' | 'shake' | 'rainbow' | 'supernova';
  startTime: number;
  duration: number;
  intensity: number;
}

interface ParticleEffect {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

// Visual effects manager
class VisualEffectsManager {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private popups: ScorePopup[] = [];
  private screenEffects: ScreenEffect[] = [];
  private particles: ParticleEffect[] = [];
  private animationId: ReturnType<typeof setTimeout> | null = null;
  private theme: ThemeName = "neon";
  private readonly raf: (callback: FrameRequestCallback) => ReturnType<typeof setTimeout>;
  private readonly caf: (handle: ReturnType<typeof setTimeout>) => void;

  constructor() {
    this.raf = resolveRequestFrame();
    this.caf = resolveCancelFrame();
  }

  setCanvas(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    if (this.ctx) {
      // Set up canvas for better mobile rendering
      const devicePixelRatio = window.devicePixelRatio || 1;
      
      // Scale canvas for high DPI displays (mobile)
      if (devicePixelRatio > 1) {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * devicePixelRatio;
        canvas.height = rect.height * devicePixelRatio;
        this.ctx.scale(devicePixelRatio, devicePixelRatio);
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
      }
      
      console.log('Visual effects canvas initialized for mobile');
    }
  }

  setTheme(theme: ThemeName) {
    this.theme = theme;
  }

  addScorePopup(points: number, type: ScorePopup['type'], linesCleared?: number) {
    if (!this.canvas) {
      console.warn('Canvas not available for visual effects');
      return;
    }

    const popup: ScorePopup = {
      id: `popup-${Date.now()}-${Math.random()}`,
      points,
      x: this.canvas.width / 2,
      y: this.canvas.height / 2,
      startTime: performance.now(),
      type,
      linesCleared,
    };

    this.popups.push(popup);
    this.startAnimation();
    
    // Log for debugging on mobile
    console.log(`Visual effect added: ${type} +${points} points`);
  }

  addScreenEffect(type: ScreenEffect['type'], duration: number, intensity: number = 1) {
    const effect: ScreenEffect = {
      id: `effect-${Date.now()}-${Math.random()}`,
      type,
      startTime: performance.now(),
      duration,
      intensity,
    };

    this.screenEffects.push(effect);
    this.startAnimation();
  }

  addParticles(x: number, y: number, count: number, color: string) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = 2 + Math.random() * 3;

      const particle: ParticleEffect = {
        id: `particle-${Date.now()}-${i}`,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: 1,
        color,
        size: 2 + Math.random() * 3,
      };

      this.particles.push(particle);
    }
    this.startAnimation();
  }

  private spawnHypernovaSparks(multiplier: number, major: boolean) {
    if (!this.canvas) {
      return;
    }
    const palette = THEME_PALETTES.hypernova;
    const bursts = Math.max(4, Math.floor(8 * multiplier));
    const width = this.canvas.width;
    const height = this.canvas.height;
    for (let i = 0; i < bursts; i++) {
      const angle = ((i + 1) * 137.5 * Math.PI) / 180; // golden angle spread
      const radius = Math.min(width, height) * (0.12 + (i / Math.max(1, bursts)) * 0.32);
      const x = width / 2 + Math.cos(angle) * radius;
      const y = height / 2 + Math.sin(angle) * radius * 0.6;
      const color = major && i % 2 === 0
        ? hexToRgbaCss(palette.primary, 0.9)
        : hexToRgbaCss(palette.secondary, 0.75);
      this.addParticles(x, y, 4 + (major ? 4 : 2), color);
    }
  }

  private startAnimation() {
    if (this.animationId !== null) return;
    
    // Use RAF with fallback for mobile
    this.animate();
    console.log('Visual effects animation started');
  }

  private animate = () => {
    this.update();
    this.render();

    if (this.popups.length > 0 || this.screenEffects.length > 0 || this.particles.length > 0) {
      this.animationId = this.requestFrame(this.animate);
    } else {
      this.animationId = null;
      console.log('Visual effects animation stopped');
    }
  };

  private update() {
    const now = performance.now();

    // Update popups
    this.popups = this.popups.filter(popup => {
      const elapsed = now - popup.startTime;
      return elapsed < 2000; // 2 second lifetime
    });

    // Update screen effects
    this.screenEffects = this.screenEffects.filter(effect => {
      const elapsed = now - effect.startTime;
      return elapsed < effect.duration;
    });

    // Update particles
    this.particles = this.particles.filter(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.1; // gravity
      particle.life -= 0.016; // ~60fps decay
      return particle.life > 0;
    });
  }

  private render() {
    if (!this.ctx || !this.canvas) return;

    const now = performance.now();

    // Render screen effects
    for (const effect of this.screenEffects) {
      const elapsed = now - effect.startTime;
      const progress = elapsed / effect.duration;
      
      this.ctx.save();
      
      switch (effect.type) {
        case 'flash':
          this.ctx.fillStyle = `rgba(255, 255, 255, ${(1 - progress) * effect.intensity * 0.3})`;
          this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
          break;

        case 'pulse':
          const pulse = Math.sin(progress * Math.PI * 4) * (1 - progress);
          this.ctx.fillStyle = `rgba(255, 255, 255, ${pulse * effect.intensity * 0.2})`;
          this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
          break;

        case 'shake':
          const shake = (1 - progress) * effect.intensity * 5;
          this.ctx.translate(
            (Math.random() - 0.5) * shake,
            (Math.random() - 0.5) * shake
          );
          break;

        case 'rainbow':
          const hue = (progress * 360) % 360;
          this.ctx.fillStyle = `hsla(${hue}, 70%, 70%, ${(1 - progress) * effect.intensity * 0.1})`;
          this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
          break;

        case 'supernova': {
          if (!this.canvas) break;
          const width = this.canvas.width;
          const height = this.canvas.height;
          const centerX = width / 2;
          const centerY = height / 2;
          const radius = Math.max(width, height) * (0.45 + progress * 0.2);
          const palette = THEME_PALETTES.hypernova;
          const gradient = this.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
          gradient.addColorStop(0, hexToRgbaCss('#ffffff', Math.min(0.45, 0.4 * (1 - progress) * effect.intensity)));
          gradient.addColorStop(0.35, hexToRgbaCss(palette.primary, 0.35 * (1 - progress)));
          gradient.addColorStop(1, hexToRgbaCss(palette.secondary, 0));
          this.ctx.fillStyle = gradient;
          this.ctx.fillRect(0, 0, width, height);

          this.ctx.globalCompositeOperation = 'lighter';
          const beamCount = 6;
          for (let i = 0; i < beamCount; i++) {
            const angle = (Math.PI * 2 * i) / beamCount + progress * Math.PI * 0.75;
            const beamWidth = Math.max(2, Math.floor(Math.min(width, height) * 0.015));
            this.ctx.save();
            this.ctx.translate(centerX, centerY);
            this.ctx.rotate(angle);
            const length = Math.max(width, height) * (0.7 + 0.2 * (1 - progress));
            const beamGrad = this.ctx.createLinearGradient(0, 0, length, 0);
            beamGrad.addColorStop(0, hexToRgbaCss('#ffffff', 0.42 * (1 - progress)));
            beamGrad.addColorStop(0.4, hexToRgbaCss(palette.secondary, 0.32 * (1 - progress)));
            beamGrad.addColorStop(1, 'rgba(0,0,0,0)');
            this.ctx.fillStyle = beamGrad;
            this.ctx.fillRect(0, -beamWidth, length, beamWidth * 2);
            this.ctx.restore();
          }
          this.ctx.globalCompositeOperation = 'source-over';
          break;
        }
      }

      this.ctx.restore();
    }

    // Render particles
    for (const particle of this.particles) {
      this.ctx.save();
      this.ctx.globalAlpha = particle.life;
      this.ctx.fillStyle = particle.color;
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }

    // Render score popups
    for (const popup of this.popups) {
      const elapsed = now - popup.startTime;
      const progress = elapsed / 2000;
      
      this.ctx.save();
      
      // Position animation
      const y = popup.y - elapsed * 0.05; // Float upward
      const alpha = 1 - progress;
      const scale = 1 + Math.sin(progress * Math.PI) * 0.2;
      
      this.ctx.globalAlpha = alpha;
      this.ctx.translate(popup.x, y);
      this.ctx.scale(scale, scale);
      
      // Style based on type
      let color = '#ffffff';
      let text = `+${popup.points}`;
      let fontSize = 24;
      
      switch (popup.type) {
        case 'line-clear':
          if (popup.linesCleared === 4) {
            color = '#ff6b35'; // Orange for Tetris
            text = `TETRIS! +${popup.points}`;
            fontSize = 32;
          } else if (popup.linesCleared === 3) {
            color = '#ffd93d'; // Yellow for triple
            fontSize = 28;
          } else if (popup.linesCleared === 2) {
            color = '#6bcf7f'; // Green for double
            fontSize = 26;
          } else {
            color = '#74b9ff'; // Blue for single
          }
          break;
          
        case 'level-up':
          color = '#e17055';
          text = `LEVEL UP! +${popup.points}`;
          fontSize = 30;
          break;
          
        case 'soft-drop':
          color = '#fdcb6e';
          fontSize = 18;
          break;
          
        case 'hard-drop':
          color = '#fd79a8';
          fontSize = 20;
          break;
      }
      
      // Text with glow effect
      this.ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui`;
      this.ctx.textAlign = 'center';
      this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
      this.ctx.lineWidth = 3;
      this.ctx.strokeText(text, 0, 0);
      this.ctx.fillStyle = color;
      this.ctx.fillText(text, 0, 0);
      
      this.ctx.restore();
    }
  }

  triggerEffect(type: 'line-clear' | 'tetris' | 'level-up' | 'combo', intensity: number = 1) {
    switch (type) {
      case 'line-clear':
        this.addScreenEffect('flash', 300, intensity * 0.5);
        this.addScreenEffect('pulse', 500, intensity);
        if (this.theme === 'hypernova') {
          this.spawnHypernovaSparks(Math.max(0.6, intensity * 0.8), false);
        }
        break;

      case 'tetris':
        this.addScreenEffect('rainbow', 1000, intensity);
        if (this.theme === 'hypernova') {
          this.addScreenEffect('supernova', 1400, Math.max(1, intensity * 1.2));
          this.spawnHypernovaSparks(Math.max(1.2, intensity * 1.6), true);
        }
        this.addScreenEffect('shake', 500, intensity * 1.5);
        // Add celebratory particles
        if (this.canvas) {
          for (let i = 0; i < 20; i++) {
            const px = Math.random() * this.canvas.width;
            const py = (Math.random() * this.canvas.height) / 2;
            const color = this.theme === 'hypernova'
              ? (i % 2 === 0
                ? hexToRgbaCss(THEME_PALETTES.hypernova.primary, 0.85)
                : hexToRgbaCss(THEME_PALETTES.hypernova.secondary, 0.78))
              : `hsl(${Math.random() * 360}, 70%, 60%)`;
            this.addParticles(px, py, 3, color);
          }
        }
        break;

      case 'level-up':
        this.addScreenEffect('pulse', 800, intensity);
        this.addScreenEffect('flash', 200, intensity * 0.7);
        break;
        
      case 'combo':
        this.addScreenEffect('pulse', 400, intensity * 0.8);
        break;
    }
  }

  clear() {
    this.popups = [];
    this.screenEffects = [];
    this.particles = [];
    if (this.animationId !== null) {
      this.cancelFrame(this.animationId);
      this.animationId = null;
    }
  }

  private requestFrame(callback: FrameRequestCallback): ReturnType<typeof setTimeout> {
    return this.raf(callback);
  }

  private cancelFrame(handle: ReturnType<typeof setTimeout>) {
    this.caf(handle);
  }
}

// Global effects manager
const effectsManager = new VisualEffectsManager();

export function GameVisualEffects({ canvasRef }: { canvasRef: React.RefObject<HTMLCanvasElement | null> }) {
  const frame = useAppSelector(selectFrame);
  const game = useAppSelector(selectGameState);
  const effectsIntensity = useAppSelector(selectEffectsIntensity);
  const theme = useAppSelector(selectThemeName);
  
  const prevScoreRef = useRef<number>(0);
  const prevLinesRef = useRef<number>(0);
  const prevLevelRef = useRef<number>(1);
  const lastEffectTimeRef = useRef<number>(0);

  // Connect canvas to effects manager
  useEffect(() => {
    if (canvasRef.current) {
      effectsManager.setCanvas(canvasRef.current);
    }
  }, [canvasRef]);

  useEffect(() => {
    effectsManager.setTheme(theme);
  }, [theme]);

  // Clear effects when game resets
  useEffect(() => {
    if (game.status === 'idle' || game.status === 'gameOver') {
      effectsManager.clear();
    }
  }, [game.status]);

  // Track score changes and trigger visual effects
  useEffect(() => {
    if (!frame || game.status !== "running") return;

    const currentScore = frame.score;
    const currentLines = frame.clearedLines;
    const currentLevel = frame.level;
    const now = Date.now();

    // Prevent rapid fire effects (debounce)
    if (now - lastEffectTimeRef.current < 100) return;

    // Level up effects
    if (currentLevel > prevLevelRef.current) {
      effectsManager.addScorePopup(
        currentScore - prevScoreRef.current, 
        'level-up'
      );
      effectsManager.triggerEffect('level-up', 1.2 * effectsIntensity);
      lastEffectTimeRef.current = now;
    }

    // Line clear effects
    if (currentLines > prevLinesRef.current) {
      const linesCleared = currentLines - prevLinesRef.current;
      const pointsGained = currentScore - prevScoreRef.current;
      
      effectsManager.addScorePopup(pointsGained, 'line-clear', linesCleared);
      
      if (linesCleared === 4) {
        effectsManager.triggerEffect('tetris', 1.5 * effectsIntensity);
      } else {
        effectsManager.triggerEffect('line-clear', linesCleared * 0.5 * effectsIntensity);
      }
      
      lastEffectTimeRef.current = now;
    }
    
    // Soft drop / Hard drop effects (score increase without line clears)
    else if (currentScore > prevScoreRef.current && currentLines === prevLinesRef.current) {
      const scoreDiff = currentScore - prevScoreRef.current;
      
      if (scoreDiff > 10) {
        effectsManager.addScorePopup(scoreDiff, 'hard-drop');
      } else if (scoreDiff > 0) {
        effectsManager.addScorePopup(scoreDiff, 'soft-drop');
      }
      
      lastEffectTimeRef.current = now;
    }

    // Update refs
    prevScoreRef.current = currentScore;
    prevLinesRef.current = currentLines;
    prevLevelRef.current = currentLevel;
  }, [frame, game.status, effectsIntensity]);

  return null; // This component only manages visual effects
}

function resolveRequestFrame(): (callback: FrameRequestCallback) => ReturnType<typeof setTimeout> {
  if (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function") {
    const raf = window.requestAnimationFrame.bind(window);
    return (callback) => raf(callback) as unknown as ReturnType<typeof setTimeout>;
  }
  if (typeof globalThis.requestAnimationFrame === "function") {
    const raf = globalThis.requestAnimationFrame.bind(globalThis);
    return (callback) => raf(callback) as unknown as ReturnType<typeof setTimeout>;
  }
  return (callback) => setTimeout(() => callback(Date.now()), 16);
}

function resolveCancelFrame(): (handle: ReturnType<typeof setTimeout>) => void {
  if (typeof window !== "undefined" && typeof window.cancelAnimationFrame === "function") {
    const caf = window.cancelAnimationFrame.bind(window);
    return (handle) => caf(handle as unknown as number);
  }
  if (typeof globalThis.cancelAnimationFrame === "function") {
    const caf = globalThis.cancelAnimationFrame.bind(globalThis);
    return (handle) => caf(handle as unknown as number);
  }
  return (handle) => clearTimeout(handle);
}

function hexToRgbaCss(hex: string, alpha: number): string {
  const normalized = hex.replace('#', '');
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export { effectsManager };