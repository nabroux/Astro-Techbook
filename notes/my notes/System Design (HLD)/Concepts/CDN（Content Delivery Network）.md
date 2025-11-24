---
title: "CDN（Content Delivery Network）"
lang: "zh"
translationKey: "cdn-content-delivery-network"
published: true
tags: ["system design", "concept"]
---

> Q: CDN算是一種快取嗎 哪一類的資料適合放到CDN 
> 之前公司有些檔案會存放在S3 但有一些還會將Bucket掛到AWS Cloudfront上，為什麼要這樣？

## **🧩 一、CDN 本質上確實是一種「快取系統」**

**CDN（Content Delivery Network）**
→ 是一種「**分散式快取網路**」，專門幫你**就近存放常被讀取的內容**，減少回源（origin）時間。

你可以把它想成：

> 「把 S3 裡的檔案快取到全世界各地的邊緣節點（edge node）上。」

### **✅ CDN 的核心功能：**

1. **快取（Cache）靜態內容**
    
    - 圖片、CSS、JS、影片、PDF、API JSON response
        
    - 設定 TTL（cache-control, max-age 等）
        
    - 減少每次都回 origin server/S3 拿資料
        
    
2. **地理分布（Geo-distribution）**
    
    - 用戶請求會被導向最近的節點（例如 Cloudflare 台北節點）
        
    - 減少實際網路距離造成的 latency
        
    
3. **減輕源伺服器負載**
    
    - 同樣的內容不必重複請求 S3
        
    - 大量請求直接被 edge node 處理
        
    
4. **安全與加速附加功能**
    
    - HTTPS / TLS termination
        
    - WAF（防火牆）
        
    - DDoS 防護
        
    - 圖片壓縮、自動壓縮 Gzip / Brotli

### **✅ CDN  pull-based vs push-based**
|**模式**|**說明**|**關鍵差異**|
|---|---|---|
|**Pull-based CDN**|「CDN 節點自動拉取」內容。第一次使用者請求時才從原始伺服器取檔並快取。|延遲較高但自動化方便。|
|**Push-based CDN**|「你主動推送」內容到 CDN 節點。部署時就提前同步。|低延遲但需要手動維護。|
#### Pull-based CDN（懶人自動型）

```
Client → CDN Edge Node
          ↓
      (Cache Miss)
          ↓
     Origin Server 拉取檔案
          ↓
     Edge Node 快取副本
          ↓
     Client 收到內容
```

### **🔹 流程解釋：**

1. 用戶第一次請求 /static/logo.png
2. CDN 節點沒有該檔案（Cache Miss）
3. 透過 HTTP 從 **Origin Server** 拉取
4. 之後的使用者都直接從 CDN 快取取

### **✅ 優點：**

- 💨 **自動更新**：不需手動同步檔案
- 🧰 **簡單配置**：只需設定 Origin Domain
- 🧱 **適合動態網站**：例如部落格、CMS、自動生成內容

### **❌ 缺點：**

- ⏳ 第一次請求會比較慢（cold start）
- 🔁 若原始內容更新，需等 TTL 過期或手動清快取
- 📦 不適合非常大量的靜態檔（像 App 更新包）

### **💡 實際例子：**
| **CDN 服務**              | **支援模式**        | **範例用途**  |
| ----------------------- | --------------- | --------- |
| Cloudflare              | ✅ Pull-based 為主 | 網頁、API 加速 |
| AWS CloudFront（Default） | ✅ Pull-based    | 靜態網站託管    |
| Akamai Dynamic Caching  | ✅ Pull-based    | 大型網站加速    |

#### Push-based CDN（主動同步型）
```
(部署階段)
Developer → Push Files → CDN Edge Servers
                 ↓
       Files 預先分發至全球節點
                 ↓
           Client 直接命中
```

### **🔹 流程解釋：**

1. 你在部署（build）階段執行一個「上傳動作」
2. 將所有檔案（CSS、JS、圖片）**預先上傳到 CDN 節點**
3. 使用者請求時，節點已經有內容，不需向 Origin 拉取

### **✅ 優點：**

- ⚡ **首訪就快（no cold start）**
- 🧩 **完全控制更新時機**
- 📦 **適合大檔案、影音、App 發布包**
- 🔐 **可離線運作（不依賴 Origin）**

### **❌ 缺點：**

- 🧠 **需自行同步機制**（CI/CD 要 push 檔案）
- 💰 **儲存成本高**（多節點複製）
- 🚧 **若檔案頻繁更新，維護負擔大**

### **💡 實際例子：**

|**CDN 服務**|**支援模式**|**範例用途**|
|---|---|---|
|AWS CloudFront（with S3 Origin）|✅ Push 模式（S3 作為來源）|部署網站、影片 CDN|
|Google Cloud CDN（with GCS）|✅ Push|靜態內容預載|
|Azure CDN（with Blob）|✅ Push|應用程式資源分發|
|App Store / Steam / YouTube|✅ Push|巨量媒體內容分發|
## **📘 實際應用建議**
|**使用場景**|**建議模式**|**原因**|
|---|---|---|
|一般網站（HTML、CSS、JS）|**Pull-based**|更新頻繁、自動化方便|
|靜態生成部落格（Next.js、Hugo）|**Pull-based**|發布後自動快取|
|巨量影片 / 圖片 CDN|**Push-based**|預載快、穩定|
|行動 App 更新包 / 遊戲內容|**Push-based**|控制更新版本|
|API Response / JSON Cache|**Pull-based**|動態內容需依 TTL 更新

---

## **📦 二、哪些資料適合放到 CDN？**
| **類型**                  | **適合與否** | **原因**                                |
| ----------------------- | -------- | ------------------------------------- |
| 圖片（JPEG, PNG, WebP）     | ✅ 很適合    | 大量重複被訪問、更新頻率低                         |
| CSS / JS 檔案             | ✅        | 所有使用者都要載入、內容穩定                        |
| HTML 靜態頁面               | ✅        | 尤其是 SSR/SSG 產生的內容                     |
| 影片 / 音樂 / PDF           | ✅        | 高流量、頻繁存取                              |
| API 回應（JSON）            | ⚠️ 有條件   | 若為 public data 可短暫快取，private data 不適合 |
| 用戶個人化資料（個人檔案、dashboard） | ❌ 不適合    | 無法快取、內容依用戶不同                          |
| 頻繁更新或交易類資料（訂單、錢包）       | ❌        | 要保證即時性與正確性                            |

## **☁️ 三、為什麼要「S3 + CDN (CloudFront)」一起用？**

這是 **雲端標準最佳實務**，原因如下 👇
### **1️⃣ S3 → 原始儲存（Origin Storage）**

- 用來存放「源檔」（原始檔案）
    
- 比如：上傳的圖片、影片、檔案備份
    
- 預設在 AWS US East / Asia Pacific 等某一區域（單一區域）
    

### **2️⃣ CloudFront → 全球加速層（Edge Network）**

- 幫你把 S3 的內容**複製到全球節點快取**
    
- 使用者就近從「最近節點」下載
    
- 只有第一次請求會回源（S3），之後都直接從 Edge 提供


### **📈 成效：**

| **指標**      | **只用 S3**     | **S3 + CloudFront**      |
| ----------- | ------------- | ------------------------ |
| 延遲（Latency） | 高（地理距離影響大）    | 低（就近取資料）                 |
| 成本          | 每次都付 S3 輸出流量費 | CloudFront 緩解 S3 負擔，反而更省 |
| 安全性         | 公開網址易暴露       | 可透過 CloudFront 控制授權與存取   |
| 全球覆蓋        | 無（單區域）        | 有（Edge 分布全球）             |


## **🧠 小補充：S3 直接提供 vs CloudFront 差異**
| **項目** | **直接用 S3 連結**      | **經 CloudFront**                 |
| ------ | ------------------ | -------------------------------- |
| 速度     | 慢（跨區網路延遲）          | 快（edge cache）                    |
| 成本     | 每次取檔都算 S3 egress 費 | Cache 命中可節省 egress               |
| 安全性    | S3 URL 可被直接抓取      | 可設定簽名 URL / Header 授權            |
| 功能     | 純儲存                | 可做壓縮、轉檔、Redirect、Rewrite、DDoS 防護 |
