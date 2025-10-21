/**
 * DeepSeek API 响应缓存工具
 * 用于缓存AI生成的结果，避免重复调用
 */

import crypto from 'crypto';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class APICache {
  private cache: Map<string, CacheEntry<any>>;
  private defaultTTL: number; // 默认缓存时间（毫秒）
  
  constructor(defaultTTL: number = 24 * 60 * 60 * 1000) { // 默认24小时
    this.cache = new Map();
    this.defaultTTL = defaultTTL;
    
    // 定期清理过期缓存（每小时）
    setInterval(() => this.cleanup(), 60 * 60 * 1000);
  }
  
  /**
   * 生成缓存键
   */
  private generateKey(prefix: string, params: any): string {
    const paramsStr = JSON.stringify(params, Object.keys(params).sort());
    const hash = crypto.createHash('md5').update(paramsStr).digest('hex');
    return `${prefix}:${hash}`;
  }
  
  /**
   * 设置缓存
   */
  set<T>(prefix: string, params: any, data: T, ttl?: number): void {
    const key = this.generateKey(prefix, params);
    const now = Date.now();
    const expiresAt = now + (ttl || this.defaultTTL);
    
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt,
    });
    
    console.log(`✅ 缓存已保存: ${key.substring(0, 40)}... (TTL: ${ttl || this.defaultTTL}ms)`);
  }
  
  /**
   * 获取缓存
   */
  get<T>(prefix: string, params: any): T | null {
    const key = this.generateKey(prefix, params);
    const entry = this.cache.get(key);
    
    if (!entry) {
      console.log(`❌ 缓存未命中: ${key.substring(0, 40)}...`);
      return null;
    }
    
    // 检查是否过期
    if (Date.now() > entry.expiresAt) {
      console.log(`⏰ 缓存已过期: ${key.substring(0, 40)}...`);
      this.cache.delete(key);
      return null;
    }
    
    const age = Math.floor((Date.now() - entry.timestamp) / 1000);
    console.log(`✅ 缓存命中: ${key.substring(0, 40)}... (Age: ${age}s)`);
    return entry.data as T;
  }
  
  /**
   * 删除缓存
   */
  delete(prefix: string, params: any): boolean {
    const key = this.generateKey(prefix, params);
    return this.cache.delete(key);
  }
  
  /**
   * 清空所有缓存
   */
  clear(): void {
    this.cache.clear();
    console.log('🗑️ 所有缓存已清空');
  }
  
  /**
   * 清理过期缓存
   */
  private cleanup(): void {
    const now = Date.now();
    let removed = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        removed++;
      }
    }
    
    if (removed > 0) {
      console.log(`🧹 清理了 ${removed} 个过期缓存项`);
    }
  }
  
  /**
   * 获取缓存统计信息
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()).map(k => k.substring(0, 50)),
    };
  }
}

// 创建单例实例
const deepseekCache = new APICache(24 * 60 * 60 * 1000); // 24小时

export default deepseekCache;

/**
 * 使用示例：
 * 
 * import deepseekCache from '@/lib/cache';
 * 
 * // 设置缓存
 * deepseekCache.set('script', { theme, artStyle, numPanels }, result, 3600000); // 1小时
 * 
 * // 获取缓存
 * const cached = deepseekCache.get('script', { theme, artStyle, numPanels });
 * if (cached) {
 *   return cached;
 * }
 * 
 * // 删除缓存
 * deepseekCache.delete('script', { theme, artStyle, numPanels });
 */

