import { NextRequest, NextResponse } from 'next/server';
import { GenerateScriptRequest, GenerateScriptResponse } from '@/lib/types';
import deepseekCache from '@/lib/cache';

export async function POST(request: NextRequest) {
  try {
    const body: GenerateScriptRequest = await request.json();
    const { theme, artStyle, numPanels, characterDescription } = body;

    if (!theme || !numPanels) {
      return NextResponse.json(
        { error: 'Theme and number of panels are required' },
        { status: 400 }
      );
    }

    // 检查缓存
    const cacheKey = { theme, artStyle, numPanels, characterDescription };
    const cachedResult = deepseekCache.get<GenerateScriptResponse>('script', cacheKey);
    
    if (cachedResult) {
      console.log('🎯 使用缓存的剧本数据');
      return NextResponse.json(cachedResult);
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    
    // 详细的调试日志
    console.log('=== DeepSeek API 调试信息 ===');
    console.log('环境变量 DEEPSEEK_API_KEY:', apiKey ? `已配置 (长度: ${apiKey.length}, 前6位: ${apiKey.substring(0, 6)}...)` : '❌ 未配置');
    console.log('当前环境:', process.env.NODE_ENV);
    console.log('主题:', theme);
    console.log('画风:', artStyle);
    console.log('格数:', numPanels);
    console.log('===========================');
    
    if (!apiKey) {
      console.log('⚠️ 警告: 未配置 DEEPSEEK_API_KEY，返回 Mock 数据');
      // Mock response for development
      const mockPanels = Array.from({ length: numPanels }, (_, i) => ({
        scene: `场景 ${i + 1}: 一个有趣的场景描述`,
        dialogue: `角色: 对话内容 ${i + 1}`,
        character: characterDescription || '主角',
        emotion: ['happy', 'surprised', 'thoughtful', 'excited'][i % 4],
      }));

      const mockResult = { panels: mockPanels };
      
      // Mock数据也缓存（1小时，避免频繁生成）
      deepseekCache.set('script', cacheKey, mockResult, 60 * 60 * 1000);

      return NextResponse.json(mockResult);
    }
    
    console.log('✅ API Key 已配置，准备调用 DeepSeek API...');

    // Call DeepSeek API - 连环画创作提示词
    const prompt = `# 角色
你是一位**漫画编剧大师**，擅长创作${artStyle}风格的连环画剧本。

## 任务
创作一个${numPanels}格的连环画剧本，要求：
- **情节连贯**：按时间线推进，像"放电影"一样流畅
- **画面感强**：每一格都有清晰的视觉呈现
- **情绪饱满**：通过对白和画面传递情感
- **风格统一**：严格遵循${artStyle}的特点

## 创作要求

主题：${theme}
画风：${artStyle}
${characterDescription ? `角色设定：${characterDescription}` : ''}
格数：${numPanels}格（必须严格遵守）

## 工作流程

1. **故事构思**：围绕主题创作一个有起承转合的完整故事
2. **分镜拆解**：将故事分为${numPanels}个关键分镜，遵循：开端→发展→高潮→结局
3. **场景描述**：为每格创作详细的画面描述，包含：
   - 构图（特写/中景/远景）
   - 环境细节（场景、道具）
   - 角色动作和表情
   - 光影和氛围
4. **对白创作**：为每格创作生动有趣的对话，要：
   - 简洁有力，适合漫画气泡
   - 体现角色性格
   - 推动情节发展

## 输出格式

请以JSON数组格式返回，每个元素包含：
- scene: 画面场景的详细描述（用于AI绘图，需包含构图、环境、角色动作、表情、光影等）
- dialogue: 对话内容（格式："角色名：台词内容"）
- character: 主要角色名称
- emotion: 角色情绪（happy/sad/angry/surprised/thoughtful/excited/neutral）

示例格式：
[
  {
    "scene": "清晨的办公室，阳光透过窗户洒在桌面上。程序员小明坐在电脑前，突然瞪大眼睛，表情震惊。特写镜头，屏幕上显示着红色的错误提示。${artStyle}风格",
    "dialogue": "小明：什么？又有bug！",
    "character": "小明",
    "emotion": "surprised"
  }
]`;

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: '你是一位专业的漫画编剧，擅长创作短小精悍、富有节奏感的漫画剧本。',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.8,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error('DeepSeek API request failed');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse JSON from response
    let panels;
    try {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                       content.match(/\[[\s\S]*\]/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      panels = JSON.parse(jsonStr);
    } catch (e) {
      console.error('Failed to parse DeepSeek response:', e);
      // Fallback to mock data
      panels = Array.from({ length: numPanels }, (_, i) => ({
        scene: `场景 ${i + 1}: ${theme}相关场景`,
        dialogue: `角色: 对话 ${i + 1}`,
        character: characterDescription || '主角',
        emotion: 'neutral',
      }));
    }

    const result = { panels } as GenerateScriptResponse;
    
    // 保存到缓存（24小时）
    deepseekCache.set('script', cacheKey, result, 24 * 60 * 60 * 1000);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error generating script:', error);
    return NextResponse.json(
      { error: 'Failed to generate script' },
      { status: 500 }
    );
  }
}

