import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const jakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ComicGen AI - AI公众号短漫自动生成器",
  description: "基于AI的漫画剧本和画面自动生成工具",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="light">
      <body className={`${jakarta.variable} font-display antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}

