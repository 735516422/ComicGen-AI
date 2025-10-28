/**
 * 豆包 API 客户端
 * 封装所有与豆包 API 交互的逻辑
 */

import { NextResponse } from 'next/server'
import {
  DOUBAO_API_ENDPOINT,
  DOUBAO_MODEL,
  API_TIMEOUT,
  DEFAULT_IMAGE_CONFIG,
  ERROR_MESSAGES,
} from './config'
import type {
  DoubaoAPIParams,
  DoubaoAPIResponse,
  SuccessResponse,
  ErrorResponse,
} from './types'

/**
 * 调用豆包 API
 */
export async function callDoubaoAPI(
  params: Partial<DoubaoAPIParams>
): Promise<DoubaoAPIResponse> {
  const apiKey = process.env.DOUBAO_API_KEY

  if (!apiKey) {
    throw new Error(ERROR_MESSAGES.NO_API_KEY)
  }

  // 合并默认配置
  const apiParams: DoubaoAPIParams = {
    model: DOUBAO_MODEL,
    ...DEFAULT_IMAGE_CONFIG,
    ...params,
  } as DoubaoAPIParams

  console.log('调用豆包API:', {
    prompt: apiParams.prompt,
    hasImage: !!apiParams.image,
    task: apiParams.task,
  })

  const response = await fetch(DOUBAO_API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(apiParams),
    signal: AbortSignal.timeout(API_TIMEOUT),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Doubao API error:', errorText)
    throw new Error(`${ERROR_MESSAGES.API_CALL_FAILED}: ${response.status}`)
  }

  return await response.json()
}

/**
 * 处理豆包 API 响应
 */
export function handleDoubaoResponse(
  data: DoubaoAPIResponse
): NextResponse<SuccessResponse | ErrorResponse> {
  if (data.data && data.data.length > 0) {
    const imageUrl = data.data[0].url
    return NextResponse.json({
      success: true,
      imageUrl: imageUrl,
    })
  } else {
    return NextResponse.json(
      { error: ERROR_MESSAGES.INVALID_RESPONSE },
      { status: 500 }
    )
  }
}

/**
 * 统一错误处理
 */
export function handleAPIError(
  error: unknown
): NextResponse<ErrorResponse> {
  console.error('API error:', error)
  const message = error instanceof Error ? error.message : ERROR_MESSAGES.SERVER_ERROR
  return NextResponse.json(
    { error: message },
    { status: 500 }
  )
}

/**
 * 验证必需参数
 */
export function validateRequired(
  condition: boolean,
  errorMessage: string
): NextResponse<ErrorResponse> | null {
  if (!condition) {
    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    )
  }
  return null
}

