
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { getRandomBuiltinBackground } from "@/lib/backgrounds";

export default function Home() {
  const [name, setName] = useState("");
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();
  const [isWeChat, setIsWeChat] = useState(false);
  const [bgImageUrl, setBgImageUrl] = useState<string | null>(null);

  useEffect(() => {
    // Initialize with a built-in background immediately
    const initialBg = getRandomBuiltinBackground();
    setBgImageUrl(initialBg);

    // Try to fetch a new AI background in the background
    const fetchBg = async () => {
      try {
        const res = await fetch("/api/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            prompt: "一匹神采奕奕的骏马，奔腾，中国新年风格，红金色调，喜庆，高品质，艺术感，背景壁纸" 
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.imageUrl) setBgImageUrl(data.imageUrl);
        }
      } catch (e) {
        console.warn("Home background generation failed, keeping built-in:", e);
      }
    };
    fetchBg();
  }, []);

  useEffect(() => {
    // 客户端检测微信环境，避免服务端渲染 hydration mismatch
    // 使用 setTimeout 避免在 Effect 中同步更新状态导致的 cascading renders 警告
    if (typeof navigator !== "undefined" && /MicroMessenger/i.test(navigator.userAgent)) {
      setTimeout(() => setIsWeChat(true), 0);
    }
  }, []);

  useEffect(() => {
    if (isWeChat) return;
    router.prefetch("/card");
  }, [router, isWeChat]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isNavigating) return;

    setIsNavigating(true);
    (document.activeElement as HTMLElement | null)?.blur?.();

    const url = `/card?name=${encodeURIComponent(name)}${bgImageUrl ? `&bg=${encodeURIComponent(bgImageUrl)}` : ""}`;
    
    // 延迟 80ms 确保 Loading 遮罩层完成渲染上屏
    // 解决移动端点击后“假死”或无反馈的问题
    setTimeout(() => {
      router.push(url);
    }, 80);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-red-800 text-yellow-300 p-4 relative overflow-hidden">
      {/* Dynamic Background */}
      {bgImageUrl && (
        <div 
          className="absolute inset-0 z-0"
          style={{ 
            backgroundImage: `url('${bgImageUrl}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.6,
            mixBlendMode: 'overlay'
          }} 
        />
      )}
      
      {isNavigating && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-red-900/90 text-yellow-300 backdrop-blur-md">
          {/* Reuse background for continuity */}
          {bgImageUrl && (
             <div 
               className="absolute inset-0 z-[-1]"
               style={{ 
                 backgroundImage: `url('${bgImageUrl}')`,
                 backgroundSize: 'cover',
                 backgroundPosition: 'center',
                 opacity: 0.4,
                 filter: 'blur(8px)'
               }} 
             />
          )}
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-yellow-400 mb-4 z-10"></div>
          <p className="text-xl animate-pulse font-bold z-10">正在为您制作贺卡...</p>
          <p className="text-sm opacity-70 mt-2 z-10">请稍候，精彩即将呈现</p>
        </div>
      )}
      <div className="relative z-10 w-full flex flex-col items-center">
      {isWeChat ? (
        <h1 className="text-4xl font-bold mb-8 text-center">2026新年贺卡AI生成</h1>
      ) : (
        <motion.h1 
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl font-bold mb-8 text-center"
        >
          2026新年贺卡AI生成
        </motion.h1>
      )}

      {isWeChat ? (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 w-full max-w-md bg-white/10 p-8 rounded-xl border border-yellow-500/30 shadow-2xl"
        >
        <label htmlFor="name" className="text-lg text-center mb-2">
          请输入您的名字，开启专属祝福
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例如：杨昊"
          className="p-3 rounded-lg bg-white/20 border border-yellow-400/50 text-white placeholder-yellow-200/50 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-center text-xl"
          required
        />
        <button
          type="submit"
          disabled={isNavigating}
          className="mt-4 py-3 px-6 bg-yellow-500 hover:bg-yellow-400 text-red-900 font-bold rounded-lg shadow-lg transform transition hover:scale-105 active:scale-95"
        >
          {isNavigating ? "正在进入..." : "生成我的贺卡"}
        </button>
        </form>
      ) : (
        <motion.form 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 w-full max-w-md bg-white/10 p-8 rounded-xl backdrop-blur-sm sm:backdrop-blur-sm border border-yellow-500/30 shadow-2xl"
        >
          <label htmlFor="name" className="text-lg text-center mb-2">
            请输入您的名字，开启专属祝福
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例如：杨昊"
            className="p-3 rounded-lg bg-white/20 border border-yellow-400/50 text-white placeholder-yellow-200/50 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-center text-xl"
            required
          />
          <button
            type="submit"
            disabled={isNavigating}
            className="mt-4 py-3 px-6 bg-yellow-500 hover:bg-yellow-400 text-red-900 font-bold rounded-lg shadow-lg transform transition hover:scale-105 active:scale-95"
          >
            {isNavigating ? "正在进入..." : "生成我的贺卡"}
          </button>
        </motion.form>
      )}
      
      <div className="absolute bottom-4 text-xs text-yellow-500/50 flex items-center justify-center gap-2 z-10">
        <span>汕头水电车间 智轨先锋组</span>
        <span className="opacity-80 font-sans bg-black/10 px-1 rounded text-[10px]">v1.3</span>
      </div>
    </div>
    </div>
  );
}
