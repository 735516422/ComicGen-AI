import { TextStyle } from '../types/canvas'

interface ToolbarProps {
  textStyle: TextStyle
  onTextStyleChange: (style: Partial<TextStyle>) => void
  onAddText: () => void
  onAddRectangle: () => void
  onAddCircle: () => void
  onDuplicateSelected: () => void
  onDeleteSelected: () => void
}

export function Toolbar({
  textStyle,
  onTextStyleChange,
  onAddText,
  onAddRectangle,
  onAddCircle,
  onDuplicateSelected,
  onDeleteSelected,
}: ToolbarProps) {
  return (
    <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold">工具箱</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {/* 基础工具 */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-400 mb-2">基础工具</h3>
          <button
            onClick={onAddText}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded flex items-center justify-center gap-2"
          >
            <span>A</span>
            <span>添加文字</span>
          </button>

          <button
            onClick={onAddRectangle}
            className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 rounded flex items-center justify-center gap-2"
          >
            <span>□</span>
            <span>添加矩形</span>
          </button>

          <button
            onClick={onAddCircle}
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
            onChange={(e) => onTextStyleChange({ fontFamily: e.target.value })}
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
            onChange={(e) => onTextStyleChange({ fontSize: Number(e.target.value) })}
            className="w-full p-2 bg-gray-700 rounded"
            min="8"
            max="200"
            placeholder="字号"
          />

          <input
            type="color"
            value={textStyle.fill}
            onChange={(e) => onTextStyleChange({ fill: e.target.value })}
            className="w-full p-1 bg-gray-700 rounded h-10"
          />

          <div className="flex gap-2">
            <button
              onClick={() => onTextStyleChange({
                fontWeight: textStyle.fontWeight === 'bold' ? 'normal' : 'bold'
              })}
              className={`flex-1 py-2 px-4 rounded ${textStyle.fontWeight === 'bold' ? 'bg-blue-600' : 'bg-gray-700'}`}
            >
              <strong>B</strong>
            </button>
            <button
              onClick={() => onTextStyleChange({
                fontStyle: textStyle.fontStyle === 'italic' ? 'normal' : 'italic'
              })}
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
            onClick={onDuplicateSelected}
            className="w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded"
          >
            复制
          </button>

          <button
            onClick={onDeleteSelected}
            className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 rounded"
          >
            删除
          </button>
        </div>
      </div>
    </div>
  )
}