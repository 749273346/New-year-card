
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useEffect, useState, useRef, Suspense } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import * as htmlToImage from "html-to-image";
import { Download, RefreshCw } from "lucide-react";
import { CornerPattern, CloudPattern, HorseSilhouette } from "@/components/CardDecorations";
import { themes, getRandomTheme, CardTheme } from "./themes";

const Fireworks = dynamic(() => import("@/components/Fireworks"), { ssr: false });

function CardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const name = searchParams.get("name");
  const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const isMobile = /Android|iPhone|iPad|iPod|Mobi/i.test(userAgent);
  const isWeChat = /MicroMessenger/i.test(userAgent);
  const lowPowerMode = isWeChat;
  
  const [greeting, setGreeting] = useState<{ poem: string[]; wish: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [exportImageUrl, setExportImageUrl] = useState<string | null>(null);
  const [exportFilename, setExportFilename] = useState<string | null>(null);
  const [exportImageSize, setExportImageSize] = useState<{ width: number; height: number } | null>(null);
  const [theme, setTheme] = useState<CardTheme>(themes[0]); // Default theme
  const [showFireworks, setShowFireworks] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (lowPowerMode) return;
    const timer = setTimeout(() => {
      setShowFireworks(true);
    }, 800);
    return () => clearTimeout(timer);
  }, [lowPowerMode]);

  useEffect(() => {
    // Randomize theme on mount
    setTheme(getRandomTheme());
  }, []);

  useEffect(() => {
    if (!name) return;
    const controller = new AbortController();

    const run = async () => {
      try {
        setLoading(true);
        setError("");

        const greetingRes = await fetch("/api/generate-greeting", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
          signal: controller.signal,
        });

        if (!greetingRes.ok) throw new Error("Failed to generate greeting");
        const greetingData = await greetingRes.json();
        if (controller.signal.aborted) return;
        setGreeting(greetingData);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        console.error(err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Something went wrong");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    void run();
    return () => controller.abort();
  }, [name]);

  const blobToDataUrl = (blob: Blob) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Failed to read image"));
      reader.readAsDataURL(blob);
    });

  const handleDownload = async () => {
    if (!name || isDownloading || !greeting || !cardRef.current) return;
    
    try {
      setIsDownloading(true);
      setIsCapturing(true);
      setExportImageUrl(null);
      setExportFilename(null);
      setExportImageSize(null);

      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      await (document as unknown as { fonts?: { ready: Promise<void> } }).fonts?.ready;
      // Increased delay to ensure DOM is stable and images/fonts are rendered
      await new Promise(resolve => setTimeout(resolve, 300));

      const element = cardRef.current;
      if (!element) {
        throw new Error("Card element not found");
      }

      // Retry logic with different configurations
      let blob: Blob | null = null;
      
      // Attempt 1: High quality
      try {
        blob = await htmlToImage.toBlob(element, {
          cacheBust: true,
          pixelRatio: isWeChat ? 1.5 : (isMobile ? 2 : 2),
          style: { transform: 'none' }, // Ensure no transforms affect the capture
          fetchRequestInit: { mode: "cors" },
        });
      } catch (e) {
        console.warn("High quality capture failed:", e);
      }

      // Attempt 2: Medium quality (1.5x or 1x)
      if (!blob) {
        try {
          blob = await htmlToImage.toBlob(element, {
            cacheBust: true,
            pixelRatio: 1.5,
            style: { transform: 'none' },
            fetchRequestInit: { mode: "cors" },
          });
        } catch (e) {
          console.warn("Medium quality capture failed:", e);
        }
      }

      // Attempt 3: Low quality (1x) and disable cacheBust
      if (!blob) {
        try {
          blob = await htmlToImage.toBlob(element, {
            cacheBust: false,
            pixelRatio: 1,
            style: { transform: 'none' },
            fetchRequestInit: { mode: "cors" },
          });
        } catch (e) {
          console.error("Low quality capture failed:", e);
        }
      }
      
      // Attempt 4: toPng fallback
      if (!blob) {
          try {
             const dataUrl = await htmlToImage.toPng(element, {
                cacheBust: false,
                pixelRatio: 1,
                fetchRequestInit: { mode: "cors" },
             });
             const res = await fetch(dataUrl);
             blob = await res.blob();
          } catch (e) {
             console.error("toPng fallback failed:", e);
          }
      }

      if (!blob) {
        throw new Error("Failed to generate image blob after multiple attempts");
      }

      const filename = `${name}-NewYearCard.png`;
      const preferPreview = isMobile || isWeChat;

      if (preferPreview) {
        const dataUrl = await blobToDataUrl(blob);
        setExportImageUrl(dataUrl);
        setExportFilename(filename);
        try {
          const img = new window.Image();
          img.src = dataUrl;
          await img.decode?.();
          if (img.naturalWidth && img.naturalHeight) {
            setExportImageSize({ width: img.naturalWidth, height: img.naturalHeight });
          }
        } catch {
          setExportImageSize(null);
        }
        return;
      }

      const file = new File([blob], filename, { type: "image/png" });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: "新年贺卡",
            text: `来自${name}的新年祝福`,
          });
          return;
        } catch (shareError) {
          console.warn("Share failed or cancelled, falling back to download:", shareError);
        }
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = filename;
      link.href = url;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
      
    } catch (err) {
       console.error("Download failed:", err);
       alert("保存图片失败，请尝试长按截图保存");
     } finally {
       setIsDownloading(false);
       setIsCapturing(false);
     }
  };

  if (!name) {
    return <div className="text-white text-center mt-20">Please provide a name.</div>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-red-900 text-yellow-300">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-yellow-400 mb-4"></div>
        <p className="text-xl animate-pulse">正在为您制作新年贺卡...</p>
        <p className="text-sm opacity-70 mt-2">AI 正在撰写诗词 & 绘制贺卡</p>
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

  const renderWishWithBoldName = (wish: string, name: string) => {
    if (!wish || !name) return wish;
    const parts = wish.split(name);
    return (
      <>
        {parts.map((part, index) => (
          <span key={index}>
            {part}
            {index < parts.length - 1 && (
              <span className={`font-extrabold mx-1 text-xl drop-shadow-sm ${theme.textColorAccent}`}>
                {name}
              </span>
            )}
          </span>
        ))}
      </>
    );
  };

  const enableMotion = !lowPowerMode && !isCapturing;

  return (
    <div className={`min-h-screen flex flex-col items-center py-8 px-4 overflow-hidden relative ${theme.pageBg}`}>
      {showFireworks && !lowPowerMode && <Fireworks />}
      {exportImageUrl && (
        <div className="fixed inset-0 z-[200] bg-black/80 p-4 flex flex-col">
          <div className="flex items-center justify-between gap-3 text-white">
            <div className="text-sm font-semibold">长按图片保存到相册</div>
            <button
              onClick={() => {
                setExportImageUrl(null);
                setExportFilename(null);
                setExportImageSize(null);
              }}
              className="px-3 py-2 rounded-md bg-white/10 border border-white/20 text-sm"
            >
              关闭
            </button>
          </div>
          <div className="mt-4 flex-1 overflow-auto flex items-start justify-center">
            <Image
              src={exportImageUrl}
              alt={exportFilename ?? "新年贺卡"}
              width={exportImageSize?.width ?? 1200}
              height={exportImageSize?.height ?? 1800}
              unoptimized
              className="max-w-full h-auto rounded-md"
              style={{ width: "100%", height: "auto" }}
            />
          </div>
        </div>
      )}
      
      {/* Background Ambient Effects */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className={`absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-black/20 to-transparent`} />
        <div className={`absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/40 to-transparent`} />
      </div>

          {/* Card Wrapper for Motion */}
      {enableMotion ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
          className="w-full max-w-sm md:max-w-md relative z-10 perspective-1000"
        >
        <div 
          id="card-capture"
          ref={cardRef}
            className={`relative w-full h-full min-h-[640px] rounded-sm overflow-hidden shadow-2xl transition-all duration-500`}
            style={{
              background: theme.cardBg,
              boxShadow: `0 30px 60px -12px rgba(0,0,0,0.5), 0 0 0 1px ${theme.glowColor} inset`,
            }}
          >
            {/* Card Texture & Decor */}
            {theme.textureUrl && (
              <div 
                className="absolute inset-0 opacity-50 mix-blend-overlay"
                style={{ 
                  backgroundImage: `url('${theme.textureUrl}')`,
                  opacity: theme.textureOpacity
                }} 
              />
            )}
            <CloudPattern className={theme.decorationColor} />
            
            <div className={`absolute inset-2 border-2 rounded-sm pointer-events-none z-20 ${theme.borderColor}`}>
              <div className={`absolute inset-1 border rounded-sm ${theme.borderColor}`} />
            </div>

            <CornerPattern position="tl" className={`${theme.decorationColor} top-4 left-4`} />
            <CornerPattern position="tr" className={`${theme.decorationColor} top-4 right-4`} />
            <CornerPattern position="bl" className={`${theme.decorationColor} bottom-4 left-4`} />
            <CornerPattern position="br" className={`${theme.decorationColor} bottom-4 right-4`} />

            <HorseSilhouette className={`${theme.decorationColor} bottom-16 right-[-20px] scale-150 rotate-[-10deg]`} />

          <div id="card-content" className={`relative z-30 p-8 pt-12 text-center min-h-[600px] flex flex-col justify-between h-full ${theme.textColorPrimary}`}>
            {/* Header */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="relative"
            >
              <div className="inline-block relative mb-2">
                 <h1 className={`text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white/80 via-white to-white/60 font-serif tracking-widest drop-shadow-sm ${theme.textColorAccent}`}>
                  新年快乐
                </h1>
              </div>
              
              <div className="flex items-center justify-center gap-3 mt-2 opacity-90">
                <span className={`h-[1px] w-8 ${theme.borderColorStrong}`}></span>
                <p className={`text-sm tracking-[0.2em] ${theme.textColorSecondary}`}>
                  <span className="font-sans font-semibold text-base">2026 丙午马年</span>
                </p>
                <span className={`h-[1px] w-8 ${theme.borderColorStrong}`}></span>
              </div>
            </motion.div>

            {/* Content */}
            <div className="my-6 space-y-8 flex flex-col items-center flex-grow justify-center">
              
              <div className={`space-y-4 font-serif text-xl md:text-2xl leading-relaxed drop-shadow-md py-4 ${theme.textColorPrimary}`}>
                {greeting?.poem.map((line, index) => (
                  isCapturing ? (
                    <div key={index} className="flex items-center justify-center gap-2">
                      <span className={`w-1 h-1 rounded-full ${theme.borderColorStrong} opacity-60`} />
                      <p className="tracking-[0.15em]">{line}</p>
                      <span className={`w-1 h-1 rounded-full ${theme.borderColorStrong} opacity-60`} />
                    </div>
                  ) : (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.0 + index * 0.4 }}
                      className="flex items-center justify-center gap-2"
                    >
                     <span className={`w-1 h-1 rounded-full ${theme.borderColorStrong} opacity-60`} />
                     <p className="tracking-[0.15em]">{line}</p>
                     <span className={`w-1 h-1 rounded-full ${theme.borderColorStrong} opacity-60`} />
                    </motion.div>
                  )
                ))}
              </div>

              {/* Wish Section */}
              {isCapturing ? (
                <div className="relative w-full">
                  <div className={`relative px-6 py-5 border-t border-b ${theme.highlightBg} ${theme.borderColor}`}>
                    <p className={`text-sm md:text-base leading-7 font-light tracking-wide text-justify indent-8 ${theme.textColorSecondary}`}>
                      {greeting && name && renderWishWithBoldName(greeting.wish, name)}
                    </p>
                  </div>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2.8 }}
                  className="relative w-full"
                >
                  <div className={`relative px-6 py-5 border-t border-b backdrop-blur-sm ${theme.highlightBg} ${theme.borderColor}`}>
                  {/* Decorative quotes - Removed */}
                   
                  <p className={`text-sm md:text-base leading-7 font-light tracking-wide text-justify indent-8 ${theme.textColorSecondary}`}>
                    {greeting && name && renderWishWithBoldName(greeting.wish, name)}
                  </p>
                </div>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className={`mt-4 pt-4 border-t w-full flex flex-col items-center gap-1 ${theme.borderColor}`}>
              <div className={`text-xs tracking-wider font-serif ${theme.textColorMuted}`}>
                汕头水电车间 · 智轨先锋组
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center relative z-20">
          <button 
            onClick={handleDownload}
            disabled={isDownloading}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold shadow-lg transition transform active:scale-95 hover:scale-105 ${theme.buttonPrimary} ${
              isDownloading ? "cursor-not-allowed opacity-80" : ""
            }`}
          >
            {isDownloading ? (
              <RefreshCw className="animate-spin" size={20} />
            ) : (
              <Download size={20} />
            )}
            {isDownloading ? "保存中..." : "保存贺卡"}
          </button>

          <button 
            onClick={() => router.push("/")}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition border ${theme.buttonSecondary}`}
          >
            <RefreshCw size={20} />
            再做一张
          </button>
        </div>
        </motion.div>
      ) : (
        <div className="w-full max-w-sm md:max-w-md relative z-10">
          <div 
            id="card-capture"
            ref={cardRef}
            className="relative w-full h-full min-h-[640px] rounded-sm overflow-hidden"
            style={{ background: theme.cardBg }}
          >
            <CloudPattern className={theme.decorationColor} />
            <div className={`absolute inset-2 border-2 rounded-sm pointer-events-none z-20 ${theme.borderColor}`}>
              <div className={`absolute inset-1 border rounded-sm ${theme.borderColor}`} />
            </div>
            <CornerPattern position="tl" className={`${theme.decorationColor} top-4 left-4`} />
            <CornerPattern position="tr" className={`${theme.decorationColor} top-4 right-4`} />
            <CornerPattern position="bl" className={`${theme.decorationColor} bottom-4 left-4`} />
            <CornerPattern position="br" className={`${theme.decorationColor} bottom-4 right-4`} />
            <HorseSilhouette className={`${theme.decorationColor} bottom-16 right-[-20px] scale-150 rotate-[-10deg]`} />

            <div id="card-content" className={`relative z-30 p-8 pt-12 text-center min-h-[600px] flex flex-col justify-between h-full ${theme.textColorPrimary}`}>
              <div className="relative">
                <div className="inline-block relative mb-2">
                  <h1 className={`text-4xl md:text-5xl font-bold font-serif tracking-widest drop-shadow-sm ${theme.textColorAccent}`}>
                    新年快乐
                  </h1>
                </div>
                <div className="flex items-center justify-center gap-3 mt-2 opacity-90">
                  <span className={`h-[1px] w-8 ${theme.borderColorStrong}`}></span>
                  <p className={`text-sm tracking-[0.2em] ${theme.textColorSecondary}`}>
                    <span className="font-sans font-semibold text-base">2026 丙午马年</span>
                  </p>
                  <span className={`h-[1px] w-8 ${theme.borderColorStrong}`}></span>
                </div>
              </div>

              <div className="my-6 space-y-8 flex flex-col items-center flex-grow justify-center">
                <div className={`space-y-4 font-serif text-xl md:text-2xl leading-relaxed drop-shadow-md py-4 ${theme.textColorPrimary}`}>
                  {greeting?.poem.map((line, index) => (
                    <div key={index} className="flex items-center justify-center gap-2">
                      <span className={`w-1 h-1 rounded-full ${theme.borderColorStrong} opacity-60`} />
                      <p className="tracking-[0.15em]">{line}</p>
                      <span className={`w-1 h-1 rounded-full ${theme.borderColorStrong} opacity-60`} />
                    </div>
                  ))}
                </div>

                <div className="relative w-full">
                  <div className={`relative px-6 py-5 border-t border-b ${theme.highlightBg} ${theme.borderColor}`}>
                    <p className={`text-sm md:text-base leading-7 font-light tracking-wide text-justify indent-8 ${theme.textColorSecondary}`}>
                      {greeting && name && renderWishWithBoldName(greeting.wish, name)}
                    </p>
                  </div>
                </div>
              </div>

              <div className={`mt-4 pt-4 border-t w-full flex flex-col items-center gap-1 ${theme.borderColor}`}>
                <div className={`text-xs tracking-wider font-serif ${theme.textColorMuted}`}>
                  汕头水电车间 · 智轨先锋组
                </div>
              </div>
            </div>

            {theme.textureUrl && (
              <div
                className="absolute inset-0 pointer-events-none z-10"
                style={{
                  backgroundImage: `url('${theme.textureUrl}')`,
                  opacity: Number.parseFloat(theme.textureOpacity) * 0.5,
                }}
              />
            )}
          </div>

          <div className="mt-8 flex flex-wrap gap-4 justify-center relative z-20">
            <button 
              onClick={handleDownload}
              disabled={isDownloading}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold shadow-lg transition transform active:scale-95 hover:scale-105 ${theme.buttonPrimary} ${
                isDownloading ? "cursor-not-allowed opacity-80" : ""
              }`}
            >
              {isDownloading ? (
                <RefreshCw className="animate-spin" size={20} />
              ) : (
                <Download size={20} />
              )}
              {isDownloading ? "保存中..." : "保存贺卡"}
            </button>

            <button 
              onClick={() => router.push("/")}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition border ${theme.buttonSecondary}`}
            >
              <RefreshCw size={20} />
              再做一张
            </button>
          </div>
        </div>
      )}
      {isDownloading && (
        <div className="fixed inset-0 z-[300] bg-black/80 flex flex-col items-center justify-center text-white backdrop-blur-sm">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-yellow-400 mb-6"></div>
          <p className="text-xl font-bold tracking-widest animate-pulse">正在精心绘制贺卡...</p>
          <p className="text-sm opacity-70 mt-2">请稍候，精彩即将呈现</p>
        </div>
      )}
    </div>
  );
}

export default function CardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-red-900 text-yellow-300">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-yellow-400 mb-4"></div>
        <p className="text-xl animate-pulse">正在加载...</p>
      </div>
    }>
      <CardContent />
    </Suspense>
  );
}
