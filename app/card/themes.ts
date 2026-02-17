import { PATTERN_PAPER, PATTERN_TILES, PATTERN_WOOD, PATTERN_DIAMONDS, PATTERN_SHATTERED } from "./patterns";

export interface CardTheme {
  id: string;
  name: string;
  // 页面容器背景（全屏）
  pageBg: string;
  // 贺卡本体背景（渐变或纯色）
  cardBg: string;
  // 贺卡纹理叠加图片URL (可选)
  textureUrl?: string;
  // 纹理透明度
  textureOpacity: string;
  
  // 文字颜色类名
  textColorPrimary: string;   // 正文颜色 (e.g., text-yellow-100)
  textColorSecondary: string; // 副标题/次要信息 (e.g., text-yellow-200)
  textColorAccent: string;    // 强调色/标题 (e.g., text-yellow-400)
  textColorMuted: string;     // 弱化文字 (e.g., text-yellow-500/50)
  
  // 边框颜色类名
  borderColor: string;        // 边框颜色 (e.g., border-yellow-500/30)
  borderColorStrong: string;  // 强边框 (e.g., border-yellow-500)
  
  // 装饰元素颜色类名 (SVG fill/stroke)
  decorationColor: string;    // 装饰图案颜色 (e.g., text-yellow-500/40)
  
  // 按钮样式
  buttonPrimary: string;      // 主按钮 (e.g., bg-yellow-500 text-red-900)
  buttonSecondary: string;    // 次按钮 (e.g., bg-white/10 text-white)
  
  // 特殊效果
  glowColor: string;          // 发光效果颜色 (e.g., shadow-yellow-500/50)
  highlightBg: string;        // 高亮区域背景 (e.g., bg-yellow-500/20)

  // Satori 兼容的 Hex 颜色 (用于服务端生成图片)
  hexColors: {
    primary: string;
    secondary: string;
    accent: string;
    border: string;
    glow: string;
  };
}

export const themes: CardTheme[] = [
  {
    id: "classic-red",
    name: "鸿运当头",
    pageBg: "bg-[#4a0404]",
    cardBg: "linear-gradient(135deg, #8B0000 0%, #B22222 50%, #FF0000 100%)",
    textureUrl: PATTERN_PAPER,
    textureOpacity: "0.4",
    textColorPrimary: "text-yellow-100",
    textColorSecondary: "text-yellow-200",
    textColorAccent: "text-yellow-400",
    textColorMuted: "text-yellow-200/80",
    borderColor: "border-yellow-500/30",
    borderColorStrong: "border-yellow-500",
    decorationColor: "text-yellow-500/40",
    buttonPrimary: "bg-yellow-500 text-red-900 hover:bg-yellow-400",
    buttonSecondary: "bg-white/10 text-white border-white/20 hover:bg-white/20",
    glowColor: "rgba(255, 215, 0, 0.5)",
    highlightBg: "bg-[#5e0b0b]/60",
    hexColors: {
      primary: "#FEF3C7", // yellow-100
      secondary: "#FDE68A", // yellow-200
      accent: "#FBBF24", // yellow-400
      border: "rgba(234, 179, 8, 0.3)", // yellow-500/30
      glow: "rgba(255, 215, 0, 0.5)",
    }
  },
  {
    id: "festive-vermilion",
    name: "锦绣中华",
    pageBg: "bg-[#7f1d1d]",
    cardBg: "linear-gradient(135deg, #dc2626 0%, #ea580c 50%, #b91c1c 100%)",
    textureUrl: PATTERN_TILES,
    textureOpacity: "0.1",
    textColorPrimary: "text-white",
    textColorSecondary: "text-orange-100",
    textColorAccent: "text-yellow-300",
    textColorMuted: "text-red-100/90",
    borderColor: "border-yellow-200/40",
    borderColorStrong: "border-yellow-100",
    decorationColor: "text-white/20",
    buttonPrimary: "bg-yellow-100 text-red-600 hover:bg-white",
    buttonSecondary: "bg-black/10 text-white border-white/30 hover:bg-black/20",
    glowColor: "rgba(255, 255, 255, 0.3)",
    highlightBg: "bg-black/10",
    hexColors: {
      primary: "#FFFFFF", // white
      secondary: "#FFEDD5", // orange-100
      accent: "#FDE047", // yellow-300
      border: "rgba(254, 240, 138, 0.4)", // yellow-200/40
      glow: "rgba(255, 255, 255, 0.3)",
    }
  },
  {
    id: "burgundy-gold",
    name: "龙马精神",
    pageBg: "bg-[#450a0a]",
    cardBg: "linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #7f1d1d 100%)",
    textureUrl: PATTERN_WOOD,
    textureOpacity: "0.3",
    textColorPrimary: "text-amber-100",
    textColorSecondary: "text-amber-200/80",
    textColorAccent: "text-amber-400",
    textColorMuted: "text-amber-200/80",
    borderColor: "border-amber-600/40",
    borderColorStrong: "border-amber-500",
    decorationColor: "text-amber-500/20",
    buttonPrimary: "bg-amber-600 text-white hover:bg-amber-500",
    buttonSecondary: "bg-amber-900/30 text-amber-100 border-amber-500/30 hover:bg-amber-900/50",
    glowColor: "rgba(245, 158, 11, 0.3)",
    highlightBg: "bg-[#2a0a0a]/40",
    hexColors: {
      primary: "#FEF3C7", // amber-100
      secondary: "rgba(253, 230, 138, 0.8)", // amber-200/80
      accent: "#FBBF24", // amber-400
      border: "rgba(217, 119, 6, 0.4)", // amber-600/40
      glow: "rgba(245, 158, 11, 0.3)",
    }
  },
  {
    id: "papercut-red",
    name: "丹红剪纸",
    pageBg: "bg-[#991b1b]",
    cardBg: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
    textureUrl: PATTERN_DIAMONDS,
    textureOpacity: "0.15",
    textColorPrimary: "text-white",
    textColorSecondary: "text-red-50",
    textColorAccent: "text-yellow-200",
    textColorMuted: "text-red-200",
    borderColor: "border-white/40",
    borderColorStrong: "border-white",
    decorationColor: "text-white/30",
    buttonPrimary: "bg-white text-red-600 hover:bg-red-50",
    buttonSecondary: "bg-red-800/20 text-white border-white/40 hover:bg-red-800/30",
    glowColor: "rgba(255, 255, 255, 0.4)",
    highlightBg: "bg-white/10",
    hexColors: {
      primary: "#FFFFFF", // white
      secondary: "#FEF2F2", // red-50
      accent: "#FEF08A", // yellow-200
      border: "rgba(255, 255, 255, 0.4)", // white/40
      glow: "rgba(255, 255, 255, 0.4)",
    }
  },
  {
    id: "golden-red",
    name: "金红交辉",
    pageBg: "bg-[#570a0a]",
    cardBg: "linear-gradient(135deg, #9f1239 0%, #be123c 40%, #fbbf24 100%)",
    textureUrl: PATTERN_SHATTERED,
    textureOpacity: "0.25",
    textColorPrimary: "text-yellow-50",
    textColorSecondary: "text-rose-100",
    textColorAccent: "text-yellow-300",
    textColorMuted: "text-rose-100/90",
    borderColor: "border-yellow-400/40",
    borderColorStrong: "border-yellow-300",
    decorationColor: "text-yellow-400/30",
    buttonPrimary: "bg-gradient-to-r from-yellow-500 to-amber-500 text-white hover:from-yellow-400 hover:to-amber-400",
    buttonSecondary: "bg-rose-900/30 text-yellow-100 border-yellow-200/30 hover:bg-rose-900/50",
    glowColor: "rgba(251, 191, 36, 0.4)",
    highlightBg: "bg-black/20",
    hexColors: {
      primary: "#FEFCE8", // yellow-50
      secondary: "#FFE4E6", // rose-100
      accent: "#FDE047", // yellow-300
      border: "rgba(250, 204, 21, 0.4)", // yellow-400/40
      glow: "rgba(251, 191, 36, 0.4)",
    }
  }
];

export function getRandomTheme(): CardTheme {
  return themes[Math.floor(Math.random() * themes.length)];
}
