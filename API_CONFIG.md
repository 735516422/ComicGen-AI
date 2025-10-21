# API 配置说明

## 🔑 当前使用的 API 服务

本项目使用以下 AI 服务：

### 1. DeepSeek（深度求索）- 文本生成
- **用途**：剧本生成、对白优化
- **官网**：https://platform.deepseek.com/
- **环境变量**：`DEEPSEEK_API_KEY`
- **费用**：约 ¥0.001/千 tokens

### 2. 豆包（Doubao）- 图片生成
- **用途**：漫画画格生成
- **官网**：https://console.volcengine.com/
- **环境变量**：`STABILITY_API_KEY`（⚠️ 注意：虽然名字是 STABILITY，但现在用的是豆包）
- **费用**：约 ¥0.08/张

---

## 📋 快速配置

### 方式 1：使用 Mock 数据（免费，推荐新手）
不需要任何配置，直接运行：
```bash
npm install
npm run dev
```

### 方式 2：只配置剧本生成（¥10/月）
```env
DEEPSEEK_API_KEY=sk-your-deepseek-key
```

### 方式 3：完整配置（¥150/月）
```env
DEEPSEEK_API_KEY=sk-your-deepseek-key
STABILITY_API_KEY=your-doubao-key
```

---

## 🔧 详细配置步骤

### DeepSeek 配置

1. **注册账号**
   - 访问：https://platform.deepseek.com/
   - 注册并登录

2. **获取 API Key**
   - 进入 API Keys 页面
   - 点击 "Create new key"
   - 复制生成的密钥

3. **配置环境变量**
   ```env
   DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxx
   ```

4. **充值（可选）**
   - 最低充值：¥10
   - 推荐：¥50（够用很久）

📖 详细说明：查看 `DEEPSEEK_INTEGRATION.md`

---

### 豆包配置

1. **注册账号**
   - 访问：https://console.volcengine.com/
   - 注册并完成实名认证

2. **开通服务**
   - 搜索"豆包"或"Doubao"
   - 开通文生图服务

3. **获取 API Key**
   - 进入 API 管理页面
   - 创建新的 API Key
   - 复制密钥

4. **配置环境变量**
   ```env
   STABILITY_API_KEY=your-doubao-key
   ```

5. **查看额度**
   - 新用户通常有免费额度
   - 可在控制台查看剩余额度

📖 详细说明：查看 `DOUBAO_SETUP.md`

---

## 💰 成本估算

### 免费版（¥0/月）
- ✅ 完整功能体验
- ✅ Mock 数据
- ❌ 无法生成真实内容

### 入门版（¥10/月）
- ✅ 真实剧本生成
- ✅ 对白优化
- ⚠️ 图片用占位图
- 适合：个人学习、测试

### 标准版（¥150/月）
- ✅ 真实剧本
- ✅ 真实图片
- ✅ 完整体验
- 适合：个人创作、小团队

### 专业版（¥500+/月）
- ✅ 所有标准版功能
- ✅ 云端存储（Supabase）
- ✅ 图片 CDN（Cloudinary）
- ✅ 用户认证
- 适合：商业项目、大量使用

---

## 🔄 API 调用位置

### DeepSeek 调用（2处）
1. **剧本生成**：`app/api/generate-script/route.ts`
   - 触发：首页点击"生成剧本"
   - 费用：¥0.001/次

2. **对白优化**：`app/api/optimize-dialogue/route.ts`
   - 触发：剧本编辑页点击"AI 优化"
   - 费用：¥0.0002/次

### 豆包调用（1处）
1. **图片生成**：`app/api/generate-image/route.ts`
   - 触发：生成页点击"生成画格"
   - 费用：¥0.08/张

---

## 📊 使用量预估

### 轻度使用（个人娱乐）
- 每周创作：2-3 个作品
- 每月剧本生成：约 10 次
- 每月图片生成：约 20 张
- **成本**：约 ¥2-3/月

### 中度使用（内容创作）
- 每周创作：10 个作品
- 每月剧本生成：约 50 次
- 每月图片生成：约 200 张
- **成本**：约 ¥16-20/月

### 重度使用（商业项目）
- 每天创作：5-10 个作品
- 每月剧本生成：约 300 次
- 每月图片生成：约 1200 张
- **成本**：约 ¥100-120/月

---

## 🛡️ 安全提示

### ⚠️ 保护你的 API 密钥

1. **不要提交到 Git**
   - `.env.local` 已在 `.gitignore` 中 ✅
   - 不要截图或分享包含密钥的内容

2. **定期更换密钥**
   - 建议每月更换一次
   - 怀疑泄露立即更换

3. **监控使用量**
   - 定期检查 API 使用情况
   - 设置用量告警

4. **使用环境变量**
   - 永远不要在代码中硬编码密钥
   - 部署时使用平台的环境变量管理

---

## 🔍 调试技巧

### 检查配置是否生效

在 API 路由中添加日志：

```typescript
// app/api/generate-script/route.ts
const apiKey = process.env.DEEPSEEK_API_KEY;
console.log('🔑 DeepSeek Key:', apiKey ? '已配置' : '未配置');

// app/api/generate-image/route.ts
const apiKey = process.env.STABILITY_API_KEY;
console.log('🔑 豆包 Key:', apiKey ? '已配置' : '未配置');
```

### 测试 API 连通性

使用 curl 测试：

```bash
# 测试 DeepSeek
curl https://api.deepseek.com/v1/chat/completions \
  -H "Authorization: Bearer your-key" \
  -H "Content-Type: application/json" \
  -d '{"model":"deepseek-chat","messages":[{"role":"user","content":"Hello"}]}'

# 测试豆包（新版 SeeDream 4.0）
curl -X POST https://ark.cn-beijing.volces.com/api/v3/images/generations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-key" \
  -d '{
    "model": "doubao-seedream-4-0-250828",
    "prompt": "一只可爱的猫咪，漫画风格",
    "response_format": "url",
    "size": "1K",
    "watermark": false
  }'

# 测试豆包（旧版 - 备用）
curl https://ark.cn-beijing.volces.com/api/v3/text2image \
  -H "Authorization: Bearer your-key" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"测试","width":512,"height":512}'
```

---

## ❓ 常见问题

### Q: 为什么豆包的环境变量名是 STABILITY_API_KEY？
A: 为了保持向后兼容，避免改动过多代码。虽然名字叫 STABILITY，但实际存储的是豆包的密钥。

### Q: 可以同时使用多个图片生成服务吗？
A: 可以！你可以修改代码，根据不同条件调用不同的服务。

### Q: Mock 数据和真实 API 可以混用吗？
A: 可以！只配置 DeepSeek，图片会用 Mock；只配置豆包，剧本会用 Mock。

### Q: 如何切换回 Stable Diffusion？
A: 修改 `app/api/generate-image/route.ts`，恢复原始的 API 调用代码。

---

## 📚 相关文档

- **DeepSeek 详细配置**：`DEEPSEEK_INTEGRATION.md`
- **豆包详细配置**：`DOUBAO_SETUP.md`
- **完整接入指南**：`INTEGRATION_GUIDE.md`
- **部署说明**：`DEPLOYMENT.md`

---

## 🆘 获取帮助

1. 查看对应服务的官方文档
2. 查看项目文档（README.md）
3. 提交 Issue 到项目仓库
4. 查看代码注释

---

最后更新：2024-10-19

