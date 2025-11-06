import { useState, useCallback } from 'react'
import * as fabric from 'fabric'
import { Layer, FabricObjectWithData } from '../types/canvas'
import { getObjectName, getObjectType } from '../utils/canvas'

export const useLayers = () => {
  const [layers, setLayers] = useState<Layer[]>([])

  const updateLayers = useCallback((fabricCanvas: fabric.Canvas) => {
    try {
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
    } catch (error) {
      console.error('更新图层列表失败:', error)
    }
  }, [])

  const addLayer = useCallback((layer: Layer) => {
    setLayers(prev => [...prev, layer])
  }, [])

  const toggleLayerVisibility = useCallback((layer: Layer, fabricCanvas: fabric.Canvas) => {
    layer.object.visible = !layer.object.visible
    fabricCanvas.renderAll()
    updateLayers(fabricCanvas)
  }, [updateLayers])

  const toggleLayerLock = useCallback((layer: Layer, fabricCanvas: fabric.Canvas) => {
    layer.object.selectable = !layer.object.selectable
    layer.object.evented = !layer.object.evented
    fabricCanvas.renderAll()
    updateLayers(fabricCanvas)
  }, [updateLayers])

  const selectLayer = useCallback((layer: Layer, fabricCanvas: fabric.Canvas) => {
    if (layer.locked) return
    fabricCanvas.setActiveObject(layer.object)
    fabricCanvas.renderAll()
  }, [])

  const deleteLayer = useCallback((layer: Layer, fabricCanvas: fabric.Canvas) => {
    if (layer.locked || layer.name.includes('主图层')) {
      alert('主图层（背景）无法删除')
      return
    }
    fabricCanvas.remove(layer.object)
    fabricCanvas.renderAll()
  }, [])

  const moveLayerUp = useCallback((layer: Layer, fabricCanvas: fabric.Canvas) => {
    if (layer.locked || layer.name.includes('主图层')) return
    fabricCanvas.bringObjectForward(layer.object)
    fabricCanvas.renderAll()
    updateLayers(fabricCanvas)
  }, [updateLayers])

  const moveLayerDown = useCallback((layer: Layer, fabricCanvas: fabric.Canvas) => {
    if (layer.locked || layer.name.includes('主图层')) return
    fabricCanvas.sendObjectBackwards(layer.object)
    fabricCanvas.renderAll()
    updateLayers(fabricCanvas)
  }, [updateLayers])

  return {
    layers,
    setLayers,
    updateLayers,
    addLayer,
    toggleLayerVisibility,
    toggleLayerLock,
    selectLayer,
    deleteLayer,
    moveLayerUp,
    moveLayerDown,
  }
}