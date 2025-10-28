'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import * as fabric from 'fabric'

interface AdvancedImageEditorProps {
  initialImage?: string
  onSave?: (imageUrl: string) => void
}

interface Layer {
  id: string
  name: string
  type: 'image' | 'text' | 'shape'
  visible: boolean
  locked: boolean
  object: fabric.FabricObject
}

interface FabricObjectWithData extends fabric.FabricObject {
  data?: {
    id?: string
    name?: string
  }
}

export default function AdvancedImageEditor({ initialImage, onSave }: AdvancedImageEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null)
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null)
  const [layers, setLayers] = useState<Layer[]>([])
  const [selectedTool, setSelectedTool] = useState<'select' | 'text' | 'rectangle' | 'circle'>('select')
  const [textStyle, setTextStyle] = useState({
    fontFamily: 'Arial',
    fontSize: 32,
    fill: '#000000',
    fontWeight: 'normal' as 'normal' | 'bold',
    fontStyle: 'normal' as 'normal' | 'italic',
  })
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [isLoadingImage, setIsLoadingImage] = useState(false)
  const imageLoadedRef = useRef(false)
  const [zoom, setZoom] = useState(1)
  const containerRef = useRef<HTMLDivElement>(null)
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 })

  // 添加图层
  const addLayer = useCallback((layer: Layer) => {
    setLayers(prev => [...prev, layer])
  }, [])

  // 更新图层列表
  const updateLayers = useCallback((fabricCanvas: fabric.Canvas) => {
    const objects = fabricCanvas.getObjects()
    setLayers(objects.map((obj, index) => {
      const objWithData = obj as FabricObjectWithData
      return {
        id: objWithData.data?.id || `layer_${index}`,
        name: objWithData.data?.name || getObjectName(obj),
        type: getObjectType(obj),
        visible: obj.visible !== false,
        locked: obj.selectable === false,
        object: obj,
      }
    }))
  }, [])

  // 保存历史 - 使用 ref 避免依赖问题
  const saveHistory = useCallback((fabricCanvas: fabric.Canvas) => {
    const json = JSON.stringify(fabricCanvas.toJSON())
    setHistoryIndex(prev => {
      const newIndex = prev + 1
      setHistory(history => [...history.slice(0, newIndex), json])
      return newIndex
    })
  }, [])

  // 初始化画布 - 只初始化一次
  useEffect(() => {
    if (!canvasRef.current || fabricCanvasRef.current) return

    console.log('初始化画布')
    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: 800, // 初始大小，加载图片后会调整
      height: 600,
      backgroundColor: '#ffffff',
      preserveObjectStacking: true,
    })

    fabricCanvasRef.current = fabricCanvas
    setCanvas(fabricCanvas)

    // 监听对象修改和删除
    fabricCanvas.on('object:modified', () => {
      updateLayers(fabricCanvas)
      const json = JSON.stringify(fabricCanvas.toJSON())
      setHistoryIndex(prev => {
        const newIndex = prev + 1
        setHistory(history => [...history.slice(0, newIndex), json])
        return newIndex
      })
    })
    fabricCanvas.on('object:removed', () => updateLayers(fabricCanvas))

    return () => {
      console.log('销毁画布')
      fabricCanvas.dispose()
      fabricCanvasRef.current = null
    }
  }, [updateLayers])

  // 加载初始图片 - 独立的 effect
  useEffect(() => {
    if (!canvas || !initialImage || imageLoadedRef.current) return
    
    imageLoadedRef.current = true
    console.log('开始加载图片:', initialImage)
    
    // 加载图片的辅助函数
    const loadImage = async (imgUrl: string) => {
      setIsLoadingImage(true)
      try {
        // 判断是否为 base64 或外部 URL
        const isBase64 = imgUrl.startsWith('data:')
        
        // 对于外部 URL，先转换为 blob，避免 CORS 问题
        let finalUrl = imgUrl
        if (!isBase64) {
          console.log('检测到外部 URL，通过代理加载...')
          try {
            // 使用 Next.js API 代理加载图片
            const response = await fetch('/api/proxy-image', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ imageUrl: imgUrl }),
            })
            
            if (response.ok) {
              const data = await response.json()
              finalUrl = data.dataUrl
              console.log('通过代理转换成功')
            } else {
              console.warn('代理失败，尝试直接加载')
            }
          } catch (proxyError) {
            console.warn('代理加载失败，尝试直接加载:', proxyError)
          }
        }

        // 使用 fabric 加载图片
        const img = await fabric.FabricImage.fromURL(finalUrl)
        console.log('图片加载成功:', img)
        
        // 获取图片原始尺寸
        const imgWidth = img.width || 800
        const imgHeight = img.height || 600
        
        // 设置画布为图片原始尺寸
        canvas.setDimensions({
          width: imgWidth,
          height: imgHeight,
        })
        setCanvasSize({ width: imgWidth, height: imgHeight })
        console.log(`画布大小设置为图片原始尺寸: ${imgWidth} x ${imgHeight}`)
        
        // 图片不缩放，完全填充画布
        img.set({
          left: 0,
          top: 0,
          selectable: true,
          scaleX: 1,
          scaleY: 1,
        })
        const imgWithData = img as FabricObjectWithData
        imgWithData.data = {
          id: generateId(),
          name: '背景图片',
        }
        canvas.add(img)
        canvas.renderAll()

        addLayer({
          id: imgWithData.data.id!,
          name: imgWithData.data.name!,
          type: 'image',
          visible: true,
          locked: false,
          object: img,
        })

        // 保存初始历史
        const json = JSON.stringify(canvas.toJSON())
        setHistory([json])
        setHistoryIndex(0)
        
        // 自动适应容器大小
        setTimeout(() => {
          if (!containerRef.current) return
          
          const container = containerRef.current
          const containerWidth = container.clientWidth - 100
          const containerHeight = container.clientHeight - 100
          
          const scaleX = containerWidth / imgWidth
          const scaleY = containerHeight / imgHeight
          const newZoom = Math.min(scaleX, scaleY, 1)
          
          setZoom(newZoom)
          if (canvasRef.current) {
            canvasRef.current.style.transform = `scale(${newZoom})`
            canvasRef.current.style.transformOrigin = 'center center'
          }
        }, 100)
        
      } catch (error) {
        console.error('图片加载失败:', error)
        alert(`图片加载失败: ${error instanceof Error ? error.message : '未知错误'}。\n请检查图片URL是否正确或网络连接。`)
      } finally {
        setIsLoadingImage(false)
      }
    }

    loadImage(initialImage)
  }, [canvas, initialImage, addLayer])

  // 获取对象类型
  const getObjectType = (obj: fabric.FabricObject): 'image' | 'text' | 'shape' => {
    if (obj.type === 'image' || obj.type === 'i-text' || obj.type === 'text') {
      return obj.type === 'image' ? 'image' : 'text'
    }
    return 'shape'
  }

  // 获取对象名称
  const getObjectName = (obj: fabric.FabricObject): string => {
    if (obj.type === 'image') return '图片'
    if (obj.type === 'i-text' || obj.type === 'text') return '文字'
    if (obj.type === 'rect') return '矩形'
    if (obj.type === 'circle') return '圆形'
    return '图层'
  }

  // 撤销
  const undo = () => {
    if (!canvas || historyIndex <= 0) return
    const newIndex = historyIndex - 1
    canvas.loadFromJSON(history[newIndex], () => {
      canvas.renderAll()
      setHistoryIndex(newIndex)
      updateLayers(canvas)
    })
  }

  // 重做
  const redo = () => {
    if (!canvas || historyIndex >= history.length - 1) return
    const newIndex = historyIndex + 1
    canvas.loadFromJSON(history[newIndex], () => {
      canvas.renderAll()
      setHistoryIndex(newIndex)
      updateLayers(canvas)
    })
  }

  // 添加文字
  const addText = () => {
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
  }

  // 添加矩形
  const addRectangle = () => {
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
  }

  // 添加圆形
  const addCircle = () => {
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
  }

  // 删除选中对象
  const deleteSelected = () => {
    if (!canvas) return
    const activeObjects = canvas.getActiveObjects()
    activeObjects.forEach(obj => canvas.remove(obj))
    canvas.discardActiveObject()
    canvas.renderAll()
    saveHistory(canvas)
  }

  // 复制选中对象
  const duplicateSelected = async () => {
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
  }

  // 图层操作
  const toggleLayerVisibility = (layer: Layer) => {
    layer.object.visible = !layer.object.visible
    canvas?.renderAll()
    updateLayers(canvas!)
  }

  const toggleLayerLock = (layer: Layer) => {
    layer.object.selectable = !layer.object.selectable
    layer.object.evented = !layer.object.evented
    canvas?.renderAll()
    updateLayers(canvas!)
  }

  const selectLayer = (layer: Layer) => {
    if (!canvas) return
    canvas.setActiveObject(layer.object)
    canvas.renderAll()
  }

  const deleteLayer = (layer: Layer) => {
    if (!canvas) return
    canvas.remove(layer.object)
    canvas.renderAll()
    saveHistory(canvas)
  }

  const moveLayerUp = (layer: Layer) => {
    if (!canvas) return
    canvas.bringObjectForward(layer.object)
    canvas.renderAll()
    updateLayers(canvas)
  }

  const moveLayerDown = (layer: Layer) => {
    if (!canvas) return
    canvas.sendObjectBackwards(layer.object)
    canvas.renderAll()
    updateLayers(canvas)
  }

  // 缩放控制
  const handleZoom = useCallback((newZoom: number) => {
    if (!canvas || !canvasRef.current) return
    setZoom(newZoom)
    
    const canvasElement = canvasRef.current
    canvasElement.style.transform = `scale(${newZoom})`
    canvasElement.style.transformOrigin = 'center center'
  }, [canvas])

  // 放大
  const zoomIn = () => {
    const newZoom = Math.min(zoom * 1.2, 5) // 最大 500%
    handleZoom(newZoom)
  }

  // 缩小
  const zoomOut = () => {
    const newZoom = Math.max(zoom / 1.2, 0.1) // 最小 10%
    handleZoom(newZoom)
  }

  // 适应窗口
  const fitToScreen = useCallback(() => {
    if (!containerRef.current || !canvasSize.width) return
    
    const container = containerRef.current
    const containerWidth = container.clientWidth - 100 // 留一些边距
    const containerHeight = container.clientHeight - 100
    
    const scaleX = containerWidth / canvasSize.width
    const scaleY = containerHeight / canvasSize.height
    const newZoom = Math.min(scaleX, scaleY, 1) // 不超过 100%
    
    handleZoom(newZoom)
  }, [canvasSize, handleZoom])

  // 重置为 100%
  const resetZoom = () => {
    handleZoom(1)
  }

  // 导出图片
  const exportImage = () => {
    if (!canvas) return
    const dataURL = canvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 1,
    })
    
    // 下载
    const link = document.createElement('a')
    link.download = `edited-image-${Date.now()}.png`
    link.href = dataURL
    link.click()

    // 回调
    onSave?.(dataURL)
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* 左侧工具栏 */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold">工具箱</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {/* 基础工具 */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-400 mb-2">基础工具</h3>
            <button
              onClick={addText}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded flex items-center justify-center gap-2"
            >
              <span>A</span>
              <span>添加文字</span>
            </button>

            <button
              onClick={addRectangle}
              className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 rounded flex items-center justify-center gap-2"
            >
              <span>□</span>
              <span>添加矩形</span>
            </button>

            <button
              onClick={addCircle}
              className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 rounded flex items-center justify-center gap-2"
            >
              <span>○</span>
              <span>添加圆形</span>
            </button>
          </div>

          {/* 文字样式 */}
          <div className="space-y-2 pt-4 border-t border-gray-700">
            <h3 className="text-sm font-semibold text-gray-400 mb-2">文字样式</h3>
            
            <select
              value={textStyle.fontFamily}
              onChange={(e) => setTextStyle(prev => ({ ...prev, fontFamily: e.target.value }))}
              className="w-full p-2 bg-gray-700 rounded"
            >
              <option value="Arial">Arial</option>
              <option value="Helvetica">Helvetica</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Courier">Courier</option>
              <option value="Georgia">Georgia</option>
              <option value="微软雅黑">微软雅黑</option>
            </select>

            <input
              type="number"
              value={textStyle.fontSize}
              onChange={(e) => setTextStyle(prev => ({ ...prev, fontSize: Number(e.target.value) }))}
              className="w-full p-2 bg-gray-700 rounded"
              min="8"
              max="200"
              placeholder="字号"
            />

            <input
              type="color"
              value={textStyle.fill}
              onChange={(e) => setTextStyle(prev => ({ ...prev, fill: e.target.value }))}
              className="w-full p-1 bg-gray-700 rounded h-10"
            />

            <div className="flex gap-2">
              <button
                onClick={() => setTextStyle(prev => ({ 
                  ...prev, 
                  fontWeight: prev.fontWeight === 'bold' ? 'normal' : 'bold' 
                }))}
                className={`flex-1 py-2 px-4 rounded ${textStyle.fontWeight === 'bold' ? 'bg-blue-600' : 'bg-gray-700'}`}
              >
                <strong>B</strong>
              </button>
              <button
                onClick={() => setTextStyle(prev => ({ 
                  ...prev, 
                  fontStyle: prev.fontStyle === 'italic' ? 'normal' : 'italic' 
                }))}
                className={`flex-1 py-2 px-4 rounded ${textStyle.fontStyle === 'italic' ? 'bg-blue-600' : 'bg-gray-700'}`}
              >
                <em>I</em>
              </button>
            </div>
          </div>

          {/* 编辑操作 */}
          <div className="space-y-2 pt-4 border-t border-gray-700">
            <h3 className="text-sm font-semibold text-gray-400 mb-2">编辑</h3>
            
            <button
              onClick={duplicateSelected}
              className="w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded"
            >
              复制
            </button>

            <button
              onClick={deleteSelected}
              className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 rounded"
            >
              删除
            </button>
          </div>
        </div>
      </div>

      {/* 中间画布区域 */}
      <div className="flex-1 flex flex-col">
        {/* 顶部工具栏 */}
        <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ↶ 撤销
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ↷ 重做
            </button>
          </div>

          {/* 缩放控制 */}
          <div className="flex items-center gap-2">
            <button
              onClick={zoomOut}
              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded"
              title="缩小"
            >
              🔍−
            </button>
            <span className="px-3 py-1 bg-gray-700 rounded min-w-[80px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={zoomIn}
              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded"
              title="放大"
            >
              🔍+
            </button>
            <button
              onClick={fitToScreen}
              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded"
              title="适应窗口"
            >
              ⛶
            </button>
            <button
              onClick={resetZoom}
              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded"
              title="实际大小 (100%)"
            >
              1:1
            </button>
          </div>

          <button
            onClick={exportImage}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded font-semibold"
          >
            导出图片
          </button>
        </div>

        {/* 画布 */}
        <div 
          ref={containerRef}
          className="flex-1 flex items-center justify-center bg-gray-700 p-8 overflow-hidden relative"
        >
          {isLoadingImage && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 z-10">
              <div className="text-center">
                <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-white text-lg">正在加载图片...</p>
              </div>
            </div>
          )}
          <div className="shadow-2xl transition-transform duration-200">
            <canvas ref={canvasRef} />
          </div>
        </div>
      </div>

      {/* 右侧图层面板 */}
      <div className="w-64 bg-gray-800 border-l border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold">图层</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {layers.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              暂无图层
            </div>
          ) : (
            [...layers].reverse().map((layer, index) => (
              <div
                key={layer.id}
                className="bg-gray-700 rounded p-3 hover:bg-gray-600 cursor-pointer"
                onClick={() => selectLayer(layer)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium truncate flex-1">{layer.name}</span>
                  <span className="text-xs text-gray-400 ml-2">
                    {layer.type === 'image' ? '图' : layer.type === 'text' ? '文' : '形'}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleLayerVisibility(layer)
                    }}
                    className="p-1 hover:bg-gray-500 rounded text-xs"
                    title={layer.visible ? '隐藏' : '显示'}
                  >
                    {layer.visible ? '👁' : '👁‍🗨'}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleLayerLock(layer)
                    }}
                    className="p-1 hover:bg-gray-500 rounded text-xs"
                    title={layer.locked ? '解锁' : '锁定'}
                  >
                    {layer.locked ? '🔒' : '🔓'}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      moveLayerUp(layer)
                    }}
                    className="p-1 hover:bg-gray-500 rounded text-xs"
                    title="上移"
                  >
                    ↑
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      moveLayerDown(layer)
                    }}
                    className="p-1 hover:bg-gray-500 rounded text-xs"
                    title="下移"
                  >
                    ↓
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteLayer(layer)
                    }}
                    className="p-1 hover:bg-red-600 rounded text-xs ml-auto"
                    title="删除"
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

