import { useState, useCallback, useRef } from 'react'
import * as fabric from 'fabric'
import { CanvasSize } from '../types/canvas'

export const useZoom = () => {
  const [zoom, setZoom] = useState(1)
  const zoomRef = useRef(1)
  const containerRef = useRef<HTMLDivElement>(null)
  const [canvasSize, setCanvasSize] = useState<CanvasSize>({ width: 600, height: 400 })

  const handleZoom = useCallback((newZoom: number, canvas: fabric.Canvas) => {
    if (!canvas || !containerRef.current) return
    setZoom(newZoom)
    zoomRef.current = newZoom

    const container = containerRef.current
    const containerWidth = container.clientWidth
    const containerHeight = container.clientHeight
    const canvasWidth = canvas.width! * newZoom
    const canvasHeight = canvas.height! * newZoom

    const left = (containerWidth - canvasWidth) / 2
    const top = (containerHeight - canvasHeight) / 2

    // 设置视口变换以居中画布
    canvas.setViewportTransform([newZoom, 0, 0, newZoom, left, top])
    canvas.renderAll()
  }, [])

  const zoomIn = useCallback((canvas: fabric.Canvas) => {
    const newZoom = Math.min(zoom * 1.2, 5)
    handleZoom(newZoom, canvas)
  }, [zoom, handleZoom])

  const zoomOut = useCallback((canvas: fabric.Canvas) => {
    const newZoom = Math.max(zoom / 1.2, 0.1)
    handleZoom(newZoom, canvas)
  }, [zoom, handleZoom])

  const fitToScreen = useCallback((canvas: fabric.Canvas) => {
    if (!containerRef.current) return

    const container = containerRef.current
    // 确保画布不会超出容器，留出一些边距
    const containerWidth = container.clientWidth - 40
    const containerHeight = container.clientHeight - 40

    const scaleX = containerWidth / canvas.width!
    const scaleY = containerHeight / canvas.height!
    const newZoom = Math.min(scaleX, scaleY, 1)

    handleZoom(newZoom, canvas)
  }, [handleZoom])

  const resetZoom = useCallback((canvas: fabric.Canvas) => {
    handleZoom(1, canvas)
  }, [handleZoom])

  // 计算最适合的缩放比例，保持图片比例
  const calculateFitToScreenZoom = useCallback((canvas: fabric.Canvas) => {
    if (!containerRef.current) return 1

    const container = containerRef.current
    const containerWidth = container.clientWidth - 40
    const containerHeight = container.clientHeight - 40

    const scaleX = containerWidth / canvas.width!
    const scaleY = containerHeight / canvas.height!

    // 返回最适合的缩放比例，保持宽高比
    return Math.min(scaleX, scaleY, 1)
  }, [])

  const centerCanvas = useCallback((canvas: fabric.Canvas) => {
    if (!containerRef.current) return

    const container = containerRef.current
    // 确保画布不会超出容器，留出一些边距
    const containerWidth = container.clientWidth - 40
    const containerHeight = container.clientHeight - 40

    const scaleX = containerWidth / canvas.width!
    const scaleY = containerHeight / canvas.height!
    // 只有当画布超出容器时才缩放，保持图片原始比例
    const newZoom = Math.min(scaleX, scaleY, 1)

    setZoom(newZoom)
    zoomRef.current = newZoom

    // 计算居中位置
    const fullContainerWidth = container.clientWidth
    const fullContainerHeight = container.clientHeight
    const canvasWidth = canvas.width! * newZoom
    const canvasHeight = canvas.height! * newZoom

    const left = (fullContainerWidth - canvasWidth) / 2
    const top = (fullContainerHeight - canvasHeight) / 2

    // 设置视口变换以居中画布，保持宽高比
    canvas.setViewportTransform([newZoom, 0, 0, newZoom, left, top])
    canvas.renderAll()
  }, [])

  return {
    zoom,
    setZoom,
    zoomRef,
    containerRef,
    canvasSize,
    setCanvasSize,
    handleZoom,
    zoomIn,
    zoomOut,
    fitToScreen,
    resetZoom,
    centerCanvas,
    calculateFitToScreenZoom,
  }
}