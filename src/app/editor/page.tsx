'use client'

import { useState } from 'react'
import Link from 'next/link'
import ImageEditor from '@/components/ImageEditor'

export default function EditorPage() {
  const [isProcessing, setIsProcessing] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* 顶部导航 */}
      <nav className="border-b border-white/10 backdrop-blur-lg bg-black/30">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">IE</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  ImageEditor Pro
                </span>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                返回首页
              </Link>
              <div className="px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full text-green-400 text-sm">
                编辑器模式
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容区域 */}
      <main className="container mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              AI图片编辑器
            </span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            使用先进的AI技术，轻松处理您的图片。支持智能滤镜、背景移除、色彩增强等专业功能。
          </p>
        </div>

        {/* 编辑器组件 */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
          <ImageEditor
            onImageGenerated={(imageUrl) => {
              console.log('Image generated:', imageUrl)
              setIsProcessing(false)
            }}
          />
        </div>

        {/* 功能提示 */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: '智能识别',
              desc: 'AI自动识别图片中的主体和场景'
            },
            {
              title: '实时预览',
              desc: '所有编辑操作都能实时查看效果'
            },
            {
              title: '隐私保护',
              desc: '所有处理都在本地完成，不上传服务器'
            }
          ].map((tip, i) => (
            <div
              key={i}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4"
            >
              <h3 className="font-semibold mb-1">{tip.title}</h3>
              <p className="text-sm text-gray-400">{tip.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* 处理中覆盖层 */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold mb-2">AI处理中...</h3>
            <p className="text-gray-400">请稍候，正在为您生成精美的图片</p>
          </div>
        </div>
      )}
    </div>
  )
}