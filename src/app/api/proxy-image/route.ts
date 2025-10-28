import { NextRequest, NextResponse } from 'next/server'

/**
 * 图片代理 API
 * 用于解决外部图片的 CORS 问题
 * 将外部图片转换为 base64 data URL
 */
export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json()

    if (!imageUrl) {
      return NextResponse.json(
        { error: '缺少图片 URL' },
        { status: 400 }
      )
    }

    console.log('代理加载图片:', imageUrl)

    // 下载图片
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      signal: AbortSignal.timeout(30000), // 30秒超时
    })

    if (!response.ok) {
      throw new Error(`下载图片失败: ${response.status}`)
    }

    // 获取图片数据
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // 获取 Content-Type
    const contentType = response.headers.get('content-type') || 'image/png'
    
    // 转换为 base64
    const base64 = buffer.toString('base64')
    const dataUrl = `data:${contentType};base64,${base64}`

    console.log('图片代理成功，大小:', buffer.length, 'bytes')

    return NextResponse.json({
      success: true,
      dataUrl: dataUrl,
    })

  } catch (error) {
    console.error('图片代理失败:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '代理图片时发生错误' },
      { status: 500 }
    )
  }
}

