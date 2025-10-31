'use client'

import { useState, useRef, ChangeEvent } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface ImageEditorProps {
  onImageGenerated?: (imageUrl: string) => void
}

type FeatureType = 'replace' | 'remove-bg' | 'remove-watermark'
type ViewMode = 'original' | 'result' | 'side-by-side' | 'top-bottom'

const FEATURE_CONFIG = {
  replace: {
    name: '替换主体',
    description: '文字描述或上传图片替换',
    color: 'from-blue-500 to-blue-600',
    hoverColor: 'hover:from-blue-600 hover:to-blue-700',
    borderColor: 'border-blue-500/50',
    bgColor: 'bg-blue-500/10',
    icon: '🔄',
    tooltip: '支持通过文字描述或上传参考图片，智能替换图片中的主体内容'
  },
  'remove-bg': {
    name: '去背景/抠图',
    description: '精准识别主体',
    color: 'from-green-500 to-emerald-600',
    hoverColor: 'hover:from-green-600 hover:to-emerald-700',
    borderColor: 'border-green-500/50',
    bgColor: 'bg-green-500/10',
    icon: '✂️',
    tooltip: '自动识别图片主体，去除背景，生成透明PNG图片，边缘精准'
  },
  'remove-watermark': {
    name: '去水印',
    description: '清除水印标记',
    color: 'from-orange-500 to-red-600',
    hoverColor: 'hover:from-orange-600 hover:to-red-700',
    borderColor: 'border-orange-500/50',
    bgColor: 'bg-orange-500/10',
    icon: '🚫',
    tooltip: '支持清除图片中的文字、logo、水印，保留原图画质'
  }
}

export default function ImageEditor({ onImageGenerated }: ImageEditorProps) {
  const router = useRouter()
  const [referenceImage, setReferenceImage] = useState<string | null>(null)
  const [replacementImage, setReplacementImage] = useState<string | null>(null)
  const [textPrompt, setTextPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [feature, setFeature] = useState<FeatureType>('remove-bg')
  const [replaceMode, setReplaceMode] = useState<'text' | 'image'>('text')
  const [viewMode, setViewMode] = useState<ViewMode>('side-by-side')
  const [showGuide, setShowGuide] = useState(false)
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const replacementFileInputRef = useRef<HTMLInputElement>(null)

  // 跳转到高级编辑器
  const goToAdvancedEditor = () => {
    if (generatedImage) {
      sessionStorage.setItem('editImage', generatedImage)
      router.push(`/advanced-editor?image=${encodeURIComponent(generatedImage)}`)
    }
  }

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>, type: 'reference' | 'replacement') => {
    const file = e.target.files?.[0]
    if (file) {
      // 验证文件类型
      if (!file.type.startsWith('image/')) {
        setError('❌ 请上传JPG/PNG/WEBP格式的图片文件')
        return
      }
      
      setError(null)
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        if (type === 'reference') {
          setReferenceImage(result)
        } else {
          setReplacementImage(result)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const generateImage = async () => {
    if (!referenceImage) {
      setError('请先上传图片')
      return
    }

    // 替换功能的验证
    if (feature === 'replace') {
      if (replaceMode === 'text' && !textPrompt.trim()) {
        setError('请输入要替换成什么')
        return
      }

      if (replaceMode === 'image' && !replacementImage) {
        setError('请上传要替换的图片')
        return
      }
    }

    setIsGenerating(true)
    setError(null)

    try {
      let endpoint = '/api/generate-image'
      let requestBody: any = {}

      if (feature === 'remove-bg') {
        endpoint = '/api/remove-background'
        requestBody = {
          image: referenceImage,
        }
      } else if (feature === 'remove-watermark') {
        endpoint = '/api/remove-watermark'
        requestBody = {
          image: referenceImage,
        }
      } else {
        let prompt = ''
        if (replaceMode === 'text') {
          prompt = `将图片主体替换为：${textPrompt}`
        } else {
          prompt = '将参考图片的主体替换为上传图片中的主体'
        }
        
        requestBody = {
          prompt: prompt,
          referenceImage: referenceImage,
          replacementImage: replaceMode === 'image' ? replacementImage : undefined,
        }
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(180000)
      })

      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`)
      }

      const data = await response.json()

      if (data.success && data.imageUrl) {
        setGeneratedImage(data.imageUrl)
        onImageGenerated?.(data.imageUrl)
      } else {
        throw new Error(data.error || '处理图片失败')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '⚠️ 生成失败，请检查网络或调整描述/参考图后重试')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleRetry = () => {
    setError(null)
    generateImage()
  }

  return (
    <div className="h-full flex bg-gradient-to-br from-gray-900 via-black to-gray-900 relative">
      {/* 左侧：功能选择区 */}
      <div className="w-80 bg-black/40 backdrop-blur-xl border-r border-white/10 flex flex-col overflow-y-auto">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-base font-semibold text-white/90 mb-1">
            AI智能编辑 · 1步搞定高频需求
          </h2>
          <p className="text-xs text-gray-400">选择功能，上传图片，一键生成</p>
        </div>

        <div className="flex-1 p-4 space-y-6">
          {/* 核心编辑组 */}
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center">
              <span className="w-1 h-4 bg-blue-500 rounded-full mr-2"></span>
              核心编辑
            </h3>
            <div className="space-y-3">
              {(['remove-bg', 'replace'] as FeatureType[]).map((feat) => {
                const config = FEATURE_CONFIG[feat]
                const isSelected = feature === feat
                return (
                  <div key={feat} className="relative">
                    <button
                      onClick={() => setFeature(feat)}
                      onMouseEnter={() => setHoveredFeature(feat)}
                      onMouseLeave={() => setHoveredFeature(null)}
                      className={`w-full p-4 rounded-lg border transition-all ${
                        isSelected
                          ? `bg-gradient-to-r ${config.color} border-transparent shadow-lg scale-[1.02]`
                          : `bg-white/5 ${config.borderColor} hover:bg-white/10 border hover:scale-[1.01]`
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-2xl ${isSelected ? 'animate-pulse' : ''}`}>
                          {config.icon}
                        </span>
                        {hoveredFeature === feat && (
                          <span className="text-white/80 text-xs">?</span>
                        )}
                      </div>
                      <div className={`font-semibold mb-0.5 ${isSelected ? 'text-white' : 'text-gray-200'}`}>
                        {config.name}
                      </div>
                      <div className={`text-xs ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                        {config.description}
                      </div>
                    </button>
                    
                    {/* Tooltip */}
                    {hoveredFeature === feat && (
                      <div className="absolute left-0 right-0 -bottom-2 translate-y-full z-10 p-3 bg-gray-800 border border-white/20 rounded-lg text-xs text-gray-300 shadow-xl">
                        {config.tooltip}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* 辅助优化组 */}
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center">
              <span className="w-1 h-4 bg-orange-500 rounded-full mr-2"></span>
              辅助优化
            </h3>
            <div className="space-y-3">
              {(['remove-watermark'] as FeatureType[]).map((feat) => {
                const config = FEATURE_CONFIG[feat]
                const isSelected = feature === feat
                return (
                  <div key={feat} className="relative">
                    <button
                      onClick={() => setFeature(feat)}
                      onMouseEnter={() => setHoveredFeature(feat)}
                      onMouseLeave={() => setHoveredFeature(null)}
                      className={`w-full p-4 rounded-lg border transition-all ${
                        isSelected
                          ? `bg-gradient-to-r ${config.color} border-transparent shadow-lg scale-[1.02]`
                          : `bg-white/5 ${config.borderColor} hover:bg-white/10 border hover:scale-[1.01]`
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-2xl ${isSelected ? 'animate-pulse' : ''}`}>
                          {config.icon}
                        </span>
                        {hoveredFeature === feat && (
                          <span className="text-white/80 text-xs">?</span>
                        )}
                      </div>
                      <div className={`font-semibold mb-0.5 ${isSelected ? 'text-white' : 'text-gray-200'}`}>
                        {config.name}
                      </div>
                      <div className={`text-xs ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                        {config.description}
                      </div>
                    </button>
                    
                    {hoveredFeature === feat && (
                      <div className="absolute left-0 right-0 -bottom-2 translate-y-full z-10 p-3 bg-gray-800 border border-white/20 rounded-lg text-xs text-gray-300 shadow-xl">
                        {config.tooltip}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* 新手引导按钮 */}
          <button
            onClick={() => setShowGuide(true)}
            className="w-full p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg text-purple-400 text-sm hover:bg-purple-500/20 transition-colors flex items-center justify-center gap-2"
          >
            <span>💡</span>
            <span>新手引导</span>
          </button>
        </div>
      </div>

      {/* 中间：操作与预览区 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* 第一步：上传图片 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold">1</span>
                  上传需要编辑的图片
                </label>
              </div>
              
              <div 
                onClick={() => !referenceImage && fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl transition-all ${
                  referenceImage 
                    ? 'border-blue-500/50 bg-blue-500/5' 
                    : 'border-gray-600 hover:border-blue-400 hover:bg-white/5 cursor-pointer'
                }`}
              >
                {referenceImage ? (
                  <div className="relative group">
                    <div className="p-4 flex justify-center">
                      <Image
                        src={referenceImage}
                        alt="原始图片"
                        width={400}
                        height={400}
                        className="rounded-lg object-contain max-h-[400px] w-auto"
                      />
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setReferenceImage(null)
                        setGeneratedImage(null)
                        setError(null)
                      }}
                      className="absolute top-6 right-6 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-lg"
                    >
                      ✕
                    </button>
                    <div className="absolute bottom-6 left-6 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-lg text-white text-xs">
                      原图
                    </div>
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">📁 点击上传或拖拽文件</h3>
                    <p className="text-sm text-gray-400">支持 JPG、PNG、WEBP 格式，最大10MB</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'reference')}
                  className="hidden"
                />
              </div>
            </div>

            {/* 第二步：参数选项 */}
            {referenceImage && (
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold">2</span>
                    设置功能参数
                  </label>
                </div>

                {feature === 'replace' && (
                  <div className="space-y-4">
                    {/* 替换方式选择 */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => setReplaceMode('text')}
                        className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                          replaceMode === 'text'
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                            : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                        }`}
                      >
                        文字描述
                      </button>
                      <button
                        onClick={() => setReplaceMode('image')}
                        className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                          replaceMode === 'image'
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                            : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                        }`}
                      >
                        上传参考图
                      </button>
                    </div>

                    {replaceMode === 'text' ? (
                      <div>
                        <textarea
                          value={textPrompt}
                          onChange={(e) => setTextPrompt(e.target.value)}
                          placeholder="替换为一只白色萨摩耶，坐姿，草地背景"
                          className="w-full p-4 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-500 resize-none"
                          rows={3}
                        />
                        <p className="mt-2 text-xs text-gray-400">💡 示例提示：描述得越详细，生成效果越好</p>
                      </div>
                    ) : (
                      <div 
                        onClick={() => replacementFileInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-blue-400 transition-all hover:bg-white/5 cursor-pointer"
                      >
                        {replacementImage ? (
                          <div className="relative group">
                            <Image
                              src={replacementImage}
                              alt="替换图片"
                              width={200}
                              height={200}
                              className="mx-auto rounded-lg object-cover"
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setReplacementImage(null)
                              }}
                              className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-all"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-500/10 flex items-center justify-center">
                              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <p className="text-gray-300 mb-1">上传需替换的主体图片</p>
                            <p className="text-xs text-gray-500">AI将匹配风格</p>
                          </>
                        )}
                        <input
                          ref={replacementFileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'replacement')}
                          className="hidden"
                        />
                      </div>
                    )}
                  </div>
                )}

                {(feature === 'remove-bg' || feature === 'remove-watermark') && (
                  <div className={`p-4 ${FEATURE_CONFIG[feature].bgColor} border ${FEATURE_CONFIG[feature].borderColor} rounded-lg`}>
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{FEATURE_CONFIG[feature].icon}</span>
                      <div>
                        <div className="text-white font-semibold mb-1">{FEATURE_CONFIG[feature].name}</div>
                        <div className="text-gray-300 text-sm">{FEATURE_CONFIG[feature].tooltip}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 第三步：生成效果 */}
            {referenceImage && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold">3</span>
                    点击生成效果
                  </label>
                </div>
                
                <button
                  onClick={generateImage}
                  disabled={isGenerating}
                  className={`w-full py-4 rounded-xl font-semibold text-white transition-all transform hover:scale-[1.01] disabled:scale-100 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg ${
                    isGenerating
                      ? 'bg-gray-600'
                      : `bg-gradient-to-r ${FEATURE_CONFIG[feature].color} ${FEATURE_CONFIG[feature].hoverColor} shadow-${feature === 'remove-bg' ? 'green' : feature === 'remove-watermark' ? 'orange' : 'blue'}-500/25`
                  }`}
                >
                  {isGenerating ? (
                    <span className="flex items-center justify-center gap-3">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>AI处理中，请稍候...</span>
                    </span>
                  ) : (
                    <span>⚡ 生成效果</span>
                  )}
                </button>
              </div>
            )}

            {/* 错误提示 */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
                <span className="text-red-400 text-xl">⚠️</span>
                <div className="flex-1">
                  <p className="text-red-400 font-medium">{error}</p>
                </div>
                {error.includes('生成失败') && (
                  <button
                    onClick={handleRetry}
                    className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded text-white text-sm transition-colors"
                  >
                    重试
                  </button>
                )}
              </div>
            )}

            {/* 预览区域 */}
            {(generatedImage || isGenerating) && (
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-xs font-bold">✓</span>
                    生成结果
                  </h3>
                  {generatedImage && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setViewMode('side-by-side')}
                        className={`px-3 py-1 rounded text-xs ${viewMode === 'side-by-side' ? 'bg-blue-500 text-white' : 'bg-white/10 text-gray-400'}`}
                      >
                        左右对比
                      </button>
                      <button
                        onClick={() => setViewMode('result')}
                        className={`px-3 py-1 rounded text-xs ${viewMode === 'result' ? 'bg-blue-500 text-white' : 'bg-white/10 text-gray-400'}`}
                      >
                        仅看效果
                      </button>
                    </div>
                  )}
                </div>

                {isGenerating ? (
                  <div className="py-20 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-400">处理中，通常需要 3-10 秒...</p>
                  </div>
                ) : generatedImage ? (
                  <div>
                    {viewMode === 'side-by-side' ? (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                          <Image
                            src={referenceImage!}
                            alt="原图"
                            width={400}
                            height={400}
                            className="rounded-lg object-contain w-full"
                          />
                          <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-white text-xs font-medium">
                            原图
                          </div>
                        </div>
                        <div className="relative">
                          <Image
                            src={generatedImage}
                            alt="效果"
                            width={400}
                            height={400}
                            className="rounded-lg object-contain w-full"
                          />
                          <div className="absolute top-3 left-3 px-2 py-1 bg-green-500/80 backdrop-blur-sm rounded text-white text-xs font-medium">
                            效果图
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <Image
                          src={generatedImage}
                          alt="效果"
                          width={600}
                          height={600}
                          className="rounded-lg object-contain w-full mx-auto"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-20 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-400">🖼️ 处理后的图片将显示在这里</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 右侧：导出与辅助区 */}
      <div className="w-80 bg-black/40 backdrop-blur-xl border-l border-white/10 flex flex-col overflow-y-auto">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-base font-semibold text-white/90 mb-1">导出与工具</h2>
          <p className="text-xs text-gray-400">保存您的编辑成果</p>
        </div>

        <div className="flex-1 p-4 space-y-4">
          {/* 导出按钮 */}
          {generatedImage && (
            <div className="space-y-3">
              <a
                href={generatedImage}
                download={`edited-${Date.now()}.${feature === 'remove-bg' ? 'png' : 'jpg'}`}
                className="block w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg font-semibold text-center transition-all transform hover:scale-[1.02] shadow-lg shadow-green-500/25"
              >
                <span className="flex items-center justify-center gap-2">
                  <span>↓</span>
                  <span>导出图片</span>
                </span>
              </a>
              
              <button
                onClick={goToAdvancedEditor}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg font-semibold transition-all transform hover:scale-[1.02] shadow-lg shadow-purple-500/25"
              >
                <span className="flex items-center justify-center gap-2">
                  <span>🎨</span>
                  <span>高级编辑</span>
                </span>
              </button>
            </div>
          )}

          {/* 信任徽章 */}
          <div className="space-y-3 pt-4 border-t border-white/10">
            <h3 className="text-sm font-medium text-gray-400 mb-3">安全保障</h3>
            
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <div className="flex items-start gap-3">
                <span className="text-xl">🔒</span>
                <div>
                  <div className="text-green-400 font-semibold text-sm mb-1">本地处理 · 图片不上云</div>
                  <div className="text-gray-400 text-xs">所有编辑操作在您的设备本地完成，服务器不存储任何图片，保障隐私安全</div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <div className="flex items-start gap-3">
                <span className="text-xl">⚡</span>
                <div>
                  <div className="text-blue-400 font-semibold text-sm mb-1">AI实时处理 · 无需等待</div>
                  <div className="text-gray-400 text-xs">基于本地AI模型，处理速度≤3秒，大图片也不卡顿</div>
                </div>
              </div>
            </div>
          </div>

          {/* 效果案例 */}
          <div className="pt-4 border-t border-white/10">
            <h3 className="text-sm font-medium text-gray-400 mb-3">功能示例</h3>
            <div className="space-y-3">
              {Object.entries(FEATURE_CONFIG).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => setFeature(key as FeatureType)}
                  className={`w-full p-3 rounded-lg border transition-all text-left ${
                    feature === key
                      ? `${config.bgColor} ${config.borderColor}`
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{config.icon}</span>
                    <span className="text-sm font-medium text-white">{config.name}</span>
                  </div>
                  <p className="text-xs text-gray-400">{config.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 新手引导浮窗 */}
      {showGuide && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-8">
          <div className="bg-gray-800 border border-white/20 rounded-2xl p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">📚 新手引导</h3>
              <button
                onClick={() => setShowGuide(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <div className="font-semibold text-white mb-1">上传图片</div>
                  <div className="text-sm text-gray-400">点击中间区域的上传按钮，选择需要编辑的图片</div>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <div className="font-semibold text-white mb-1">选择功能</div>
                  <div className="text-sm text-gray-400">在左侧选择要使用的AI功能（去背景、替换主体、去水印）</div>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <div className="font-semibold text-white mb-1">导出保存</div>
                  <div className="text-sm text-gray-400">点击右侧的导出按钮，保存处理后的图片</div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowGuide(false)}
              className="w-full mt-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-semibold transition-all"
            >
              开始使用
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
