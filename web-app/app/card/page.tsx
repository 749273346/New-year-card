
"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import html2canvas from "html2canvas";
import Fireworks from "@/components/Fireworks";
import { Download, RefreshCw } from "lucide-react";

export default function CardPage() {
  const searchParams = useSearchParams();
  const name = searchParams.get("name");
  
  const [greeting, setGreeting] = useState<{ poem: string[]; wish: string } | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!name) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        // Randomly select a local background image
        const bgImages = [
          "/backgrounds/bg1.jpg",
          "/backgrounds/bg2.jpg",
          "/backgrounds/bg3.jpg",
          "/backgrounds/bg4.jpg",
          "/backgrounds/bg5.jpg",
          "/backgrounds/bg6.jpg"
        ];
        const randomBg = bgImages[Math.floor(Math.random() * bgImages.length)];
        // Preload image to avoid flicker
        const img = new Image();
        img.src = randomBg;
        
        // Fetch greeting
        const greetingRes = await fetch("/api/generate-greeting", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        });

        if (!greetingRes.ok) throw new Error("Failed to generate greeting");
        const greetingData = await greetingRes.json();
        setGreeting(greetingData);

        // Set the local image
        setImageUrl(randomBg);

      } catch (err) {
        console.error(err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Something went wrong");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [name]);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, {
        useCORS: true, // Important for external images
        scale: 2, // Better quality
        backgroundColor: null,
      });
      const link = document.createElement("a");
      link.download = `${name}-NewYearCard.png`;
      link.href = canvas.toDataURL("image/png");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Download failed:", err);
      alert("保存图片失败，请尝试长按截图");
    }
  };

  if (!name) {
    return <div className="text-white text-center mt-20">Please provide a name.</div>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-red-900 text-yellow-300">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-yellow-400 mb-4"></div>
        <p className="text-xl animate-pulse">正在为您调制新年祝福...</p>
        <p className="text-sm opacity-70 mt-2">AI 正在撰写藏头诗 & 绘制贺卡</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-red-900 text-white p-4">
        <div className="bg-red-800 p-6 rounded-lg border border-red-600 max-w-md text-center">
          <h2 className="text-2xl font-bold mb-2">生成失败</h2>
          <p className="mb-4 opacity-80">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-yellow-500 text-red-900 rounded-md font-bold hover:bg-yellow-400"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-900 via-red-800 to-red-950 flex flex-col items-center py-8 px-4 overflow-hidden relative">
      <Fireworks />
      
          {/* Card Wrapper for Motion */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-sm md:max-w-md relative z-10"
      >
        <div 
          ref={cardRef}
            className="bg-white/10 backdrop-blur-md border-2 border-yellow-500/30 rounded-2xl overflow-hidden shadow-2xl relative w-full h-full min-h-[600px]"
            style={{
              backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
              background: !imageUrl ? "linear-gradient(135deg, #8B0000 0%, #B22222 50%, #FF0000 100%)" : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
          {/* Overlay for readability */}
          <div className="absolute inset-0 bg-black/30 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

          <div className="relative z-20 p-8 text-center text-yellow-100 min-h-[500px] flex flex-col justify-between">
            {/* Header */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h1 className="text-3xl font-bold text-yellow-400 drop-shadow-lg font-serif">
                ✨ 新年快乐 ✨
              </h1>
              <p className="text-sm opacity-80 mt-1">2026 丙午马年</p>
            </motion.div>

            {/* Content */}
            <div className="my-8 space-y-6">
              <motion.div 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.8, type: "spring" }}
                className="inline-block px-6 py-2 border-y-2 border-yellow-500/50 bg-black/20 backdrop-blur-sm rounded-full"
              >
                <h2 className="text-4xl font-bold text-white drop-shadow-md">{name}</h2>
              </motion.div>

              <div className="space-y-3 font-serif text-lg md:text-xl leading-relaxed text-yellow-50 drop-shadow-md">
                {greeting?.poem.map((line, index) => (
                  <motion.p
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.2 + index * 0.3 }}
                    className="tracking-widest"
                  >
                    {line}
                  </motion.p>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.5 }}
                className="mt-6 pt-4 border-t border-white/20"
              >
                <p className="text-sm italic opacity-90">
                  “{greeting?.wish}”
                </p>
              </motion.div>
            </div>

            {/* Footer */}
            <div className="text-xs opacity-50">
              汕头水电车间 智轨先锋组
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex gap-4 justify-center relative z-20">
          <button 
            onClick={handleDownload}
            className="flex items-center gap-2 px-6 py-3 bg-yellow-500 text-red-900 rounded-full font-bold shadow-lg hover:bg-yellow-400 transition transform hover:scale-105 active:scale-95"
          >
            <Download size={20} />
            保存贺卡
          </button>
          <button 
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white border border-white/20 rounded-full font-bold hover:bg-white/20 transition"
          >
            <RefreshCw size={20} />
            再做一张
          </button></div>
      </motion.div>
    </div>
  );
}
