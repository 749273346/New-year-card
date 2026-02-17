"use client";

import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

export default function Fireworks() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isMounted = useRef(true);
  const audiosRef = useRef<Set<HTMLAudioElement>>(new Set());

  useEffect(() => {
    isMounted.current = true;
    const isWeChatWebView = () => {
      if (typeof navigator === "undefined") return false;
      return /MicroMessenger/i.test(navigator.userAgent);
    };

    if (isWeChatWebView() || window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) return;

    const duration = 15 * 1000;
    const animationEnd = Date.now() + duration;

    const stopAllAudio = () => {
      for (const a of audiosRef.current) {
        try {
          a.pause();
          a.currentTime = 0;
          a.src = "";
          a.load();
        } catch {}
      }
      audiosRef.current.clear();
      audioRef.current = null;
    };

    const handlePageHide = () => {
      if (!isMounted.current) return;
      stopAllAudio();
    };

    const handleVisibilityChange = () => {
      if (!isMounted.current) return;
      if (document.visibilityState !== "visible") {
        stopAllAudio();
      }
    };

    const handleFirstInteraction = () => {
      if (!isMounted.current) return;
      if (audioRef.current) return;
      // Strict check: if animation has ended, do not start sound
      if (Date.now() >= animationEnd) return;

      const audio = new Audio("/firework.mp3");
      audio.volume = 0.8;
      audio.loop = true; // Set loop to true initially
      audioRef.current = audio;
      audiosRef.current.add(audio);

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((e) => {
          if (!isMounted.current) return;
          try {
            audio.pause();
            audio.currentTime = 0;
          } catch {}
          audiosRef.current.delete(audio);
          if (audioRef.current === audio) audioRef.current = null;
          if (e.name !== "AbortError" && e.name !== "NotAllowedError") {
            console.warn("Audio play failed", e);
          }
        });
      }
    };

    // Auto play if possible, otherwise wait for interaction
    const autoAudio = new Audio("/firework.mp3");
    autoAudio.volume = 0.8;
    autoAudio.loop = true;
    audioRef.current = autoAudio;
    audiosRef.current.add(autoAudio);
    
    const playPromise = autoAudio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        if (!isMounted.current) return;
        try {
          autoAudio.pause();
          autoAudio.currentTime = 0;
        } catch {}
        audiosRef.current.delete(autoAudio);
        if (audioRef.current === autoAudio) audioRef.current = null;
        // If autoplay blocked, wait for interaction
        // Only attach listener if animation is still running
        if (Date.now() < animationEnd) {
          document.addEventListener("pointerdown", handleFirstInteraction, { once: true });
        }
      });
    }

    const isSmallScreen = window.innerWidth < 420;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: ReturnType<typeof setInterval> = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        // Stop sound when animation ends
        document.removeEventListener("pointerdown", handleFirstInteraction);
        stopAllAudio();
        return clearInterval(interval);
      }

      const baseCount = isSmallScreen ? 26 : 50;
      const particleCount = baseCount * (timeLeft / duration);
      // since particles fall down, start a bit higher than random
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, isSmallScreen ? 400 : 250);

    window.addEventListener("pagehide", handlePageHide);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
        isMounted.current = false;
        window.removeEventListener("pagehide", handlePageHide);
        document.removeEventListener("visibilitychange", handleVisibilityChange);
        clearInterval(interval);
        document.removeEventListener("pointerdown", handleFirstInteraction);
        stopAllAudio();
        confetti.reset();
    };
  }, []);

  return null;
}
