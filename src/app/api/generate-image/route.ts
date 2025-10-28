import { NextRequest } from 'next/server'
import {
  callDoubaoAPI,
  handleDoubaoResponse,
  handleAPIError,
  validateRequired,
  ERROR_MESSAGES,
} from '@/lib/doubao'

/**
 * 图片主体替换 API
 * 支持文字描述替换和图片替换两种模式
 */
export async function POST(request: NextRequest) {
  try {
    const { prompt, referenceImage, replacementImage } = await request.json()

    // 验证必需参数
    const validationError = validateRequired(!!prompt, ERROR_MESSAGES.NO_PROMPT)
    if (validationError) return validationError

    // 构建图片参数
    let image: string | string[] | undefined
    if (replacementImage) {
      // 图片替换模式：传递图片数组
      image = [referenceImage, replacementImage]
    } else if (referenceImage) {
      // 文字替换模式：传递单张图片
      image = referenceImage
    }

    // 调用豆包 API
    const data = await callDoubaoAPI({
      prompt,
      image,
    })

    // 处理响应
    return handleDoubaoResponse(data)

  } catch (error) {
    return handleAPIError(error)
  }
}