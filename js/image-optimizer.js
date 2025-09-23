// 圖片優化模組 - 用於照片處理和懶加載

class PhotoOptimizer {
    constructor() {
        this.loadedImages = new Set();
        this.failedImages = new Set();
        this.imageCache = new Map();
        this.observer = null;
        this.init();
    }
    
    init() {
        // 初始化 Intersection Observer 用於懶加載
        if ('IntersectionObserver' in window) {
            this.observer = new IntersectionObserver(
                this.handleIntersection.bind(this),
                {
                    rootMargin: '50px',
                    threshold: 0.1
                }
            );
        }
        
        window.logger.log('PhotoOptimizer initialized');
    }
    
    // 處理圖片進入視窗
    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                this.loadImage(img);
                this.observer.unobserve(img);
            }
        });
    }
    
    // 載入圖片
    async loadImage(imgElement) {
        const src = imgElement.dataset.src || imgElement.src;
        
        if (!src || this.loadedImages.has(src)) {
            return;
        }
        
        try {
            // 檢查是否需要壓縮
            if (this.shouldCompress(src)) {
                const compressedSrc = await this.compressImage(src);
                imgElement.src = compressedSrc;
            } else {
                imgElement.src = src;
            }
            
            this.loadedImages.add(src);
            imgElement.classList.add('loaded');
            
        } catch (error) {
            window.logger.error('Failed to load image:', src, error);
            this.failedImages.add(src);
            imgElement.classList.add('error');
        }
    }
    
    // 判斷是否需要壓縮
    shouldCompress(src) {
        // 如果是本地檔案或小於 100KB，不需要壓縮
        if (src.startsWith('blob:') || src.startsWith('data:')) {
            return false;
        }
        
        // 檢查圖片大小（如果可能）
        return true; // 預設壓縮
    }
    
    // 壓縮圖片
    async compressImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // 計算壓縮後的尺寸
                const maxWidth = CONFIG.photo.maxWidth || 1920;
                const maxHeight = CONFIG.photo.maxHeight || 1080;
                const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
                
                canvas.width = img.width * ratio;
                canvas.height = img.height * ratio;
                
                // 繪製壓縮後的圖片
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                // 轉換為 blob
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            const compressedUrl = URL.createObjectURL(blob);
                            resolve(compressedUrl);
                        } else {
                            reject(new Error('Failed to compress image'));
                        }
                    },
                    'image/jpeg',
                    CONFIG.photo.quality || 0.8
                );
            };
            
            img.onerror = () => reject(new Error('Failed to load image for compression'));
            img.src = src;
        });
    }
    
    // 為圖片元素添加懶加載
    addLazyLoading(imgElement) {
        if (this.observer) {
            this.observer.observe(imgElement);
        } else {
            // 降級處理：直接載入
            this.loadImage(imgElement);
        }
    }
    
    // 批量處理照片
    async processPhotos(photos) {
        const batchSize = CONFIG.photo.batchSize || 20;
        const processedPhotos = [];
        
        for (let i = 0; i < photos.length; i += batchSize) {
            const batch = photos.slice(i, i + batchSize);
            const batchPromises = batch.map(photo => this.processPhoto(photo));
            
            try {
                const batchResults = await Promise.allSettled(batchPromises);
                processedPhotos.push(...batchResults.map(result => 
                    result.status === 'fulfilled' ? result.value : null
                ).filter(Boolean));
                
                // 顯示進度
                this.updateProgress(i + batch.length, photos.length);
                
            } catch (error) {
                window.logger.error('Error processing photo batch:', error);
            }
        }
        
        return processedPhotos;
    }
    
    // 處理單張照片
    async processPhoto(photo) {
        try {
            // 如果照片需要壓縮
            if (photo.size > CONFIG.photo.maxSize) {
                const compressedFile = await this.compressImage(photo);
                return {
                    ...photo,
                    compressedFile,
                    originalSize: photo.size,
                    compressedSize: compressedFile.size
                };
            }
            
            return photo;
            
        } catch (error) {
            window.logger.error('Error processing photo:', photo.name, error);
            return photo; // 返回原始照片
        }
    }
    
    // 更新進度
    updateProgress(current, total) {
        const progress = Math.round((current / total) * 100);
        
        // 更新進度指示器（如果存在）
        const progressElement = document.getElementById('photoProcessingProgress');
        if (progressElement) {
            progressElement.textContent = `Processing photos: ${progress}%`;
        }
        
        window.logger.log(`Photo processing progress: ${progress}%`);
    }
    
    // 清理資源
    cleanup() {
        if (this.observer) {
            this.observer.disconnect();
        }
        
        // 清理快取
        this.imageCache.clear();
        this.loadedImages.clear();
        this.failedImages.clear();
    }
}

// 優化現有的照片渲染函數
function optimizePhotoRendering() {
    // 攔截原有的 renderPhotos 函數
    if (typeof window.renderPhotos === 'function') {
        const originalRenderPhotos = window.renderPhotos;
        
        window.renderPhotos = async function(photos, lazyObserver, isNewPhotos = false) {
            window.logger.log('Optimized renderPhotos called with', photos.length, 'photos');
            
            // 使用照片優化器處理照片
            const photoOptimizer = new PhotoOptimizer();
            const processedPhotos = await photoOptimizer.processPhotos(photos);
            
            // 調用原始函數
            return originalRenderPhotos.call(this, processedPhotos, lazyObserver, isNewPhotos);
        };
    }
}

// 優化照片網格渲染
function optimizePhotoGrid() {
    const photoGrid = document.getElementById('photoGrid');
    if (!photoGrid) return;
    
    // 為現有的照片項目添加懶加載
    const existingPhotos = photoGrid.querySelectorAll('img[data-src]');
    existingPhotos.forEach(img => {
        if (window.photoOptimizer) {
            window.photoOptimizer.addLazyLoading(img);
        }
    });
}

// 初始化照片優化器
function initPhotoOptimizer() {
    window.photoOptimizer = new PhotoOptimizer();
    
    // 優化現有函數
    optimizePhotoRendering();
    
    // 優化現有照片網格
    optimizePhotoGrid();
    
    window.logger.log('Photo optimizer initialized and applied');
}

// 等待 DOM 載入完成後初始化
document.addEventListener('DOMContentLoaded', initPhotoOptimizer);

// 導出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PhotoOptimizer;
}
