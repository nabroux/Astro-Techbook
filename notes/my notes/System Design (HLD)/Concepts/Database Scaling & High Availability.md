---
title: "Database Scaling & High Availability"
lang: "zh"
translationKey: "database-scaling-high-availability"
published: true
tags: ["system design", "concept"]
---

_資料庫擴展與高可用性設計指南_

## **💡 一、章節概要**

> 當資料庫「太大、太慢、太忙」時，
> 我們要透過 **資料設計（設計層）**、**效能優化（應用層）**、與 **系統擴展（架構層）**
> 讓系統能穩定承載龐大流量，同時維持一致性與可用性。

**核心目標：**

- 提升資料存取效率（Scaling）
- 保證系統穩定不中斷（High Availability）
- 控制資料一致性、可用性、延遲之間的平衡（CAP / BASE）

## **🧱 二、資料設計層：正規化與反正規化**

  ### **🔹 正規化（Normalization）**

> 將資料結構「拆解到最乾淨的形態」，
> 以消除重複資料（Redundancy）並維持一致性（Consistency）。

|**階段**|**目標**|**說明**|
|---|---|---|
|**1NF（第一正規化）**|欄位不可再分割|e.g. phone1, phone2 → 轉成另一張電話表|
|**2NF（第二正規化）**|消除部分相依|讓非主鍵欄位完全依賴主鍵|
|**3NF（第三正規化）**|消除傳遞相依|e.g. 學生表不應包含系主任名字（屬於系表）|
|**BCNF（Boyce-Codd NF）**|更嚴格的 3NF|所有決定子都是候選鍵|

📘 **優點：**

- 更新簡單、一致性高
- 節省儲存空間

⚠️ **缺點：**

- JOIN 過多，查詢效率下降
- 分散式環境難以橫向擴展

---

### **🔹 反正規化（Denormalization）**

> 為了效能而「違反部分正規化原則」，
> 將常用欄位或結果提前展開、預存、或重複。

📈 **常見策略：**

1. **欄位冗餘**：將 user_name, email 放入訂單表，減少 JOIN
2. **預先彙總表（Aggregation Table）**：每日銷售總表
3. **Materialized View**：快取查詢結果
4. **Flatten Document**（NoSQL）: 把嵌套文件攤平，加快讀取
  
⚠️ **缺點：**

- 更新成本高（同一資料需多處同步）
- 儲存空間增加
- 不一致風險（Consistency trade-off）

🧩 **常見應用：**

- 讀多寫少（Read-heavy）系統，如報表、Feed 流、內容平台
- 寫入壓力低、但查詢複雜的場景

---

## **⚙️ 三、資料庫效能優化與擴展策略（SQL & NoSQL 通用）**

### **1️⃣ Indexing — 提升查詢效率的第一步**

> 索引是一種排序結構（通常為 B+ Tree），
> 讓查詢能快速定位資料列而非全表掃描。

#### **📘 常見索引類型：**
| **類型**              | **特性**    | **使用場景**      |
| ------------------- | --------- | ------------- |
| **B+ Tree Index**   | 最常見的通用索引  | 篩選 / 排序欄位     |
| **Hash Index**      | 快速等值查詢（=） | 高速 Key Lookup |
| **Composite Index** | 多欄位索引     | 頻繁條件組合查詢      |
| **Covering Index**  | 查詢欄位全在索引中 | 無需回表          |
| **Full-text Index** | 文本搜尋      | 搜尋文章內容        |
| **Spatial Index**   | 地理座標搜尋    | LBS, 地圖系統     |
#### **🧠 實務建議：**

- 80% 的效能問題來自索引設計不當
- 寫多讀少的系統：索引過多會拖慢寫入
- 查詢優化原則：
    
    - EXPLAIN 分析執行計畫
    - 避免 SELECT *
    - 讓篩選條件（WHERE）與索引匹配順序一致

---
### **2️⃣ Replication（主從複製）— 讀寫分離**

> 將主資料庫（Master）負責寫入，
> 將從資料庫（Replica）負責讀取，
> 分散負載並提升可用性。

```
[Write Requests] → Master DB
[Read Requests]  → Replica DB(s)
```

#### **✨ 優點：**

- 可橫向擴展讀取效能
- 主掛掉時可快速切換（Failover）
- 支援跨地區容錯

#### **⚠️ 缺點：**

- 複製延遲（Replication Lag） → 可能讀到舊資料
- 主節點壓力集中於寫入
- 寫入一致性問題（需最終同步）

#### **🧩 常見實作：**

| **系統**         | **機制**                                      |
| -------------- | ------------------------------------------- |
| **MySQL**      | Binlog-based Replication, Group Replication |
| **PostgreSQL** | Streaming Replication, Logical Replication  |
| **MongoDB**    | Replica Set（自動選主）                           |
| **Cassandra**  | Multi-master（Peer-to-peer replication）      |

---

### **3️⃣ Failover（故障切換）與備援**

> 當主資料庫掛掉時，自動讓副本升級為主節點，確保高可用（HA）。

#### **🚀 流程：**

1. 監控主節點健康狀態（Health Check）
2. 偵測故障 → 選出新的主節點
3. 應用層（App）重新導向連線
  
#### **🧰 工具實例：**

- **MySQL**：MHA、Orchestrator、ProxySQL
- **PostgreSQL**：Patroni、Repmgr、PgBouncer
- **MongoDB**：Replica Set 自動切換
- **Kubernetes**：可用 StatefulSet + Operator 自動化切換

---

### **4️⃣ Sharding（資料分片）— 寫入與容量的最終解法**

> 當資料量過大或寫入量太高，
> 需將資料拆分到多台節點（水平分片）。

#### **💡 適用條件：**

- 資料表達「數億級」
- 單 DB 延遲瓶頸
- QPS / IOPS 無法再提升
- 全球多地分佈部署

#### **📘 常見分片策略：**

|**類型**|**說明**|**優缺點**|
|---|---|---|
|**Hash-based**|根據 user_id % N 分散到不同節點|分布均勻但難跨分片查詢|
|**Range-based**|根據時間或 ID 範圍劃分|易跨片查詢、但可能傾斜|
|**Directory-based**|外部服務紀錄分片位置（metadata）|靈活但需額外維護|
#### **⚠️ 挑戰：**

- 跨分片 JOIN、Transaction 不再簡單
- 資料重分佈（Resharding）成本高
- 需應用層協調一致性（Saga、Two-phase commit）

#### **💬 實際應用：**
|**系統**|**特性**|
|---|---|
|**MongoDB Shard Cluster**|Router + Config Server + Data Shards|
|**MySQL Sharding**|應用層分片（分庫分表）|
|**Cassandra**|自動一致性哈希分片|
|**Elasticsearch**|Shard + Replica 架構自動管理|

---

### **5️⃣ Vertical Partitioning（垂直分割）**

> 將 表過寬（太多欄位）的問題拆分，
> 把常用欄位與不常用欄位分開，減少 I/O。

#### **範例：**
```sql
users_basic(id, username, email, last_login)
users_profile(id, avatar_url, bio, preferences)
```

📈 優點：查詢常用欄位更快
📉 缺點：仍需 JOIN（但成本降低）

💡 適合：用戶、商品、內容表（欄位眾多但常查部分）

---

### **6️⃣ Caching（快取）— 應用層的「第一道防線」**

> 在應用層或資料庫層加入快取系統（如 Redis / Memcached），
> 減少重複查詢、降低延遲。

App → Cache → DB

#### **📘 策略：**
| **機制**                    | **說明**             | **解法**                    |
| ------------------------- | ------------------ | ------------------------- |
| **Cache TTL（過期時間）**       | 控制資料新鮮度            | 熱點資料可延長 TTL               |
| **Cache Stampede（擊穿）**    | 熱點快取同時失效導致大量 DB 請求 | 使用分佈式鎖 / 預熱機制             |
| **Cache Snowball（雪崩）**    | 多筆快取同時失效           | 分散 TTL 時間、批次重建            |
| **Cache Penetration（穿透）** | 查詢不存在資料            | 加空值快取或布隆過濾器（Bloom Filter） |
#### **📦 工具：**

- **Redis**（In-memory key-value store）
- **Memcached**（純快取）
- **CDN Cache**（靜態內容）

---

## **🧭 四、NoSQL 系統的可擴展性與高可用設計**

|**系統**|**擴展機制**|**一致性模型**|**高可用設計**|
|---|---|---|---|
|**MongoDB**|Sharding + Replica Set|Eventual Consistency|自動選主與複製|
|**Cassandra**|Peer-to-peer + Gossip|Tunable Consistency|多節點寫入容錯|
|**Redis Cluster**|Slot-based Partitioning|最終一致|主從 + Sentinel Failover|
|**Elasticsearch**|Shard + Replica|Eventual|自動重建節點、容錯|

💡 特點：
- NoSQL 多採 BASE 模型（最終一致）
- 天生支援 **水平擴展（Scale-out）**
- 寫入與查詢可分散至多節點

---

## **⚖️ 五、SQL vs NoSQL 在擴展與可用性上的取捨**

|**面向**|**SQL**|**NoSQL**|
|---|---|---|
|**一致性**|強一致（ACID）|弱一致（BASE）|
|**可用性**|主從 + 備援|多主、多節點容錯|
|**擴展方式**|垂直為主（Scale-up）|水平為主（Scale-out）|
|**快取依賴度**|高（Cache as Layer）|中（部分自帶 cache）|
|**交易支援**|完整 Transaction|限定或簡化|
|**最佳場景**|金融、交易、報表|高併發、社群、分散式系統|

---

## **🧩 六、綜合架構示意**

```plaintext
          ┌───────────────┐
          │   Application  │
          ├───────────────┤
          │   Cache Layer  │ ← Redis / CDN
          ├───────────────┤
          │ Read Replica 1 │ ← 讀取
          │ Read Replica 2 │
          ├───────────────┤
          │   Master DB    │ ← 寫入
          ├───────────────┤
          │   Shard A      │
          │   Shard B      │ ← 水平分片
          ├───────────────┤
          │ Backup / HA    │ ← 備援、快照
          └───────────────┘
```

---

## **🧠 七、設計原則總結**

| **問題**  | **解法優先順序**                      |
| ------- | ------------------------------- |
| 查詢慢     | Index → Denormalization → Cache |
| 讀取壓力大   | Replication + Read/Write Split  |
| 單機瓶頸    | Sharding（最後手段）                  |
| 表太寬     | Vertical Partitioning           |
| 高可用     | Replica + Failover              |
| 高延遲     | Cache + CDN                     |
| 一致性要求高  | SQL / CP 模型                     |
| 高併發、低延遲 | NoSQL / AP 模型                   |

---

## **✅ 八、總結一句話**

> **Database Scaling & High Availability = 效能 + 穩定 + 一致的取捨藝術。**
- > 設計層：**正規化 → 資料乾淨**
- > 效能層：**索引 + 快取 → 加速查詢**
- > 架構層：**讀寫分離 + 備援 + Sharding → 撐起高流量**
>   
> 📖 在系統設計中，
> **Sharding 永遠是最後的手段，Cache 永遠是第一道防線。**


---

###  **Denormalization** 反正規化 範例

### **🔹 原始（正規化）設計 **
##### 訂單系統
| **表格**         | **欄位**                         |
| -------------- | ------------------------------ |
| **Users**      | user_id, name, email           |
| **Orders**     | order_id, user_id, total_price |
| **OrderItems** | order_id, product_id, qty      |
| **Products**   | product_id, name, price        |

要查詢「訂單 + 使用者名稱 + 商品名稱」，
需要至少 **JOIN 三張表**：

```sql
SELECT o.order_id, u.name, p.name, p.price
FROM orders o
JOIN users u ON o.user_id = u.user_id
JOIN order_items oi ON o.order_id = oi.order_id
JOIN products p ON oi.product_id = p.product_id;
```

📉 問題：
- 需要多重 JOIN
- 高併發下 CPU / I/O 成本大

### **🔹 反正規化後的版本**
我們可以把常用欄位「展開」存入訂單表中：

| **order_id** | **user_id** | **user_name** | **product_name** | **total_price** |
| ------------ | ----------- | ------------- | ---------------- | --------------- |
| 1001         | 1           | Alice         | Keyboard         | 50              |
| 1002         | 1           | Alice         | Mouse            | 20              |
| 1003         | 2           | Bob           | Laptop           | 900             |
📈 **查詢變快：**

```sql
SELECT order_id, user_name, product_name, total_price
FROM denormalized_orders
WHERE user_id = 1;
```

📉 **代價：**
- 若 user_name 改變，所有訂單記錄都要更新。
- 資料不一致風險上升。

---

## **🧠 四、常見的反正規化策略**

|**類型**|**說明**|**範例**|
|---|---|---|
|**欄位冗餘**|將常查欄位複製到主表|在 Orders 表中存 user_name|
|**彙總表（Summary Table）**|預先計算結果|每日銷售額、用戶統計表|
|**Materialized View**|將查詢結果快取成實體表|PostgreSQL、Oracle 支援|
|**扁平化結構（Flattening）**|JSON 結構展開|NoSQL 中將巢狀物件攤平|
|**Precomputed Columns**|儲存計算結果|儲存 total_price 而非每次 SUM()|
|**嵌入子文件（Embedding）**|文件導向資料庫（MongoDB）中把關聯資料直接存進同一文件|User 文件內嵌 Address 子文件|

## **📘 五、實際案例：反正規化查詢速度提升**

假設要查詢「每位用戶的總消費金額」

### **(1) 正規化設計：**
```sql
SELECT u.name, SUM(o.total_price)
FROM users u
JOIN orders o ON u.id = o.user_id
GROUP BY u.name;
```

📉 每次都要掃描兩張表並 GROUP。

### **(2) 反正規化設計（預先維護彙總表）：**
| **user_id** | **total_spent** |
| ----------- | --------------- |
| 1           | 70              |
| 2           | 900             |

📈 查詢速度可提升 **數十倍**：
```sql
SELECT total_spent FROM user_stats WHERE user_id = 1;
```

更新策略：
- 每次訂單提交時同步更新該用戶的 total_spent
- 或每日批次重算

---
## **🗃️ 六、反正規化在 NoSQL 的應用**

在 NoSQL（特別是 Document DB）中，
**反正規化幾乎是預設設計哲學。**
### **📘 MongoDB 範例**
#### **（正規化方式）**
```js
User = { _id: 1, name: "Alice" }
Post = { _id: 10, user_id: 1, title: "Hello" }
```
查詢貼文 + 使用者名稱 → 需要 $lookup（JOIN 等效操作）

---

#### **（反正規化方式）**
```js
Post = {
  _id: 10,
  title: "Hello",
  user: { id: 1, name: "Alice" }
}
```

📈 查詢只需一次讀取，效能極佳。
📉 缺點：若使用者名稱改變，所有貼文都需更新

💡 **MongoDB 設計原則：**
> 「**Data that is accessed together should be stored together.**」
> （會一起被查詢的資料，應該一起儲存）

---

## **⚖️ 七、反正規化的優缺點**

|**面向**|**優點**|**缺點**|
|---|---|---|
|**效能**|大幅降低 JOIN 開銷、查詢速度快|更新成本高|
|**一致性**|弱一致（需自行同步）|資料重複|
|**維護性**|查詢簡單|Schema 複雜、難追蹤更新|
|**儲存空間**|更多資料冗餘|成本增加|

---

## **🧩 八、反正規化 + Cache = 實務強化組合**

在大型系統中，反正規化往往搭配快取層（Redis、Memcached）：

Request → Cache → (Denormalized Table) → Database

- Cache 作為熱資料加速層
- 反正規化作為「冷資料快取」或中間層
- 結合兩者可大幅提升 QPS 與響應時間

📘 範例：

> 電商後台查詢「使用者最新訂單」
> → 先查 Redis（快取）
> → 若無快取則查 Denormalized Table（讀快）
> → 再同步主表（寫慢）


## **🧮 九、反正規化的維護策略**
|**類型**|**方法**|**工具**|
|---|---|---|
|**同步更新**|應用層同時更新多表|交易控制（ACID）|
|**非同步更新**|使用 Queue（Kafka, RabbitMQ）或定期 Job|延遲一致性|
|**批次重建**|每日重算彙總表|ETL / Airflow / Spark|
|**版本欄位**|用 updated_at 追蹤同步狀態|ETL 驗證一致性|

---
## **🧠 十、在系統設計中的定位**

|**系統規模**|**設計策略**|
|---|---|
|小規模系統|優先正規化（維持簡潔）|
|中規模（10萬級用戶）|適度反正規化（減少 JOIN）|
|大規模（億級資料）|全面反正規化 + Cache + Sharding|
|分散式應用|採 BASE 模型（最終一致）|

## **✅ 十一、一句話總結**

> **正規化** 解決「資料一致性」問題。
> **反正規化** 解決「查詢效能」問題。
>   
> ⚙️ 沒有絕對好壞，只有**依系統特性選擇取捨**。
>   
> 📊 寫多讀少 → 正規化
> ⚡ 讀多寫少 → 反正規化
> 🌐 分散式系統 → 結合快取與事件同步機制


---
# **⚙️ Sharding 通常用在哪種資料庫？**
  
> ✅ **Sharding 是為了「寫入與容量的擴展」而設計的。**
> 也就是說，它**主要針對「寫的資料庫」**。

### **1️⃣ 「讀」的瓶頸可以靠** Replication（主從複製）解決

- 讀取操作天生可平行化
- 你可以有多個 replica 同時服務查詢
- 這時只要做 **讀寫分離（Read/Write Split）** 就能橫向擴展
- 所以 **讀的壓力通常不需要 sharding**

📘 例如：
```
App
 ├──> Master DB (寫)
 ├──> Read Replica A (讀)
 └──> Read Replica B (讀)
```

👉 當「讀取」變多時，只要增加 replica 就好，不需要動資料結構。

---

### **2️⃣ 「寫」的瓶頸無法靠複製解決**

- 所有寫入仍集中在主資料庫（Single Write Master）
- 單台機器的 IOPS、CPU、磁碟空間都有上限
- **Replication 只能複製結果，不能分攤寫入壓力**

📉 這時候就必須：

> ➤ 將資料「分片（Shard）」到多個節點，
> 讓不同的使用者或業務區塊能同時寫入不同資料庫。

---
## **📊 比較：Replication vs Sharding**

| **項目** | **Replication（主從複製）** | **Sharding（資料分片）**                 |
| ------ | --------------------- | ---------------------------------- |
| 主要目標   | 增加**讀取**吞吐量           | 增加**寫入**與**容量**吞吐量                 |
| 資料內容   | 每個節點都存同一份資料           | 每個節點只存部分資料                         |
| 一致性    | 主寫、從讀（延遲同步）           | 每片獨立維護自己的資料                        |
| 擴展方式   | 水平擴展「讀」               | 水平擴展「寫」與「容量」                       |
| 複雜度    | 相對簡單                  | 架構與查詢邏輯更複雜                         |
| 適用時機   | 讀多寫少（read-heavy）      | 寫多或資料量極大（write-heavy / data-heavy） |

---

## **🧩 真實案例**

|**系統**|**方案**|**原因**|
|---|---|---|
|**MySQL 電商系統**|Sharding by user_id|不同使用者訂單同時寫入不同分片|
|**社群平台（Twitter）**|Shard by tweet_id（時間序號）|高速寫入 tweet log，橫向擴展|
|**遊戲後台**|Shard by region|每伺服器區玩家資料獨立儲存|
|**金融系統**|Shard by account_id|避免單主庫寫入瓶頸|
|**MongoDB**|自動分片（Shard Key）|同時提升容量與寫入效能|

---

## **💡 延伸設計：讀寫都很多時怎麼辦？**

若系統既「讀多」又「寫多」，可**同時結合兩種策略：**
```
App
 ├──> Shard A (Master + Replicas)
 ├──> Shard B (Master + Replicas)
 ├──> Shard C (Master + Replicas)
```

這叫做：

> **Sharded Cluster with Replication**
> 每個 shard 各自有 replication group，
> 既能水平分寫，也能水平分讀。

📘 MongoDB、Cassandra、Elasticsearch 都是這種架構。

---
## **🧭 五、一句話總結**

- > **Replication → 解決讀的問題（Read Scaling）**    
- > **Sharding → 解決寫的問題（Write Scaling）**

> 📖 Sharding 幫你分散「資料與寫入壓力」，
> 不是用來分散查詢的。