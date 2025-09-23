# Photo Number Extractor V6.1.1

一個用於檢查數據管理的照片號碼提取器應用程式，可以從照片中提取號碼並分配到不同類別。

## 專案結構

```
PlanPneBeta home/
├── index.html          # 主要 HTML 檔案
├── css/
│   └── styles.css      # 樣式表檔案
├── js/
│   └── main.js         # 主要 JavaScript 檔案
├── assets/
│   └── images/         # 圖片資源資料夾
└── README.md           # 專案說明檔案
```

## 功能特色

- 📸 **照片號碼提取**：從上傳的照片中自動提取號碼
- 🏷️ **類別管理**：支援 A-J 共 10 個類別的數據分類
- 🎨 **現代化 UI**：使用大地色系配色方案，響應式設計
- 📊 **數據表格**：清晰的數據展示和管理
- 📄 **PDF 導出**：支援數據導出為 PDF 格式
- 🔍 **縮放功能**：支援照片和標籤的縮放操作

## 技術棧

- **HTML5**：語義化標記
- **CSS3**：現代化樣式，包含 CSS 變數和 Flexbox/Grid 佈局
- **JavaScript (ES6+)**：現代 JavaScript 功能
- **外部庫**：
  - Font Awesome 6.4.0（圖標）
  - JSZip 3.10.1（檔案壓縮）
  - FileSaver.js 2.0.5（檔案下載）
  - html2pdf.js 0.10.1（PDF 生成）
  - pdf-lib 1.17.1（PDF 處理）

## 使用方法

1. 開啟 `index.html` 檔案
2. 上傳照片檔案
3. 選擇照片並分配到相應類別
4. 使用數據表格查看和管理提取的號碼
5. 導出數據為 PDF 格式

## 瀏覽器支援

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 開發說明

此專案已重構為現代化的檔案結構：
- 將內聯 CSS 提取到 `css/styles.css`
- 將內聯 JavaScript 提取到 `js/main.js`
- 保持 HTML 檔案的簡潔性
- 遵循現代 Web 開發最佳實踐

## 版本歷史

- **V6.1.1**：重構專案結構，分離 CSS 和 JavaScript
- 支援多類別數據管理
- 優化用戶界面和體驗
