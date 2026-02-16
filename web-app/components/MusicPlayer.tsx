"use client";

import { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { motion } from "framer-motion";

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const playlist = [
      "/music/cny-upbeat-chinese-new-year.mp3",
      "/music/cny-chinese-new-year.mp3",
      "/music/cny-is-coming.mp3",
      "/music/cny-lunar-new-year.mp3",
    ];

    const randomSong = playlist[Math.floor(Math.random() * playlist.length)];
    const cacheBust = process.env.NODE_ENV === "development" ? `?v=${Date.now()}` : "";

    const audio = new Audio(`${randomSong}${cacheBust}`);
    audio.loop = true;
    audio.volume = 0.4;
    audioRef.current = audio;

    const tryPlay = () =>
      audio.play().then(() => {
        setIsPlaying(true);
      });

    tryPlay().catch(() => {
      setIsPlaying(false);
      const onFirstInteraction = () => {
        tryPlay().catch(() => {});
        window.removeEventListener("pointerdown", onFirstInteraction);
        window.removeEventListener("touchstart", onFirstInteraction);
      };
      window.addEventListener("pointerdown", onFirstInteraction, { once: true });
      window.addEventListener("touchstart", onFirstInteraction, { once: true });
    });

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    setIsPlaying((prev) => {
      if (prev) {
        audio.pause();
        return false;
      }
      audio.play().catch(() => {});
      return true;
    });
  };

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed top-4 right-4 z-50 p-3 bg-white/10 backdrop-blur-md border border-yellow-500/30 rounded-full text-yellow-400 hover:bg-white/20 transition shadow-lg"
      onClick={togglePlay}
      title={isPlaying ? "暂停音乐" : "播放音乐"}
    >
      {isPlaying ? <Volume2 size={24} /> : <VolumeX size={24} />}
    </motion.button>
  );
}
