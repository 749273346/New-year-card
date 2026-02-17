
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function Home() {
  const [name, setName] = useState("");
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    router.prefetch("/card");
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isNavigating) return;

    setIsNavigating(true);
    (document.activeElement as HTMLElement | null)?.blur?.();

    const url = `/card?name=${encodeURIComponent(name)}`;
    // Use setTimeout to allow the UI to update (show loading spinner) before
    // the heavy lifting of navigation starts.
    setTimeout(() => {
      router.push(url);
    }, 10);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-red-800 text-yellow-300 p-4">
      {isNavigating && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-red-900 text-yellow-300">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-yellow-400 mb-4"></div>
          <p className="text-xl animate-pulse">正在为您制作新年贺卡...</p>
          <p className="text-sm opacity-70 mt-2">请稍候，即将进入贺卡页面</p>
        </div>
      )}
      <motion.h1 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-4xl font-bold mb-8 text-center"
      >
        2026新年贺卡AI生成
      </motion.h1>

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
      
      <div className="absolute bottom-4 text-xs text-yellow-500/50">
        汕头水电车间 智轨先锋组
      </div>
    </div>
  );
}
