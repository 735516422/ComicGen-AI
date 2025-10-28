'use client'

import { useState, useRef, ChangeEvent } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface ImageEditorProps {
  onImageGenerated?: (imageUrl: string) => void
}

export default function ImageEditor({ onImageGenerated }: ImageEditorProps) {
  const router = useRouter()
  const [referenceImage, setReferenceImage] = useState<string | null>(null)
  const [replacementImage, setReplacementImage] = useState<string | null>(null)
  const [textPrompt, setTextPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [feature, setFeature] = useState<'replace' | 'remove-bg' | 'remove-watermark'>('replace')
  const [replaceMode, setReplaceMode] = useState<'text' | 'image'>('text')

  const fileInputRef = useRef<HTMLInputElement>(null)
  const replacementFileInputRef = useRef<HTMLInputElement>(null)

  // 跳转到高级编辑器
  const goToAdvancedEditor = () => {
    if (generatedImage) {
      // 保存到 sessionStorage
      sessionStorage.setItem('editImage', generatedImage)
      // 跳转到编辑页面
      router.push(`/advanced-editor?image=${encodeURIComponent(generatedImage)}`)
    }
  }

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>, type: 'reference' | 'replacement') => {
    const file = e.target.files?.[0]
    if (file) {
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
        // 去背景功能
        endpoint = '/api/remove-background'
        requestBody = {
          image: referenceImage,
        }
        console.log('调用去背景功能')
      } else if (feature === 'remove-watermark') {
        // 去水印功能
        endpoint = '/api/remove-watermark'
        requestBody = {
          image: referenceImage,
        }
        console.log('调用去水印功能')
      } else {
        // 替换功能
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
        
        console.log('提示词:', prompt)
        console.log('替换模式:', replaceMode)
      }

      // 调用API
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(180000) // 3分钟超时
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
      setError(err instanceof Error ? err.message : '处理图片时发生错误')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl">
      <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
        AI图片编辑工具
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 左侧：上传区域 */}
        <div className="space-y-6">
          {/* 功能选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              选择功能
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setFeature('replace')}
                className={`py-4 px-3 rounded-xl transition-all ${
                  feature === 'replace'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/20'
                }`}
              >
                <div className="text-center">
                  <div className="font-semibold text-base">替换主体</div>
                  <div className="text-xs opacity-75 mt-1">更换内容</div>
                </div>
              </button>
              <button
                onClick={() => setFeature('remove-bg')}
                className={`py-4 px-3 rounded-xl transition-all ${
                  feature === 'remove-bg'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30 scale-105'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/20'
                }`}
              >
                <div className="text-center">
                  <div className="font-semibold text-base">去背景</div>
                  <div className="text-xs opacity-75 mt-1">抠图去背</div>
                </div>
              </button>
              <button
                onClick={() => setFeature('remove-watermark')}
                className={`py-4 px-3 rounded-xl transition-all ${
                  feature === 'remove-watermark'
                    ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/30 scale-105'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/20'
                }`}
              >
                <div className="text-center">
                  <div className="font-semibold text-base">去水印</div>
                  <div className="text-xs opacity-75 mt-1">清除水印</div>
                </div>
              </button>
            </div>
          </div>

          {/* 参考图片上传 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {feature === 'remove-bg' || feature === 'remove-watermark' ? '上传图片' : '参考图片'}
            </label>
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center hover:border-blue-400 transition-all hover:bg-white/5">
              {referenceImage ? (
                <div className="relative">
                  <Image
                    src={referenceImage}
                    alt="参考图片"
                    width={300}
                    height={300}
                    className="mx-auto rounded-lg object-cover"
                  />
                  <button
                    onClick={() => setReferenceImage(null)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div>
                  <svg className="mx-auto h-12 w-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105"
                  >
                    选择图片
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'reference')}
                    className="hidden"
                  />
                </div>
              )}
            </div>
          </div>

          {/* 替换功能的选项 */}
          {feature === 'replace' && (
            <>
              {/* 替换模式选择 */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  替换方式
                </label>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setReplaceMode('text')}
                    className={`flex-1 py-2 px-4 rounded-lg transition-all ${
                      replaceMode === 'text'
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/20'
                    }`}
                  >
                    文字描述
                  </button>
                  <button
                    onClick={() => setReplaceMode('image')}
                    className={`flex-1 py-2 px-4 rounded-lg transition-all ${
                      replaceMode === 'image'
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/20'
                    }`}
                  >
                    上传图片
                  </button>
                </div>
              </div>

              {/* 替换内容输入 */}
              {replaceMode === 'text' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    替换成什么
                  </label>
                  <textarea
                    value={textPrompt}
                    onChange={(e) => setTextPrompt(e.target.value)}
                    placeholder="例如：一只可爱的小猫、一个戴眼镜的男生、一朵向日葵、一辆红色跑车..."
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 hover:bg-white/15 transition-colors"
                    rows={4}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    lang="zh-CN"
                    inputMode="text"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    上传替换图片
                  </label>
                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center hover:border-blue-400 transition-all hover:bg-white/5">
                    {replacementImage ? (
                      <div className="relative">
                        <Image
                          src={replacementImage}
                          alt="替换图片"
                          width={250}
                          height={250}
                          className="mx-auto rounded-lg object-cover"
                        />
                        <button
                          onClick={() => setReplacementImage(null)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div>
                        <svg className="mx-auto h-12 w-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <button
                          onClick={() => replacementFileInputRef.current?.click()}
                          className="mt-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105"
                        >
                          选择图片
                        </button>
                        <input
                          ref={replacementFileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'replacement')}
                          className="hidden"
                        />
                        <p className="text-gray-400 text-sm mt-2">将会提取这张图片的主体进行替换</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* 去背景功能的说明 */}
          {feature === 'remove-bg' && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <div>
                <div className="text-green-400 font-semibold mb-1">一键去背景</div>
                <div className="text-gray-300 text-sm">
                  AI 会自动识别并去除图片背景，保留主体内容
                </div>
              </div>
            </div>
          )}

          {/* 去水印功能的说明 */}
          {feature === 'remove-watermark' && (
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
              <div>
                <div className="text-orange-400 font-semibold mb-1">智能去水印</div>
                <div className="text-gray-300 text-sm">
                  AI 会自动检测并清除图片中的水印、文字标记等
                </div>
              </div>
            </div>
          )}

          {/* 生成按钮 */}
          <button
            onClick={generateImage}
            disabled={isGenerating || !referenceImage}
            className={`w-full py-3 text-white rounded-lg disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed transition-all transform hover:scale-105 hover:shadow-lg font-semibold ${
              feature === 'remove-bg'
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 hover:shadow-green-500/25'
                : feature === 'remove-watermark'
                ? 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 hover:shadow-orange-500/25'
                : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 hover:shadow-blue-500/25'
            }`}
          >
            {isGenerating ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                处理中...
              </span>
            ) : (
              feature === 'remove-bg' ? '去掉背景' : feature === 'remove-watermark' ? '去除水印' : '生成图片'
            )}
          </button>
        </div>

        {/* 右侧：结果展示 */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              生成结果
            </label>
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 min-h-[400px] flex items-center justify-center hover:border-blue-400 transition-all hover:bg-white/5">
              {generatedImage ? (
                <Image
                  src={generatedImage}
                  alt="生成的图片"
                  width={400}
                  height={400}
                  className="rounded-lg object-cover"
                />
              ) : (
                <div className="text-center text-gray-400">
                  <svg className="mx-auto h-12 w-12 text-gray-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-400">生成的图片将在这里显示</p>
                </div>
              )}
            </div>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg backdrop-blur-sm">
              <p>{error}</p>
            </div>
          )}

          {/* 操作按钮 */}
          {generatedImage && (
            <div className="space-y-3">
              <button
                onClick={goToAdvancedEditor}
                className="block w-full text-center py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-all transform hover:scale-105 hover:shadow-lg hover:shadow-orange-500/25 font-semibold"
              >
                高级编辑
              </button>
              
              <a
                href={generatedImage}
                download="generated-image.jpg"
                className="block w-full text-center py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 font-semibold"
              >
                下载图片
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}