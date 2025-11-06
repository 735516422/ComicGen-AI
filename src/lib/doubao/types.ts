/**
 * 豆包 API 类型定义
 */

// 豆包 API 请求参数
export interface DoubaoAPIParams {
  model: string
  prompt: string
  image?: string | string[]
  n?: number
  size?: string
  quality?: 'standard' | 'hd'
  response_format?: 'url' | 'b64_json'
  style?: 'natural' | 'vivid'
  watermark?: boolean
  task?: string
  [key: string]: any
}

// 豆包 API 响应数据
export interface DoubaoAPIResponse {
  data?: Array<{
    url: string
    b64_json?: string
  }>
  error?: {
    message: string
    code?: string
  }
}

// 统一的成功响应
export interface SuccessResponse {
  success: true
  imageUrl: string
  format?: string // 图片格式，如 'png'
}

// 统一的错误响应
export interface ErrorResponse {
  error: string
}

