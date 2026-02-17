"use client";

import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

export default function Fireworks() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Play sound
    const audio = new Audio("/firework.mp3");
    audio.volume = 0.8;
    audio.loop = true; 
    audioRef.current = audio;

    // Handle loading errors
    audio.addEventListener('error', (e) => {
      // console.warn("Audio load error", e);
    });
    
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((e) => {
        // Ignore AbortError which happens if component unmounts quickly
        if (e.name !== 'AbortError' && e.name !== 'NotAllowedError') {
           console.warn("Audio play failed", e);
        }
      });
    }

    const duration = 15 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: ReturnType<typeof setInterval> = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        // Stop sound when animation ends
        if (audioRef.current) {
            // Fade out effect could be nice, but for now just pause
            audioRef.current.pause();
            audioRef.current = null;
        }
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      // since particles fall down, start a bit higher than random
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);

    return () => {
        clearInterval(interval);
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
    };
  }, []);

  return null;
}
