// Performance optimization utilities

export class PerformanceMonitor {
  private static measurements: Map<string, number> = new Map();

  static startMeasurement(name: string): void {
    this.measurements.set(name, performance.now());
  }

  static endMeasurement(name: string): number {
    const startTime = this.measurements.get(name);
    if (!startTime) {
      console.warn(`No measurement started for: ${name}`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.measurements.delete(name);
    
    // Log slow operations
    if (duration > 1000) {
      console.warn(`Slow operation detected: ${name} took ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  static measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    return new Promise(async (resolve, reject) => {
      this.startMeasurement(name);
      try {
        const result = await fn();
        const duration = this.endMeasurement(name);
        console.log(`${name} completed in ${duration.toFixed(2)}ms`);
        resolve(result);
      } catch (error) {
        this.endMeasurement(name);
        reject(error);
      }
    });
  }
}

// Debounce utility for search and filter operations
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle utility for scroll and resize events
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Cache management for API responses
export class CacheManager {
  private static cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();

  static set(key: string, data: any, ttlMinutes = 5): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000
    });
  }

  static get(key: string): any | null {
    const cached = this.cache.get(key);
    
    if (!cached) {
      return null;
    }

    // Check if cache has expired
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  static clear(pattern?: string): void {
    if (pattern) {
      // Clear keys matching pattern
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      // Clear all cache
      this.cache.clear();
    }
  }

  static size(): number {
    return this.cache.size;
  }
}

// Memory usage monitoring
export class MemoryMonitor {
  static getMemoryUsage(): any {
    if ('memory' in performance) {
      return (performance as any).memory;
    }
    return null;
  }

  static logMemoryUsage(context: string): void {
    const memory = this.getMemoryUsage();
    if (memory) {
      console.log(`Memory usage (${context}):`, {
        used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`
      });
    }
  }
}

// Network status monitoring
export class NetworkMonitor {
  private static listeners: Set<(online: boolean) => void> = new Set();

  static init(): void {
    window.addEventListener('online', () => this.notifyListeners(true));
    window.addEventListener('offline', () => this.notifyListeners(false));
  }

  static isOnline(): boolean {
    return navigator.onLine;
  }

  static addListener(callback: (online: boolean) => void): void {
    this.listeners.add(callback);
  }

  static removeListener(callback: (online: boolean) => void): void {
    this.listeners.delete(callback);
  }

  private static notifyListeners(online: boolean): void {
    this.listeners.forEach(callback => callback(online));
  }
}

// Initialize network monitoring
if (typeof window !== 'undefined') {
  NetworkMonitor.init();
}