"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useComicStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Upload,
  Loader2,
  Plus,
  RotateCcw,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import Image from 'next/image';

export default function GeneratePage() {
  const router = useRouter();
  const { currentProject, updatePanel, updateProject } = useComicStore();
  const { toast } = useToast();

  const [characterConsistency, setCharacterConsistency] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // 连环画模式状态 - 默认开启
  const [useSequentialMode, setUseSequentialMode] = useState(true);
  const [styleConsistency, setStyleConsistency] = useState(0.9);
  
  // 图片预览状态
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    if (!currentProject) {
      router.push('/');
    }
  }, [currentProject, router]);

  // ESC键关闭预览
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && previewImage) {
        setPreviewImage(null);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewImage]);

  if (!currentProject) {
    return null;
  }

  const handleGenerateImage = async (panelId: string) => {
    const panel = currentProject.panels.find((p) => p.id === panelId);
    if (!panel) return;

    updatePanel(panelId, { status: 'generating', progress: 0 });

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        updatePanel(panelId, {
          progress: Math.min((panel.progress || 0) + 10, 90),
        });
      }, 500);

      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          panelId,
          scene: panel.scene,
          artStyle: currentProject.artStyle,
          characterDescription: currentProject.characterDescription,
          referenceImageUrl: currentProject.referenceImageUrl,
        }),
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      const data = await response.json();

      updatePanel(panelId, {
        imageUrl: data.imageUrl,
        consistencyScore: data.consistencyScore,
        status: 'completed',
        progress: 100,
      });

      if (data.consistencyScore && data.consistencyScore < 0.8) {
        toast({
          title: '⚠️ 风格一致性提示',
          description: `该格的一致性评分为 ${(data.consistencyScore * 100).toFixed(0)}%，建议重绘`,
          variant: 'destructive',
        });
      } else {
        toast({
          title: '✅ 生成成功',
          description: '画格已生成',
        });
      }
    } catch (error) {
      console.error('Error generating image:', error);
      updatePanel(panelId, { status: 'error', progress: 0 });
      toast({
        title: '生成失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
    }
  };

  // 连环画模式批量生成
  const handleGenerateSequential = async () => {
    setIsGenerating(true);
    
    try {
      // 标记所有未完成的画格为生成中
      const panelsToGenerate = currentProject.panels.filter(p => p.status !== 'completed');
      
      if (panelsToGenerate.length === 0) {
        toast({
          title: '所有画格已生成',
          description: '无需重新生成',
        });
        setIsGenerating(false);
        return;
      }
      
      if (panelsToGenerate.length > 6) {
        toast({
          title: '⚠️ 画格数量过多',
          description: '连环画模式建议最多6格，将自动切换到逐格模式',
          variant: 'destructive',
        });
        setUseSequentialMode(false);
        await handleGenerateAll();
        return;
      }
      
      panelsToGenerate.forEach(panel => {
        updatePanel(panel.id, { status: 'generating', progress: 0 });
      });
      
      toast({
        title: '🎬 连环画生成中',
        description: `正在生成 ${panelsToGenerate.length} 张风格统一的画格...`,
      });

      const response = await fetch('/api/generate-sequential', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          panels: panelsToGenerate.map(p => ({
            id: p.id,
            scene: p.scene,
            dialogue: p.dialogue,
          })),
          artStyle: currentProject.artStyle,
          characterDescription: currentProject.characterDescription,
          referenceImageUrls: currentProject.referenceImageUrl ? [currentProject.referenceImageUrl] : [],
          styleConsistency: styleConsistency,
          size: '1K',
        }),
      });

      const data = await response.json();

      if (data.success && data.images && data.images.length > 0) {
        // 更新成功生成的画格
        data.images.forEach((img: any) => {
          updatePanel(img.id, {
            imageUrl: img.imageUrl,
            status: 'completed',
            progress: 100,
            consistencyScore: img.consistencyScore,
          });
        });

        // 将未成功生成的画格恢复为pending状态
        panelsToGenerate.forEach(panel => {
          const isGenerated = data.images.some((img: any) => img.id === panel.id);
          if (!isGenerated) {
            updatePanel(panel.id, { status: 'pending', progress: 0 });
          }
        });

        // 根据是否部分成功给出不同提示
        if (data.partialSuccess) {
          const failedCount = panelsToGenerate.length - data.images.length;
          toast({
            title: '⚠️ 部分生成成功',
            description: `成功生成 ${data.images.length} 张图片，${failedCount} 张失败。可以重试失败的画格。`,
            variant: 'default',
          });
        } else {
          toast({
            title: '✅ 连环画生成成功',
            description: `已生成 ${data.images.length} 张风格一致的图片`,
          });
        }
      } else {
        throw new Error(data.error || data.message || '生成失败');
      }
    } catch (error: any) {
      console.error('连环画生成失败:', error);
      
      // 恢复错误状态
      currentProject.panels.forEach(panel => {
        if (panel.status === 'generating') {
          updatePanel(panel.id, { status: 'pending', progress: 0 });
        }
      });
      
      toast({
        title: '❌ 连环画生成失败',
        description: error.message || '请尝试切换到逐格模式',
        variant: 'destructive',
      });
    } finally {
      // 确保加载状态被清除
      setIsGenerating(false);
    }
  };

  // 逐格生成模式
  const handleGenerateAll = async () => {
    setIsGenerating(true);

    for (const panel of currentProject.panels) {
      if (panel.status !== 'completed') {
        await handleGenerateImage(panel.id);
      }
    }

    setIsGenerating(false);
    toast({
      title: '全部生成完成！',
      description: '所有画格已生成',
    });
  };

  const handleCheckConsistency = () => {
    const completedPanels = currentProject.panels.filter(
      (p) => p.status === 'completed'
    );

    if (completedPanels.length < 2) {
      toast({
        title: '画格不足',
        description: '至少需要 2 格已完成的画面才能检测一致性',
        variant: 'destructive',
      });
      return;
    }

    const avgScore =
      completedPanels.reduce((sum, p) => sum + (p.consistencyScore || 0.9), 0) /
      completedPanels.length;

    toast({
      title: '一致性检测完成',
      description: `整体一致性评分：${(avgScore * 100).toFixed(0)}%`,
    });
  };

  const handleNextStep = () => {
    const allCompleted = currentProject.panels.every(
      (p) => p.status === 'completed'
    );

    if (!allCompleted) {
      toast({
        title: '还有未完成的画格',
        description: '请完成所有画格的生成',
        variant: 'destructive',
      });
      return;
    }

    updateProject({ status: 'completed' });
    router.push('/preview');
  };

  const completedCount = currentProject.panels.filter(
    (p) => p.status === 'completed'
  ).length;

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
      {/* Header - Fixed */}
      <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-3 bg-white dark:bg-gray-900 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.push('/script')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">返回编辑</span>
          </Button>
          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
          <div className="flex items-center gap-3">
            <div className="text-primary">
              <Sparkles className="h-6 w-6 sm:h-8 sm:w-8" />
            </div>
            <h2 className="text-text-dark dark:text-white text-lg sm:text-xl font-bold">
              AI 漫画生成器
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCheckConsistency}
            className="hidden md:flex items-center gap-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            检查一致性
          </Button>
          <Button size="sm" onClick={handleNextStep} className="flex items-center gap-2">
            <span>预览导出</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Main Content - Add margin top to account for fixed header */}
      <main className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 p-4 sm:p-6 mt-16 overflow-hidden">
        {/* Left Panel: Canvas Area */}
        <div className="md:col-span-2 bg-gray-100 dark:bg-gray-800 rounded-xl p-4 sm:p-6 flex flex-col gap-4 sm:gap-6 overflow-y-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-text-dark dark:text-white">
                你的漫画画格
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                点击空白格生成图片，或批量生成全部
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-1.5">
                <div className={`h-2 w-2 rounded-full ${completedCount === currentProject.panels.length ? 'bg-green-500' : 'bg-secondary'}`} />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {completedCount} / {currentProject.panels.length}
                </span>
              </div>
            </div>
          </div>

          <div className="flex-grow grid grid-cols-2 gap-6 content-start">
            {currentProject.panels.map((panel) => (
              <div key={panel.id} className="relative group">
                {panel.status === 'generating' ? (
                  <div className="relative aspect-square bg-white dark:bg-gray-900 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
                    <div className="text-center">
                      <Loader2 className="w-16 h-16 animate-spin text-secondary mx-auto" />
                      <p className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                        生成中...
                      </p>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-2 bg-secondary/20 rounded-b-lg overflow-hidden">
                      <div
                        className="h-full bg-secondary transition-all"
                        style={{ width: `${panel.progress || 0}%` }}
                      />
                    </div>
                  </div>
                ) : panel.status === 'completed' && panel.imageUrl ? (
                  <div className="relative">
                    <div 
                      className="relative aspect-square bg-white dark:bg-gray-900 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                      onClick={() => setPreviewImage(panel.imageUrl!)}
                    >
                      <Image
                        src={panel.imageUrl}
                        alt={`Panel ${panel.order + 1}`}
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                    <div className="absolute top-2 left-2 bg-black/50 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {panel.order + 1}
                    </div>
                    {panel.consistencyScore && panel.consistencyScore < 0.8 && (
                      <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        ⚠️
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg gap-2">
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewImage(panel.imageUrl!);
                        }}
                        className="flex items-center gap-2"
                        variant="secondary"
                      >
                        <span>👁️</span>
                        预览
                      </Button>
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGenerateImage(panel.id);
                        }}
                        className="flex items-center gap-2"
                      >
                        <RotateCcw className="h-4 w-4" />
                        重绘
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="relative aspect-square bg-white dark:bg-gray-900 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 cursor-pointer hover:border-primary transition-colors"
                    onClick={() => handleGenerateImage(panel.id)}
                  >
                    <div className="absolute top-2 left-2 bg-black/50 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {panel.order + 1}
                    </div>
                    <Plus className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      点击生成
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel: Control Area */}
        <div className="flex flex-col gap-4 sm:gap-6 bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-xl overflow-y-auto border border-gray-200 dark:border-gray-700">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text-dark dark:text-white">生成设置</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">调整参数后生成图片</p>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="theme" className="text-sm font-semibold">你的漫画主题</Label>
            <Textarea
              id="theme"
              value={currentProject.theme}
              readOnly
              className="min-h-[100px] resize-none text-sm bg-gray-50 dark:bg-gray-800"
            />
          </div>

          {/* Settings */}
          <div className="flex flex-col gap-4 bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
            {/* 连环画模式切换 */}
            <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded-lg border-2 border-primary/20">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🎬</span>
                  <p className="text-sm font-bold">连环画模式</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {useSequentialMode ? '批量生成风格统一的画格' : '逐格生成，可单独调整'}
                </p>
              </div>
              <label className="relative flex h-[26px] w-[44px] cursor-pointer items-center rounded-full border-none bg-gray-300 dark:bg-gray-700 p-0.5 transition-colors has-[:checked]:bg-primary">
                <div
                  className={`h-full aspect-square rounded-full bg-white transition-transform ${
                    useSequentialMode ? 'translate-x-[18px]' : ''
                  }`}
                />
                <input
                  type="checkbox"
                  className="invisible absolute"
                  checked={useSequentialMode}
                  onChange={(e) => setUseSequentialMode(e.target.checked)}
                />
              </label>
            </div>

            {/* 连环画模式参数 */}
            {useSequentialMode && (
              <div className="flex flex-col gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      风格一致性
                    </span>
                  </div>
                  <span className="text-xs font-bold text-primary">
                    {(styleConsistency * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.7"
                  max="0.98"
                  step="0.05"
                  value={styleConsistency}
                  onChange={(e) => setStyleConsistency(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>更多变化</span>
                  <span>高度一致</span>
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-secondary" />
                <p className="text-sm font-medium">角色一致性</p>
              </div>
              <label className="relative flex h-[26px] w-[44px] cursor-pointer items-center rounded-full border-none bg-gray-300 dark:bg-gray-700 p-0.5 transition-colors has-[:checked]:bg-primary">
                <div
                  className={`h-full aspect-square rounded-full bg-white transition-transform ${
                    characterConsistency ? 'translate-x-[18px]' : ''
                  }`}
                />
                <input
                  type="checkbox"
                  className="invisible absolute"
                  checked={characterConsistency}
                  onChange={(e) => setCharacterConsistency(e.target.checked)}
                />
              </label>
            </div>

            {/* 当前风格显示 */}
            <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  当前风格
                </span>
              </div>
              <p className="text-sm font-bold text-primary">
                {currentProject.artStyle}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                💡 如需更改风格，请返回主页重新生成
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
            {/* 主生成按钮 */}
            <Button
              onClick={useSequentialMode ? handleGenerateSequential : handleGenerateAll}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2 h-12 text-base font-bold shadow-lg hover:shadow-xl transition-shadow"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {useSequentialMode ? '连环画生成中...' : `生成中 (${completedCount}/${currentProject.panels.length})`}
                </>
              ) : (
                <>
                  {useSequentialMode ? (
                    <>
                      <span className="text-xl">🎬</span>
                      <span>连环画模式生成</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" />
                      <span>逐格生成全部</span>
                    </>
                  )}
                </>
              )}
            </Button>
            
            {/* 提示信息 */}
            {useSequentialMode && (
              <div className="text-xs text-center text-gray-500 dark:text-gray-400 bg-primary/5 py-2 px-3 rounded-lg">
                💡 连环画模式会一次性生成所有画格，确保风格统一
              </div>
            )}
            
            {/* 一致性检测 */}
            <Button
              onClick={handleCheckConsistency}
              variant="outline"
              size="lg"
              className="w-full flex items-center justify-center gap-2 h-11"
            >
              <CheckCircle2 className="h-5 w-5" />
              检测角色一致性
            </Button>
          </div>
        </div>
      </main>

      {/* 图片预览模态框 */}
      {previewImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh] w-full">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <div className="flex items-center gap-2 text-lg">
                <span>✕</span>
                <span className="text-sm">关闭预览 (ESC)</span>
              </div>
            </button>
            <div className="relative w-full h-full flex items-center justify-center">
              <Image
                src={previewImage}
                alt="预览"
                width={1024}
                height={1024}
                className="object-contain max-h-[85vh] rounded-lg"
                unoptimized
              />
            </div>
            <div className="absolute -bottom-12 left-0 right-0 text-center text-white text-sm">
              点击任意位置关闭
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

