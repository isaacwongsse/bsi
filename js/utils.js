// 效能優化工具函數

// 防抖函數
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 節流函數
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// 批量 DOM 操作
function batchDOMOperations(operations) {
    const fragment = document.createDocumentFragment();
    operations.forEach(op => {
        if (op.type === 'create') {
            fragment.appendChild(op.element);
        }
    });
    return fragment;
}

// 圖片壓縮
function compressImage(file, maxWidth = 1920, quality = 0.8) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
            const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
            canvas.width = img.width * ratio;
            canvas.height = img.height * ratio;
            
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            canvas.toBlob(resolve, 'image/jpeg', quality);
        };
        
        img.src = URL.createObjectURL(file);
    });
}

// 虛擬滾動實現
class VirtualScroll {
    constructor(container, items, itemHeight, renderItem) {
        this.container = container;
        this.items = items;
        this.itemHeight = itemHeight;
        this.renderItem = renderItem;
        this.visibleCount = Math.ceil(container.clientHeight / itemHeight);
        this.startIndex = 0;
        this.endIndex = this.visibleCount;
        
        this.init();
    }
    
    init() {
        this.container.addEventListener('scroll', throttle(() => {
            this.updateVisibleItems();
        }, 16));
        
        this.render();
    }
    
    updateVisibleItems() {
        const scrollTop = this.container.scrollTop;
        this.startIndex = Math.floor(scrollTop / this.itemHeight);
        this.endIndex = Math.min(this.startIndex + this.visibleCount, this.items.length);
        
        this.render();
    }
    
    render() {
        const visibleItems = this.items.slice(this.startIndex, this.endIndex);
        const offsetY = this.startIndex * this.itemHeight;
        
        this.container.innerHTML = '';
        visibleItems.forEach((item, index) => {
            const element = this.renderItem(item, this.startIndex + index);
            element.style.position = 'absolute';
            element.style.top = (index * this.itemHeight) + 'px';
            this.container.appendChild(element);
        });
        
        this.container.style.height = (this.items.length * this.itemHeight) + 'px';
    }
}

// 數據驗證工具
const Validator = {
    email: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    
    required: (value) => value !== null && value !== undefined && value.toString().trim() !== '',
    
    number: (value) => !isNaN(value) && isFinite(value),
    
    date: (value) => !isNaN(Date.parse(value)),
    
    fileSize: (file, maxSize) => file.size <= maxSize,
    
    fileType: (file, allowedTypes) => allowedTypes.includes(file.type)
};

// 錯誤處理工具
class ErrorHandler {
    static handle(error, context = '') {
        const errorMessage = `Error in ${context}: ${error.message}`;
        window.logger.error(errorMessage, error);
        
        // 顯示用戶友好的錯誤訊息
        this.showUserError(context);
    }
    
    static showUserError(context) {
        const messages = {
            'photo-upload': '照片上傳失敗，請檢查檔案格式和大小',
            'data-save': '數據保存失敗，請重試',
            'export': '導出失敗，請檢查數據完整性',
            'default': '操作失敗，請重試'
        };
        
        const message = messages[context] || messages.default;
        // 這裡可以調用通知系統
        console.error(message);
    }
}

// 導出工具函數
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        debounce,
        throttle,
        batchDOMOperations,
        compressImage,
        VirtualScroll,
        Validator,
        ErrorHandler
    };
}
