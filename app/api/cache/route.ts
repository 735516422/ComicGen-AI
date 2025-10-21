import { NextRequest, NextResponse } from 'next/server';
import deepseekCache from '@/lib/cache';

/**
 * 缓存管理 API
 * 
 * GET  /api/cache - 查看缓存统计
 * POST /api/cache?action=clear - 清空缓存
 */

export async function GET(request: NextRequest) {
  try {
    const stats = deepseekCache.getStats();
    
    return NextResponse.json({
      success: true,
      stats: {
        size: stats.size,
        keys: stats.keys,
        message: `当前缓存 ${stats.size} 个项目`,
      },
    });
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get cache stats' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    if (action === 'clear') {
      deepseekCache.clear();
      
      return NextResponse.json({
        success: true,
        message: '缓存已清空',
      });
    }
    
    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error managing cache:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to manage cache' },
      { status: 500 }
    );
  }
}

