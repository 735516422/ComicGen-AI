import { useState, useCallback } from 'react'
import * as fabric from 'fabric'

export const useHistory = () => {
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  const saveHistory = useCallback((canvas: fabric.Canvas) => {
    try {
      const json = JSON.stringify(canvas.toJSON())
      setHistoryIndex(prev => {
        const newIndex = prev + 1
        setHistory(history => [...history.slice(0, newIndex), json])
        return newIndex
      })
    } catch (error) {
      console.error('保存历史失败:', error)
    }
  }, [])

  const undo = useCallback((canvas: fabric.Canvas, onComplete?: () => void) => {
    if (historyIndex <= 0) return
    const newIndex = historyIndex - 1
    canvas.loadFromJSON(history[newIndex], () => {
      canvas.renderAll()
      setHistoryIndex(newIndex)
      onComplete?.()
    })
  }, [history, historyIndex])

  const redo = useCallback((canvas: fabric.Canvas, onComplete?: () => void) => {
    if (historyIndex >= history.length - 1) return
    const newIndex = historyIndex + 1
    canvas.loadFromJSON(history[newIndex], () => {
      canvas.renderAll()
      setHistoryIndex(newIndex)
      onComplete?.()
    })
  }, [history, historyIndex])

  const initHistory = useCallback((json: string) => {
    setHistory([json])
    setHistoryIndex(0)
  }, [])

  return {
    history,
    historyIndex,
    saveHistory,
    undo,
    redo,
    initHistory,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
  }
}








