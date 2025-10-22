"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useComicStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Upload, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { ComicPanel } from "@/lib/types";

export default function HomePage() {
  const router = useRouter();
  const { setProject, setLoading } = useComicStore();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    theme: "",
    artStyle: "Comic Illustration",
    numPanels: 4,
    characterDescription: "",
    referenceImage: null as File | null,
    imageRatio: "3:4" as "1:1" | "3:4" | "16:9" | "9:16",
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, referenceImage: file });
    }
  };

  const handleGenerateScript = async () => {
    if (!formData.theme) {
      toast({
        title: "请输入主题",
        description: "主题是必填项",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setLoading(true);

    try {
      const response = await fetch("/api/generate-script", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          theme: formData.theme,
          artStyle: formData.artStyle,
          numPanels: formData.numPanels,
          characterDescription: formData.characterDescription,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate script");
      }

      const data = await response.json();

      // Create panels with IDs
      const panels: ComicPanel[] = data.panels.map(
        (panel: any, index: number) => ({
          id: `panel-${Date.now()}-${index}`,
          order: index,
          scene: panel.scene,
          dialogue: panel.dialogue,
          character: panel.character,
          emotion: panel.emotion,
          status: "pending" as const,
        })
      );

      // Create project
      const project = {
        id: `project-${Date.now()}`,
        theme: formData.theme,
        artStyle: formData.artStyle,
        numPanels: formData.numPanels,
        characterDescription: formData.characterDescription,
        imageRatio: formData.imageRatio,
        panels,
        status: "script" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setProject(project);

      toast({
        title: "剧本生成成功！",
        description: `已生成 ${panels.length} 格漫画剧本`,
      });

      // Navigate to script editor
      router.push("/script");
    } catch (error) {
      console.error("Error generating script:", error);
      toast({
        title: "生成失败",
        description: "请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      setLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-background-light dark:bg-background-dark">
      {/* Header - Fixed */}
      <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-8 py-4 border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 text-primary">
            <svg fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1.5-6.5h3c.83 0 1.5-.67 1.5-1.5v-3c0-.83-.67-1.5-1.5-1.5h-3c-.83 0-1.5.67-1.5 1.5v3c0 .83.67 1.5 1.5 1.5zm1.5-4.5c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM5 16.5c0-.83.67-1.5 1.5-1.5h11c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-11c-.83 0-1.5-.67-1.5-1.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold">ComicGen AI</h2>
        </div>
      </header>

      {/* Main Content */}
      <main className="h-full flex items-center justify-center px-4 pt-20 pb-6 overflow-y-auto">
        <div className="w-full max-w-3xl">
          {/* Hero Section */}
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-semibold mb-2">
              <Sparkles className="w-4 h-4" />
              AI 驱动的漫画创作工具
            </div>
            <h1 className="text-4xl font-black mb-1.5">几秒钟创作你的漫画！</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              输入主题，AI 自动生成剧本和精美画面
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-5 border border-gray-200 dark:border-gray-700">
            <div className="space-y-3.5">
              {/* Theme Input */}
              <div>
                <Label htmlFor="theme" className="flex items-center gap-1.5 mb-2">
                  ✨ 主题/题材 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="theme"
                  placeholder="例如：程序员修bug的日常、猫咪的奇幻冒险..."
                  value={formData.theme}
                  onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                  className="h-11"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                  💡 描述越详细，生成的漫画越精彩
                </p>
              </div>

              {/* Art Style and Number of Panels */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="artStyle" className="flex items-center gap-1.5 mb-2">
                    🎨 漫画风格
                  </Label>
                  <Select
                    value={formData.artStyle}
                    onValueChange={(value) => setFormData({ ...formData, artStyle: value })}
                  >
                    <SelectTrigger id="artStyle" className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Comic Illustration">🎭 漫画式插画风</SelectItem>
                      <SelectItem value="Japanese Manga">🇯🇵 日式漫画</SelectItem>
                      <SelectItem value="American Comic">🇺🇸 美式漫画</SelectItem>
                      <SelectItem value="Webtoon">📱 条漫</SelectItem>
                      <SelectItem value="Chibi">🐰 Q版</SelectItem>
                      <SelectItem value="Anime Style">✨ 二次元动漫</SelectItem>
                      <SelectItem value="Watercolor">🎨 水彩风格</SelectItem>
                      <SelectItem value="Cyberpunk">🤖 赛博朋克</SelectItem>
                      <SelectItem value="Chinese Ink">🖌️ 国风水墨</SelectItem>
                      <SelectItem value="Disney Style">🏰 迪士尼风格</SelectItem>
                      <SelectItem value="Realistic">📷 写实风格</SelectItem>
                      <SelectItem value="Pixel Art">👾 像素风格</SelectItem>
                      <SelectItem value="Vintage Comic">📰 复古漫画</SelectItem>
                      <SelectItem value="Studio Ghibli">🌿 吉卜力风格</SelectItem>
                      <SelectItem value="Marvel Style">⚡ 漫威风格</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="numPanels" className="flex items-center gap-1.5 mb-2">
                    📊 画格数量
                  </Label>
                  <Input
                    id="numPanels"
                    type="number"
                    min="1"
                    max="12"
                    value={formData.numPanels}
                    onChange={(e) => setFormData({ ...formData, numPanels: parseInt(e.target.value) || 4 })}
                    className="h-11"
                  />
                </div>
              </div>

              {/* Image Ratio Selection */}
              <div>
                <Label className="flex items-center gap-1.5 mb-2">
                  📐 图片比例
                </Label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { value: "1:1", label: "1:1", icon: "⬜" },
                    { value: "3:4", label: "3:4", icon: "📱" },
                    { value: "16:9", label: "16:9", icon: "🖥️" },
                    { value: "9:16", label: "9:16", icon: "📲" },
                  ].map((ratio) => (
                    <button
                      key={ratio.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, imageRatio: ratio.value as any })}
                      className={`flex flex-col items-center justify-center p-2 rounded-lg border-2 transition ${
                        formData.imageRatio === ratio.value
                          ? "border-primary bg-primary/10"
                          : "border-gray-200 dark:border-gray-700 hover:border-primary/50"
                      }`}
                    >
                      <span className="text-xl">{ratio.icon}</span>
                      <span className="text-xs font-semibold">{ratio.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Advanced Settings Toggle */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center justify-between w-full p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  <span className="text-sm font-semibold">⚙️ 高级配置</span>
                  {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {/* Advanced Settings Content */}
                {showAdvanced && (
                  <div className="mt-3 space-y-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    {/* Character Description */}
                    <div>
                      <Label htmlFor="characterDescription" className="flex items-center gap-1.5 mb-2">
                        👤 角色描述 <span className="text-xs text-gray-500">(可选)</span>
                      </Label>
                      <Textarea
                        id="characterDescription"
                        placeholder="例如：主角是一个戴眼镜的程序员，配角是一只会说话的橡皮鸭..."
                        value={formData.characterDescription}
                        onChange={(e) => setFormData({ ...formData, characterDescription: e.target.value })}
                        className="min-h-[70px] text-sm"
                      />
                    </div>

                    {/* Reference Image Upload */}
                    <div>
                      <Label htmlFor="referenceImage" className="flex items-center gap-1.5 mb-2">
                        📸 参考图片 <span className="text-xs text-gray-500">(可选)</span>
                      </Label>
                      <label
                        htmlFor="referenceImage"
                        className="flex flex-col items-center justify-center h-24 border-2 border-dashed rounded-lg cursor-pointer bg-secondary/5 hover:bg-secondary/10 transition"
                      >
                        <Upload className="w-7 h-7 mb-1.5 text-secondary" />
                        <p className="text-xs font-semibold">点击上传</p>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF (最大 5MB)</p>
                        {formData.referenceImage && (
                          <div className="mt-1.5 px-2 py-0.5 bg-primary rounded text-xs font-medium">
                            ✓ {formData.referenceImage.name}
                          </div>
                        )}
                        <input id="referenceImage" type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerateScript}
                disabled={isGenerating || !formData.theme}
                className="w-full h-11 font-bold shadow-lg hover:shadow-xl transition mt-1"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                    AI 正在创作中...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 w-5 h-5" />
                    🎬 开始创作漫画
                  </>
                )}
              </Button>
              <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                ⚡ 通常只需 10-30 秒即可生成完整剧本
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
