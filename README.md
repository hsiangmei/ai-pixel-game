# Pixel Arcade Quiz

這是一個基於 Vanilla JS + jQuery 開發的懷舊街機像素風問答遊戲。遊戲題目與玩家成績皆透過 Google Sheets 與 Google Apps Script (GAS) 進行無伺服器 (Serverless) 的資料庫管理。

## 🚀 專案啟動與安裝指南

### 1. 前端環境準備
1. 將本專案的所有檔案（`index.html`, `style.css`, `app.js`, `env.js`, `Code.gs`）下載至你的本機 Web Server（例如 AppServ, XAMPP）或其他靜態網頁代管服務（如 GitHub Pages, Vercel）。
2. 開啟瀏覽器訪問對應的伺服器網址（例如 `http://localhost/github/pixel-game/index.html`）。

### 2. Google Sheets 配置
1. 開啟一個新的 Google 試算表。
2. 建立兩個工作表，分別命名並注意標籤名稱：
   * **`題目`**
   * **`回答`**
3. **`題目` 工作表欄位設定**（直接拖曳選取下方表格的這列字去貼上即可）：

   | 題號 | 題目 | A | B | C | D | 解答 |
   | :--- | :--- | :--- | :--- | :--- | :--- | :--- |

4. **`回答` 工作表欄位設定**（切換到「回答」工作表，一樣複製下方這個表格的這列）：

   | ID | 闖關次數 | 總分 | 最高分 | 第一次通關分數 | 花了幾次通關 | 最近遊玩時間 |
   | :--- | :--- | :--- | :--- | :--- | :--- | :--- |

### 3. Google Apps Script 佈署
1. 在你的該份 Google Sheets 中，點選選單列的 **「擴充功能」** > **「Apps Script」**。
2. 將本專案內的 `Code.gs` 內容全部複製，貼上並覆蓋 Apps Script 的編輯器區塊。
3. 首次佈署 Web App：
   * 點擊右上角藍色的 **「部署」(Deploy)** > **「新增部署作業」(New deployment)**。
   * 點擊左上角的齒輪圖示，選擇 **「網頁應用程式」(Web app)**。
   * 將「誰可以存取」(Who has access) 的權限設為 **「所有人」(Anyone)**。
   * 點擊下方藍色 **「部署」** 並同意你的 Google 帳號授權。
   * 將畫面上顯示的 **「網頁應用程式網址」(Web App URL)** 完整複製下來。
4. **⚠️ 更新佈署的重要心法 ⚠️**：
   * 若你後來去編輯修改了 `Code.gs`，按 Ctrl+S 儲存「不會」更新網址內容！
   * 你必須點上方 **部署** > **管理部署作業** > **編輯（右上的鉛筆圖示）**。
   * 在下拉式選單把**「版本」(Version)** 改選成 **「建立新版本」(New version)** 後，按下部署，你的改動才會真正生效並覆蓋到網址上。

### 4. 串接遊戲前端
1. 開啟專案內的 `env.js`（以及 `.env` 當作對照）。
2. 將你剛剛複製好的 Google Apps Script URL 替換掉原本的連結：
   ```javascript
   window.ENV = {
       GOOGLE_APP_SCRIPT_URL: "https://script.google.com/macros/s/你的ID/exec",
       PASS_THRESHOLD: 3,
       QUESTION_COUNT: 5
   };
   ```
3. 重新整理你的遊戲，開始遊玩！

---

## 🌐 部署至 GitHub Pages (自動化流程)

本專案已包含 GitHub Actions 設定。當你將程式碼推送到 GitHub 時，系統會自動將環境變數注入並部署至 GitHub Pages。

### 設定步驟：
1. **上傳至 GitHub**：將程式碼推送至你的 GitHub 專案。
2. **設定 GitHub Secrets**：
   * 在 GitHub 專案頁面，點選 **Settings** > **Secrets and variables** > **Actions**。
   * 點選 **New repository secret**，新增以下變數（名稱需完全一致）：
     * `GOOGLE_APP_SCRIPT_URL`：你的 GAS 部署網址 (必填)。
     * `PASS_THRESHOLD`：及格分數門檻 (選填，預設為 3)。
     * `QUESTION_COUNT`：每次遊戲抽取的題目數量 (選填，預設為 5)。
3. **開啟 Pages 權限**：
   * 到 **Settings** > **Pages**。
   * 在 **Build and deployment** -> **Source** 選擇 **GitHub Actions**。
4. **自動更新**：往後每次推送 `master` 分支的代碼，GitHub Actions 都會自動執行，產出正確的 `env.js` 並完成部署。

---

## 📝 測試題庫：生成式AI基礎知識 (可直接複製貼上至 Google Sheets 的 `題目` 表)

| 題號 | 題目 | A | B | C | D | 解答 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | 生成式AI主要是指哪一種類型的技術？ | 僅能進行搜尋引擎優化的技術 | 能夠創造新內容(文本、圖像、音訊等)的人工智慧 | 專門用於影像辨識的安防系統 | 只會做邏輯演繹運算的決策樹 | B |
| 2 | 以下哪個是最知名的生成式大型語言模型(LLM)之一？ | AlphaGo | ChatGPT (GPT-4) | Blue Gene | TensorFlow | B |
| 3 | 所謂的「Prompt Engineering」(提示工程) 是指什麼？ | 開發更快的電腦晶片 | 設計有效的指令來引導AI生成理想結果 | 撰寫底層神經網路的C++程式碼 | 防止AI模型中毒的安全機制 | B |
| 4 | ChatGPT 的「T」代表什麼意思？ | Transformer | Transfer | Topology | Time | A |
| 5 | 下列何者並非常見的生成式AI圖像生成工具？ | Midjourney | Stable Diffusion | Excel | DALL-E | C |
| 6 | 在訓練大型語言模型時，為什麼需要海量數據？ | 因為數據量越大，儲存空間越便宜 | 模型需要大量文本來學習語言模式與知識結構 | 只是為了滿足版權局的報備標準 | 為了佔用競爭對手的網路頻寬 | B |
| 7 | 當語言模型一本正經地給出看似合理但完全錯誤的答案時，我們稱之為什麼現象？ | AI覺醒 (AI Awakening) | 自我訓練 (Self-training) | 幻覺 (Hallucination) | 過度擬合 (Overfitting) | C |
| 8 | 生成式AI生成文章的核心運作原理是什麼？ | 直接從網路上搜尋現成句子並拼湊 | 查詢內建的關聯式資料庫 | 預測並接續下一個最有可能出現的詞彙 | 讓真人客服在後台手寫回覆 | C |
| 9 | Midjourney 生成圖片的過程主要基於下列哪一種模型技術架構？ | RNN (迴圈神經網路) | Diffusion (擴散模型) | SVM (支持向量機) | K-Means (K-平均算法) | B |
| 10 | 下列哪項不是當前生成式AI普及後引發的主要挑戰？ | 算力成本大幅下降，導致舊有電腦報銷 | 深度偽造(Deepfake)與假新聞快速傳播 | 訓練資料的版權爭議與隱私問題 | 學生利用AI代寫作業的教育誠信問題 | A |
