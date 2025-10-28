'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Home() {
  const [text, setText] = useState('')
  const [isTyping, setIsTyping] = useState(true)

  const fullText = "下一代AI图片编辑器"

  useEffect(() => {
    if (isTyping && text.length < fullText.length) {
      const timeout = setTimeout(() => {
        setText(fullText.slice(0, text.length + 1))
      }, 150)
      return () => clearTimeout(timeout)
    } else if (text.length === fullText.length) {
      setIsTyping(false)
    }
  }, [text, isTyping])

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* 网格背景 */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-purple-900/20 to-blue-900/20">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px), linear-gradient(90deg, rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>

      {/* 动态粒子效果 */}
      <div className="fixed inset-0">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* 导航栏 */}
      <nav className="relative z-10 border-b border-white/10 backdrop-blur-lg bg-black/30">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">IE</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                ImageEditor Pro
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors">功能</a>
              <a href="#workflow" className="text-gray-300 hover:text-white transition-colors">使用流程</a>
              <a href="#about" className="text-gray-300 hover:text-white transition-colors">关于</a>
              <Link
                href="/editor"
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-blue-500/25"
              >
                开始编辑
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero 区域 */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-5xl mx-auto">
          {/* 主标题 */}
          <h1 className="text-6xl md:text-8xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              {text}
              <span className="animate-pulse">|</span>
            </span>
          </h1>

          {/* 副标题 */}
          <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
            革命性的AI驱动图片编辑体验
            <br />
            <span className="text-blue-400">智能处理</span> • <span className="text-purple-400">实时预览</span> • <span className="text-pink-400">专业品质</span>
          </p>

          {/* CTA 按钮组 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/editor"
              className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full font-semibold text-lg transition-all transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25"
            >
              <span className="relative z-10">立即开始编辑</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Link>

            <a
              href="#features"
              className="px-8 py-4 border border-gray-600 rounded-full font-semibold text-lg hover:border-blue-400 hover:bg-blue-400/10 transition-all"
            >
              了解更多
            </a>
          </div>

          {/* 特性标签 */}
          <div className="flex flex-wrap justify-center gap-3">
            {['无需安装', '完全免费', '隐私安全', 'AI增强'].map((tag, i) => (
              <span
                key={i}
                className="px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full text-sm text-gray-300 hover:bg-white/10 transition-colors"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 功能展示区域 */}
      <section id="features" className="relative z-10 py-20 px-6">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              强大功能矩阵
            </span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'AI智能滤镜',
                description: '基于深度学习的智能滤镜系统，一键提升图片质感',
                color: 'from-blue-500 to-cyan-500'
              },
              {
                title: '精准裁剪',
                description: '智能识别主体，提供最佳裁剪建议',
                color: 'from-purple-500 to-pink-500'
              },
              {
                title: '色彩增强',
                description: '自动调整色彩平衡，让照片更加生动',
                color: 'from-pink-500 to-red-500'
              },
              {
                title: '智能文字',
                description: '添加动态文字效果，支持多种字体和动画',
                color: 'from-green-500 to-teal-500'
              },
              {
                title: '背景移除',
                description: '一键移除背景，支持毛发级细节处理',
                color: 'from-yellow-500 to-orange-500'
              },
              {
                title: '批量处理',
                description: '支持批量编辑，大幅提升工作效率',
                color: 'from-indigo-500 to-purple-500'
              }
            ].map((feature, i) => (
              <div
                key={i}
                className="group relative p-8 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300 hover:transform hover:scale-105 hover:border-blue-400/50"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity`}></div>
                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 使用流程 */}
      <section id="workflow" className="relative z-10 py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              简单三步，专业效果
            </span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: 1, title: '上传图片', desc: '支持多种格式，拖拽即传' },
              { step: 2, title: 'AI编辑', desc: '智能识别，一键优化' },
              { step: 3, title: '下载分享', desc: '高质量输出，即刻分享' }
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="relative inline-block mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-3xl font-bold">
                    {item.step}
                  </div>
                  {i < 2 && (
                    <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-purple-600 to-pink-600 transform -translate-y-1/2"></div>
                  )}
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA 区域 */}
      <section className="relative z-10 py-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="p-12 bg-gradient-to-br from-blue-900/20 to-purple-900/20 backdrop-blur-lg border border-white/10 rounded-3xl">
            <h2 className="text-4xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                准备好创造令人惊艳的作品了吗？
              </span>
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              加入数万用户的选择，体验下一代图片编辑技术
            </p>
            <Link
              href="/editor"
              className="inline-block px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full font-semibold text-lg transition-all transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25"
            >
              免费开始使用 →
            </Link>
          </div>
        </div>
      </section>

      {/* 页脚 */}
      <footer className="relative z-10 border-t border-white/10 backdrop-blur-lg bg-black/30 py-12 px-6">
        <div className="container mx-auto text-center">
          <p className="text-gray-400">
            © 2024 ImageEditor Pro. 科技改变创意，AI赋能设计
          </p>
        </div>
      </footer>
    </div>
  )
}