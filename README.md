# ComicGen AI - AI 公众号短漫自动生成器

一个基于 Next.js 15 的 Web 应用，帮助用户输入主题后，自动生成漫画剧本、漫画画格、对白气泡，并排版成长图，可直接发布到公众号或小红书。

![ComicGen AI](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38bdf8)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ 功能特性

### 核心功能
- 🎬 **AI 剧本生成**：基于 DeepSeek AI，根据主题自动生成漫画分镜剧本
- 🎨 **画面自动生成**：使用 Stable Diffusion XL 生成漫画画格
- ✏️ **可视化编辑**：支持剧本编辑、对白优化、分镜重排
- 🔄 **角色一致性**：自动检测并保持角色风格一致性
- 📤 **多格式导出**：支持公众号长图、九宫格、项目文件导出

### 页面功能

#### 1. 首页 / 创作入口页
- 主题输入
- 风格选择（日式漫画、美式漫画、条漫、Q版）
- 格数设置（1-12格）
- 角色描述
- 参考图上传

#### 2. 剧本编辑页
- 显示 AI 生成的分镜脚本
- 支持编辑对白
- 单格重新生成
- AI 对白优化
- 拖拽排序（规划中）
- 添加/删除分镜

#### 3. 漫画生成页
- 画格生成进度显示
- 批量生成 / 单独生成
- 角色一致性开关
- 风格切换
- 一致性检测（自动评分）
- 单格重绘

#### 4. 预览导出页
- 完整漫画长图预览
- 导出公众号长图（900px 宽）
- 导出九宫格
- 保存项目文件
- 返回修改

## 🛠️ 技术栈

- **前端框架**：Next.js 15 (App Router)
- **UI 框架**：TailwindCSS + shadcn/ui
- **状态管理**：Zustand
- **AI 模型**：DeepSeek (剧本/对白生成)
- **图像生成**：Stable Diffusion XL
- **图片处理**：html-to-image
- **类型系统**：TypeScript

## 📦 项目结构

```
ai漫画生成器/
├── app/                    # Next.js App Router 页面
│   ├── page.tsx           # 首页 - 创作入口
│   ├── script/            # 剧本编辑页
│   ├── generate/          # 漫画生成页
│   ├── preview/           # 预览导出页
│   ├── api/               # API 路由
│   │   ├── generate-script/
│   │   ├── generate-image/
│   │   └── optimize-dialogue/
│   ├── layout.tsx
│   └── globals.css
├── components/            # React 组件
│   └── ui/               # shadcn/ui 组件
│       ├── button.tsx
│       ├── input.tsx
│       ├── textarea.tsx
│       ├── select.tsx
│       └── ...
├── lib/                   # 工具库
│   ├── types.ts          # TypeScript 类型定义
│   ├── store.ts          # Zustand 状态管理
│   └── utils.ts          # 工具函数
├── hooks/                 # React Hooks
│   └── use-toast.ts
├── stitch_/              # 原始设计原型（参考）
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
└── README.md
```

## 🚀 快速开始

### 前置要求

- Node.js 18+ 
- npm / yarn / pnpm

### 安装依赖

```bash
npm install
# 或
yarn install
# 或
pnpm install
```

### 配置环境变量

复制 `.env.local.example` 为 `.env.local` 并填入你的 API 密钥：

```env
# DeepSeek AI API Key
DEEPSEEK_API_KEY=your_deepseek_api_key_here

# Stable Diffusion API (可选)
STABILITY_API_KEY=your_stability_api_key_here

# Supabase (可选 - 用于存储)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**注意**：如果没有配置 API 密钥，应用会使用 Mock 数据进行演示。

### 运行开发服务器

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本

```bash
npm run build
npm start
```

## 📖 使用指南

### 1. 创建漫画

1. 在首页输入你的漫画主题（例如："程序员的日常崩溃"）
2. 选择漫画风格和格数
3. （可选）添加角色描述和参考图
4. 点击 "🎬 生成剧本"

### 2. 编辑剧本

1. 查看 AI 生成的分镜剧本
2. 点击 "编辑" 修改对白
3. 点击 "AI 优化" 让 AI 优化对白
4. 点击 "重写" 重新生成单个分镜
5. 完成后点击 "下一步：生成画面"

### 3. 生成漫画

1. 点击 "生成全部画格" 或单独点击画格生成
2. 查看生成进度
3. 检查角色一致性评分
4. 对不满意的画格点击 "重绘此格"
5. 完成后点击 "预览导出"

### 4. 导出作品

1. 预览完整漫画
2. 选择导出格式：
   - **公众号长图**：900px 宽的垂直长图
   - **九宫格**：适合社交媒体的 3x3 格式
   - **项目文件**：保存为 JSON，稍后继续编辑

## 🎨 设计规范

### 配色方案

- **主色调（Primary）**：`#FFD100` - 亮黄色，代表创意和活力
- **辅助色（Secondary）**：`#5BC0EB` - 蓝色，代表科技和可靠
- **背景色（Light）**：`#F8F9FA` - 浅灰白
- **背景色（Dark）**：`#231f0f` - 深棕色

### 字体

- **英文/数字**：Plus Jakarta Sans
- **中文**：系统默认 sans-serif

### 响应式断点

- **移动端**：< 768px
- **平板**：768px - 1024px
- **桌面**：> 1024px

## 🔧 API 接口

### 生成剧本

```typescript
POST /api/generate-script
Content-Type: application/json

{
  "theme": "程序员的日常",
  "artStyle": "Japanese Manga",
  "numPanels": 4,
  "characterDescription": "戴眼镜的程序员"
}
```

### 生成图片

```typescript
POST /api/generate-image
Content-Type: application/json

{
  "panelId": "panel-123",
  "scene": "场景描述",
  "artStyle": "Japanese Manga",
  "characterDescription": "角色描述",
  "referenceImageUrl": "https://..."
}
```

### 优化对白

```typescript
POST /api/optimize-dialogue
Content-Type: application/json

{
  "dialogue": "原始对话",
  "context": "上下文信息"
}
```

## 📝 类型定义

```typescript
interface ComicPanel {
  id: string;
  order: number;
  scene: string;
  dialogue: string;
  character: string;
  emotion?: string;
  imageUrl?: string;
  status: 'pending' | 'generating' | 'completed' | 'error';
  progress?: number;
  consistencyScore?: number;
}

interface ComicProject {
  id: string;
  theme: string;
  artStyle: string;
  numPanels: number;
  characterDescription?: string;
  referenceImageUrl?: string;
  panels: ComicPanel[];
  status: 'draft' | 'script' | 'generating' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}
```

## 🔜 规划功能

- [ ] 拖拽排序分镜
- [ ] 更多漫画风格（水彩、线稿等）
- [ ] 对话气泡自定义样式
- [ ] 分格布局编辑器
- [ ] 云端项目存储（Supabase）
- [ ] 用户认证和项目管理
- [ ] 批量导出和打包
- [ ] AI 自动配色方案
- [ ] 更多导出格式（PDF、视频）

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- [Next.js](https://nextjs.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [DeepSeek](https://www.deepseek.com/)
- [Stable Diffusion](https://stability.ai/)

## 📧 联系方式

如有问题或建议，欢迎通过以下方式联系：

- 提交 Issue
- 发送邮件至：your-email@example.com

---

Made with ❤️ by ComicGen Team

