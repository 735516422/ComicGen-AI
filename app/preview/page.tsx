"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useComicStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { Download, Grid3x3, Save, ArrowLeft, Loader2 } from 'lucide-react';
import Image from 'next/image';
import html2canvas from 'html-to-image';

export default function PreviewPage() {
  const router = useRouter();
  const { currentProject } = useComicStore();
  const { toast } = useToast();
  const comicRef = useRef<HTMLDivElement>(null);

  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<'long' | 'grid' | null>(null);

  useEffect(() => {
    if (!currentProject) {
      router.push('/');
    }
  }, [currentProject, router]);

  if (!currentProject) {
    return null;
  }

  const handleExportLongImage = async () => {
    if (!comicRef.current) return;

    setIsExporting(true);
    setExportType('long');

    try {
      const dataUrl = await html2canvas.toPng(comicRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      });

      // Create download link
      const link = document.createElement('a');
      link.download = `comic-${currentProject.id}-long.png`;
      link.href = dataUrl;
      link.click();

      toast({
        title: '导出成功！',
        description: '长图已保存到本地',
      });
    } catch (error) {
      console.error('Error exporting long image:', error);
      toast({
        title: '导出失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  const handleExportGrid = async () => {
    if (!comicRef.current) return;

    setIsExporting(true);
    setExportType('grid');

    try {
      // For grid export, we'd need to create a 3x3 grid layout
      // This is a simplified version - in production, you'd create a proper grid layout
      const dataUrl = await html2canvas.toPng(comicRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      });

      const link = document.createElement('a');
      link.download = `comic-${currentProject.id}-grid.png`;
      link.href = dataUrl;
      link.click();

      toast({
        title: '导出成功！',
        description: '九宫格已保存到本地',
      });
    } catch (error) {
      console.error('Error exporting grid:', error);
      toast({
        title: '导出失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  const handleSaveProject = () => {
    // In a real app, this would save to a database
    const projectData = JSON.stringify(currentProject);
    const blob = new Blob([projectData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `comic-project-${currentProject.id}.json`;
    link.href = url;
    link.click();

    toast({
      title: '项目已保存',
      description: '项目文件已下载到本地',
    });
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
      {/* Header - Fixed */}
      <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95 px-6 py-3 md:px-10">
        <div className="flex items-center gap-3 text-text-dark dark:text-white">
          <div className="size-8 text-primary">
            <svg
              fill="currentColor"
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                clipRule="evenodd"
                d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z"
                fillRule="evenodd"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold leading-tight tracking-tight">
            ComicGen
          </h1>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push('/generate')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回编辑
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 w-full mt-16">
        {/* Comic Preview */}
        <div className="flex-1 flex flex-col items-center py-8 px-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-gray-100 dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div
              ref={comicRef}
              className="w-full flex flex-col items-center p-4 sm:p-6 md:p-8 space-y-4 bg-white"
            >
              {/* Title */}
              <div className="w-full text-center pb-4 border-b-2 border-gray-200">
                <h2 className="text-2xl font-black text-text-dark">
                  {currentProject.theme}
                </h2>
              </div>

              {/* Comic Panels */}
              <div className="w-full space-y-4">
                {currentProject.panels.map((panel) => (
                  <div
                    key={panel.id}
                    className="w-full bg-white border-2 border-gray-300 rounded-lg overflow-hidden"
                  >
                    {panel.imageUrl && (
                      <div className="relative w-full aspect-square bg-gray-50">
                        <Image
                          src={panel.imageUrl}
                          alt={`Panel ${panel.order + 1}`}
                          fill
                          className="object-contain"
                          unoptimized
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="w-full bg-secondary/20 p-4 text-center mt-6">
                <p className="font-bold text-sm text-text-dark">
                  ComicGen AI / 作者：{currentProject.id.slice(0, 8)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Toolbar */}
        <aside className="w-full md:w-80 p-4 md:py-8 md:pr-8 md:pl-0">
          <div className="sticky top-24 bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 flex flex-col gap-4">
            <h2 className="text-lg font-bold text-text-dark dark:text-white mb-2">
              导出选项
            </h2>

            <Button
              onClick={handleExportLongImage}
              disabled={isExporting}
              size="lg"
              className="w-full"
            >
              {isExporting && exportType === 'long' ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  导出中...
                </>
              ) : (
                <>
                  <Download className="h-5 w-5 mr-2" />
                  导出公众号长图
                </>
              )}
            </Button>

            <Button
              onClick={handleExportGrid}
              disabled={isExporting}
              variant="secondary"
              size="lg"
              className="w-full"
            >
              {isExporting && exportType === 'grid' ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  导出中...
                </>
              ) : (
                <>
                  <Grid3x3 className="h-5 w-5 mr-2" />
                  导出九宫格
                </>
              )}
            </Button>

            <Button
              onClick={handleSaveProject}
              variant="outline"
              size="lg"
              className="w-full"
            >
              <Save className="h-5 w-5 mr-2" />
              保存项目
            </Button>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                项目信息
              </p>
              <ul className="text-xs text-gray-500 dark:text-gray-500 space-y-1">
                <li>格数: {currentProject.panels.length}</li>
                <li>风格: {currentProject.artStyle}</li>
                <li>
                  创建时间:{' '}
                  {new Date(currentProject.createdAt).toLocaleDateString()}
                </li>
              </ul>
            </div>
          </div>
        </aside>
      </main>

      {/* Footer */}
      <footer className="w-full flex flex-col gap-2 px-5 py-6 text-center bg-gray-100 dark:bg-gray-900">
        <p className="text-gray-500 dark:text-gray-400 text-sm font-normal leading-normal">
          © 2024 ComicGen AI. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

