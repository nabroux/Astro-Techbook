---
title: "Elasticsearch"
lang: "zh"
translationKey: "elasticsearch"
published: true
tags: ["system design", "concept"]
---

參考資料：
https://www.youtube.com/watch?v=PuZvF2EyfBM
https://www.hellointerview.com/learn/system-design/deep-dives/elasticsearch

中文影片
https://www.youtube.com/watch?v=dVUMqi5knuo


## **💡 一、Elasticsearch 是什麼？**

> **Elasticsearch（簡稱 ES）**
> 是一個基於 **Lucene** 的**分散式全文檢索與資料分析引擎**。

📦 它最初由 Elastic.co 開發，

被廣泛用於：

- 全文搜尋（Full-text Search）    
- 日誌分析（Log Analytics）
- 商業智慧（Business Intelligence, BI）
- 實時監控（Observability, APM）

👉 通常搭配：  

> **Elasticsearch + Logstash + Kibana = ELK Stack**
> （現在新版叫 **Elastic Stack**）

## **🧱 二、ES 的核心概念結構**

| **概念**           | **類似於**            | **說明**                      |
| ---------------- | ------------------ | --------------------------- |
| **Index（索引）**    | 資料庫（Database）      | 用來儲存一類型的文件                  |
| **Document（文件）** | 資料表中的一筆資料（Row）     | JSON 格式的資料單位                |
| **Field（欄位）**    | 資料表的欄位（Column）     | 文件的屬性名稱                     |
| **Mapping**      | Schema             | 定義欄位的型別、分析器                 |
| **Analyzer**     | Tokenizer + Filter | 負責將文字切分、正規化、建立倒排索引          |
| **Shard**        | 資料分片（Partition）    | 一個 Index 可分成多個 Shard，實現水平擴展 |
| **Replica**      | 資料副本               | 備援用，提升可用性與查詢效率              |

---

## **⚙️ 三、Elasticsearch 的運作原理**

### **1️⃣ 資料寫入（Indexing）**

```
Client → Elasticsearch Node
        ↓
Analyzer 分析（斷詞、過濾）
        ↓
建立倒排索引（Inverted Index）
        ↓
儲存在 Shard 中
```

> ✅ 倒排索引（Inverted Index） =
> 一種「從字詞找文件」的資料結構。

💬 舉例：

```
"apple" 出現在文件 1, 5, 7
"banana" 出現在文件 2, 5
```

### **2️⃣ 資料搜尋（Querying）**

```
User Query → Analyzer（分析查詢字）  

          → 在倒排索引中比對詞彙  

          → 返回符合的文件 + 相關度（score）
```

> ES 會根據 **TF-IDF / BM25** 等演算法計算「相關度分數」。

---

## **🧠 四、ES 的強項**

| **類別**                          | **能力**             |
| ------------------------------- | ------------------ |
| 🔍 **全文檢索**                     | 文字切詞、模糊搜尋、相似度比對    |
| ⚡ **即時查詢**                      | 秒級回應，支援大規模資料       |
| 📈 **聚合分析（Aggregation）**        | 分組、統計、計數、平均值、直方圖   |
| 🧩 **結構化 + 非結構化資料混用**           | JSON 格式靈活          |
| 🔁 **水平擴展（Horizontal Scaling）** | Shard + Replica 架構 |
| 🧱 **高可用性（High Availability）**  | 節點分佈式同步、容錯機制       |

---

## **🧩 五、ES 的分散式架構**

```
        ┌──────────────────────┐
        │      Client (API)    │
        └──────────┬───────────┘
                   │
        ┌──────────┴───────────┐
        │  Coordinating Node   │ ← 請求協調者
        └──────────┬───────────┘
     ┌──────────────┼──────────────┐
     ▼              ▼              ▼
[Data Node1]   [Data Node2]   [Data Node3]
   ├─ Shard 1     ├─ Shard 2     ├─ Shard 3
   └─ Replica 3    └─ Replica 1   └─ Replica 2
```

🧠 說明：

- **Client Node**：接收查詢或寫入請求
- **Coordinating Node**：拆分查詢並整合結果
- **Data Node**：實際儲存資料、索引與分片
- **Master Node**：管理叢集、分片分配、節點健康檢查

---

## **🔍 六、搜尋方式類型**

|**查詢類型**|**功能**|**範例**|
|---|---|---|
|**Term Query**|精準比對（不斷詞）|找 “status: active”|
|**Match Query**|全文比對（會斷詞）|找 “快速搜尋”|
|**Bool Query**|複合條件|must + should + filter|
|**Range Query**|範圍查詢|price: 100–500|
|**Aggregation**|聚合統計|平均價格、最大最小值|

💡 ES 的查詢語言是 **DSL（Domain Specific Language）**，
以 JSON 格式撰寫，例如：

```json

GET /products/_search
{
  "query": {
    "match": { "name": "headphones" }
  },
  "aggs": {
    "avg_price": { "avg": { "field": "price" } }
  }
}

```

---

## **📦 七、常見使用場景**

|**類型**|**實例**|
|---|---|
|🔍 搜尋引擎|網站全文搜尋、產品搜尋、模糊比對|
|📊 日誌分析|ELK Stack（Logstash → Elasticsearch → Kibana）|
|📈 資料分析|即時統計、報表聚合|
|🧠 智能推薦|根據使用者查詢詞彙找相似結果|
|🕵️ 監控系統|收集 Metrics、Trace、Logs 整合查詢|

---

## **⚠️ 八、Elasticsearch 的挑戰與缺點**

|**問題**|**說明**|
|---|---|
|🧮 **資料一致性弱（Eventually Consistent）**|分散式系統的同步延遲可能造成短暫不一致|
|💾 **儲存空間消耗大**|倒排索引與副本佔用大量磁碟|
|⚙️ **寫入效能不如查詢快**|建索引、斷詞、壓縮成本高|
|🔍 **複雜查詢調校難**|Mapping、Analyzer 不當會造成搜尋不準|
|🧩 **集群維護複雜**|Shard/Replica 過多易影響效能|
|🧠 **學習曲線高**|DSL 語法與查詢邏輯需熟悉|

---

## **🧮 九、與資料庫比較（SQL vs Elasticsearch）**

| **面向**   | **RDBMS (SQL)** | **Elasticsearch** |
| -------- | --------------- | ----------------- |
| 資料型別     | 結構化（表格）         | JSON（半結構化）        |
| 查詢語言     | SQL             | DSL（JSON）         |
| 寫入效能     | 高               | 中（需建立索引）          |
| 查詢效能     | 精確查詢快           | 模糊查詢快             |
| 事務（ACID） | 支援              | 弱一致性              |
| 水平擴展     | 困難              | 天生支援              |
| 適用場景     | CRUD 業務系統       | 搜尋、分析、即時報表        |

---

## **🔧 十、與其他搜尋系統比較**

|**系統**|**說明**|**特色**|
|---|---|---|
|**Elasticsearch**|基於 Lucene，最流行|分散式、REST API、擴展性強|
|**Solr**|早期 Lucene 平台|XML-based 配置、較傳統|
|**OpenSearch**|AWS fork 版本|開源持續開發|
|**Meilisearch / Typesense**|輕量搜尋引擎|簡單部署、小專案適用|

---

## **✅ 十一、一句話總結**

> 🔍 **Elasticsearch 是資料世界的 Google。**

- > 用倒排索引讓搜尋快得像查字典
- > 用分片（Shard）讓叢集能無限水平擴展
- > 同時兼具搜尋引擎與資料分析功能>   

> 💬 實務應用中：

- > RDBMS 負責**儲存**（data of record）
- > Elasticsearch 負責**搜尋與分析**（data for query）
