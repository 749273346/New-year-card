"use client";

import { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { motion } from "framer-motion";

export default function MusicPlayer() {
  const isWeChat = typeof navigator !== "undefined" && /MicroMessenger/i.test(navigator.userAgent);
  const [isPlaying, setIsPlaying] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (isWeChat) return;
    const playlist = [
      "/music/cny-upbeat-chinese-new-year.mp3",
      "/music/cny-chinese-new-year.mp3",
      "/music/cny-lunar-new-year.mp3",
      "/music/cny-is-coming.mp3",
    ];

    let currentIndex = Math.floor(Math.random() * playlist.length);
    const audio = new Audio(playlist[currentIndex]);
    audio.loop = true;
    audio.volume = 0.4;
    audioRef.current = audio;

    const tryPlay = () => audio.play().then(() => setIsPlaying(true));

    const switchToNext = () => {
      if (playlist.length <= 1) return;
      currentIndex = (currentIndex + 1) % playlist.length;
      audio.pause();
      audio.src = playlist[currentIndex];
      audio.load();
      tryPlay().catch(() => {});
    };

    const handleError = (e: Event) => {
      const target = e.target as HTMLAudioElement;
      console.error("Audio error:", target.error, target.src);
      // Only switch if it's a real error, not an abort
      if (target.error && target.error.code !== target.error.MEDIA_ERR_ABORTED) {
          switchToNext();
      }
    };

    audio.addEventListener("error", handleError);

    tryPlay().catch(() => {
      // Keep isPlaying as true to indicate intention to play
      // setIsPlaying(false); 
      const onFirstInteraction = () => {
        tryPlay().catch(() => {});
        window.removeEventListener("pointerdown", onFirstInteraction);
        window.removeEventListener("touchstart", onFirstInteraction);
      };
      window.addEventListener("pointerdown", onFirstInteraction, { once: true });
      window.addEventListener("touchstart", onFirstInteraction, { once: true });
    });

    return () => {
      audio.removeEventListener("error", handleError);
      audio.pause();
      audio.src = "";
    };
  }, [isWeChat]);

  const togglePlay = () => {
    if (isWeChat) return;
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

  if (isWeChat) return null;

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
