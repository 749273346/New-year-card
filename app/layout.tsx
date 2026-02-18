import type { Metadata } from "next";
import { 
  Geist, 
  Geist_Mono, 
  Ma_Shan_Zheng, 
  Noto_Serif_SC, 
  ZCOOL_KuaiLe, 
  ZCOOL_QingKe_HuangYou, 
  Long_Cang 
} from "next/font/google";
import "./globals.css";
import MusicPlayer from "@/components/MusicPlayer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const maShanZheng = Ma_Shan_Zheng({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-ma-shan-zheng",
  display: "swap",
});

const notoSerifSC = Noto_Serif_SC({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-noto-serif-sc",
  display: "swap",
});

const zcoolKuaiLe = ZCOOL_KuaiLe({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-zcool-kuaile",
  display: "swap",
});

const zcoolQingKeHuangYou = ZCOOL_QingKe_HuangYou({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-zcool-qingke-huangyou",
  display: "swap",
});

const longCang = Long_Cang({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-long-cang",
  display: "swap",
});

export const metadata: Metadata = {
  title: "新年贺卡制作",
  description: "2026丙午马年新年贺卡AI生成",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`
          ${geistSans.variable} 
          ${geistMono.variable} 
          ${maShanZheng.variable} 
          ${notoSerifSC.variable} 
          ${zcoolKuaiLe.variable} 
          ${zcoolQingKeHuangYou.variable} 
          ${longCang.variable} 
          antialiased
        `}
      >
        <MusicPlayer />
        {children}
      </body>
    </html>
  );
}
