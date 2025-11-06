import { forwardRef } from 'react'

interface CanvasContainerProps {
  children: React.ReactNode
  isLoadingImage: boolean
  containerRef: React.RefObject<HTMLDivElement>
  canvasWidth: number
  canvasHeight: number
}

export const CanvasContainer = forwardRef<HTMLCanvasElement, CanvasContainerProps>(
  ({ children, isLoadingImage, containerRef, canvasWidth, canvasHeight }, canvasRef) => {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 画布容器 - 确保不会溢出 */}
        <div
          ref={containerRef}
          className="flex-1 flex items-center justify-center bg-gray-700 p-4 overflow-hidden relative w-full h-full"
          style={{
            // 确保容器有明确的最大尺寸限制
            maxWidth: '100%',
            maxHeight: '100%',
          }}
        >
          {/* 加载指示器 */}
          {isLoadingImage && (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-900/50 z-50 pointer-events-none">
              <div className="text-center pointer-events-auto">
                <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-white text-lg">正在加载图片...</p>
              </div>
            </div>
          )}

          {/* 画布包装器 - 限制最大尺寸 */}
          <div
            className="relative shadow-2xl"
            style={{
              // 动态计算最大尺寸，确保不超过容器
              maxWidth: '100%',
              maxHeight: '100%',
              // 保持画布宽高比
              aspectRatio: `${canvasWidth} / ${canvasHeight}`,
            }}
          >
            {children}
          </div>
        </div>
      </div>
    )
  }
)

CanvasContainer.displayName = 'CanvasContainer'