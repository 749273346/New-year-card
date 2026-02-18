"use client";

import { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { motion } from "framer-motion";

// 扩展 Window 接口以包含 WeixinJSBridge
declare global {
  interface Window {
    WeixinJSBridge: {
      invoke: (
        action: string,
        data: Record<string, unknown>,
        callback: () => void
      ) => void;
    };
  }
}

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // 1. 初始化音频对象
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

    // 2. 核心播放逻辑
    const playAudio = async () => {
      try {
        if (audio.paused) {
          await audio.play();
          setIsPlaying(true);
          // 播放成功后移除交互监听
          removeInteractionListeners();
        }
      } catch (err) {
        console.log("Autoplay prevented:", err);
        setIsPlaying(false);
      }
    };

    // 3. 微信特定处理 (大厂常用 Hack: 通过 invoke getNetworkType 触发)
    const handleWeixinPlay = () => {
      playAudio();
      if (typeof window !== "undefined" && window.WeixinJSBridge) {
        window.WeixinJSBridge.invoke(
          "getNetworkType",
          {},
          () => {
            playAudio();
          }
        );
      }
    };

    // 4. 用户交互处理
    const handleInteraction = () => {
      playAudio();
    };

    // 添加监听器
    const addInteractionListeners = () => {
      // 使用 capture: true 确保尽早捕获事件
      document.addEventListener("click", handleInteraction, { capture: true, once: true });
      document.addEventListener("touchstart", handleInteraction, { capture: true, once: true });
      document.addEventListener("keydown", handleInteraction, { capture: true, once: true });
      document.addEventListener("scroll", handleInteraction, { capture: true, once: true });
    };

    const removeInteractionListeners = () => {
      document.removeEventListener("click", handleInteraction, { capture: true });
      document.removeEventListener("touchstart", handleInteraction, { capture: true });
      document.removeEventListener("keydown", handleInteraction, { capture: true });
      document.removeEventListener("scroll", handleInteraction, { capture: true });
    };

    // 5. 初始化执行
    // 立即尝试播放
    playAudio();

    // 监听微信 Bridge
    if (typeof window !== "undefined" && window.WeixinJSBridge) {
      handleWeixinPlay();
    } else {
      document.addEventListener("WeixinJSBridgeReady", handleWeixinPlay, { once: true });
    }

    // 监听用户交互
    addInteractionListeners();

    // 清理函数
    return () => {
      audio.pause();
      audio.src = ""; // 释放资源
      removeInteractionListeners();
      document.removeEventListener("WeixinJSBridgeReady", handleWeixinPlay);
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
