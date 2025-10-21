import { NextRequest, NextResponse } from 'next/server';
import deepseekCache from '@/lib/cache';

export async function POST(request: NextRequest) {
  try {
    const { dialogue, context } = await request.json();

    if (!dialogue) {
      return NextResponse.json(
        { error: 'Dialogue is required' },
        { status: 400 }
      );
    }

    // 检查缓存
    const cacheKey = { dialogue, context };
    const cachedResult = deepseekCache.get<{ optimizedDialogue: string }>('dialogue', cacheKey);
    
    if (cachedResult) {
      console.log('🎯 使用缓存的对白优化数据');
      return NextResponse.json(cachedResult);
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    
    if (!apiKey) {
      // Mock response
      const mockResult = {
        optimizedDialogue: `${dialogue}（优化版）`,
      };
      
      // Mock数据也缓存（1小时）
      deepseekCache.set('dialogue', cacheKey, mockResult, 60 * 60 * 1000);
      
      return NextResponse.json(mockResult);
    }

    const prompt = `请优化以下漫画对话，使其更生动、有趣、富有节奏感：

原对话：${dialogue}
${context ? `上下文：${context}` : ''}

要求：
1. 保持原意
2. 增加趣味性和表现力
3. 适合漫画气泡展示
4. 简洁有力

只返回优化后的对话内容，不要额外解释。`;

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
            content: '你是一位专业的漫画对白编剧，擅长创作生动有趣的对话。',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      throw new Error('DeepSeek API request failed');
    }

    const data = await response.json();
    const optimizedDialogue = data.choices[0].message.content.trim();

    const result = { optimizedDialogue };
    
    // 保存到缓存（7天，对白优化结果通常不会改变）
    deepseekCache.set('dialogue', cacheKey, result, 7 * 24 * 60 * 60 * 1000);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error optimizing dialogue:', error);
    return NextResponse.json(
      { error: 'Failed to optimize dialogue' },
      { status: 500 }
    );
  }
}

