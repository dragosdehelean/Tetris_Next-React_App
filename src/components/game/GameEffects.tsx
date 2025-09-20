"use client";

import { useEffect, useRef } from "react";
import { useAppSelector } from "@/features/store/hooks";
import { selectFrame, selectGameState } from "@/features/game/gameSlice";
import { selectVolume, selectMuted, selectEffectsIntensity } from "@/features/settings/settingsSlice";

// Audio context and sound management
class GameAudioManager {
  private audioContext: AudioContext | null = null;
  private volume = 0.7;
  private muted = false;
  private soundCache = new Map<string, AudioBuffer>();
  private isInitialized = false;
  private isUserInteracted = false;

  constructor() {
    if (typeof window !== "undefined") {
      this.initializeAudio();
      // Listen for user interaction to enable audio on mobile
      this.setupUserInteractionListener();
    }
  }

  private setupUserInteractionListener() {
    const enableAudio = async () => {
      if (!this.isUserInteracted) {
        this.isUserInteracted = true;
        await this.resumeAudioContext();
        // Remove listeners after first interaction
        document.removeEventListener('touchstart', enableAudio);
        document.removeEventListener('click', enableAudio);
        document.removeEventListener('keydown', enableAudio);
      }
    };

    // Listen for various user interactions
    document.addEventListener('touchstart', enableAudio, { passive: true });
    document.addEventListener('click', enableAudio);
    document.addEventListener('keydown', enableAudio);
  }

  private async resumeAudioContext() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
        console.log('Audio context resumed for mobile');
      } catch (error) {
        console.warn('Failed to resume audio context:', error);
      }
    }
  }

  private async initializeAudio() {
    try {
      // Use a more robust audio context creation
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) {
        console.warn('Web Audio API not supported');
        return;
      }
      
      this.audioContext = new AudioContextClass();
      await this.loadSounds();
      this.isInitialized = true;
      console.log('Audio initialized successfully');
    } catch (error) {
      console.warn("Audio initialization failed:", error);
    }
  }

  private async loadSounds() {
    const sounds = {
      // Point gaining sounds
      'line-clear-1': this.generateTone(523.25, 0.15), // C5 - Single line
      'line-clear-2': this.generateChord([523.25, 659.25], 0.2), // C5 + E5 - Double  
      'line-clear-3': this.generateChord([523.25, 659.25, 783.99], 0.25), // C5 + E5 + G5 - Triple
      'line-clear-4': this.generateChord([523.25, 659.25, 783.99, 1046.50], 0.4), // Full C major - Tetris!
      'soft-drop': this.generateTone(220, 0.05), // A3 - Quick drop sound
      'hard-drop': this.generateTone(130.81, 0.1), // C3 - Thud sound
      'level-up': this.generateArpeggio([523.25, 659.25, 783.99, 1046.50], 0.6), // Ascending arpeggio
      'combo': this.generateTone(1046.50, 0.2), // C6 - High pitched reward
    };

    for (const [name, generator] of Object.entries(sounds)) {
      this.soundCache.set(name, await generator);
    }
  }

  private async generateTone(frequency: number, duration: number): Promise<AudioBuffer> {
    if (!this.audioContext) throw new Error("Audio context not initialized");
    
    const sampleRate = this.audioContext.sampleRate;
    const length = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      // Generate a pleasant sine wave with envelope
      const envelope = Math.exp(-t * 3); // Exponential decay
      data[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.3;
    }

    return buffer;
  }

  private async generateChord(frequencies: number[], duration: number): Promise<AudioBuffer> {
    if (!this.audioContext) throw new Error("Audio context not initialized");
    
    const sampleRate = this.audioContext.sampleRate;
    const length = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 2.5);
      let sample = 0;
      
      for (const freq of frequencies) {
        sample += Math.sin(2 * Math.PI * freq * t);
      }
      
      data[i] = (sample / frequencies.length) * envelope * 0.25;
    }

    return buffer;
  }

  private async generateArpeggio(frequencies: number[], duration: number): Promise<AudioBuffer> {
    if (!this.audioContext) throw new Error("Audio context not initialized");
    
    const sampleRate = this.audioContext.sampleRate;
    const length = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    
    const noteLength = length / frequencies.length;

    for (let i = 0; i < length; i++) {
      const noteIndex = Math.floor(i / noteLength);
      const noteTime = (i % noteLength) / sampleRate;
      const frequency = frequencies[noteIndex] || frequencies[frequencies.length - 1];
      
      const envelope = Math.exp(-noteTime * 4);
      data[i] = Math.sin(2 * Math.PI * frequency * noteTime) * envelope * 0.3;
    }

    return buffer;
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  setMuted(muted: boolean) {
    this.muted = muted;
  }

  async playSound(soundName: string, volumeMultiplier = 1) {
    if (!this.audioContext || this.muted || this.volume === 0) return;

    try {
      // Ensure audio context is ready and user has interacted
      if (!this.isInitialized) {
        console.warn('Audio not initialized');
        return;
      }

      // Resume audio context if suspended (required by modern browsers, especially mobile)
      await this.resumeAudioContext();

      const buffer = this.soundCache.get(soundName);
      if (!buffer) {
        console.warn(`Sound buffer not found: ${soundName}`);
        return;
      }

      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      
      source.buffer = buffer;
      gainNode.gain.value = this.volume * volumeMultiplier;
      
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      source.start();
      
      // Log successful sound play for debugging
      console.log(`Playing sound: ${soundName} at volume ${this.volume * volumeMultiplier}`);
    } catch (error) {
      console.warn(`Failed to play sound ${soundName}:`, error);
    }
  }
}

// Global audio manager instance
const audioManager = new GameAudioManager();

export function GameEffects() {
  const frame = useAppSelector(selectFrame);
  const game = useAppSelector(selectGameState);
  const volume = useAppSelector(selectVolume);
  const muted = useAppSelector(selectMuted);
  const effectsIntensity = useAppSelector(selectEffectsIntensity);
  
  const prevScoreRef = useRef<number>(0);
  const prevLinesRef = useRef<number>(0);
  const prevLevelRef = useRef<number>(1);
  const lastSoundTimeRef = useRef<number>(0);

  // Update audio settings
  useEffect(() => {
    audioManager.setVolume(volume);
    audioManager.setMuted(muted);
  }, [volume, muted]);

  // Track score changes and play appropriate sounds
  useEffect(() => {
    if (!frame || game.status !== "running") return;

    const currentScore = frame.score;
    const currentLines = frame.clearedLines;
    const currentLevel = frame.level;
    const now = Date.now();

    // Prevent rapid fire sounds (debounce)
    if (now - lastSoundTimeRef.current < 50) return;

    // Level up sound
    if (currentLevel > prevLevelRef.current) {
      audioManager.playSound('level-up', 1.2 * effectsIntensity);
      lastSoundTimeRef.current = now;
    }

    // Line clear sounds
    if (currentLines > prevLinesRef.current) {
      const linesCleared = currentLines - prevLinesRef.current;
      let soundName = 'line-clear-1';
      let volumeMultiplier = 0.8;

      switch (linesCleared) {
        case 1:
          soundName = 'line-clear-1';
          volumeMultiplier = 0.8;
          break;
        case 2:
          soundName = 'line-clear-2';
          volumeMultiplier = 1.0;
          break;
        case 3:
          soundName = 'line-clear-3';
          volumeMultiplier = 1.1;
          break;
        case 4:
          soundName = 'line-clear-4'; // TETRIS!
          volumeMultiplier = 1.3;
          break;
      }

      audioManager.playSound(soundName, volumeMultiplier * effectsIntensity);
      lastSoundTimeRef.current = now;
    }

    // Soft drop / Hard drop sounds (score increase without line clears)
    else if (currentScore > prevScoreRef.current && currentLines === prevLinesRef.current) {
      const scoreDiff = currentScore - prevScoreRef.current;
      
      // Large score difference indicates hard drop
      if (scoreDiff > 10) {
        audioManager.playSound('hard-drop', 0.6 * effectsIntensity);
      }
      // Small score difference indicates soft drop
      else if (scoreDiff > 0) {
        audioManager.playSound('soft-drop', 0.4 * effectsIntensity);
      }
      
      lastSoundTimeRef.current = now;
    }

    // Update refs
    prevScoreRef.current = currentScore;
    prevLinesRef.current = currentLines;
    prevLevelRef.current = currentLevel;
  }, [frame, game.status, effectsIntensity]);

  return null; // This component only handles audio effects
}

export { audioManager };