import { useEffect, useRef, useState } from 'react'
import * as fabric from 'fabric'

interface UseFabricCanvasOptions {
  onObjectModified?: (canvas: fabric.Canvas, isDisposing: { current: boolean }) => void
  onObjectRemoved?: (canvas: fabric.Canvas, isDisposing: { current: boolean }) => void
  onZoomChange?: (zoom: number) => void
}

export const useFabricCanvas = (options: UseFabricCanvasOptions = {}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null)
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null)
  const isDisposing = useRef(false)
  const zoomRef = useRef(1)
  const isDragging = useRef(false)
  const lastPosX = useRef(0)
  const lastPosY = useRef(0)

  useEffect(() => {
    if (!canvasRef.current || fabricCanvasRef.current) return

    console.log('初始化画布')
    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: 600,
      height: 400,
      backgroundColor: 'transparent',
      preserveObjectStacking: true,
      allowTouchScrolling: false,
      selection: true,
      // 启用画布拖动
      viewportTransform: [1, 0, 0, 1, 0, 0],
    })

    fabricCanvasRef.current = fabricCanvas
    setCanvas(fabricCanvas)

    // 监听对象修改
    fabricCanvas.on('object:modified', () => {
      options.onObjectModified?.(fabricCanvas, isDisposing)
    })

    // 监听对象删除
    fabricCanvas.on('object:removed', () => {
      options.onObjectRemoved?.(fabricCanvas, isDisposing)
    })

    // 鼠标滚轮缩放 (Ctrl + 滚轮)
    const handleWheel = (opt: any) => {
      const evt = opt.e
      if (evt.ctrlKey) {
        evt.preventDefault()
        evt.stopPropagation()

        const delta = evt.deltaY
        let newZoom = fabricCanvas.getZoom()
        newZoom *= 0.999 ** delta

        // 限制缩放范围 10% - 500%
        if (newZoom > 5) newZoom = 5
        if (newZoom < 0.1) newZoom = 0.1

        fabricCanvas.zoomToPoint(
          new fabric.Point(evt.offsetX, evt.offsetY),
          newZoom
        )

        zoomRef.current = newZoom
        options.onZoomChange?.(newZoom)

        opt.e.preventDefault()
        opt.e.stopPropagation()
      }
    }

    fabricCanvas.on('mouse:wheel', handleWheel)

    // 画布拖动功能
    const handleMouseDown = (opt: any) => {
      const evt = opt.e
      // 只有在按住空格键或中键时才启用拖动
      if (evt.button === 1 || evt.spaceKey) { // 中键或空格键
        isDragging.current = true
        lastPosX.current = evt.clientX
        lastPosY.current = evt.clientY
        fabricCanvas.selection = false // 禁用选择
        fabricCanvas.defaultCursor = 'grab'
        evt.preventDefault()
      }
    }

    const handleMouseMove = (opt: any) => {
      if (!isDragging.current) return

      const evt = opt.e
      const deltaX = evt.clientX - lastPosX.current
      const deltaY = evt.clientY - lastPosY.current

      const vpt = fabricCanvas.viewportTransform!
      vpt[4] += deltaX
      vpt[5] += deltaY

      fabricCanvas.setViewportTransform(vpt)
      fabricCanvas.requestRenderAll()

      lastPosX.current = evt.clientX
      lastPosY.current = evt.clientY
      evt.preventDefault()
    }

    const handleMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false
        fabricCanvas.selection = true // 恢复选择
        fabricCanvas.defaultCursor = 'default'
      }
    }

    // 添加拖动事件监听
    fabricCanvas.on('mouse:down', handleMouseDown)
    fabricCanvas.on('mouse:move', handleMouseMove)
    fabricCanvas.on('mouse:up', handleMouseUp)

    // 键盘事件监听（空格键）
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault()
        fabricCanvas.defaultCursor = 'grab'
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        fabricCanvas.defaultCursor = 'default'
        isDragging.current = false
      }
    }

    // 添加键盘事件监听
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)

    return () => {
      console.log('销毁画布')
      isDisposing.current = true
      fabricCanvas.off('mouse:wheel', handleWheel)
      fabricCanvas.off('mouse:down', handleMouseDown)
      fabricCanvas.off('mouse:move', handleMouseMove)
      fabricCanvas.off('mouse:up', handleMouseUp)
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
      fabricCanvas.dispose()
      fabricCanvasRef.current = null
      isDisposing.current = false
    }
  }, [options.onObjectModified, options.onObjectRemoved, options.onZoomChange])

  return { canvasRef, canvas, isDisposing, zoomRef }
}








