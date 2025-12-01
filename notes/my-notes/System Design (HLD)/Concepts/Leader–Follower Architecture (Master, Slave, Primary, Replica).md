---
title: "Leader–Follower Architecture (Master, Slave, Primary, Replica)"
lang: "zh"
translationKey: "leader-follower-architecture-master-slave-primary-replica"
published: true
tags: ["system design", "concept"]
---

## **💡 一、這些詞到底是什麼意思？**

在分散式系統中，我們常聽到這些名稱：  

> Leader / Follower
> Master / Slave
> Primary / Replica
> Coordinator / Worker

它們其實都在描述**節點之間的角色分工**：

- 誰負責「寫入」（決策者）
- 誰負責「同步」或「備援」（執行者）

💬 換句話說：

> 「Leader」是主導資料狀態的人，
> 「Follower」是抄筆記、跟上進度的人。

---

## **🧱 二、基本結構概念**

```
            ┌─────────────┐
            │   Leader    │  ← 處理寫入、決策
            └──────┬──────┘
                   │ Replication
       ┌───────────┴───────────┐
       ▼                       ▼
 [Follower 1]            [Follower 2]
   (讀取請求)              (讀取請求)
```

---

## **⚙️ 三、主要角色與職責**

|**角色**|**職責**|**常見別名**|**實際範例**|
|---|---|---|---|
|**Leader / Primary / Master**|負責處理所有寫入與狀態更新，並將變更複製給其他節點|Master, Coordinator|MySQL Primary, Kafka Controller|
|**Follower / Replica / Slave**|接收 Leader 的更新並保持同步，通常只處理讀請求|Secondary, Standby|MySQL Replica, Elasticsearch Data Node|
|**Arbiter / Observer**|不儲存資料，只負責協助選舉或維持仲裁票數|Witness, Voter|MongoDB Arbiter, ZooKeeper Observer|

---

## **🧩 四、Leader–Follower 架構的好處**

|**優點**|**說明**|
|---|---|
|✅ **高一致性**|所有寫入經由 Leader 決策，避免衝突|
|✅ **簡化同步邏輯**|單一來源更新（Single source of truth）|
|✅ **容易實作強一致性（Strong Consistency）**|可搭配 Raft / Paxos 達到線性一致性|
|✅ **可水平擴展讀取（Read Scalability）**|多個 Follower 負責讀取壓力|

---

## **⚠️ 五、缺點與挑戰**

|**缺點**|**說明**|
|---|---|
|❌ **Leader 故障會中斷寫入**|需執行 Leader Election 才能恢復服務|
|❌ **延遲同步造成資料落差**|Follower 可能比 Leader 落後（最終一致性）|
|❌ **寫入無法水平擴展**|所有寫操作仍集中在 Leader|
|❌ **選舉機制複雜**|須防止腦裂（Split-brain）或雙主衝突|

---

## **🔄 六、Leader Election（領導者選舉）**

> 當 Leader 掛掉時，系統需自動選出新的 Leader。

常見演算法：

| **演算法**                             | **說明**          | **實際應用**                  |
| ----------------------------------- | --------------- | ------------------------- |
| **Raft**                            | 易理解的共識演算法       | etcd、Consul、Elasticsearch |
| **Paxos**                           | 理論嚴謹但實作複雜       | Google Chubby、Zookeeper   |
| **ZAB（Zookeeper Atomic Broadcast）** | 專為 ZooKeeper 設計 | ZooKeeper Cluster         |

🧠 重點：

> 所有這些演算法都為了「多節點能對 Leader 達成共識」。

---

## **🧮 七、Leader–Follower 的資料同步方式**

|**模式**|**特點**|**延遲**|**一致性**|
|---|---|---|---|
|**同步複製（Synchronous Replication）**|Leader 等所有 Follower 確認後才提交|高|強一致性|
|**非同步複製（Asynchronous Replication）**|Leader 先回應，Follower 稍後同步|低|最終一致性|
|**半同步（Semi-sync）**|至少等一個 Follower ACK|中等|折衷方案|

---

## **📊 八、實際系統範例**

| **系統**                             | **架構模式**                      | **說明**                        |
| ---------------------------------- | ----------------------------- | ----------------------------- |
| **MySQL / PostgreSQL Replication** | Master–Slave                  | 寫入主節點、從節點同步資料                 |
| **Kafka Cluster**                  | Leader–Follower per Partition | 每個分區（Partition）有一個 Leader     |
| **Elasticsearch**                  | Primary–Replica               | Primary shard 接收寫入、Replica 同步 |
| **MongoDB Replica Set**            | Primary–Secondary–Arbiter     | 自動選舉新的 Primary                |
| **Redis Sentinel**                 | Master–Replica + Sentinel     | 自動故障切換（Failover）              |
| **ZooKeeper / etcd / Consul**      | Leader–Follower（Raft）         | 強一致性共識系統                      |

---

## **🔧 九、與 Multi-leader / Leaderless 的對比**

| **架構**            | **特點**          | **代表系統**                          |
| ----------------- | --------------- | --------------------------------- |
| **Single Leader** | 單主節點寫入，最常見      | MySQL, Kafka                      |
| **Multi-leader**  | 多主寫入，需解決衝突      | Active–Active PostgreSQL, CouchDB |
| **Leaderless**    | 所有節點都可寫入，依版本號合併 | DynamoDB, Cassandra               |

💬 換句話說：
- > **Leader–Follower** 強一致（Strong Consistency）
- > **Leaderless** 強可用（High Availability）

---

## **💥 十、常見問題與設計考量**

| **問題**            | **原因**        | **解法**                                      |
| ----------------- | ------------- | ------------------------------------------- |
| Leader 掛了整個系統停擺   | 沒有自動選舉        | 用 Raft / Sentinel 自動 failover               |
| 讀寫不一致             | Follower 延遲同步 | 強制從 Leader 讀取（Read-after-write consistency） |
| 雙主衝突（Split-brain） | 同時出現兩個 Leader | 引入 quorum 機制（過半決策）                          |
| 負載不均              | Leader 壓力過大   | 將讀請求導向 Follower                             |

---

## **✅ 十一、一句話總結**


> 💬 **Leader–Follower 架構是分散式系統的一種「共識與分工模型」。**

- > Leader 負責「決策與寫入」    
- > Follower 負責「同步與讀取」
- > 搭配選舉機制，實現「高可用 + 一致性」

> 🧠 在系統設計面試中，它常出現在：

- > 資料庫複寫（Replication）    
- > 分散式鎖（Distributed Lock）
- > 協調服務（etcd, Zookeeper）
- > Kafka Partition 的 Leader 選舉

---


## **簡單說明三者概念**

### Raft – 現代主流**

最「工程實用」的共識演算法。

> 用途：Leader 選舉 + 日誌複製 + 狀態一致
> 通俗比喻：
> 一個班長（Leader）抄黑板，其他同學（Follower）跟著抄。
> 如果班長下課（掛了），大家投票選出新班長繼續。

🔹 特點：

- 容易理解與實作    
- 有明確 Leader（集中協調）
- 實現強一致性（CP 系統）
- 被 etcd / Consul / Elasticsearch 採用

📘 例如：Kubernetes 用的 **etcd** → 就是基於 Raft。

---
### **Paxos – 理論基礎**

最早提出的共識演算法，被稱為「學界經典但工業界惡夢」。

> 核心概念：多數節點對提案（Proposal）達成一致。

🔹 問題：

- 理論嚴謹但實作複雜（多階段通信）
- 不易理解（連原作者 Lamport 都寫了簡化版 “Paxos Made Simple” 😂）
- 但 Google 改良它形成 **Multi-Paxos、Spanner Paxos**

📘 所以現代系統幾乎不直接用原生 Paxos，只用它的思想。

---
### **ZAB（ZooKeeper Atomic Broadcast） – ZooKeeper 專用**

為 Apache ZooKeeper 設計的共識協議。

> 核心概念：Leader 廣播提案（Proposal），Follower 確認後提交。
  
🔹 特點：

- 保證事件順序一致（Order-based consistency）
- 專為「協調服務」與「配置同步」而設計
- 與 Raft 類似，但更強調「廣播順序」而非「日誌複製」

📘 ZooKeeper、Kafka Controller、Hadoop 都用這套。

---

## **⚙️ 共通點**

所有共識演算法都遵循：

1. 多數同意原則（Majority Quorum）
2. 錯誤容忍（可容忍 N/2 - 1 節點故障）
3. 狀態機複製（Replicated State Machine）
4. 選舉 + 日誌同步 + 提交（Commit）