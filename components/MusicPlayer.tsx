"use client";

import { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { motion } from "framer-motion";

declare global {
  interface Window {
    WeixinJSBridge?: unknown;
  }
}

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const playlist = [
      "/music/cny-upbeat-chinese-new-year.mp3",
      "/music/cny-chinese-new-year.mp3",
      "/music/cny-lunar-new-year.mp3",
      "/music/cny-is-coming.mp3",
    ];

    const randomIndex = Math.floor(Math.random() * playlist.length);
    const audio = new Audio(playlist[randomIndex]);
    audio.loop = true;
    audio.volume = 0.4;
    audioRef.current = audio;

    const requestPlay = async () => {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
    };

    const unlockPlay = () => {
      void requestPlay();
    };

    void requestPlay();

    if (typeof window !== "undefined" && window.WeixinJSBridge) {
      unlockPlay();
    } else {
      document.addEventListener("WeixinJSBridgeReady", unlockPlay, { once: true });
    }

    window.addEventListener("touchstart", unlockPlay, { once: true, passive: true });
    window.addEventListener("pointerdown", unlockPlay, { once: true });

    return () => {
      audio.pause();
      audio.src = "";
      document.removeEventListener("WeixinJSBridgeReady", unlockPlay);
      window.removeEventListener("touchstart", unlockPlay);
      window.removeEventListener("pointerdown", unlockPlay);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed top-4 right-4 z-50 p-3 bg-black/20 backdrop-blur-md border border-yellow-500/30 rounded-full text-yellow-400 hover:bg-black/30 transition shadow-lg"
      onClick={togglePlay}
      title={isPlaying ? "暂停音乐" : "播放音乐"}
    >
      {isPlaying ? <Volume2 size={24} /> : <VolumeX size={24} />}
    </motion.button>
  );
}
