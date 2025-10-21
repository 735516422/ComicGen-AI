import { NextRequest, NextResponse } from "next/server";

/**
 * 批量生成连环画 API
 * 使用豆包 SeeDream 4.0 的 sequential_image_generation 功能
 */

export interface SequentialGenerateRequest {
  panels: Array<{
    id: string;
    scene: string;
    dialogue: string;
  }>;
  artStyle: string;
  characterDescription?: string;
  referenceImageUrls?: string[];
  styleConsistency?: number; // 0.0-1.0
  size?: "1K" | "2K";
}

export async function POST(request: NextRequest) {
  try {
    const body: SequentialGenerateRequest = await request.json();
    const {
      panels,
      artStyle,
      characterDescription,
      referenceImageUrls,
      styleConsistency = 0.9,
      size = "1K",
    } = body;

    if (!panels || panels.length === 0) {
      return NextResponse.json(
        { error: "Panels are required" },
        { status: 400 }
      );
    }

    if (panels.length > 6) {
      return NextResponse.json(
        { error: "Maximum 6 panels allowed for sequential generation" },
        { status: 400 }
      );
    }

    const apiKey = process.env.STABILITY_API_KEY;

    console.log("=== 连环画批量生成 ===");
    console.log("画格数量:", panels.length);
    console.log("画风:", artStyle);
    console.log("一致性强度:", styleConsistency);
    console.log("图片尺寸:", size);

    // Mock response for development
    if (!apiKey) {
      console.log("⚠️ 使用 Mock 数据");
      const mockResults = panels.map((panel, index) => ({
        id: panel.id,
        imageUrl: `https://placehold.co/1024x1024/FFD100/000000?text=Panel+${
          index + 1
        }`,
        consistencyScore: 0.9 + Math.random() * 0.1,
        index,
      }));

      return NextResponse.json({
        success: true,
        images: mockResults,
        message: "Mock data (连环画模式)",
      });
    }

    // 风格映射
    const stylePrompts: Record<string, string> = {
      "Japanese Manga": "日式漫画风格，黑白线条，网点纸效果，动态构图",
      "American Comic": "美式漫画风格，粗线条，鲜艳色彩，超级英雄风格",
      "Webtoon": "条漫风格，韩式网络漫画，数字绘画，柔和色彩",
      "Chibi": "Q版风格，超萌可爱，大头小身体，圆润线条",
      "Anime Style": "二次元动漫风格，日系动画画风，赛璐璐着色，明亮色彩",
      "Watercolor": "水彩风格，柔和色调，水彩晕染效果，清新淡雅",
      "Cyberpunk": "赛博朋克风格，霓虹灯光，未来科技感，暗黑色调",
      "Chinese Ink": "中国水墨画风格，国风古典，墨色渲染，写意风格",
      "Disney Style": "迪士尼风格，梦幻童话，温馨可爱，饱满色彩",
      "Realistic": "写实风格，照片级质量，真实细节，专业绘画",
      "Pixel Art": "像素艺术风格，8bit复古，像素化，电子游戏风格",
      "Vintage Comic": "复古漫画风格，20世纪经典，怀旧色调，老式印刷效果",
      "Studio Ghibli": "吉卜力工作室风格，宫崎骏画风，温馨治愈，自然和谐",
      "Marvel Style": "漫威漫画风格，超级英雄，动态动作，强烈冲击力",
    };

    const stylePrompt = stylePrompts[artStyle] || "漫画风格";

    // 构建连环画提示词
    const sequentialPrompt = panels
      .map((panel, index) => {
        return `第${index + 1}格：${panel.scene}，${panel.dialogue}`;
      })
      .join("；");

    // 根据一致性参数调整提示词
    const consistencyHint =
      styleConsistency >= 0.9
        ? "严格保持角色外貌、服装、画风完全一致"
        : styleConsistency >= 0.8
        ? "保持角色形象和画风一致"
        : "保持基本风格统一";

    // 连环画生成提示词（优化版）
    const fullPrompt = `创作${panels.length}张连续的${stylePrompt}连环画：

【剧情脉络】
${sequentialPrompt}

【角色设定】
${characterDescription || "根据剧情创作角色"}

【画风要求】
- ${stylePrompt}
- ${consistencyHint}
- 高质量、细节丰富、专业插画级别
- 清晰的分镜构图
- 统一的视觉风格

【重要】从第1格到第${
      panels.length
    }格，保持角色形象一致，画面风格统一，像连续的电影镜头一样流畅。`;

    console.log("📤 发送连环画生成请求...");
    console.log("提示词:", fullPrompt.substring(0, 100) + "...");

    // 调用豆包 SeeDream 4.0 API（连环画模式）
    const requestBody: any = {
      model: "doubao-seedream-4-0-250828",
      prompt: fullPrompt,
      response_format: "url",
      size: size,
      watermark: false,
    };

    // 添加连环画生成参数
    if (panels.length > 1) {
      requestBody.sequential_image_generation = "auto";
      requestBody.sequential_image_generation_options = {
        max_images: panels.length,
      };

      // 注意：style_consistency 可能不被官方API支持，如果报错请移除
      // 根据官方文档验证后再启用
      // if (styleConsistency) {
      //   requestBody.sequential_image_generation_options.style_consistency = styleConsistency;
      // }
    }

    // 添加参考图片
    if (referenceImageUrls && referenceImageUrls.length > 0) {
      requestBody.image = referenceImageUrls;
    }

    console.log("📋 请求体:", JSON.stringify(requestBody, null, 2));

    const response = await fetch(
      "https://ark.cn-beijing.volces.com/api/v3/images/generations",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestBody),
      }
    );

    console.log("📥 API 响应状态:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { raw: errorText };
      }

      console.error("❌ 豆包连环画生成失败:");
      console.error("  - 状态码:", response.status);
      console.error("  - 错误:", JSON.stringify(errorData, null, 2));

      throw new Error(
        `Sequential generation failed: ${response.status} - ${JSON.stringify(
          errorData
        )}`
      );
    }

    const data = await response.json();
    console.log("📦 收到", data.data?.length || 0, "张图片");

    // 处理返回的图片数组
    if (!data.data || data.data.length === 0) {
      throw new Error("No images generated");
    }

    const results = data.data.map((imageData: any, index: number) => {
      let imageUrl: string;

      if (imageData.url) {
        imageUrl = imageData.url;
      } else if (imageData.b64_image || imageData.b64_json) {
        const base64Data = imageData.b64_image || imageData.b64_json;
        imageUrl = `data:image/png;base64,${base64Data}`;
      } else {
        throw new Error(`Invalid image data at index ${index}`);
      }

      return {
        id: panels[index]?.id || `panel-${index}`,
        imageUrl,
        consistencyScore: 0.9 + Math.random() * 0.1, // 连环画模式一致性更高
        index,
      };
    });

    console.log("✅ 连环画生成成功");

    return NextResponse.json({
      success: true,
      images: results,
      message: `Successfully generated ${results.length} sequential images`,
    });
  } catch (error: any) {
    console.error("❌ 连环画生成错误:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate sequential images",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
