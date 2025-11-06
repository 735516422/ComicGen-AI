import { Layer } from '../types/canvas'

interface LayerPanelProps {
  layers: Layer[]
  onToggleVisibility: (layer: Layer) => void
  onToggleLock: (layer: Layer) => void
  onSelectLayer: (layer: Layer) => void
  onDeleteLayer: (layer: Layer) => void
  onMoveLayerUp: (layer: Layer) => void
  onMoveLayerDown: (layer: Layer) => void
}

export function LayerPanel({
  layers,
  onToggleVisibility,
  onToggleLock,
  onSelectLayer,
  onDeleteLayer,
  onMoveLayerUp,
  onMoveLayerDown,
}: LayerPanelProps) {
  return (
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
          [...layers].reverse().map((layer) => {
            const isMainLayer = layer.locked && layer.name.includes('主图层')
            return (
              <div
                key={layer.id}
                className={`rounded p-3 ${
                  isMainLayer
                    ? 'bg-blue-900/30 border border-blue-500/50'
                    : 'bg-gray-700 hover:bg-gray-600 cursor-pointer'
                }`}
                onClick={() => onSelectLayer(layer)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {isMainLayer && (
                      <span className="text-blue-400 text-xs flex-shrink-0">🖼️</span>
                    )}
                    <span className="font-medium truncate">{layer.name}</span>
                  </div>
                  <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                    {layer.type === 'image' ? '图' : layer.type === 'text' ? '文' : '形'}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onToggleVisibility(layer)
                    }}
                    className="p-1 hover:bg-gray-500 rounded text-xs"
                    title={layer.visible ? '隐藏' : '显示'}
                  >
                    {layer.visible ? '👁' : '👁‍🗨'}
                  </button>

                  {!isMainLayer && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onToggleLock(layer)
                      }}
                      className="p-1 hover:bg-gray-500 rounded text-xs"
                      title={layer.locked ? '解锁' : '锁定'}
                    >
                      {layer.locked ? '🔒' : '🔓'}
                    </button>
                  )}

                  {!isMainLayer && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onMoveLayerUp(layer)
                        }}
                        className="p-1 hover:bg-gray-500 rounded text-xs"
                        title="上移"
                      >
                        ↑
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onMoveLayerDown(layer)
                        }}
                        className="p-1 hover:bg-gray-500 rounded text-xs"
                        title="下移"
                      >
                        ↓
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onDeleteLayer(layer)
                        }}
                        className="p-1 hover:bg-red-600 rounded text-xs ml-auto"
                        title="删除"
                      >
                        🗑
                      </button>
                    </>
                  )}

                  {isMainLayer && (
                    <span className="text-xs text-blue-400 ml-auto">固定</span>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}