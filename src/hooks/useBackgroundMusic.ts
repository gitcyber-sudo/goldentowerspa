import { useState, useEffect, useRef, useCallback } from 'react';

const STORAGE_KEY = 'gt_music_muted';
const MUSIC_SRC = '/endless-still-water.mp3';
const DEFAULT_VOLUME = 0.3;
const FADE_DURATION = 1500; // ms

/**
 * Global background music hook for the spa website.
 *
 * Handles:
 * - Autoplay policy: waits for first user interaction before playing
 * - Mute/unmute toggle with localStorage persistence
 * - Smooth volume fade-in on first play
 * - Infinite loop
 */
export function useBackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasStartedRef = useRef(false);

  const [isMuted, setIsMuted] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'true';
  });
  const [isPlaying, setIsPlaying] = useState(false);

  // Create audio element once
  useEffect(() => {
    const audio = new Audio(MUSIC_SRC);
    audio.loop = true;
    audio.volume = 0; // start silent for fade-in
    audio.preload = 'auto';
    audioRef.current = audio;

    // Sync state when audio actually plays/pauses
    audio.addEventListener('play', () => setIsPlaying(true));
    audio.addEventListener('pause', () => setIsPlaying(false));

    return () => {
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
      audio.pause();
      audio.src = '';
      audio.removeEventListener('play', () => setIsPlaying(true));
      audio.removeEventListener('pause', () => setIsPlaying(false));
    };
  }, []);

  // Smooth fade-in
  const fadeIn = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const targetVolume = DEFAULT_VOLUME;
    const steps = 30;
    const stepTime = FADE_DURATION / steps;
    const volumeIncrement = targetVolume / steps;
    let currentStep = 0;

    audio.volume = 0;

    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);

    fadeIntervalRef.current = setInterval(() => {
      currentStep++;
      const newVolume = Math.min(volumeIncrement * currentStep, targetVolume);
      audio.volume = newVolume;

      if (currentStep >= steps) {
        if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
        fadeIntervalRef.current = null;
      }
    }, stepTime);
  }, []);

  // Attempt to start playback
  const startPlayback = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || hasStartedRef.current) return;

    // If user previously muted, mark as started but don't play
    if (isMuted) {
      hasStartedRef.current = true;
      return;
    }

    audio.play().then(() => {
      hasStartedRef.current = true;
      fadeIn();
    }).catch(() => {
      // Autoplay blocked — will try again on next interaction
    });
  }, [isMuted, fadeIn]);

  // Listen for first user interaction to start playback
  useEffect(() => {
    if (hasStartedRef.current) return;

    const events = ['click', 'touchstart', 'scroll', 'keydown'] as const;

    const handler = () => {
      startPlayback();
      // Clean up after first successful interaction
      if (hasStartedRef.current) {
        events.forEach(e => document.removeEventListener(e, handler));
      }
    };

    events.forEach(e => document.addEventListener(e, handler, { once: false, passive: true }));

    return () => {
      events.forEach(e => document.removeEventListener(e, handler));
    };
  }, [startPlayback]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const newMuted = !isMuted;
    setIsMuted(newMuted);
    localStorage.setItem(STORAGE_KEY, String(newMuted));

    if (newMuted) {
      // Muting
      audio.pause();
    } else {
      // Unmuting — start playing if not already
      if (!hasStartedRef.current || audio.paused) {
        audio.volume = DEFAULT_VOLUME;
        audio.play().then(() => {
          hasStartedRef.current = true;
        }).catch(() => {
          // Still blocked
        });
      }
    }
  }, [isMuted]);

  return { isMuted, isPlaying, toggleMute };
}
