import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  fallback: ['system-ui', 'sans-serif']
})

export const metadata: Metadata = {
  title: 'ImageEditor Pro - AI驱动的下一代图片编辑器',
  description: '革命性的AI驱动图片编辑体验，智能处理、实时预览、专业品质。无需安装、完全免费、隐私安全。支持AI智能滤镜、背景移除、批量处理等功能。',
  keywords: ['AI图片编辑', '在线图片编辑', '智能滤镜', '背景移除', '批量处理', '免费编辑器', '无需安装'],
  authors: [{ name: 'ImageEditor Pro Team' }],
  creator: 'ImageEditor Pro',
  publisher: 'ImageEditor Pro',
  robots: 'index, follow',
  openGraph: {
    title: 'ImageEditor Pro - AI驱动的下一代图片编辑器',
    description: '革命性的AI驱动图片编辑体验，智能处理、实时预览、专业品质',
    url: 'https://imageeditor-pro.com',
    siteName: 'ImageEditor Pro',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'ImageEditor Pro - AI图片编辑器',
      },
    ],
    locale: 'zh_CN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ImageEditor Pro - AI驱动的下一代图片编辑器',
    description: '革命性的AI驱动图片编辑体验，智能处理、实时预览、专业品质',
    images: ['/og-image.jpg'],
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" className="scroll-smooth">
      <head>
        <meta name="theme-color" content="#165DFF" />
        <meta name="msapplication-TileColor" content="#165DFF" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="ImageEditor Pro" />
        <meta name="application-name" content="ImageEditor Pro" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-touch-fullscreen" content="yes" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <div id="root">
          {children}
        </div>
      </body>
    </html>
  )
}