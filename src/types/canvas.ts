import * as fabric from 'fabric'

export interface Layer {
  id: string
  name: string
  type: 'image' | 'text' | 'shape'
  visible: boolean
  locked: boolean
  object: fabric.FabricObject
}

export interface FabricObjectWithData extends fabric.FabricObject {
  data?: {
    id?: string
    name?: string
  }
}

export interface TextStyle {
  fontFamily: string
  fontSize: number
  fill: string
  fontWeight: 'normal' | 'bold'
  fontStyle: 'normal' | 'italic'
}

export type Tool = 'select' | 'text' | 'rectangle' | 'circle'

export interface CanvasSize {
  width: number
  height: number
}