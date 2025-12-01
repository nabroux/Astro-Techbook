---
title: "Caching"
lang: "zh"
translationKey: "caching"
published: true
tags: ["system design", "concept"]
---
## **💡 一、什麼是快取（Cache）**

> **Cache** 是一種「以空間換取時間」的技術。
>   
> 它將**常用或重複的資料**暫存在存取速度較快的地方（如記憶體），
> 以減少反覆查詢後端系統（如資料庫、API、檔案儲存）的成本。

🧠 **核心理念：**
> **「不要重複計算或查同樣的資料兩次。」**


## **⚙️ 二、快取運作流程**

基本流程如下：
Client → Cache → Database

1. 客戶端請求資料
2. 系統先查 Cache 是否有結果（Cache Hit）
3. 若有 → 直接回傳
4. 若沒有 → 查資料庫（Cache Miss），並將結果寫入 Cache

## **🧩 三、Cache 在系統中的位置**
| **層級**                   | **範例**                          | **目的**     |
| ------------------------ | ------------------------------- | ---------- |
| **瀏覽器快取（Browser Cache）** | HTML、CSS、JS、圖片                  | 減少重複下載     |
| **CDN Cache**            | Cloudflare, Akamai              | 提升全球用戶訪問速度 |
| **應用層快取（App Cache）**     | Redis, Memcached                | 降低資料庫負擔    |
| **資料庫快取（DB Cache）**      | MySQL Query Cache / Buffer Pool | 優化查詢效能     |
| **硬體快取（CPU Cache）**      | L1 / L2 Cache                   | 降低記憶體延遲    |

---

## **🧭 四、各層級的快取

### a. Browser Caching（瀏覽器快取）

瀏覽器快取是最上層的一種快取，
用於避免每次都重新下載同樣的靜態資源。

### **📘 常見機制：**
| **Header**                            | **說明**                |
| ------------------------------------- | --------------------- |
| **Cache-Control**                     | 控制快取行為，如 max-age=3600 |
| **ETag / If-None-Match**              | 基於內容版本控制              |
| **Last-Modified / If-Modified-Since** | 基於時間戳檢查是否更新           |
#### **例：**
```
Cache-Control: max-age=3600, public
ETag: "file-v1.2.3"
```

💡 **作用：**

- 降低頻寬與伺服器負載
- 提升網站載入速度
- 常見於前端靜態資源（JS、CSS、圖片）

### b. Application Caching（應用層快取）

> 這是「後端工程師最常手動設計」的一層快取。
> 應用層快取通常放在：

- **Redis**    
- **Memcached**
- 或應用程式本地記憶體（In-memory cache）

🧩 常見快取策略：請見第五點

### c. Database Caching（資料庫快取）

> 📍 把查詢結果、資料頁、索引存在記憶體中。

常見資料庫快取層：

| **系統**             | **快取機制**         | **功能**           |
| ------------------ | ---------------- | ---------------- |
| **MySQL (InnoDB)** | Buffer Pool      | 儲存資料頁與索引頁，避免磁碟存取 |
| **PostgreSQL**     | Shared Buffers   | 快取資料區塊與查詢結果      |
| **MongoDB**        | WiredTiger Cache | 內建文件快取           |
| **SQLite**         | Page Cache       | 快取資料頁，減少磁碟存取     |
💡 實務案例：
- 查詢同一筆使用者資料 → 命中 Buffer Pool，不需磁碟存取
- 熱資料（Hot Data）會自動常駐記憶體

📊 效能提升：
- 頻繁查詢：快取命中可比磁碟快 100 倍    
- 減少 disk I/O、鎖競爭

### d. CDN (Content Delivery Network)

詳見 [[CDN（Content Delivery Network）]]

---

## **🧱 五、Cache 寫入策略（Write Policies）**

不同策略在「更新資料」時行為不同，
選擇哪種會直接影響一致性與效能。

| **策略**                       | **寫入時行為**          | **一致性** | **效能** | **適用場景**   |
| ---------------------------- | ------------------ | ------- | ------ | ---------- |
| **Write Through**            | 同步寫入 cache 與 DB    | 高       | 中      | 要求一致性      |
| **Write Around**             | 只寫入 DB，不立即更新 cache | 中       | 高      | 低命中率資料     |
| **Write Back（Write Behind）** | 先寫 cache，延後批次同步 DB | 低       | 高      | 批次寫入、分析性資料 |

### **🔹 1. Write Through Cache**

> 寫入資料時，同步更新 Cache 與 DB。

✅ 優點：資料即時一致
⚠️ 缺點：寫入延遲稍高
💡 用於：金融系統、登入狀態、會員資料

Client → Cache (write)
       → DB (同步寫入)

---
### **🔹 2. Write Around Cache**

> 寫入只更新 DB，不立即更新 Cache。
> Cache 僅在下次讀取時再更新。

✅ 優點：減少 Cache 污染（不常用資料不進快取）
⚠️ 缺點：第一次讀取時會 Cache Miss
💡 用於：寫多讀少的資料（如日誌、歷史紀錄）

Client → DB
       → Cache（不更新）

---
### **🔹 3. Write Back / Write Behind Cache**

> 寫入只更新 Cache，稍後批次同步至 DB。

✅ 優點：寫入延遲極低
⚠️ 缺點：資料可能暫時不一致、Cache Crash 會遺失更新
💡 用於：非即時性數據（統計、遊戲積分、計數器）

Client → Cache
(Cache → DB async)

---

## **🧮 六、Cache Eviction Policies（淘汰策略）**

當快取容量滿了，系統必須決定「誰該被踢出去」。

| **策略**   | **全名**                | **概念**       | **適用場景**  |
| -------- | --------------------- | ------------ | --------- |
| **FIFO** | First In First Out    | 最早進入的資料先被移除  | 單純緩衝區用途   |
| **LRU**  | Least Recently Used   | 最久未被使用的資料先移除 | 一般應用最常用   |
| **LFU**  | Least Frequently Used | 使用次數最少的資料先移除 | 熱點資料高度重複時 |
📘 Redis 與 Memcached 預設支援 LRU、LFU、TTL 到期清除等策略。

---

## **⚠️ 七、常見快取問題與解法**

### **🔹 Cache Miss**

- 查不到資料 → 回源（Database）再寫入 Cache
- 解法：設定合理 TTL + 預熱機制（Warm-up）


### **🔹 Cache Hit Ratio**

快取命中率衡量效能：

```
Cache Hit Ratio = Hit / (Hit + Miss)
```

命中率越高 → 系統越省資源。
通常目標：**>90%**


### **🔹 Cache Penetration（快取穿透）**

> 用戶請求「不存在」的資料，導致 Cache 永遠 Miss，
> 所有請求都打到資料庫。

💡 解法：
- 將空查詢結果也快取（設短 TTL）
- 使用布隆過濾器（Bloom Filter）先過濾非法 Key


### **🔹 Cache Breakdown（快取擊穿）**

> 某個**熱門資料**突然過期，
> 大量同時請求瞬間打爆資料庫。

💡 解法：

- 加分佈式鎖（Redis SETNX）確保僅一人回源
- 預熱熱門快取
- 設隨機 TTL（避免同時過期）


### **🔹 Cache Avalanche（快取雪崩）**

> 大量快取**同時過期或失效**，
> 所有請求瞬間直打資料庫，造成雪崩效應。

💡 解法：

1. 給不同資料設定隨機 TTL（避免同時失效）
2. 預先快取熱點資料（Warm Cache）
3. 設定降載機制（Rate Limiting / Queue）
4. 在 Cache 層加入「多層快取」或「永不過期備援快取」

---

## **🧠 八、Database Caching（資料庫快取）**
  
> **Database Caching** 指在資料庫內部或外部增加快取層，
> 提升查詢效能與減少 I/O。

### **📘 1️⃣ 內部快取（Database Engine 自帶）**
| **系統**         | **快取機制**                 | **說明**                |
| -------------- | ------------------------ | --------------------- |
| MySQL (InnoDB) | Buffer Pool              | 快取索引與資料頁（page）        |
| PostgreSQL     | Shared Buffer + OS Cache | 預讀與共享快取機制             |
| Oracle         | SGA（System Global Area）  | 全域快取 + SQL Plan Cache |
| Redis（作為資料庫）   | Key-value 存取即是快取結構       |                       |

---
### **📘 2️⃣ 外部快取（External Cache Layer）**

在資料庫前加一層 Redis/Memcached 快取，
由應用程式控制快取邏輯。

App → Redis Cache → Database

#### **優點：**

- 可依照業務定義快取規則（TTL、更新時機）
- 減少 DB 壓力與讀取延遲
#### **缺點：**

- 快取一致性問題需人工處理（寫入策略）

## **🔄 九、快取層級架構範例**
```
        ┌───────────────┐
        │   Browser Cache│  ← 靜態資源
        ├───────────────┤
        │   CDN Cache    │  ← 全球加速
        ├───────────────┤
        │ App / Redis Cache│ ← 熱門資料
        ├───────────────┤
        │  Database Cache │ ← Query Buffer / Index Cache
        ├───────────────┤
        │  Persistent DB  │ ← MySQL / PostgreSQL
        └───────────────┘
```

💡 一般應用同時存在多層快取，
由外到內越靠近使用者，速度越快、容量越小。

## **⚖️ 十、設計取捨與實務建議**
|**類別**|**原因**|**建議策略**|
|---|---|---|
|熱點資料|高頻查詢|長 TTL + LRU|
|大量即時更新|一致性重要|Write Through|
|大量批次寫入|效能優先|Write Back|
|計算結果 / 報表|可預算|預算後快取|
|靜態內容|頻繁下載|Browser Cache + CDN|
|動態資料|即時性|Redis / Memcached|
|分散式系統|跨節點一致性|分布式鎖 + Cache 更新事件（Pub/Sub）|
## **✅ 十一、一句話總結**

> ⚙️ **Cache 是效能設計的靈魂。**
>   
> 它讓系統「快」，但也可能讓資料「舊」。
> 因此設計重點永遠是：
1. > **什麼資料該被快取？**
2. > **何時更新？**
3. > **快取失效後怎麼撐住？**
>   
> 🧱
- > Cache Miss → 打資料庫
- > Cache Breakdown → 熱點過期
- > Cache Avalanche → 全部失效
>   
> 🚀 精心設計 TTL、更新策略與淘汰機制，
> 系統才能「又快又穩」。