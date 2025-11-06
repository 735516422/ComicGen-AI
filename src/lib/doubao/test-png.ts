/**
 * PNG格式测试工具
 */

/**
 * 检查返回的图片是否为PNG格式
 */
export function isPNGFormat(imageUrl: string): boolean {
  // 检查data URL格式
  if (imageUrl.startsWith('data:')) {
    return imageUrl.includes('image/png')
  }

  // 检查URL参数格式
  try {
    const url = new URL(imageUrl)
    return url.searchParams.get('format') === 'png' ||
           url.pathname.toLowerCase().endsWith('.png')
  } catch {
    return false
  }
}

/**
 * 验证base64数据是否为PNG
 */
export function validatePNGBase64(base64Data: string): boolean {
  try {
    // PNG文件的魔术字节是：89 50 4E 47 0D 0A 1A 0A
    // 在base64中对应的是：iVBORw0KGgo=
    const binaryString = atob(base64Data)
    return binaryString.startsWith('\x89PNG\r\n\x1a\n')
  } catch {
    return false
  }
}

/**
 * 测试API响应格式
 */
export function testAPIResponse(response: any): {
  isPNG: boolean
  format: string
  hasBase64: boolean
  hasURL: boolean
} {
  const result = {
    isPNG: false,
    format: 'unknown',
    hasBase64: false,
    hasURL: false
  }

  if (response.data && response.data.length > 0) {
    const imageData = response.data[0]

    if (imageData.b64_json) {
      result.hasBase64 = true
      result.isPNG = validatePNGBase64(imageData.b64_json)
      result.format = result.isPNG ? 'png (base64)' : 'unknown (base64)'
    }

    if (imageData.url) {
      result.hasURL = true
      const isURLPNG = isPNGFormat(imageData.url)
      if (!result.isPNG) {
        result.isPNG = isURLPNG
        result.format = isURLPNG ? 'png (url)' : 'unknown (url)'
      }
    }
  }

  return result
}