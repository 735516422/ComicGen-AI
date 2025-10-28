# 豆包 API 公共模块

这个模块封装了所有与豆包 API 交互的公共逻辑，提高代码的可维护性和可读性。

## 📁 文件结构

```
src/lib/doubao/
├── index.ts          # 统一导出入口
├── config.ts         # API 配置和常量
├── types.ts          # TypeScript 类型定义
├── client.ts         # API 客户端封装
└── README.md         # 使用说明
```

## 🎯 核心功能

### 1. **配置管理** (`config.ts`)
- API 端点配置
- 模型配置
- 默认参数配置
- 错误消息常量

### 2. **类型定义** (`types.ts`)
- API 请求参数类型
- API 响应数据类型
- 统一的成功/错误响应类型

### 3. **客户端封装** (`client.ts`)
- `callDoubaoAPI()` - 调用豆包 API
- `handleDoubaoResponse()` - 处理 API 响应
- `handleAPIError()` - 统一错误处理
- `validateRequired()` - 参数验证

## 📝 使用示例

### 基础用法

```typescript
import { NextRequest } from 'next/server'
import {
  callDoubaoAPI,
  handleDoubaoResponse,
  handleAPIError,
  validateRequired,
  ERROR_MESSAGES,
} from '@/lib/doubao'

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json()

    // 验证参数
    const validationError = validateRequired(!!image, ERROR_MESSAGES.NO_IMAGE)
    if (validationError) return validationError

    // 调用 API
    const data = await callDoubaoAPI({
      prompt: '你的提示词',
      image,
    })

    // 处理响应
    return handleDoubaoResponse(data)

  } catch (error) {
    return handleAPIError(error)
  }
}
```

## 🔧 自定义配置

如需修改默认配置，编辑 `config.ts`：

```typescript
export const DEFAULT_IMAGE_CONFIG = {
  n: 1,
  size: '1024x1024',
  quality: 'hd',
  // ... 其他配置
}
```

## ✨ 优势

1. **代码复用** - 避免重复代码
2. **统一管理** - 集中配置和错误处理
3. **类型安全** - TypeScript 类型定义
4. **易于维护** - 修改一处，全局生效
5. **清晰结构** - 职责分离，逻辑清晰

## 🚀 扩展

添加新的 API 功能时：

1. 在 `src/app/api/` 下创建新路由
2. 导入 `@/lib/doubao` 模块
3. 使用封装好的函数处理请求

无需重复编写相同的逻辑！

