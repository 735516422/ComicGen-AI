'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import * as fabric from 'fabric'
import { useFabricCanvas } from '../hooks/useFabricCanvas'
import { useLayers } from '../hooks/useLayers'
import { useHistory } from '../hooks/useHistory'
import { useZoom } from '../hooks/useZoom'
import { Toolbar } from './Toolbar'
import { LayerPanel } from './LayerPanel'
import { ZoomControls } from './ZoomControls'
import { CanvasContainer } from './CanvasContainer'
import { CanvasTips } from './CanvasTips'
import { TextStyle, FabricObjectWithData } from '../types/canvas'
import { generateId } from '../utils/canvas'
import { exportImageArea } from '../utils/canvasExport'

interface AdvancedImageEditorProps {
  initialImage?: string
  onSave?: (imageUrl: string) => void
}

export default function AdvancedImageEditor({ initialImage, onSave }: AdvancedImageEditorProps) {
  const [selectedTool, setSelectedTool] = useState<'select' | 'text' | 'rectangle' | 'circle'>('select')
  const [textStyle, setTextStyle] = useState<TextStyle>({
    fontFamily: 'Arial',
    fontSize: 32,
    fill: '#000000',
    fontWeight: 'normal',
    fontStyle: 'normal',
  })

  const [showTips, setShowTips] = useState(true) // 显示操作提示

  // 使用 ref 来避免回调函数的依赖问题
  const updateLayersRef = useRef<((fabricCanvas: fabric.Canvas) => void) | null>(null)
  const saveHistoryRef = useRef<((fabricCanvas: fabric.Canvas) => void) | null>(null)
  const setZoomRef = useRef<((zoom: number) => void) | null>(null)

  // Custom hooks - 先初始化 hooks
  const { layers, updateLayers, addLayer, toggleLayerVisibility, toggleLayerLock, selectLayer, deleteLayer, moveLayerUp, moveLayerDown } = useLayers()
  const { saveHistory, undo, redo, initHistory, canUndo, canRedo } = useHistory()
  const { zoom, setZoom, containerRef, canvasSize, setCanvasSize, zoomIn, zoomOut, fitToScreen, resetZoom, centerCanvas } = useZoom()

  // 更新 ref 引用
  updateLayersRef.current = updateLayers
  saveHistoryRef.current = saveHistory
  setZoomRef.current = setZoom

  // 使用 ref 的回调函数，避免依赖循环
  const handleObjectModified = useCallback((fabricCanvas: fabric.Canvas, isDisposing: { current: boolean }) => {
    if (isDisposing.current) return
    updateLayersRef.current?.(fabricCanvas)
    saveHistoryRef.current?.(fabricCanvas)
  }, [])

  const handleObjectRemoved = useCallback((fabricCanvas: fabric.Canvas, isDisposing: { current: boolean }) => {
    if (isDisposing.current) return
    updateLayersRef.current?.(fabricCanvas)
  }, [])

  const handleZoomChange = useCallback((zoom: number) => {
    setZoomRef.current?.(zoom)
  }, [])

  const { canvasRef, canvas, isDisposing, zoomRef } = useFabricCanvas({
    onObjectModified: handleObjectModified,
    onObjectRemoved: handleObjectRemoved,
    onZoomChange: handleZoomChange,
  })
  const [isLoadingImage, setIsLoadingImage] = useState(false)
  const imageLoadedRef = useRef(false)

  // 处理图片加载完成
  const handleImageLoad = useCallback(async (fabricCanvas: fabric.Canvas) => {
    const imgWidth = fabricCanvas.width!
    const imgHeight = fabricCanvas.height!

    setCanvasSize({ width: imgWidth, height: imgHeight })

    // 添加主图层
    const objects = fabricCanvas.getObjects()
    if (objects.length > 0) {
      const mainImage = objects[0] as FabricObjectWithData
      addLayer({
        id: mainImage.data?.id || generateId(),
        name: mainImage.data?.name || '主图层（背景）',
        type: 'image',
        visible: true,
        locked: true,
        object: mainImage,
      })
    }

    // 初始化历史记录
    initHistory(JSON.stringify(fabricCanvas.toJSON()))

    // 自动适应容器，保持图片原始比例
    setTimeout(() => {
      centerCanvas(fabricCanvas)
    }, 100)
  }, [addLayer, initHistory, centerCanvas, setCanvasSize])

  // 加载初始图片
  const loadInitialImage = useCallback(async (fabricCanvas: fabric.Canvas) => {
    if (!fabricCanvas || !initialImage || imageLoadedRef.current) return

    imageLoadedRef.current = true
    setIsLoadingImage(true)

    try {
      const isBase64 = initialImage.startsWith('data:')
      let finalUrl = initialImage

      if (!isBase64) {
        try {
          const response = await fetch('/api/proxy-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageUrl: initialImage }),
          })

          if (response.ok) {
            const data = await response.json()
            finalUrl = data.dataUrl
          }
        } catch (error) {
          console.warn('代理加载失败，尝试直接加载:', error)
        }
      }

      const img = await fabric.FabricImage.fromURL(finalUrl)
      const imgWidth = img.width || 800
      const imgHeight = img.height || 600

      // 设置画布大小与图片原始尺寸完全一致，保持宽高比
      fabricCanvas.setDimensions({
        width: imgWidth,
        height: imgHeight,
      })

      // 图片以原始尺寸填满画布，保持1:1比例
      img.set({
        left: 0,
        top: 0,
        selectable: false,
        evented: false,
        scaleX: 1,
        scaleY: 1,
        // 图片使用原始尺寸，与画布完全匹配
      })

      const imgWithData = img as FabricObjectWithData
      imgWithData.data = {
        id: generateId(),
        name: '主图层（背景）',
      }

      fabricCanvas.add(img)
      fabricCanvas.sendObjectToBack(img)
      fabricCanvas.renderAll()

      await handleImageLoad(fabricCanvas)
    } catch (error) {
      console.error('图片加载失败:', error)
      alert(`图片加载失败: ${error instanceof Error ? error.message : '未知错误'}。\n请检查图片URL是否正确或网络连接。`)
    } finally {
      setIsLoadingImage(false)
    }
  }, [initialImage, handleImageLoad])

  // 设置画布事件处理器
  useEffect(() => {
    if (!canvas) return

    // 缩放事件处理器已在useFabricCanvas中处理
    // 其他初始化逻辑
    loadInitialImage(canvas)
  }, [canvas, loadInitialImage])

  // 工具函数
  const addText = useCallback(() => {
    if (!canvas) return

    const text = new fabric.IText('双击编辑文字', {
      left: canvas.width! / 2 - 100,
      top: canvas.height! / 2 - 50,
      ...textStyle,
      editable: true,
      data: {
        id: generateId(),
        name: '文字图层',
      },
    })

    canvas.add(text)
    canvas.setActiveObject(text)
    canvas.renderAll()
    saveHistory(canvas)
  }, [canvas, textStyle, saveHistory])

  const addRectangle = useCallback(() => {
    if (!canvas) return

    const rect = new fabric.Rect({
      left: canvas.width! / 2 - 75,
      top: canvas.height! / 2 - 50,
      width: 150,
      height: 100,
      fill: '#3B82F6',
      stroke: '#1E40AF',
      strokeWidth: 2,
      data: {
        id: generateId(),
        name: '矩形',
      },
    })

    canvas.add(rect)
    canvas.setActiveObject(rect)
    canvas.renderAll()
    saveHistory(canvas)
  }, [canvas, saveHistory])

  const addCircle = useCallback(() => {
    if (!canvas) return

    const circle = new fabric.Circle({
      left: canvas.width! / 2 - 60,
      top: canvas.height! / 2 - 60,
      radius: 60,
      fill: '#10B981',
      stroke: '#059669',
      strokeWidth: 2,
      data: {
        id: generateId(),
        name: '圆形',
      },
    })

    canvas.add(circle)
    canvas.setActiveObject(circle)
    canvas.renderAll()
    saveHistory(canvas)
  }, [canvas, saveHistory])

  const deleteSelected = useCallback(() => {
    if (!canvas) return
    const activeObjects = canvas.getActiveObjects()
    activeObjects.forEach(obj => canvas.remove(obj))
    canvas.discardActiveObject()
    canvas.renderAll()
    saveHistory(canvas)
  }, [canvas, saveHistory])

  const duplicateSelected = useCallback(async () => {
    if (!canvas) return
    const activeObject = canvas.getActiveObject()
    if (!activeObject) return

    const cloned = await activeObject.clone()
    const clonedWithData = cloned as FabricObjectWithData
    clonedWithData.set({
      left: (cloned.left || 0) + 10,
      top: (cloned.top || 0) + 10,
    })
    const activeWithData = activeObject as FabricObjectWithData
    clonedWithData.data = {
      id: generateId(),
      name: `${activeWithData.data?.name || '图层'} 副本`,
    }
    canvas.add(cloned)
    canvas.setActiveObject(cloned)
    canvas.renderAll()
    saveHistory(canvas)
  }, [canvas, saveHistory])

  // 图层操作包装函数
  const handleToggleLayerVisibility = useCallback((layer: any) => {
    if (!canvas) return
    toggleLayerVisibility(layer, canvas)
  }, [canvas, toggleLayerVisibility])

  const handleToggleLayerLock = useCallback((layer: any) => {
    if (!canvas) return
    toggleLayerLock(layer, canvas)
  }, [canvas, toggleLayerLock])

  const handleSelectLayer = useCallback((layer: any) => {
    if (!canvas) return
    selectLayer(layer, canvas)
  }, [canvas, selectLayer])

  const handleDeleteLayer = useCallback((layer: any) => {
    if (!canvas) return
    deleteLayer(layer, canvas)
    saveHistory(canvas)
  }, [canvas, deleteLayer, saveHistory])

  const handleMoveLayerUp = useCallback((layer: any) => {
    if (!canvas) return
    moveLayerUp(layer, canvas)
  }, [canvas, moveLayerUp])

  const handleMoveLayerDown = useCallback((layer: any) => {
    if (!canvas) return
    moveLayerDown(layer, canvas)
  }, [canvas, moveLayerDown])

  // 缩放操作包装函数
  const handleZoomIn = useCallback(() => {
    if (!canvas) return
    zoomIn(canvas)
  }, [canvas, zoomIn])

  const handleZoomOut = useCallback(() => {
    if (!canvas) return
    zoomOut(canvas)
  }, [canvas, zoomOut])

  const handleFitToScreen = useCallback(() => {
    if (!canvas) return
    fitToScreen(canvas)
  }, [canvas, fitToScreen])

  const handleResetZoom = useCallback(() => {
    if (!canvas) return
    resetZoom(canvas)
  }, [canvas, resetZoom])

  // 历史操作包装函数
  const handleUndo = useCallback(() => {
    if (!canvas) return
    undo(canvas, () => updateLayers(canvas))
  }, [canvas, undo, updateLayers])

  const handleRedo = useCallback(() => {
    if (!canvas) return
    redo(canvas, () => updateLayers(canvas))
  }, [canvas, redo, updateLayers])

  // 导出图片 - 只导出图片区域，不包含空白区域
  const exportImage = useCallback(() => {
    if (!canvas) return

    // 保存原始背景色
    const originalBgColor = canvas.backgroundColor
    canvas.backgroundColor = 'transparent'
    canvas.renderAll()

    try {
      // 使用新的导出函数，只导出有内容的区域
      const dataURL = exportImageArea(canvas, 'png', 1, 2) // 使用2倍分辨率以提高质量

      const link = document.createElement('a')
      link.download = `edited-image-${Date.now()}.png`
      link.href = dataURL
      link.click()

      onSave?.(dataURL)
    } catch (error) {
      console.error('导出图片失败:', error)
      // 如果新方法失败，回退到原始方法
      const dataURL = canvas.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 1,
      })

      const link = document.createElement('a')
      link.download = `edited-image-${Date.now()}.png`
      link.href = dataURL
      link.click()

      onSave?.(dataURL)
    } finally {
      // 恢复原始背景色
      canvas.backgroundColor = originalBgColor
      canvas.renderAll()
    }
  }, [canvas, onSave])

  // 文字样式更新
  const handleTextStyleChange = useCallback((styleUpdates: Partial<TextStyle>) => {
    setTextStyle(prev => ({ ...prev, ...styleUpdates }))
  }, [])

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* 左侧工具栏 */}
      <Toolbar
        textStyle={textStyle}
        onTextStyleChange={handleTextStyleChange}
        onAddText={addText}
        onAddRectangle={addRectangle}
        onAddCircle={addCircle}
        onDuplicateSelected={duplicateSelected}
        onDeleteSelected={deleteSelected}
      />

      {/* 中间画布区域 */}
      <div className="flex-1 flex flex-col">
        {/* 顶部工具栏 */}
        <ZoomControls
          zoom={zoom}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onFitToScreen={handleFitToScreen}
          onResetZoom={handleResetZoom}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onExportImage={exportImage}
        />

        {/* 画布 */}
        <CanvasContainer
          isLoadingImage={isLoadingImage}
          containerRef={containerRef}
          canvasWidth={canvasSize.width}
          canvasHeight={canvasSize.height}
        >
          <canvas ref={canvasRef} className="w-full h-full" />
        </CanvasContainer>
      </div>

      {/* 右侧图层面板 */}
      <LayerPanel
        layers={layers}
        onToggleVisibility={handleToggleLayerVisibility}
        onToggleLock={handleToggleLayerLock}
        onSelectLayer={handleSelectLayer}
        onDeleteLayer={handleDeleteLayer}
        onMoveLayerUp={handleMoveLayerUp}
        onMoveLayerDown={handleMoveLayerDown}
      />

      {/* 操作提示 */}
      {showTips && (
        <CanvasTips onClose={() => setShowTips(false)} />
      )}
    </div>
  )
}

