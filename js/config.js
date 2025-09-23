// 應用程式配置
const CONFIG = {
    // 開發模式檢測
    isDevelopment: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
    
    // 照片處理配置
    photo: {
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
        batchSize: 20,
        lazyLoadThreshold: 0.1
    },
    
    // 缺陷管理配置
    defect: {
        maxCount: 1000,
        autoNumbering: true,
        syncDebounceDelay: 300
    },
    
    // UI 配置
    ui: {
        animationDuration: 300,
        debounceDelay: 300,
        notificationDuration: 4000
    },
    
    // 效能配置
    performance: {
        enableVirtualScroll: true,
        enableImageCompression: true,
        maxConsoleLogs: 100
    }
};

// 日誌管理器
class Logger {
    constructor() {
        this.logCount = 0;
        this.maxLogs = CONFIG.performance.maxConsoleLogs;
    }
    
    log(message, ...args) {
        if (CONFIG.isDevelopment && this.logCount < this.maxLogs) {
            console.log(message, ...args);
            this.logCount++;
        }
    }
    
    error(message, ...args) {
        console.error(message, ...args);
    }
    
    warn(message, ...args) {
        if (CONFIG.isDevelopment) {
            console.warn(message, ...args);
        }
    }
}

// 全域日誌實例
window.logger = new Logger();

// 導出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
