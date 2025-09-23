// 效能優化補丁 - 為現有事件添加防抖和節流
// 這個檔案將在 main.js 之後載入，用於優化現有的事件處理

(function() {
    'use strict';
    
    // 等待 DOM 載入完成
    document.addEventListener('DOMContentLoaded', function() {
        // 為輸入事件添加防抖
        optimizeInputEvents();
        
        // 為滾動事件添加節流
        optimizeScrollEvents();
        
        // 為調整大小事件添加節流
        optimizeResizeEvents();
        
        window.logger.log('Performance optimization patches applied');
    });
    
    function optimizeInputEvents() {
        // 防抖延遲時間
        const debounceDelay = CONFIG.ui.debounceDelay || 300;
        
        // 為缺陷類型直接輸入添加防抖
        const defectTypeDirectInput = document.getElementById('defectTypeDirectInput');
        if (defectTypeDirectInput) {
            const originalHandler = defectTypeDirectInput._originalInputHandler;
            if (originalHandler) {
                defectTypeDirectInput.removeEventListener('input', originalHandler);
                defectTypeDirectInput.addEventListener('input', debounce(originalHandler, debounceDelay));
            }
        }
        
        // 為缺陷搜索輸入添加防抖
        const defectSearchInput = document.getElementById('defectSearchInput');
        if (defectSearchInput) {
            const originalHandler = defectSearchInput._originalInputHandler;
            if (originalHandler) {
                defectSearchInput.removeEventListener('input', originalHandler);
                defectSearchInput.addEventListener('input', debounce(originalHandler, debounceDelay));
            }
        }
        
        // 為檢查編號欄位添加防抖
        const inspectionNoField = document.getElementById('inspectionNo');
        if (inspectionNoField) {
            const originalHandler = inspectionNoField._originalInputHandler;
            if (inspectionNoField._originalInputHandler) {
                inspectionNoField.removeEventListener('input', originalHandler);
                inspectionNoField.addEventListener('input', debounce(originalHandler, debounceDelay));
            }
        }
        
        // 為縮放滑桿添加節流
        const zoomSlider = document.getElementById('zoomSlider');
        if (zoomSlider) {
            const originalHandler = zoomSlider._originalInputHandler;
            if (originalHandler) {
                zoomSlider.removeEventListener('input', originalHandler);
                zoomSlider.addEventListener('input', throttle(originalHandler, 16)); // 60fps
            }
        }
        
        // 為標籤詳細表格輸入添加防抖
        const labelsDetailTable = document.getElementById('labelsDetailTable');
        if (labelsDetailTable) {
            const originalHandler = labelsDetailTable._originalInputHandler;
            if (originalHandler) {
                labelsDetailTable.removeEventListener('input', originalHandler);
                labelsDetailTable.addEventListener('input', debounce(originalHandler, debounceDelay));
            }
        }
        
        // 為缺陷詳細表格輸入添加防抖
        const defectsDetailTable = document.getElementById('defectsDetailTable');
        if (defectsDetailTable) {
            const originalHandler = defectsDetailTable._originalInputHandler;
            if (originalHandler) {
                defectsDetailTable.removeEventListener('input', originalHandler);
                defectsDetailTable.addEventListener('input', debounce(originalHandler, debounceDelay));
            }
        }
    }
    
    function optimizeScrollEvents() {
        // 為照片網格滾動添加節流
        const photoGrid = document.getElementById('photoGrid');
        if (photoGrid) {
            const originalHandler = photoGrid._originalScrollHandler;
            if (originalHandler) {
                photoGrid.removeEventListener('scroll', originalHandler);
                photoGrid.addEventListener('scroll', throttle(originalHandler, 16)); // 60fps
            }
        }
        
        // 為樓層平面圖滾動添加節流
        const floorPlanViewer = document.getElementById('floorPlanViewer');
        if (floorPlanViewer) {
            const originalHandler = floorPlanViewer._originalScrollHandler;
            if (originalHandler) {
                floorPlanViewer.removeEventListener('scroll', originalHandler);
                floorPlanViewer.addEventListener('scroll', throttle(originalHandler, 16)); // 60fps
            }
        }
    }
    
    function optimizeResizeEvents() {
        // 為視窗調整大小添加節流
        const originalResizeHandler = window._originalResizeHandler;
        if (originalResizeHandler) {
            window.removeEventListener('resize', originalResizeHandler);
            window.addEventListener('resize', throttle(originalResizeHandler, 250));
        }
    }
    
    // 為現有的滑桿添加優化
    function optimizeSliders() {
        // 標籤大小滑桿
        const labelSizeSlider = document.getElementById('labelSizeSlider');
        if (labelSizeSlider && labelSizeSlider._inputHandler) {
            const originalHandler = labelSizeSlider._inputHandler;
            labelSizeSlider.removeEventListener('input', originalHandler);
            labelSizeSlider.addEventListener('input', throttle(originalHandler, 16)); // 60fps
        }
        
        // 缺陷標記大小滑桿
        const defectSizeSlider = document.getElementById('defectSizeSlider');
        if (defectSizeSlider && defectSizeSlider._inputHandler) {
            const originalHandler = defectSizeSlider._inputHandler;
            defectSizeSlider.removeEventListener('input', originalHandler);
            defectSizeSlider.addEventListener('input', throttle(originalHandler, 16)); // 60fps
        }
    }
    
    // 延遲執行滑桿優化，確保滑桿已初始化
    setTimeout(optimizeSliders, 1000);
    
})();
