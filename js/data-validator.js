// 數據驗證和錯誤處理模組

class DataValidator {
    constructor() {
        this.validationRules = {
            defect: {
                defectNo: { required: true, type: 'number', min: 1 },
                locationId: { required: true, type: 'string', minLength: 1 },
                inspectionDate: { required: true, type: 'date' },
                floor: { required: false, type: 'string' },
                areaName: { required: false, type: 'string' },
                roomNo: { required: false, type: 'string' },
                defectType: { required: true, type: 'string', minLength: 1 },
                description: { required: true, type: 'string', minLength: 1 }
            },
            label: {
                id: { required: true, type: 'string' },
                inspectionNo: { required: true, type: 'string', minLength: 1 },
                inspectionDate: { required: true, type: 'date' },
                floor: { required: false, type: 'string' },
                areaName: { required: false, type: 'string' },
                roomNo: { required: false, type: 'string' },
                defectNo: { required: false, type: 'number' }
            },
            photo: {
                name: { required: true, type: 'string', minLength: 1 },
                size: { required: true, type: 'number', min: 0 },
                type: { required: true, type: 'string' },
                lastModified: { required: true, type: 'number' }
            }
        };
        
        this.errorMessages = {
            required: '此欄位為必填',
            type: '資料類型不正確',
            minLength: '長度不足',
            min: '數值過小',
            max: '數值過大',
            invalid: '資料格式不正確'
        };
    }
    
    // 驗證單個欄位
    validateField(value, rules) {
        const errors = [];
        
        // 檢查必填
        if (rules.required && (value === null || value === undefined || value === '')) {
            errors.push(this.errorMessages.required);
            return errors;
        }
        
        // 如果值為空且非必填，跳過其他驗證
        if (!value && !rules.required) {
            return errors;
        }
        
        // 檢查資料類型
        if (rules.type) {
            if (!this.checkType(value, rules.type)) {
                errors.push(this.errorMessages.type);
            }
        }
        
        // 檢查最小長度
        if (rules.minLength && value.toString().length < rules.minLength) {
            errors.push(this.errorMessages.minLength);
        }
        
        // 檢查最小數值
        if (rules.min !== undefined && Number(value) < rules.min) {
            errors.push(this.errorMessages.min);
        }
        
        // 檢查最大數值
        if (rules.max !== undefined && Number(value) > rules.max) {
            errors.push(this.errorMessages.max);
        }
        
        return errors;
    }
    
    // 檢查資料類型
    checkType(value, expectedType) {
        switch (expectedType) {
            case 'string':
                return typeof value === 'string';
            case 'number':
                return !isNaN(value) && isFinite(value);
            case 'date':
                return !isNaN(Date.parse(value));
            case 'boolean':
                return typeof value === 'boolean';
            default:
                return true;
        }
    }
    
    // 驗證完整物件
    validateObject(data, type) {
        const rules = this.validationRules[type];
        if (!rules) {
            window.logger.warn(`No validation rules found for type: ${type}`);
            return { isValid: true, errors: {} };
        }
        
        const errors = {};
        let isValid = true;
        
        for (const [field, fieldRules] of Object.entries(rules)) {
            const fieldErrors = this.validateField(data[field], fieldRules);
            if (fieldErrors.length > 0) {
                errors[field] = fieldErrors;
                isValid = false;
            }
        }
        
        return { isValid, errors };
    }
    
    // 驗證缺陷資料
    validateDefect(defectData) {
        return this.validateObject(defectData, 'defect');
    }
    
    // 驗證標籤資料
    validateLabel(labelData) {
        return this.validateObject(labelData, 'label');
    }
    
    // 驗證照片資料
    validatePhoto(photoData) {
        return this.validateObject(photoData, 'photo');
    }
    
    // 批量驗證
    validateBatch(dataArray, type) {
        const results = dataArray.map((data, index) => ({
            index,
            data,
            validation: this.validateObject(data, type)
        }));
        
        const validItems = results.filter(r => r.validation.isValid);
        const invalidItems = results.filter(r => !r.validation.isValid);
        
        return {
            valid: validItems,
            invalid: invalidItems,
            total: dataArray.length,
            validCount: validItems.length,
            invalidCount: invalidItems.length
        };
    }
}

// 錯誤處理器
class ErrorHandler {
    constructor() {
        this.errorCount = 0;
        this.maxErrors = 100; // 防止錯誤日誌過多
    }
    
    // 處理錯誤
    handle(error, context = '', showUserMessage = true) {
        this.errorCount++;
        
        if (this.errorCount > this.maxErrors) {
            return; // 停止記錄錯誤
        }
        
        const errorMessage = `Error in ${context}: ${error.message}`;
        window.logger.error(errorMessage, error);
        
        if (showUserMessage) {
            this.showUserError(context);
        }
    }
    
    // 顯示用戶友好的錯誤訊息
    showUserError(context) {
        const messages = {
            'photo-upload': '照片上傳失敗，請檢查檔案格式和大小',
            'data-save': '數據保存失敗，請重試',
            'data-load': '數據載入失敗，請檢查檔案',
            'export-pdf': 'PDF 導出失敗，請檢查數據完整性',
            'export-csv': 'CSV 導出失敗，請檢查數據格式',
            'defect-create': '缺陷創建失敗，請檢查輸入資料',
            'label-create': '標籤創建失敗，請檢查輸入資料',
            'floor-plan': '樓層平面圖載入失敗',
            'default': '操作失敗，請重試'
        };
        
        const message = messages[context] || messages.default;
        this.showNotification(message, 'error');
    }
    
    // 顯示通知
    showNotification(message, type = 'info') {
        // 創建通知元素
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // 添加樣式
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 25px',
            borderRadius: '8px',
            color: 'white',
            zIndex: '10000',
            fontSize: '14px',
            maxWidth: '300px',
            wordWrap: 'break-word',
            animation: 'slideInRight 0.3s ease-out'
        });
        
        // 設置背景顏色
        const colors = {
            error: '#f44336',
            warning: '#ff9800',
            success: '#4caf50',
            info: '#2196f3'
        };
        notification.style.backgroundColor = colors[type] || colors.info;
        
        // 添加到頁面
        document.body.appendChild(notification);
        
        // 自動移除
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, CONFIG.ui.notificationDuration || 4000);
    }
    
    // 重置錯誤計數
    reset() {
        this.errorCount = 0;
    }
}

// 數據同步管理器
class DataSyncManager {
    constructor() {
        this.syncQueue = [];
        this.isProcessing = false;
        this.syncDelay = CONFIG.defect.syncDebounceDelay || 300;
        this.syncTimeout = null;
    }
    
    // 添加同步任務
    addSyncTask(type, data, callback) {
        this.syncQueue.push({ type, data, callback });
        this.scheduleSync();
    }
    
    // 安排同步
    scheduleSync() {
        if (this.syncTimeout) {
            clearTimeout(this.syncTimeout);
        }
        
        this.syncTimeout = setTimeout(() => {
            this.processSyncQueue();
        }, this.syncDelay);
    }
    
    // 處理同步佇列
    async processSyncQueue() {
        if (this.isProcessing || this.syncQueue.length === 0) {
            return;
        }
        
        this.isProcessing = true;
        
        try {
            while (this.syncQueue.length > 0) {
                const task = this.syncQueue.shift();
                await this.performSync(task);
            }
        } catch (error) {
            window.logger.error('Error in sync queue processing:', error);
        } finally {
            this.isProcessing = false;
        }
    }
    
    // 執行同步
    async performSync(task) {
        try {
            if (task.callback && typeof task.callback === 'function') {
                await task.callback(task.data);
            }
        } catch (error) {
            window.logger.error(`Sync error for ${task.type}:`, error);
        }
    }
}

// 初始化驗證器和錯誤處理器
function initDataValidation() {
    window.dataValidator = new DataValidator();
    window.errorHandler = new ErrorHandler();
    window.dataSyncManager = new DataSyncManager();
    
    window.logger.log('Data validation and error handling initialized');
}

// 等待 DOM 載入完成後初始化
document.addEventListener('DOMContentLoaded', initDataValidation);

// 導出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DataValidator,
        ErrorHandler,
        DataSyncManager
    };
}
