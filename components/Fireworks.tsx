"use client";

import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

export default function Fireworks() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Play sound
    const audio = new Audio("/firework.mp3");
    audio.volume = 0.8;
    // Assume we want it to continue as long as fireworks are visible, loop if necessary
    // But user said sound didn't end, implying it was too long. 
    // So maybe we don't force loop, but we definitely cut it off.
    // However, for continuous fireworks, looping is usually better if the clip is short.
    // Let's set loop to true to match the 15s duration visually.
    audio.loop = true; 
    audioRef.current = audio;
    
    // User interaction policy might block auto-play, but since user just clicked "Generate", it might work.
    // If not, we catch the error.
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((e) => {
        // Ignore AbortError which happens if component unmounts quickly
        if (e.name !== 'AbortError') {
          // console.log("Audio play failed", e);
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
