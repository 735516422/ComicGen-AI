interface ZoomControlsProps {
  zoom: number
  onZoomIn: () => void
  onZoomOut: () => void
  onFitToScreen: () => void
  onResetZoom: () => void
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
  onExportImage: () => void
}

export function ZoomControls({
  zoom,
  onZoomIn,
  onZoomOut,
  onFitToScreen,
  onResetZoom,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onExportImage,
}: ZoomControlsProps) {
  return (
    <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ↶ 撤销
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ↷ 重做
        </button>
      </div>

      {/* 缩放控制 */}
      <div className="flex items-center gap-2">
        <button
          onClick={onZoomOut}
          className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded"
          title="缩小"
        >
          🔍−
        </button>
        <span className="px-3 py-1 bg-gray-700 rounded min-w-[80px] text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={onZoomIn}
          className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded"
          title="放大"
        >
          🔍+
        </button>
        <button
          onClick={onFitToScreen}
          className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded"
          title="适应窗口"
        >
          ⛶
        </button>
        <button
          onClick={onResetZoom}
          className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded"
          title="实际大小 (100%)"
        >
          1:1
        </button>
        <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded text-blue-400 text-xs">
          💡 Ctrl + 滚轮缩放
        </div>
      </div>

      <button
        onClick={onExportImage}
        className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded font-semibold"
      >
        导出图片
      </button>
    </div>
  )
}