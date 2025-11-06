import * as fabric from 'fabric'

/**
 * 导出图片区域（不包含空白区域）
 * @param canvas Fabric画布实例
 * @param format 导出格式
 * @param quality 图片质量
 * @param multiplier 缩放倍数
 * @returns base64图片数据
 */
export function exportImageArea(
  canvas: fabric.Canvas,
  format: string = 'png',
  quality: number = 1,
  multiplier: number = 1
): string {
  // 获取所有对象
  const objects = canvas.getObjects()
  if (objects.length === 0) {
    return canvas.toDataURL({ format, quality, multiplier })
  }

  // 计算所有对象的边界框
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  objects.forEach(obj => {
    const boundingRect = obj.getBoundingRect(true) // true 表示考虑变换
    minX = Math.min(minX, boundingRect.left)
    minY = Math.min(minY, boundingRect.top)
    maxX = Math.max(maxX, boundingRect.left + boundingRect.width)
    maxY = Math.max(maxY, boundingRect.top + boundingRect.height)
  })

  // 添加一些边距
  const padding = 10
  minX = Math.max(0, minX - padding)
  minY = Math.max(0, minY - padding)
  maxX = Math.min(canvas.width!, maxX + padding)
  maxY = Math.min(canvas.height!, maxY + padding)

  const width = maxX - minX
  const height = maxY - minY

  // 创建临时画布来裁剪区域
  const tempCanvas = document.createElement('canvas')
  tempCanvas.width = width * multiplier
  tempCanvas.height = height * multiplier
  const tempCtx = tempCanvas.getContext('2d')!

  // 设置白色背景（如果需要透明背景，可以移除这行）
  tempCtx.fillStyle = 'transparent'
  tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height)

  // 渲染指定区域
  const imageData = canvas.getContext()?.getImageData(
    minX * multiplier,
    minY * multiplier,
    width * multiplier,
    height * multiplier
  )

  if (imageData) {
    tempCtx.putImageData(imageData, 0, 0)
  }

  // 转换为DataURL
  return tempCanvas.toDataURL(`image/${format}`, quality)
}

/**
 * 获取画布中所有对象的边界框
 * @param canvas Fabric画布实例
 * @returns 边界框信息
 */
export function getCanvasBoundingBox(canvas: fabric.Canvas): {
  left: number
  top: number
  width: number
  height: number
} {
  const objects = canvas.getObjects()
  if (objects.length === 0) {
    return { left: 0, top: 0, width: canvas.width!, height: canvas.height! }
  }

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  objects.forEach(obj => {
    const boundingRect = obj.getBoundingRect(true)
    minX = Math.min(minX, boundingRect.left)
    minY = Math.min(minY, boundingRect.top)
    maxX = Math.max(maxX, boundingRect.left + boundingRect.width)
    maxY = Math.max(maxY, boundingRect.top + boundingRect.height)
  })

  return {
    left: Math.max(0, minX),
    top: Math.max(0, minY),
    width: Math.min(canvas.width!, maxX - Math.max(0, minX)),
    height: Math.min(canvas.height!, maxY - Math.max(0, minY))
  }
}