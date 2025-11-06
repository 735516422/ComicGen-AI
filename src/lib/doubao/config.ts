/**
 * 豆包 API 配置
 */

// API 端点
export const DOUBAO_API_ENDPOINT = 'https://ark.cn-beijing.volces.com/api/v3/images/generations'

// API 模型
export const DOUBAO_MODEL = 'doubao-seedream-4-0-250828'

// 请求超时时间（毫秒）
export const API_TIMEOUT = 180000 // 3分钟

// 默认配置 - 强制返回PNG格式
export const DEFAULT_IMAGE_CONFIG = {
  n: 1,
  size: '1024x1024' as const,
  quality: 'hd' as const,
  response_format: 'b64_json' as const, // 使用base64格式，确保PNG
  style: 'natural' as const,
  watermark: false,
}

// PNG格式专用配置
export const PNG_IMAGE_CONFIG = {
  n: 1,
  size: '1024x1024' as const,
  quality: 'hd' as const,
  response_format: 'b64_json' as const, // base64格式，确保PNG
  style: 'natural' as const,
  watermark: false,
}

// 错误消息
export const ERROR_MESSAGES = {
  NO_API_KEY: 'API密钥未配置',
  API_CALL_FAILED: '豆包API调用失败',
  INVALID_RESPONSE: 'API返回的数据格式不正确',
  SERVER_ERROR: '服务器内部错误',
  NO_IMAGE: '请上传图片',
  NO_PROMPT: '请输入替换内容',
}

