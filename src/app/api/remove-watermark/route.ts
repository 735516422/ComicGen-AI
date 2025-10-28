import { NextRequest } from 'next/server'
import {
  callDoubaoAPI,
  handleDoubaoResponse,
  handleAPIError,
  validateRequired,
  ERROR_MESSAGES,
} from '@/lib/doubao'

/**
 * 去除水印 API
 * AI 自动检测并清除图片中的水印、文字标记等
 */
export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json()

    // 验证必需参数
    const validationError = validateRequired(!!image, ERROR_MESSAGES.NO_IMAGE)
    if (validationError) return validationError

    // 调用豆包 API
    const data = await callDoubaoAPI({
      prompt: '移除图片中的所有水印、文字标记、logo，保持图片内容完整清晰',
      image,
    })

    // 处理响应
    return handleDoubaoResponse(data)

  } catch (error) {
    return handleAPIError(error)
  }
}

