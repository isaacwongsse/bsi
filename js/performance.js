// 效能監控和優化

class PerformanceMonitor {
    constructor() {
        this.metrics = {
            pageLoad: 0,
            domContentLoaded: 0,
            firstPaint: 0,
            firstContentfulPaint: 0,
            largestContentfulPaint: 0,
            cumulativeLayoutShift: 0,
            firstInputDelay: 0
        };
        
        this.init();
    }
    
    init() {
        // 監控頁面載入時間
        window.addEventListener('load', () => {
            this.metrics.pageLoad = performance.now();
            this.reportMetrics();
        });
        
        // 監控 DOM 內容載入
        document.addEventListener('DOMContentLoaded', () => {
            this.metrics.domContentLoaded = performance.now();
        });
        
        // 監控 Core Web Vitals
        this.observeCoreWebVitals();
        
        // 監控記憶體使用
        this.monitorMemoryUsage();
    }
    
    observeCoreWebVitals() {
        // First Paint
        if ('PerformanceObserver' in window) {
            const paintObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.name === 'first-paint') {
                        this.metrics.firstPaint = entry.startTime;
                    } else if (entry.name === 'first-contentful-paint') {
                        this.metrics.firstContentfulPaint = entry.startTime;
                    }
                }
            });
            paintObserver.observe({ entryTypes: ['paint'] });
            
            // Largest Contentful Paint
            const lcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                this.metrics.largestContentfulPaint = lastEntry.startTime;
            });
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
            
            // Cumulative Layout Shift
            const clsObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (!entry.hadRecentInput) {
                        this.metrics.cumulativeLayoutShift += entry.value;
                    }
                }
            });
            clsObserver.observe({ entryTypes: ['layout-shift'] });
        }
    }
    
    monitorMemoryUsage() {
        if ('memory' in performance) {
            setInterval(() => {
                const memory = performance.memory;
                if (memory.usedJSHeapSize > 50 * 1024 * 1024) { // 50MB
                    window.logger.warn('High memory usage detected:', {
                        used: Math.round(memory.usedJSHeapSize / 1024 / 1024) + 'MB',
                        total: Math.round(memory.totalJSHeapSize / 1024 / 1024) + 'MB',
                        limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) + 'MB'
                    });
                }
            }, 30000); // 每30秒檢查一次
        }
    }
    
    reportMetrics() {
        if (CONFIG.isDevelopment) {
            window.logger.log('Performance Metrics:', this.metrics);
        }
        
        // 檢查效能問題
        this.checkPerformanceIssues();
    }
    
    checkPerformanceIssues() {
        const issues = [];
        
        if (this.metrics.firstContentfulPaint > 2000) {
            issues.push('First Contentful Paint is slow (>2s)');
        }
        
        if (this.metrics.largestContentfulPaint > 2500) {
            issues.push('Largest Contentful Paint is slow (>2.5s)');
        }
        
        if (this.metrics.cumulativeLayoutShift > 0.1) {
            issues.push('High Cumulative Layout Shift (>0.1)');
        }
        
        if (issues.length > 0) {
            window.logger.warn('Performance issues detected:', issues);
        }
    }
    
    // 測量函數執行時間
    measureFunction(name, fn) {
        const start = performance.now();
        const result = fn();
        const end = performance.now();
        
        if (CONFIG.isDevelopment) {
            window.logger.log(`Function ${name} took ${(end - start).toFixed(2)}ms`);
        }
        
        return result;
    }
    
    // 測量異步函數執行時間
    async measureAsyncFunction(name, fn) {
        const start = performance.now();
        const result = await fn();
        const end = performance.now();
        
        if (CONFIG.isDevelopment) {
            window.logger.log(`Async function ${name} took ${(end - start).toFixed(2)}ms`);
        }
        
        return result;
    }
}

// 圖片載入優化
class ImageOptimizer {
    constructor() {
        this.loadedImages = new Set();
        this.failedImages = new Set();
    }
    
    // 預載入圖片
    preloadImage(src) {
        return new Promise((resolve, reject) => {
            if (this.loadedImages.has(src)) {
                resolve();
                return;
            }
            
            if (this.failedImages.has(src)) {
                reject(new Error('Image previously failed to load'));
                return;
            }
            
            const img = new Image();
            img.onload = () => {
                this.loadedImages.add(src);
                resolve();
            };
            img.onerror = () => {
                this.failedImages.add(src);
                reject(new Error('Failed to load image'));
            };
            img.src = src;
        });
    }
    
    // 批量預載入
    async preloadImages(srcs) {
        const promises = srcs.map(src => this.preloadImage(src));
        return Promise.allSettled(promises);
    }
    
    // 圖片壓縮
    compressImage(file, options = {}) {
        const {
            maxWidth = 1920,
            maxHeight = 1080,
            quality = 0.8,
            format = 'image/jpeg'
        } = options;
        
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
                canvas.width = img.width * ratio;
                canvas.height = img.height * ratio;
                
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                canvas.toBlob(resolve, format, quality);
            };
            
            img.src = URL.createObjectURL(file);
        });
    }
}

// 初始化效能監控
window.performanceMonitor = new PerformanceMonitor();
window.imageOptimizer = new ImageOptimizer();

// 導出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PerformanceMonitor,
        ImageOptimizer
    };
}
