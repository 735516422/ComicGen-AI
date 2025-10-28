import { NextRequest } from 'next/server'
import {
  callDoubaoAPI,
  handleDoubaoResponse,
  handleAPIError,
  validateRequired,
  ERROR_MESSAGES,
} from '@/lib/doubao'

/**
 * 去除图片背景 API
 * AI 自动识别并去除背景，保留主体
 */
export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json()

    // 验证必需参数
    const validationError = validateRequired(!!image, ERROR_MESSAGES.NO_IMAGE)
    if (validationError) return validationError

    // 调用豆包 API
    const data = await callDoubaoAPI({
      prompt: '去除图片背景，保留主体，背景透明',
      image,
      task: 'remove-background', // 任务类型标识
    })

    // 处理响应
    return handleDoubaoResponse(data)

  } catch (error) {
    return handleAPIError(error)
  }
}

