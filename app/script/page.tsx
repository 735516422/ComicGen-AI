"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useComicStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowRight,
  ArrowLeft,
  GripVertical,
  Edit3,
  RefreshCw,
  Sparkles,
  Plus,
  Save,
} from 'lucide-react';
import { ComicPanel } from '@/lib/types';

export default function ScriptPage() {
  const router = useRouter();
  const { currentProject, updatePanel, addPanel, reorderPanels, updateProject } = useComicStore();
  const { toast } = useToast();

  const [editingPanelId, setEditingPanelId] = useState<string | null>(null);
  const [editingDialogue, setEditingDialogue] = useState('');
  const [optimizingPanelId, setOptimizingPanelId] = useState<string | null>(null);
  const [regeneratingPanelId, setRegeneratingPanelId] = useState<string | null>(null);

  useEffect(() => {
    if (!currentProject) {
      router.push('/');
    }
  }, [currentProject, router]);

  if (!currentProject) {
    return null;
  }

  const handleEditDialogue = (panelId: string, currentDialogue: string) => {
    setEditingPanelId(panelId);
    setEditingDialogue(currentDialogue);
  };

  const handleSaveDialogue = (panelId: string) => {
    updatePanel(panelId, { dialogue: editingDialogue });
    setEditingPanelId(null);
    toast({
      title: '保存成功',
      description: '对白已更新',
    });
  };

  const handleOptimizeDialogue = async (panelId: string, currentDialogue: string) => {
    setOptimizingPanelId(panelId);

    try {
      const response = await fetch('/api/optimize-dialogue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dialogue: currentDialogue,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to optimize dialogue');
      }

      const data = await response.json();
      updatePanel(panelId, { dialogue: data.optimizedDialogue });

      toast({
        title: 'AI 优化完成',
        description: '对白已优化',
      });
    } catch (error) {
      console.error('Error optimizing dialogue:', error);
      toast({
        title: '优化失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setOptimizingPanelId(null);
    }
  };

  const handleRegeneratePanel = async (panelId: string) => {
    setRegeneratingPanelId(panelId);

    try {
      const response = await fetch('/api/generate-script', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          theme: currentProject.theme,
          artStyle: currentProject.artStyle,
          numPanels: 1,
          characterDescription: currentProject.characterDescription,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to regenerate panel');
      }

      const data = await response.json();
      const newPanel = data.panels[0];

      updatePanel(panelId, {
        scene: newPanel.scene,
        dialogue: newPanel.dialogue,
        character: newPanel.character,
        emotion: newPanel.emotion,
      });

      toast({
        title: '重新生成成功',
        description: '该格已更新',
      });
    } catch (error) {
      console.error('Error regenerating panel:', error);
      toast({
        title: '生成失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setRegeneratingPanelId(null);
    }
  };

  const handleAddPanel = () => {
    const newPanel: ComicPanel = {
      id: `panel-${Date.now()}`,
      order: currentProject.panels.length,
      scene: '新场景：描述这一格的场景',
      dialogue: '角色：对话内容',
      character: '角色名',
      status: 'pending',
    };

    addPanel(newPanel);

    toast({
      title: '添加成功',
      description: '已添加新的一格',
    });
  };

  const handleNextStep = () => {
    updateProject({ status: 'generating' });
    router.push('/generate');
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Header - Fixed */}
      <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 lg:px-10 py-3 bg-white dark:bg-gray-900 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.push('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">返回首页</span>
          </Button>
          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
          <div className="flex items-center gap-3 text-text-dark dark:text-white">
            <div className="size-6 text-primary">
              <svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-12h2v4h-2v-4zm0 6h2v2h-2v-2z" />
              </svg>
            </div>
            <h2 className="text-text-dark dark:text-white text-lg sm:text-xl font-bold leading-tight tracking-tighter">
              AI 漫画生成器
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            <span className="hidden sm:inline">已保存</span>
            <span className="sm:hidden">✓</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 sm:p-6 lg:p-8 mt-16 max-w-5xl mx-auto">
        {/* Page Header */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-col gap-2">
              <h1 className="text-text-dark dark:text-white text-3xl sm:text-4xl font-black leading-tight tracking-[-0.033em]">
                编辑你的漫画剧本
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base font-normal leading-normal flex items-center gap-2">
                <GripVertical className="h-4 w-4" />
                拖拽卡片可重新排序分镜
              </p>
            </div>
            <Button onClick={handleNextStep} size="lg" className="flex items-center gap-2 w-full sm:w-auto">
              <span>下一步：生成画面</span>
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {currentProject.panels.map((panel) => (
            <div
              key={panel.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex flex-col lg:flex-row items-start gap-4">
                {/* Drag Handle and Number */}
                <div className="flex items-center gap-4 w-full lg:w-auto">
                  <GripVertical className="h-5 w-5 text-gray-400 cursor-grab" />
                  <div className="flex-shrink-0 size-12 flex items-center justify-center bg-primary rounded-lg text-text-dark text-2xl font-bold">
                    {panel.order + 1}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-grow">
                  <p className="text-gray-600 dark:text-gray-300 text-base font-medium leading-normal mb-2">
                    {panel.scene}
                  </p>
                  {editingPanelId === panel.id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editingDialogue}
                        onChange={(e) => setEditingDialogue(e.target.value)}
                        className="min-h-[80px]"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleSaveDialogue(panel.id)}
                        >
                          保存
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingPanelId(null)}
                        >
                          取消
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-text-dark dark:text-white text-base font-normal leading-normal">
                      {panel.dialogue}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 self-start lg:self-center flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditDialogue(panel.id, panel.dialogue)}
                    disabled={editingPanelId === panel.id}
                  >
                    <Edit3 className="h-4 w-4 lg:mr-2" />
                    <span className="hidden sm:inline">编辑</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRegeneratePanel(panel.id)}
                    disabled={regeneratingPanelId === panel.id}
                  >
                    {regeneratingPanelId === panel.id ? (
                      <RefreshCw className="h-4 w-4 animate-spin lg:mr-2" />
                    ) : (
                      <RefreshCw className="h-4 w-4 lg:mr-2" />
                    )}
                    <span className="hidden sm:inline">重写</span>
                  </Button>
                  <Button
                    size="sm"
                    className="bg-secondary/20 text-secondary hover:bg-secondary/30"
                    onClick={() => handleOptimizeDialogue(panel.id, panel.dialogue)}
                    disabled={optimizingPanelId === panel.id}
                  >
                    {optimizingPanelId === panel.id ? (
                      <Sparkles className="h-4 w-4 animate-pulse lg:mr-2" />
                    ) : (
                      <Sparkles className="h-4 w-4 lg:mr-2" />
                    )}
                    <span className="hidden sm:inline">AI 优化</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Panel Button */}
        <div className="mt-8 mb-4">
          <button
            onClick={handleAddPanel}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-xl border-2 border-dashed border-secondary/50 bg-secondary/5 hover:bg-secondary/10 hover:border-secondary transition-all text-secondary font-semibold"
          >
            <Plus className="h-6 w-6" />
            <span>添加新的一格</span>
          </button>
        </div>
      </main>
    </div>
  );
}

