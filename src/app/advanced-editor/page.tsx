'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import AdvancedImageEditor from '@/components/AdvancedImageEditor'

function EditorContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  useEffect(() => {
    // 从 URL 参数获取图片
    const urlImage = searchParams.get('image')
    
    // 从 sessionStorage 获取图片
    const sessionImage = sessionStorage.getItem('editImage')

    // 优先使用 URL 参数，其次使用 sessionStorage
    const image = urlImage || sessionImage

    if (image) {
      setImageUrl(decodeURIComponent(image))
    } else {
      // 如果没有图片，提示用户
      alert('未找到图片，请先生成图片')
      router.push('/editor')
    }
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* 顶部导航 */}
      <nav className="bg-gray-800 border-b border-gray-700 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/editor" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AE</span>
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              高级编辑器
            </span>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <Link
            href="/editor"
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
          >
            ← 返回编辑器
          </Link>
          <Link
            href="/"
            className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
          >
            返回首页
          </Link>
        </div>
      </nav>

      {/* 编辑器主体 */}
      <div className="flex-1">
        {imageUrl ? (
          <AdvancedImageEditor
            initialImage={imageUrl}
            onSave={(savedImageUrl) => {
              console.log('图片已保存:', savedImageUrl)
              // 可以在这里添加保存后的逻辑，比如跳转回编辑器页面
            }}
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-400">正在加载图片...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AdvancedEditorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">加载中...</p>
        </div>
      </div>
    }>
      <EditorContent />
    </Suspense>
  )
}

