import type { Metadata } from "next";
import "./globals.css";
import MusicPlayer from "@/components/MusicPlayer";

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
      <body className="antialiased">
        <MusicPlayer />
        {children}
      </body>
    </html>
  );
}
