import { NextRequest, NextResponse } from 'next/server';
import { GenerateImageRequest, GenerateImageResponse } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body: GenerateImageRequest = await request.json();
    const { scene, artStyle, characterDescription, referenceImageUrl } = body;

    if (!scene) {
      return NextResponse.json(
        { error: 'Scene description is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.STABILITY_API_KEY;
    
    // 详细的调试日志
    console.log('=== 豆包 API 调试信息 ===');
    console.log('环境变量 STABILITY_API_KEY:', apiKey ? `已配置 (长度: ${apiKey.length}, 前6位: ${apiKey.substring(0, 6)}...)` : '❌ 未配置');
    console.log('当前环境:', process.env.NODE_ENV);
    console.log('场景描述:', scene);
    console.log('========================');
    
    // Mock response for development (using placeholder images)
    if (!apiKey) {
      console.log('⚠️ 警告: 未配置 STABILITY_API_KEY，返回占位图');
      // Return a placeholder comic-style image
      const mockImageUrl = `https://placehold.co/900x900/FFD100/000000?text=Panel+${encodeURIComponent(scene.slice(0, 20))}`;
      
      return NextResponse.json({
        imageUrl: mockImageUrl,
        consistencyScore: 0.85 + Math.random() * 0.15,
      } as GenerateImageResponse);
    }
    
    console.log('✅ API Key 已配置，准备调用豆包 API...');

    // Build prompt based on art style
    const stylePrompts: Record<string, string> = {
      'Comic Illustration': '漫画式插画风格，现代漫画插图，细腻线条，柔和色彩，故事性强，画面精致，插画质感，叙事性构图',
      'Japanese Manga': '漫画风格，日式漫画，黑白线条，网点纸效果，动态构图，经典少年漫画风格',
      'American Comic': '美式漫画风格，粗线条，鲜艳色彩，超级英雄风格，戏剧化构图，强烈对比',
      'Webtoon': '条漫风格，韩式网络漫画，数字绘画，柔和色彩，清新画风，垂直滚动格式',
      'Chibi': 'Q版风格，超萌可爱，超级变形，大头小身体，圆润线条，卡通化表现',
      'Anime Style': '二次元动漫风格，日系动画画风，赛璐璐着色，明亮色彩，大眼睛，精致细节',
      'Watercolor': '水彩风格，柔和色调，水彩晕染效果，清新淡雅，艺术感，纸张质感',
      'Cyberpunk': '赛博朋克风格，霓虹灯光，未来科技感，暗黑色调，电子元素，科幻都市',
      'Chinese Ink': '中国水墨画风格，国风古典，墨色渲染，写意风格，传统意境，山水韵味',
      'Disney Style': '迪士尼风格，梦幻童话，温馨可爱，饱满色彩，经典动画感，细腻表情',
      'Realistic': '写实风格，照片级质量，真实细节，专业绘画，光影真实，纹理细腻',
      'Pixel Art': '像素艺术风格，8bit复古，像素化，电子游戏风格，马赛克效果，怀旧感',
      'Vintage Comic': '复古漫画风格，20世纪经典，怀旧色调，老式印刷效果，复古排版，纸张泛黄',
      'Studio Ghibli': '吉卜力工作室风格，宫崎骏画风，温馨治愈，自然和谐，手绘质感，梦幻氛围',
      'Marvel Style': '漫威漫画风格，超级英雄，动态动作，强烈冲击力，戏剧化光影，史诗感',
      'Line Art': '线稿风格，清晰线条，素描风格，简约阴影',
      'Color Comic': '彩色漫画风格，赛璐璐着色，明亮色彩',
      'Tsukomi Style': '日式吐槽漫画风格，夸张表情，情绪化表现',
    };

    const stylePrompt = stylePrompts[artStyle as keyof typeof stylePrompts] || '漫画风格';
    
    const fullPrompt = `${scene}，${stylePrompt}，${characterDescription || ''}，高质量，细节丰富，漫画分镜，专业插画`;
    
    // 负面提示词
    const negativePrompt = '模糊，低质量，水印，文字，签名，变形，扭曲';

    // Call Doubao (豆包) API - 使用新版 SeeDream 4.0 模型
    console.log('📤 发送请求到豆包 API...');
    console.log('请求地址:', 'https://ark.cn-beijing.volces.com/api/v3/images/generations');
    console.log('请求参数:', {
      model: 'doubao-seedream-4-0-250828',
      prompt: fullPrompt.substring(0, 50) + '...',
      size: '1K',
      response_format: 'url'
    });
    
    // 准备请求参数
    const requestBody: any = {
      model: 'doubao-seedream-4-0-250828',
      prompt: fullPrompt,
      response_format: 'url',
      size: '1K', // 可选: 1K (1024x1024), 2K (2048x2048)
      watermark: false, // 是否添加水印
      stream: false, // 是否使用流式输出
    };
    
    // 如果提供了参考图片，添加到请求中
    if (referenceImageUrl) {
      requestBody.image = [referenceImageUrl];
    }
    
    const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    console.log('📥 API 响应状态:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { raw: errorText };
      }
      
      console.error('❌ 豆包 API 错误详情:');
      console.error('  - 状态码:', response.status, response.statusText);
      console.error('  - 错误信息:', JSON.stringify(errorData, null, 2));
      console.error('  - 响应头:', Object.fromEntries(response.headers.entries()));
      console.error('  - 请求 URL:', 'https://ark.cn-beijing.volces.com/api/v3/text2image');
      
      // 根据错误码给出具体建议
      if (response.status === 401) {
        console.error('  ⚠️ 401 认证失败 - 可能原因:');
        console.error('    1. API 密钥无效或已过期');
        console.error('    2. API 端点地址不正确');
        console.error('    3. 密钥格式错误（检查是否有多余空格）');
        console.error('    4. 需要使用不同的认证方式');
      }
      
      throw new Error(`Image generation failed: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    
    console.log('📦 API 响应数据:', JSON.stringify(data).substring(0, 200));
    
    // 豆包 SeeDream 4.0 API 返回格式处理
    let imageUrl: string;
    
    // 新版API返回格式
    if (data.data && data.data.length > 0) {
      const imageData = data.data[0];
      
      // 返回 URL（最常见）
      if (imageData.url) {
        imageUrl = imageData.url;
        console.log('✅ 获取到图片 URL:', imageUrl.substring(0, 50) + '...');
      } 
      // 返回 base64
      else if (imageData.b64_image || imageData.b64_json) {
        const base64Data = imageData.b64_image || imageData.b64_json;
        imageUrl = `data:image/png;base64,${base64Data}`;
        console.log('✅ 获取到 Base64 图片');
      } 
      else {
        console.error('❌ 响应数据格式异常:', imageData);
        throw new Error('Invalid response format from Doubao API');
      }
    } else {
      console.error('❌ 响应中没有图片数据:', data);
      throw new Error('No image data in response');
    }
    
    // Mock consistency score (in a real app, you'd use a model to compute this)
    const consistencyScore = 0.85 + Math.random() * 0.15;

    return NextResponse.json({
      imageUrl,
      consistencyScore,
    } as GenerateImageResponse);
  } catch (error) {
    console.error('Error generating image:', error);
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    );
  }
}

