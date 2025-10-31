'use client'

import Link from 'next/link'
import ImageEditor from '@/components/ImageEditor'

export default function EditorPage() {
  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* 顶部导航 - 优化后的设计 */}
      <nav className="border-b border-white/10 backdrop-blur-xl bg-black/40 flex-shrink-0">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Logo - 点击可返回首页 */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-white font-bold text-xl">IE</span>
              </div>
              <div>
                <div className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  ImageEditor Pro
                </div>
                <div className="text-xs text-gray-400 -mt-1">AI驱动的下一代图片编辑器</div>
              </div>
            </Link>

            {/* 右侧导航 */}
            <div className="flex items-center gap-4">
              <Link
                href="/help"
                className="px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                帮助中心
              </Link>
              <Link
                href="/about"
                className="px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                关于我们
              </Link>
              <div className="h-4 w-px bg-white/10"></div>
              <div className="px-3 py-1.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-lg text-blue-400 text-xs font-medium">
                编辑器模式
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容区域 - 编辑器全屏 */}
      <main className="flex-1 overflow-hidden">
        <ImageEditor
          onImageGenerated={(imageUrl) => {
            console.log('Image generated:', imageUrl)
          }}
        />
      </main>
    </div>
  )
}