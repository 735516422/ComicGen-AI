/**
 * 画布比例计算工具函数
 */

export interface CanvasDimensions {
  width: number
  height: number
}

export interface ContainerDimensions {
  width: number
  height: number
}

/**
 * 计算最适合的缩放比例，保持原始宽高比
 * @param canvas 画布尺寸
 * @param container 容器尺寸
 * @param padding 边距
 * @returns 缩放比例
 */
export function calculateOptimalScale(
  canvas: CanvasDimensions,
  container: ContainerDimensions,
  padding: number = 40
): number {
  const availableWidth = container.width - padding
  const availableHeight = container.height - padding

  const scaleX = availableWidth / canvas.width
  const scaleY = availableHeight / canvas.height

  // 返回较小的缩放比例，确保画布完全适应容器
  return Math.min(scaleX, scaleY, 1)
}

/**
 * 检查画布是否需要缩放
 * @param canvas 画布尺寸
 * @param container 容器尺寸
 * @param padding 边距
 * @returns 是否需要缩放
 */
export function needsScaling(
  canvas: CanvasDimensions,
  container: ContainerDimensions,
  padding: number = 40
): boolean {
  const availableWidth = container.width - padding
  const availableHeight = container.height - padding

  return canvas.width > availableWidth || canvas.height > availableHeight
}

/**
 * 计算居中位置
 * @param canvas 画布尺寸
 * @param container 容器尺寸
 * @param scale 缩放比例
 * @returns 居中偏移量
 */
export function calculateCenterOffset(
  canvas: CanvasDimensions,
  container: ContainerDimensions,
  scale: number
): { left: number; top: number } {
  const scaledWidth = canvas.width * scale
  const scaledHeight = canvas.height * scale

  const left = (container.width - scaledWidth) / 2
  const top = (container.height - scaledHeight) / 2

  return { left, top }
}

/**
 * 获取画布宽高比描述
 * @param width 宽度
 * @param height 高度
 * @returns 比例描述字符串
 */
export function getAspectRatioDescription(width: number, height: number): string {
  const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b)
  const divisor = gcd(width, height)

  const aspectWidth = Math.round(width / divisor)
  const aspectHeight = Math.round(height / divisor)

  return `${aspectWidth}:${aspectHeight}`
}