---
title: "Serverless Architecture"
lang: "zh"
translationKey: "serverless-architecture"
published: true
tags: ["system design", "concept"]
---
Serverless Computing in 100 Seconds
https://www.youtube.com/watch?v=W_VV2Fx32_Y

## **💡 一、什麼是 Serverless？**

> 「Serverless」不是沒有伺服器，
> 而是 —— **開發者不需要管理伺服器**。

在 Serverless 架構中：

- 你只負責 **撰寫程式邏輯（function / API）**    
- 雲端服務商（AWS / GCP / Azure）負責 **部署、擴展、維護基礎設施**

📘 代表產品：

- AWS Lambda    
- Google Cloud Functions
- Azure Functions
- Cloudflare Workers
- Vercel Functions / Netlify Functions

---

## **🧱 二、Serverless 與傳統架構的差別**

| **比較項目**  | **傳統伺服器（Server-based）** | **Serverless（Function-based）** |
| --------- | ----------------------- | ------------------------------ |
| **伺服器管理** | 自行維護（EC2、VM）            | 全自動由雲端供應商管理                    |
| **部署方式**  | 部署整個應用                  | 部署單一 Function                  |
| **計費模式**  | 按時間（CPU / Memory 佔用）    | 按執行次數、運算時間                     |
| **擴展性**   | 手動或 Auto Scaling        | 自動瞬間擴展                         |
| **啟動時間**  | 持續運行                    | 按需啟動（Cold Start）               |
| **適合場景**  | 長期運行服務                  | 間歇性任務、事件觸發任務                   |

---

## **🧩 三、Serverless 架構的核心組件**

|**組件**|**說明**|**範例**|
|---|---|---|
|**Function as a Service (FaaS)**|執行邏輯的最小單位（無需維護伺服器）|AWS Lambda, GCP Cloud Functions|
|**Backend as a Service (BaaS)**|雲端提供現成服務（認證、資料庫、存儲）|Firebase, Supabase, Cognito|
|**Event Triggers**|事件觸發 Function（HTTP, Queue, Schedule）|S3 Upload、API Gateway、Cron|
|**API Gateway**|對外暴露 API、觸發 Function|AWS API Gateway, Cloudflare Gateway|
|**Object Storage**|存放靜態資源 / 檔案|S3, GCS, Azure Blob|

---

## **⚙️ 四、Serverless 架構運作流程**

```
Client → API Gateway → Lambda Function
                          ↓
                     Database / S3
                          ↓
                       回傳結果
```

💡 **事件驅動（Event-driven）模型**

例如：

- 使用者上傳圖片 → 觸發 Lambda → 壓縮 → 存入 S3    
- API 被呼叫 → Lambda 查資料庫 → 回傳 JSON    
- Cron Job → 每天自動寄報表

---

## **🚀 五、Serverless 的優點**

| **類別** | **優點**      | **說明**                        |
| ------ | ----------- | ----------------------------- |
| 🧱 成本  | 按使用量付費      | 沒流量就不收錢（例如 Lambda 前 100 萬次免費） |
| ⚡ 彈性   | 自動擴展        | 同時 10 或 1000 個請求都能應付          |
| 🧩 維護  | 無需伺服器運維     | 不用 patch OS、設定 Nginx          |
| 📦 開發  | 高模組化        | Function 拆得越細，維護越容易           |
| 🔐 安全性 | 由雲端自動管理底層安全 | 不需手動管理 TLS 或 port             |

---

## **🧊 六、Serverless 的缺點**

| **問題**                    | **說明**                      | **可能的解法**                               |
| ------------------------- | --------------------------- | --------------------------------------- |
| 🕒 **Cold Start**         | 長時間沒用的 Function 首次執行會延遲幾百毫秒 | 預熱（Warm-up）、短 TTL 呼叫                    |
| 💾 **狀態保存困難**             | Lambda 是無狀態（stateless）      | 使用 Redis / DynamoDB / S3 存狀態            |
| 🧩 **Debug / Logging 困難** | Function 短暫存在，log 分散        | 整合 CloudWatch / StackDriver             |
| ⚙️ **執行時間限制**             | Lambda 最長 15 分鐘             | 長任務改用容器或 Batch Job                      |
| 🔄 **依賴雲端供應商**            | 廠商鎖定（Vendor lock-in）        | 使用開源框架（Serverless Framework / OpenFaaS） |

---

## **🧠 七、常見應用場景**

|**類型**|**實例**|**說明**|
|---|---|---|
|**API / 微服務（Microservices）**|Lambda + API Gateway|每個 Endpoint 一個 Function|
|**批次任務（Batch Jobs）**|Cron Lambda / Cloud Scheduler|每日報表、清理任務|
|**影像 / 檔案處理**|S3 → Lambda → S3|圖片壓縮、轉檔、自動標籤|
|**Webhook / 事件回應**|Stripe / GitHub Webhook Handler|即時反應外部事件|
|**資料處理 / ETL**|Stream → Lambda → DB|Kafka / SQS 觸發|
|**Chatbot / AI API**|Cloud Functions + Firestore|輕量級對話邏輯|

---

## **🧰 八、Serverless 與 Container（容器）比較**

| **項目** | **Serverless** | **Container (Kubernetes)** |
| ------ | -------------- | -------------------------- |
| 啟動速度   | ms–s（冷啟動略慢）    | 秒級（啟動容器）                   |
| 成本     | 按執行次數付費        | 長期固定成本                     |
| 狀態     | 無狀態            | 可有狀態（stateful pods）        |
| 部署     | 單 Function 即可  | 需管理 cluster                |
| 可移植性   | 低（綁定供應商）       | 高（Docker 標準化）              |
| 適合場景   | 事件觸發、小任務       | 長期運行、複雜系統                  |

💡 可結合使用：

> 前端或輕量 API 用 Serverless，
> 重型任務（AI、批次）用 Kubernetes。

---

## **🔍 九、Serverless 架構實例**

### **🧩 1️⃣ 靜態網站（Jamstack 架構）**

```
GitHub → Vercel Build → Edge Functions → CDN
```

- HTML/CSS/JS 放 CDN
- API 用 Edge Functions 即時回應
- Database 用 Supabase / Firebase

### **🧩 2️⃣ 圖片壓縮系統**

```
User Upload → S3

      ↓

S3 Event Trigger → Lambda

      ↓

Lambda Process → Save to S3 (optimized/)
```

### **🧩 3️⃣ ETL 資料處理**

```
Data Stream (Kinesis) → Lambda
      ↓
Clean & Transform → DynamoDB
```

## **🧮 十、Serverless 設計原則**

|**原則**|**解釋**|
|---|---|
|**Stateless Function**|每次執行皆獨立，不保留狀態|
|**Event-driven**|所有邏輯都由事件觸發|
|**Single Responsibility**|每個 Function 做一件事|
|**Idempotency**|Function 重複執行結果相同（避免重入）|
|**Observe & Log**|整合監控、追蹤（CloudWatch / StackDriver）|
## **⚡ 十一、Serverless 與 Edge Computing**

現代 Serverless 正與 **Edge Function** 越來越融合：

- Cloudflare Workers
- Vercel Edge Functions
- Deno Deploy

💡 特點：

- 延遲極低（距離使用者更近）
- 支援 KV / Durable Object 儲存
- 適合即時互動（A/B 測試、個人化內容）

## **✅ 十二、一句話總結**
  
> ☁️ **Serverless = 將伺服器管理外包給雲端，只專注業務邏輯。**
> 📘 未來架構趨勢是：**Serverless + Edge + Event-driven**

- > 🧩 簡單任務、小型 API → Lambda / Cloud Functions
- > ⚙️ 大規模、需狀態 → Container / Kubernetes
- > 🚀 想省成本 → Serverless 最划算（零閒置費）


Edge Computing 的想法是：
> 🚀 **把部分運算、快取、甚至程式邏輯放在全球邊緣節點（Edge Node）。**
> 讓請求在「最近」的節點就能處理完。
> ⚡ **Edge Computing = Serverless 的全球加速引擎。**

- > **Serverless**：按需運算、不維護伺服器
- > **Edge**：讓運算更靠近使用者
- > **Event-driven**：讓運算只在需要時觸發

> 三者結合，就能打造
> 「**全球即時、低延遲、零維護**」的現代雲端架構。

