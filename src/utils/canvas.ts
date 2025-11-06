import * as fabric from 'fabric'
import { FabricObjectWithData } from '../types/canvas'

export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function getObjectType(obj: fabric.FabricObject): 'image' | 'text' | 'shape' {
  if (obj.type === 'image' || obj.type === 'i-text' || obj.type === 'text') {
    return obj.type === 'image' ? 'image' : 'text'
  }
  return 'shape'
}

export function getObjectName(obj: fabric.FabricObject): string {
  if (obj.type === 'image') return '图片'
  if (obj.type === 'i-text' || obj.type === 'text') return '文字'
  if (obj.type === 'rect') return '矩形'
  if (obj.type === 'circle') return '圆形'
  return '图层'
}

export async function loadImageFromUrl(imageUrl: string): Promise<string> {
  const isBase64 = imageUrl.startsWith('data:')

  if (!isBase64) {
    try {
      const response = await fetch('/api/proxy-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl }),
      })

      if (response.ok) {
        const data = await response.json()
        return data.dataUrl
      }
    } catch (error) {
      console.warn('代理加载失败，尝试直接加载:', error)
    }
  }

  return imageUrl
}

export function createFabricObjectWithData(obj: fabric.FabricObject, id?: string, name?: string): FabricObjectWithData {
  const objWithData = obj as FabricObjectWithData
  objWithData.data = {
    id: id || generateId(),
    name: name || getObjectName(obj),
  }
  return objWithData
}