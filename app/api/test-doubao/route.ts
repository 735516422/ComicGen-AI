import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.STABILITY_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      success: false,
      error: 'API 密钥未配置',
    });
  }

  console.log('=== 豆包 API 测试 ===');
  console.log('API Key 长度:', apiKey.length);
  console.log('API Key 前10位:', apiKey.substring(0, 10));
  console.log('API Key 后4位:', apiKey.substring(apiKey.length - 4));

  // 尝试多个可能的端点
  const endpoints = [
    'https://ark.cn-beijing.volces.com/api/v3/images/generations', // 新版 SeeDream 4.0
    'https://ark.cn-beijing.volces.com/api/v3/text2image', // 旧版
    'https://visual.volcengineapi.com',
  ];

  const results = [];

  for (const endpoint of endpoints) {
    console.log(`\n测试端点: ${endpoint}`);
    
    try {
      // 根据不同端点使用不同的payload
      let testPayload: any;
      
      if (endpoint.includes('images/generations')) {
        // 新版 SeeDream 4.0 API
        testPayload = {
          model: 'doubao-seedream-4-0-250828',
          prompt: '测试图片：一只可爱的猫咪',
          response_format: 'url',
          size: '1K',
          watermark: false,
        };
      } else {
        // 旧版 API
        testPayload = {
          prompt: '测试图片',
          width: 512,
          height: 512,
        };
      }

      // 尝试不同的认证方式
      const authMethods = [
        { 'Authorization': `Bearer ${apiKey}` },
        { 'X-Api-Key': apiKey },
        { 'api-key': apiKey },
      ];

      for (const [index, headers] of authMethods.entries()) {
        console.log(`  尝试认证方式 ${index + 1}:`, Object.keys(headers)[0]);
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
          body: JSON.stringify(testPayload),
        });

        const status = response.status;
        const statusText = response.statusText;
        let body;
        
        try {
          body = await response.json();
        } catch {
          body = await response.text();
        }

        console.log(`  响应状态: ${status} ${statusText}`);
        console.log(`  响应体:`, typeof body === 'string' ? body.substring(0, 200) : JSON.stringify(body).substring(0, 200));

        results.push({
          endpoint,
          authMethod: Object.keys(headers)[0],
          status,
          statusText,
          body: typeof body === 'string' ? body.substring(0, 500) : body,
          success: status >= 200 && status < 300,
        });

        if (status >= 200 && status < 300) {
          console.log('  ✅ 成功！');
          break;
        }
      }
    } catch (error: any) {
      console.error(`  错误:`, error.message);
      results.push({
        endpoint,
        error: error.message,
        success: false,
      });
    }
  }

  console.log('=== 测试完成 ===');

  return NextResponse.json({
    success: true,
    apiKeyConfigured: true,
    apiKeyLength: apiKey.length,
    apiKeyPreview: `${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}`,
    results,
  });
}

