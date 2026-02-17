"use client";

import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

export default function Fireworks() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const isWeChatWebView = () => {
      if (typeof navigator === "undefined") return false;
      return /MicroMessenger/i.test(navigator.userAgent);
    };

    if (isWeChatWebView() || window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) return;

    const handleFirstInteraction = () => {
      if (audioRef.current) return;

      const audio = new Audio("/firework.mp3");
      audio.volume = 0.8;
      audio.loop = true; // Set loop to true initially
      audioRef.current = audio;

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((e) => {
          if (e.name !== "AbortError" && e.name !== "NotAllowedError") {
            console.warn("Audio play failed", e);
          }
        });
      }
    };

    // Auto play if possible, otherwise wait for interaction
    const audio = new Audio("/firework.mp3");
    audio.volume = 0.8;
    audio.loop = true;
    audioRef.current = audio;
    
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // If autoplay blocked, wait for interaction
        audioRef.current = null; // Reset
        document.addEventListener("pointerdown", handleFirstInteraction, { once: true });
      });
    }

    const isSmallScreen = window.innerWidth < 420;
    const duration = 15 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: ReturnType<typeof setInterval> = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        // Stop sound when animation ends
        if (audioRef.current) {
           const fadeAudio = setInterval(() => {
              if (audioRef.current && audioRef.current.volume > 0.1) {
                  audioRef.current.volume -= 0.1;
              } else {
                  clearInterval(fadeAudio);
                  if (audioRef.current) {
                      audioRef.current.pause();
                      audioRef.current = null;
                  }
              }
           }, 100);
        }
        return clearInterval(interval);
      }

      const baseCount = isSmallScreen ? 26 : 50;
      const particleCount = baseCount * (timeLeft / duration);
      // since particles fall down, start a bit higher than random
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, isSmallScreen ? 400 : 250);

    return () => {
        clearInterval(interval);
        document.removeEventListener("pointerdown", handleFirstInteraction);
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
    };
  }, []);

  return null;
}
