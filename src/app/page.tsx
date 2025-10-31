'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Home() {
  const [text, setText] = useState('')
  const [isTyping, setIsTyping] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center overflow-hidden">
        <div className="relative">
          {/* 加载动画 */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center animate-spin">
              <span className="text-white font-bold text-xl">IE</span>
            </div>
            <div className="text-2xl font-bold">
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                ImageEditor Pro
              </span>
            </div>
          </div>
          {/* 加载进度条 */}
          <div className="absolute -bottom-8 left-0 right-0">
            <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"
                   style={{width: '0%', animation: 'loading 1.5s ease-out forwards'}}></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

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
            {/* 品牌标识优化 */}
            <div className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center transform transition-transform hover:scale-110 hover:rotate-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  ImageEditor Pro
                </span>
                <span className="text-xs text-gray-400 group-hover:text-blue-400 transition-colors">
                  AI 驱动图片编辑
                </span>
              </div>
            </div>

            {/* 桌面端导航 */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-300 hover:text-blue-400 transition-all duration-300 hover:underline hover:underline-offset-4">功能</a>
              <a href="#workflow" className="text-gray-300 hover:text-blue-400 transition-all duration-300 hover:underline hover:underline-offset-4">使用流程</a>
              <a href="#about" className="text-gray-300 hover:text-blue-400 transition-all duration-300 hover:underline hover:underline-offset-4">关于</a>
              <Link
                href="/editor"
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 font-medium"
              >
                开始编辑
              </Link>
            </div>

            {/* 移动端汉堡菜单 */}
            <button
              className="md:hidden text-gray-300 hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <div className="w-6 h-5 relative flex flex-col justify-center">
                <span className={`absolute h-0.5 w-6 bg-current transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-0' : '-translate-y-2'}`}></span>
                <span className={`h-0.5 w-6 bg-current transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                <span className={`absolute h-0.5 w-6 bg-current transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 translate-y-0' : 'translate-y-2'}`}></span>
              </div>
            </button>
          </div>

          {/* 移动端菜单 */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pt-4 border-t border-white/10 animate-in slide-in-from-top-2 duration-300">
              <div className="flex flex-col space-y-3">
                <a href="#features" className="text-gray-300 hover:text-blue-400 transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>功能</a>
                <a href="#workflow" className="text-gray-300 hover:text-blue-400 transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>使用流程</a>
                <a href="#about" className="text-gray-300 hover:text-blue-400 transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>关于</a>
                <Link
                  href="/editor"
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-center font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  开始编辑
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero 区域 */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-6">
        {/* AI编辑过程背景动画 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        <div className="text-center max-w-5xl mx-auto relative z-10">
          {/* 主标题 */}
          <h1 className="text-6xl md:text-8xl font-bold mb-6 animate-fade-in-up">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              {text}
              <span className="animate-pulse">|</span>
            </span>
          </h1>

          {/* 副标题 */}
          <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed animate-fade-in-up" style={{animationDelay: '0.3s'}}>
            革命性的AI驱动图片编辑体验
          </p>

          {/* 核心卖点可视化 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { icon: '🧠', title: '智能处理', desc: 'AI算法自动优化', color: 'from-blue-500 to-cyan-500' },
              { icon: '👁️', title: '实时预览', desc: '即时查看编辑效果', color: 'from-purple-500 to-pink-500' },
              { icon: '⭐', title: '专业品质', desc: '输出级照片质量', color: 'from-pink-500 to-red-500' }
            ].map((feature, i) => (
              <div
                key={i}
                className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300 transform hover:scale-105 hover:border-blue-400/50 animate-fade-in-up"
                style={{animationDelay: `${0.5 + i * 0.1}s`}}
              >
                <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center text-2xl transform transition-transform hover:rotate-6`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* CTA 按钮组 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in-up" style={{animationDelay: '0.8s'}}>
            <Link
              href="/editor"
              className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25 hover:-translate-y-1"
            >
              <span className="relative z-10 flex items-center justify-center">
                立即开始编辑
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Link>

            <a
              href="#features"
              className="px-8 py-4 border border-gray-600 rounded-full font-semibold text-lg hover:border-blue-400 hover:bg-blue-400/10 transition-all duration-300 flex items-center justify-center group"
            >
              了解更多
              <svg className="w-5 h-5 ml-2 group-hover:translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* 优势区 - 信任徽章样式 */}
      <section className="relative z-10 py-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: '🚀',
                title: '无需安装',
                desc: '浏览器内直接使用',
                color: 'from-blue-500 to-cyan-500'
              },
              {
                icon: '💰',
                title: '完全免费',
                desc: '无任何隐藏费用',
                color: 'from-green-500 to-emerald-500'
              },
              {
                icon: '🔒',
                title: '隐私安全',
                desc: '数据本地处理，不上传云端',
                color: 'from-purple-500 to-pink-500'
              },
              {
                icon: '🤖',
                title: 'AI增强',
                desc: '最新AI算法加持',
                color: 'from-orange-500 to-red-500'
              }
            ].map((advantage, i) => (
              <div
                key={i}
                className="group p-6 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20 animate-fade-in-up"
                style={{animationDelay: `${1.0 + i * 0.1}s`}}
              >
                <div className={`w-14 h-14 mb-4 bg-gradient-to-br ${advantage.color} rounded-xl flex items-center justify-center text-2xl transform transition-transform group-hover:scale-110 group-hover:rotate-6`}>
                  {advantage.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{advantage.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{advantage.desc}</p>
              </div>
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
                color: 'from-blue-500 to-cyan-500',
                beforeImage: '📷',
                afterImage: '✨',
                isCore: true
              },
              {
                title: '精准裁剪',
                description: '智能识别主体，提供最佳裁剪建议',
                color: 'from-purple-500 to-pink-500',
                beforeImage: '🖼️',
                afterImage: '🎯'
              },
              {
                title: '色彩增强',
                description: '自动调整色彩平衡，让照片更加生动',
                color: 'from-pink-500 to-red-500',
                beforeImage: '🌈',
                afterImage: '🎨'
              },
              {
                title: '智能文字',
                description: '添加动态文字效果，支持多种字体和动画',
                color: 'from-green-500 to-teal-500',
                beforeImage: '📝',
                afterImage: '💫'
              },
              {
                title: '背景移除',
                description: '一键移除背景，支持毛发级细节处理',
                color: 'from-yellow-500 to-orange-500',
                beforeImage: '🏞️',
                afterImage: '🔲',
                isCore: true
              },
              {
                title: '批量处理',
                description: '支持批量编辑，大幅提升工作效率',
                color: 'from-indigo-500 to-purple-500',
                beforeImage: '📁',
                afterImage: '⚡'
              }
            ].map((feature, i) => (
              <div
                key={i}
                className={`group relative overflow-hidden rounded-2xl transition-all duration-500 hover:transform hover:scale-105 animate-fade-in-up ${
                  feature.isCore ? 'bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-400/30' : 'bg-white/5 backdrop-blur-lg border border-white/10'
                } hover:border-blue-400/50 hover:shadow-2xl hover:shadow-blue-500/20`}
                style={{animationDelay: `${1.4 + i * 0.1}s`}}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-500`}></div>

                {/* 功能前后对比展示 */}
                <div className="relative h-32 overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-full h-full flex">
                      {/* 原图 */}
                      <div className="flex-1 flex items-center justify-center p-4 opacity-60 group-hover:opacity-30 transition-opacity duration-500">
                        <span className="text-4xl">{feature.beforeImage}</span>
                      </div>
                      {/* 分割线 */}
                      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-gray-400 to-transparent transform -translate-x-1/2"></div>
                      {/* 效果图 */}
                      <div className="flex-1 flex items-center justify-center p-4 opacity-60 group-hover:opacity-100 transition-opacity duration-500">
                        <span className="text-4xl transform scale-110 group-hover:scale-125 transition-transform duration-500">{feature.afterImage}</span>
                      </div>
                    </div>
                  </div>
                  {feature.isCore && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
                      <span className="text-xs text-white font-semibold">核心</span>
                    </div>
                  )}
                </div>

                <div className="p-6 relative z-10">
                  <h3 className="text-xl font-bold mb-3 text-white group-hover:text-blue-400 transition-colors">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed text-sm">{feature.description}</p>

                  {/* 功能演示提示 */}
                  <div className="mt-4 flex items-center text-xs text-gray-500">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>悬停查看效果</span>
                  </div>
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
              {
                step: 1,
                title: '上传图片',
                desc: '支持多种格式，拖拽即传',
                icon: '📤',
                color: 'from-blue-500 to-cyan-500'
              },
              {
                step: 2,
                title: 'AI编辑',
                desc: '智能识别，一键优化',
                icon: '🤖',
                color: 'from-purple-500 to-pink-500',
                hasAnimation: true
              },
              {
                step: 3,
                title: '下载分享',
                desc: '高质量输出，即刻分享',
                icon: '📥',
                color: 'from-green-500 to-emerald-500'
              }
            ].map((item, i) => (
              <div key={i} className="text-center group">
                <div className="relative inline-block mb-6">
                  {/* 步骤圆圈 */}
                  <div className={`w-24 h-24 bg-gradient-to-br ${item.color} rounded-full flex items-center justify-center text-4xl transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 cursor-pointer relative overflow-hidden animate-fade-in-up`}
                      style={{animationDelay: `${2.0 + i * 0.1}s`}}
                      onClick={() => {
                        // 步骤交互演示
                        if (i === 0) {
                          alert('拖拽图片到此处进行上传演示');
                        } else if (i === 1) {
                          // AI编辑动画演示
                        } else if (i === 2) {
                          alert('开始下载演示');
                        }
                      }}>
                    {item.icon}

                    {/* 脉冲动画（仅AI编辑步骤） */}
                    {item.hasAnimation && (
                      <>
                        <div className="absolute inset-0 bg-white/20 rounded-full animate-ping"></div>
                        <div className="absolute inset-0 bg-white/10 rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
                      </>
                    )}
                  </div>

                  {/* 连接线条动画 */}
                  {i < 2 && (
                    <div className="hidden md:block absolute top-12 left-full w-full h-0.5 overflow-visible">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 transform -translate-y-1/2">
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600"
                               style={{
                                 animation: 'flowLine 2s ease-in-out infinite',
                                 transformOrigin: 'left center'
                               }}></div>
                        </div>
                        <div className="absolute top-1/2 right-0 w-2 h-2 bg-pink-600 rounded-full transform -translate-y-1/2 animate-pulse"></div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="animate-fade-in-up" style={{animationDelay: `${2.3 + i * 0.1}s`}}>
                  <h3 className="text-xl font-bold mb-2 text-white group-hover:text-blue-400 transition-colors">{item.title}</h3>
                  <p className="text-gray-400">{item.desc}</p>
                </div>

                {/* 步骤交互提示 */}
                <div className="mt-3 text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity animate-fade-in-up"
                     style={{animationDelay: `${2.5 + i * 0.1}s`}}>
                  点击查看演示
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA 区域 */}
      <section className="relative z-10 py-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="p-12 bg-gradient-to-br from-blue-900/20 to-purple-900/20 backdrop-blur-lg border border-white/10 rounded-3xl hover:border-blue-400/30 transition-all duration-500">
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
              className="group relative inline-block px-10 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full font-semibold text-lg transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700 rounded-full"
                   style={{
                     animation: 'breathing 2s ease-in-out infinite'
                   }}></div>
              <span className="relative z-10 flex items-center justify-center">
                免费开始使用
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* 页脚 */}
      <footer className="relative z-10 border-t border-white/10 backdrop-blur-lg bg-black/30 py-12 px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* 品牌信息 */}
            <div className="text-center md:text-left">
              <h3 className="text-lg font-semibold text-white mb-3">ImageEditor Pro</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                科技改变创意，AI赋能设计
              </p>
            </div>

            {/* 快速链接 */}
            <div className="text-center">
              <h4 className="text-sm font-medium text-white mb-3">快速链接</h4>
              <div className="flex flex-wrap justify-center gap-4">
                <a href="#" className="text-sm text-gray-400 hover:text-blue-400 transition-colors">隐私政策</a>
                <a href="#" className="text-sm text-gray-400 hover:text-blue-400 transition-colors">用户协议</a>
                <a href="#" className="text-sm text-gray-400 hover:text-blue-400 transition-colors">帮助中心</a>
              </div>
            </div>

            {/* 社交媒体 */}
            <div className="text-center md:text-right">
              <h4 className="text-sm font-medium text-white mb-3">关注我们</h4>
              <div className="flex justify-center md:justify-end gap-3">
                <a href="#" className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-blue-500/20 transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-blue-500/20 transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* 版权信息 */}
          <div className="pt-8 border-t border-white/10 text-center">
            <p className="text-sm text-gray-400">
              © 2024 ImageEditor Pro. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}