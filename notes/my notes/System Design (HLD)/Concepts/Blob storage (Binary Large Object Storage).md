---
title: "Blob storage (Binary Large Object Storage)"
lang: "zh"
translationKey: "blob-storage-binary-large-object-storage"
published: true
tags: ["system design", "concept"]
---
## **🧩 一、什麼是 Blob Storage？**

  

> **Blob Storage**（Binary Large Object）是專門儲存**非結構化資料**的物件儲存系統。

> 它不是傳統檔案系統，也不是資料庫，而是一種「以物件為單位」儲存資料的方式。

  

📦 每個物件（Blob）包含三個部分：

1. **檔案內容（data）** → 實際的 binary 或文字資料。
    
2. **Metadata（中繼資料）** → 自訂屬性（Content-Type, Tag, Timestamp）。
    
3. **Unique Identifier（唯一鍵）** → 通常是一個 URL，例如：
	`https://storage.example.com/bucket/image001.jpg`

## **📊 二、為什麼要用 Blob Storage？**
| **傳統儲存**     | **問題**       | **Blob 優勢**         |
| ------------ | ------------ | ------------------- |
| 資料庫（BLOB 欄位） | 不適合儲大檔案      | 專為大量非結構資料設計         |
| 檔案系統（本機磁碟）   | 無法橫向擴充、難維護   | 雲端分散式儲存、可無限擴充       |
| CDN 快取       | 只適合分發、不保存原始檔 | Blob 可做長期保存、備份、版本控制 |

👉 適合儲存：

- 影片、圖片、音樂、PDF、Zip 檔
- Log、備份檔、AI 模型權重
- 靜態前端資源（JS、CSS）
- Webhook 事件快照或大型 JSON

## **⚙️ 三、Blob Storage 的典型結構**

以 AWS S3、Azure Blob、Google Cloud Storage 為例：
```
[Storage Account]  ← 類似雲端帳號
   └── [Container / Bucket]  ← 資料邏輯區
         └── [Object / Blob]  ← 單一檔案或資料
```

📘 例子：
`s3://myapp-assets/profile-pics/user_123.png`

- myapp-assets = Bucket 名稱
- profile-pics/user_123.png = Object 路徑
- Object 有自己的 metadata 與存取權限設定。

## **🔐 四、存取控制（Security & Access Control）**

Blob Storage 一定要做好權限控管！

|**層級**|**說明**|
|---|---|
|**Public Access**|檔案可直接透過 URL 存取（CDN 典型用法）|
|**Private Access**|需要授權 Token（例如 AWS IAM、Azure SAS、GCP Signed URL）|
|**ACL / Bucket Policy**|可設定哪些帳號或 IP 可存取哪些路徑|
|**Encryption**|支援 Server-side encryption（自動加密）與 Customer-managed key（KMS）|

🧩 常見用法：

- 後端簽發「**簽名 URL（Pre-signed URL）**」讓前端可臨時上傳 / 下載。

```python
import boto3
s3 = boto3.client('s3')
url = s3.generate_presigned_url('get_object',
	Params={'Bucket': 'mybucket', 'Key': 'image.png'},
	ExpiresIn=3600)
```

## **🚀 五、常見操作類型**
|**操作**|**說明**|
|---|---|
|**PUT / Upload**|上傳檔案到 blob（可直接 HTTP PUT）|
|**GET / Download**|下載檔案|
|**DELETE**|刪除|
|**LIST**|列出 bucket 內所有物件|
|**HEAD / Metadata**|查詢檔案屬性（Content-Length, Type）|
|**COPY**|檔案複製（甚至跨 region）|
📌 各雲端提供 SDK（Python boto3、Node.js、Go SDK 等）
同時也支援 REST API 與 CLI。

## **💾 六、Blob 儲存層級（Storage Tier）**
| **層級**                 | **用途**          | **成本** | **延遲**     |
| ---------------------- | --------------- | ------ | ---------- |
| **Hot / Standard**     | 常用資料（頻繁讀取）      | 💲💲   | ⚡ 快        |
| **Cool / Nearline**    | 偶爾讀取（例如 30 天一次） | 💲     | ⏳ 中        |
| **Archive / Coldline** | 幾乎不讀取（備份用）      | 💲 最低  | 🐢 高延遲（數小時 |
💡 你可以根據檔案存取頻率自動轉換層級（Lifecycle Policy）。

## **🧱 七、Blob 與其他儲存方式比較**
| **類型**                   | **適用資料**         | **特點**           |
| ------------------------ | ---------------- | ---------------- |
| **Block Storage（區塊儲存）**  | VM 磁碟、DB、快取      | 低延遲、高 IOPS，但非共享  |
| **File Storage（檔案儲存）**   | 共用網路磁碟 (NFS/SMB) | 適合舊系統、NAS 共享     |
| **Object Storage（Blob）** | 非結構化資料           | 無限擴充、高彈性、低成本、雲原生 |
📌 「Blob Storage」基本上就是「Object Storage」的同義詞（Azure 用 Blob 這個名稱）。


## **🌍 八、常見實作與產品**

| **平台**                 | **名稱**                      | **特點**                                      |
| ---------------------- | --------------------------- | ------------------------------------------- |
| **AWS**                | S3 (Simple Storage Service) | 事實標準、支援 Pre-signed URL、Lifecycle、Versioning |
| **Azure**              | Blob Storage                | 支援 Hot/Cool/Archive、SAS Token               |
| **GCP**                | Cloud Storage (GCS)         | API 與 S3 相容、支援自動分類                          |
| **MinIO**              | 自架開源版本，S3 介面相容              | 可在本地部署，支援分散式儲存                              |
| **Ceph / RADOS**       | 企業級開源物件儲存                   | 大型私有雲使用                                     |
| **Backblaze / Wasabi** | 第三方相容 S3 API 的低價替代品         | 便宜、適合備份                                     |

## **🧠 九、進階功能**
|**功能**|**說明**|
|---|---|
|**Versioning**|保留每個檔案的歷史版本|
|**Lifecycle Rules**|自動轉移舊檔案至冷存儲或刪除|
|**Cross-Region Replication (CRR)**|自動複製資料至另一地區（防災備援）|
|**Event Notification / Webhook**|檔案上傳後自動觸發 Lambda / Cloud Function|
|**Static Website Hosting**|直接用 Blob 作為靜態網站伺服器（S3/Blob Container 可綁 domain）|
|**Signed URL / SAS Token**|限時授權外部上傳下載|
|**Server-side Encryption (SSE)**|自動加密資料，搭配 KMS 管理金鑰|
## **🧩 十、實務架構應用舉例**
### **📸 例 1：圖片上傳服務**

```
Client → (Pre-signed URL) → S3/Blob Storage
                ↑
          API Server (簽名 URL)
```
- 前端上傳直接打 Blob，不經 API Server
- 後端負責生成安全的 URL

### **🎥 例 2：影片轉檔系統**
```
Upload to Blob → Event Trigger → Lambda → FFmpeg → Save Output → Blob
```

- 上傳觸發雲函式
- 轉檔結果再寫回 Blob

### **🗄️ 例 3：微服務資料交換**
- 每個微服務寫結果（JSON）到 Blob
- 其他服務從 Blob 讀取處理（輕量、可持久化）


---
# signed url / pre-signed url

## **🎯 一、什麼是 Signed URL？**

> **Signed URL（或 Pre-signed URL）** 是一種「帶簽章的臨時授權連結」，
> 它允許用戶在**不需要直接擁有憑證**的情況下，
> **臨時訪問一個受保護的檔案**（例如音樂、影片、圖片等）。


### **🔐 結構範例：**

```
https://cdn.spotify.com/audio/abc123.mp3?
X-Amz-Algorithm=AWS4-HMAC-SHA256&
X-Amz-Credential=AKIAxxxxxx/20251026/...&
X-Amz-Date=20251026T030000Z&
X-Amz-Expires=300&
X-Amz-Signature=0f9d...a45
```

這一長串連結中：

- X-Amz-Expires=300 表示有效期限 5 分鐘
- X-Amz-Signature=... 是伺服器依照 secret key 簽出的簽章
- 驗證簽章正確 + 時間未過期 → 檔案可讀取
- 過期後，連結就失效

## **🧱 二、為什麼不用固定連結？**

以 Spotify 為例，
我們來假設一下如果 Spotify 真的用固定連結會怎樣：

```
https://cdn.spotify.com/audio/track_123.mp3
```

### **🚨 問題 1：誰都能存取**
這個連結一旦被抓出來（或被分享），
任何人只要貼上就能直接下載歌曲。
→ 等於**整個音樂庫外洩**。

### **🚨 問題 2：無法控管授權範圍**

Spotify 的曲庫是有授權限制的：

- 有的歌在某國可以播放、某國不行
- Premium 才能聽高音質
- 免費用戶播放時會插廣告

👉 若是固定 URL，後端無法依「使用者身份」「地區」「方案」動態控制播放權限。

---

### **🚨 問題 3：CDN / Blob Storage 無法自行驗證使用者**

像 S3、Cloudflare R2、Azure Blob 這些物件儲存服務：
- 本身只負責提供靜態檔案，不知道「誰該不該看」
- 若開 public，誰都能取；若關掉 public，就要經過權限驗證
    但 blob 並不知道 Spotify 用戶的登入狀態。

→ **所以 Spotify 的應用伺服器要先授權，**
再產生一條「臨時可讀」的連結交給播放器。


## **🔄 三、Spotify（或 YouTube、Netflix）的做法邏輯**

典型的流程如下：

```
Client App  →  Spotify Backend  →  Blob Storage (S3/CDN)
```

1️⃣ 使用者選擇歌曲
2️⃣ Spotify 後端驗證：使用者身份、地區、方案、播放權限
3️⃣ 後端向 Blob (ex: S3) 產生 **signed URL**
4️⃣ 將這個 signed URL 傳給用戶端
5️⃣ 用戶端直接用這條 URL 向 CDN 串流音訊


# 延伸：資料庫儲存 signed url ?

**資料庫不應長期存 pre-signed URL 當主鍵**。正確做法是「**存物件定位資訊（bucket/key 或 object_id）+ 權限模型**」，在**每次讀取前由後端驗證授權，然後即時產生新的 pre-signed URL** 或直接由後端代取。

但如果你已經存了 pre-signed URL，也還是有務實補救與檢查手段，下面分兩種情境給你完整做法。

## **1) 資料怎麼存**


在 DB 只存：

- resource_id / bucket / object_key
- owner_id、tenant_id、scope（ACL/ABAC 用）
- created_at、checksum/etag（選擇性）

> 不要存長效 pre-signed URL；最多存**極短效**（幾分鐘）作為 cache。

## **2) 讀取流程（建議）**

```
Client → Backend（攜帶使用者身份） 
   → 後端做授權（RBAC/ABAC/租戶隔離、配額、審計）
      → 產生短效 pre-signed URL（30s~5m）回 Client
      → Client 直接向 Blob/CDN 以該 URL 串流
```

- **授權點**在後端（不是在 blob/CDN）。
- URL 只是一張「臨時票」，過期即失效。
- 多檔批量下載：改用 **Signed Cookies** 或逐檔 pre-signed。

## **3) 後端直取（私密/審計強需求）**

授權通過後，後端用 SDK 憑證直接 GetObject，**以後端為 Proxy 串流**給 Client。
好處：不洩漏任何 URL；可統一打水印、審計、速率限制。成本：後端帶寬壓力。
