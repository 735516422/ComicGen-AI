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
  PNG_IMAGE_CONFIG,
  ERROR_MESSAGES,
} from './config'
import type {
  DoubaoAPIParams,
  DoubaoAPIResponse,
  SuccessResponse,
  ErrorResponse,
} from './types'
import { testAPIResponse } from './test-png'

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
    responseFormat: apiParams.response_format,
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

  const jsonData = await response.json()

  // 测试返回的格式
  const formatTest = testAPIResponse(jsonData)
  console.log('API响应格式测试 (标准):', formatTest)

  return jsonData
}

/**
 * 调用豆包 API - 强制返回PNG格式
 */
export async function callDoubaoAPIPNG(
  params: Partial<DoubaoAPIParams>
): Promise<DoubaoAPIResponse> {
  const apiKey = process.env.DOUBAO_API_KEY

  if (!apiKey) {
    throw new Error(ERROR_MESSAGES.NO_API_KEY)
  }

  // 使用PNG专用配置
  const apiParams: DoubaoAPIParams = {
    model: DOUBAO_MODEL,
    ...PNG_IMAGE_CONFIG,
    ...params,
    // 确保使用b64_json格式以获得PNG
    response_format: 'b64_json',
  } as DoubaoAPIParams

  console.log('调用豆包API (PNG格式):', {
    prompt: apiParams.prompt,
    hasImage: !!apiParams.image,
    task: apiParams.task,
    responseFormat: 'b64_json',
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

  const jsonData = await response.json()

  // 测试返回的格式
  const formatTest = testAPIResponse(jsonData)
  console.log('API响应格式测试 (PNG):', formatTest)

  return jsonData
}

/**
 * 处理豆包 API 响应 - 支持PNG格式
 */
export function handleDoubaoResponse(
  data: DoubaoAPIResponse
): NextResponse<SuccessResponse | ErrorResponse> {
  if (data.data && data.data.length > 0) {
    const imageData = data.data[0]
    let imageUrl: string

    // 处理base64格式的响应，确保PNG格式
    if (imageData.b64_json) {
      // 将base64数据转换为PNG格式的data URL
      imageUrl = `data:image/png;base64,${imageData.b64_json}`
    } else if (imageData.url) {
      // 如果返回的是URL，添加PNG格式提示（通过参数）
      const url = new URL(imageData.url)
      url.searchParams.set('format', 'png')
      imageUrl = url.toString()
    } else {
      return NextResponse.json(
        { error: ERROR_MESSAGES.INVALID_RESPONSE },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      imageUrl: imageUrl,
      format: 'png', // 明确返回PNG格式
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

