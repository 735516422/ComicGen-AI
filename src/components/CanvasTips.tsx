interface CanvasTipsProps {
  onClose: () => void
}

export function CanvasTips({ onClose }: CanvasTipsProps) {
  return (
    <div className="fixed bottom-4 left-4 bg-gray-800 border border-gray-600 rounded-lg p-4 max-w-sm shadow-xl z-50">
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-sm font-semibold text-white">画布操作提示</h4>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white text-sm"
        >
          ✕
        </button>
      </div>

      <div className="space-y-2 text-xs text-gray-300">
        <div className="flex items-center gap-2">
          <span className="text-blue-400">🖱️</span>
          <span><kbd>Ctrl</kbd> + 滚轮：缩放画布</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-green-400">✋</span>
          <span>按住 <kbd>空格键</kbd> + 拖动：移动画布</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-purple-400">🖱️</span>
          <span>鼠标中键 + 拖动：移动画布</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-orange-400">💾</span>
          <span>导出时只保存图片内容区域</span>
        </div>
      </div>
    </div>
  )
}