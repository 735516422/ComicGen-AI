# 🎨 高级图片编辑器使用文档

## 📦 安装依赖

```bash
npm install fabric @types/fabric
```

或者使用 pnpm:
```bash
pnpm install fabric @types/fabric
```

## 🚀 功能特性

### 1. **图层管理系统**
- ✅ 多图层支持
- ✅ 图层显示/隐藏
- ✅ 图层锁定/解锁
- ✅ 图层上移/下移
- ✅ 图层删除
- ✅ 实时图层预览

### 2. **文字编辑功能**
- ✅ 添加可编辑文字
- ✅ 双击直接编辑
- ✅ 字体选择（Arial、微软雅黑等）
- ✅ 字号调整（8-200px）
- ✅ 文字颜色选择
- ✅ 粗体/斜体样式
- ✅ 文字选中和移动
- ✅ 文字缩放和旋转

### 3. **形状绘制**
- ✅ 矩形绘制
- ✅ 圆形绘制
- ✅ 形状填充颜色
- ✅ 形状描边
- ✅ 形状变换（缩放、旋转）

### 4. **编辑操作**
- ✅ 撤销（Undo）
- ✅ 重做（Redo）
- ✅ 复制对象
- ✅ 删除对象
- ✅ 多选对象（Ctrl/Cmd + Click）
- ✅ 对象拖拽移动
- ✅ 对象缩放旋转

### 5. **导出功能**
- ✅ 导出为 PNG 格式
- ✅ 高质量导出（quality: 1）
- ✅ 自动下载
- ✅ 保存回调

## 🎯 使用流程

### 步骤 1：生成图片
1. 在主编辑器（`/editor`）中生成图片
2. 使用三大功能之一：
   - 替换主体
   - 去背景
   - 去水印

### 步骤 2：进入高级编辑
1. 图片生成后，点击「高级编辑」按钮
2. 自动跳转到高级编辑器（`/advanced-editor`）
3. 原图自动加载到画布

### 步骤 3：高级编辑
#### 添加文字
1. 点击左侧「添加文字」按钮
2. 文字出现在画布上
3. 双击文字直接编辑内容
4. 在左侧面板调整样式：
   - 选择字体
   - 调整字号
   - 更改颜色
   - 设置粗体/斜体

#### 添加形状
1. 点击「添加矩形」或「添加圆形」
2. 形状出现在画布上
3. 拖拽移动形状
4. 拉伸调整大小
5. 旋转调整角度

#### 图层操作
1. 右侧查看所有图层
2. 点击图层选中对象
3. 使用图层控制：
   - 👁 显示/隐藏
   - 🔒 锁定/解锁
   - ↑↓ 调整顺序
   - 🗑 删除图层

### 步骤 4：导出保存
1. 编辑完成后点击「导出图片」
2. 自动下载 PNG 格式图片
3. 文件名格式：`edited-image-{timestamp}.png`

## ⌨️ 快捷键（规划中）

| 快捷键 | 功能 |
|--------|------|
| Ctrl/Cmd + Z | 撤销 |
| Ctrl/Cmd + Shift + Z | 重做 |
| Ctrl/Cmd + C | 复制 |
| Ctrl/Cmd + V | 粘贴 |
| Delete/Backspace | 删除选中对象 |
| Ctrl/Cmd + A | 全选 |

## 🏗️ 技术架构

### 核心技术栈
- **React 18** - UI 框架
- **Next.js 14** - 应用框架
- **Fabric.js** - Canvas 图形库
- **TypeScript** - 类型安全
- **Tailwind CSS** - 样式框架

### 数据流
```
用户操作 → Fabric.js Canvas → 图层更新 → React State → UI 刷新
```

### 历史记录
- 使用 Canvas JSON 序列化
- 每次修改保存快照
- 支持撤销/重做

## 📁 文件结构

```
src/
├── components/
│   ├── ImageEditor.tsx              # 基础编辑器（AI功能）
│   └── AdvancedImageEditor.tsx      # 高级编辑器（Canvas）
├── app/
│   ├── editor/
│   │   └── page.tsx                 # 基础编辑页面
│   └── advanced-editor/
│       └── page.tsx                 # 高级编辑页面
└── lib/
    └── doubao/                      # 豆包 API 封装
```

## 🔧 扩展开发

### 添加新的形状
```typescript
const addTriangle = () => {
  if (!canvas) return
  
  const triangle = new fabric.Triangle({
    left: 150,
    top: 150,
    width: 100,
    height: 100,
    fill: '#FF6B6B',
    data: {
      id: generateId(),
      name: '三角形',
    },
  })
  
  canvas.add(triangle)
  canvas.setActiveObject(triangle)
  canvas.renderAll()
  saveHistory(canvas)
}
```

### 添加滤镜效果
```typescript
const applyFilter = (filterName: string) => {
  const activeObject = canvas.getActiveObject()
  if (!activeObject || activeObject.type !== 'image') return
  
  const imageObject = activeObject as fabric.Image
  
  switch(filterName) {
    case 'grayscale':
      imageObject.filters = [new fabric.Image.filters.Grayscale()]
      break
    case 'brightness':
      imageObject.filters = [new fabric.Image.filters.Brightness({ brightness: 0.2 })]
      break
  }
  
  imageObject.applyFilters()
  canvas.renderAll()
}
```

## 🐛 常见问题

### Q: 图片无法加载？
A: 检查图片 URL 是否支持 CORS，或者图片是否已正确生成。

### Q: 文字无法编辑？
A: 双击文字进入编辑模式，确保文字对象未被锁定。

### Q: 导出图片模糊？
A: 已设置 quality: 1（最高质量），如需更高分辨率，可调整画布尺寸。

### Q: 撤销功能不可用？
A: 确保至少有一次编辑操作，历史记录才会生效。

## 🚧 未来计划

- [ ] 更多形状（三角形、多边形、线条）
- [ ] 图片滤镜（灰度、模糊、锐化等）
- [ ] 文字高级效果（渐变、描边、阴影）
- [ ] 贴纸库
- [ ] 图层分组
- [ ] 智能对齐辅助线
- [ ] 批量导出
- [ ] 快捷键支持
- [ ] 画布缩放和平移
- [ ] 项目保存和加载

## 📞 技术支持

如遇问题，请检查：
1. fabric.js 是否正确安装
2. 浏览器控制台是否有报错
3. 图片 URL 是否可访问

---

**版本**: 1.0.0  
**更新日期**: 2025-10-28

