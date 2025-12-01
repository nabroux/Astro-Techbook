---
title: "Message Queue vs Message Broker"
lang: "zh"
translationKey: "message-queue-vs-message-broker"
published: true
tags: ["system design", "concept"]
---
## **🧠 一、先講一句話版本（快速區分）**

> 🔸 **Message Queue（訊息佇列）**：一個「資料結構」或「機制」，
> 負責先進先出（FIFO）地暫存訊息。
>   
> 🔸 **Message Broker（訊息代理）**：一個「系統元件」或「服務」，
> 負責**收發、路由、轉換、分發**訊息（內部可能有多個 queue）。

---

## **📦 二、簡單比喻**

想像有一家物流公司 🚚：

| **角色**                   | **比喻**                   | **對應系統**               |
| ------------------------ | ------------------------ | ---------------------- |
| 📬 **Message Queue**     | 倉庫裡的「貨架」：一箱一箱排著，先進先出     | 資料暫存區（Queue）           |
| 🧑‍💼 **Message Broker** | 整個「物流公司」：負責接單、分流、轉運、通知司機 | 訊息中介系統（Kafka、RabbitMQ） |

也就是說：
- Queue = **存放訊息的地方**
- Broker = **管理訊息如何傳送的整個中樞**

---

## **🧱 三、Message Queue 是什麼？**

> 「一個讓生產者（Producer）和消費者（Consumer）之間**非同步溝通**的暫存通道。」

📘 重點功能：

- 存放訊息（FIFO）
- 消息消費一次即刪除
- 支援重試與確認（ACK）
- 可水平擴展（分散多台）

📊 常見實作：

| **系統**                  | **性質**         |
| ----------------------- | -------------- |
| **Amazon SQS**          | 純 Queue，沒有路由邏輯 |
| **Beanstalkd**          | 簡單工作佇列         |
| **Redis List / Stream** | 可用作暫時性的 Queue  |

💡 核心概念：
只負責**暫存 + 傳遞**，不幫你做邏輯判斷或分發。

---

## **⚙️ 四、Message Broker 是什麼？**

> 「Broker 是管理多個 Queue、主題、訂閱者之間訊息流動的智慧中樞。」

📦 它不只是儲存訊息，還負責：

- 訊息**路由（Routing）**
- **轉換格式（Transformation）**
- **重試與錯誤處理**
- **發布/訂閱（Pub/Sub）**
- **保證送達（ACK / Durable）**
- **集群與高可用（Cluster HA）**
  
📊 常見實作：

|**系統**|**功能特色**|
|---|---|
|**RabbitMQ (AMQP)**|Exchange + Queue 模型，路由強大|
|**Kafka**|分散式 Log Stream（高吞吐）|
|**NATS**|輕量、高速 Broker|
|**ActiveMQ / Azure Service Bus**|企業級 Broker|

---

## **🔁 五、兩者關係圖**

```
Producer ──► [Message Broker] ──► [Queue] ──► Consumer
                ├── Routing / Topic
                ├── Acknowledgement
                ├── Retry / DLQ
                └── Monitoring
```

💬 可以這樣理解：

> 「Message Queue」只是 Broker 的一個元件。
>   
> 一個 Broker 內可能包含 **多個 Queue、Topic、Exchange**，
> 並提供更多功能（像郵局總局管理所有信箱）。


## **🧩 六、舉例比較**

|**特性**|**Message Queue**|**Message Broker**|
|---|---|---|
|核心功能|暫存訊息、排隊傳遞|管理、分發、轉換、路由訊息|
|複雜度|低|高|
|功能範圍|單純 Queue|Queue + Topic + Routing + Pub/Sub|
|傳遞模式|Point-to-Point|Point-to-Point / Pub-Sub|
|範例|SQS, Redis Queue|RabbitMQ, Kafka, NATS|
|適用場景|非同步任務、簡單工作排程|分散式系統整合、事件驅動架構|
|可否支援多消費者|通常 1:1|支援多訂閱者（Fanout）|

---

## **💬 七、實際應用場景對比**
| **系統需求**                            | **適合使用**             |
| ----------------------------------- | -------------------- |
| 任務排程（Email Queue、報表產生）              | Message Queue        |
| 微服務事件分發（User Created Event → 多服務反應） | Message Broker       |
| IoT 裝置資料上報（Topic-based）             | Broker（MQTT / Kafka） |
| 單純工作排隊                              | Queue                |
| 分佈式事件驅動架構（EDA）                      | Broker               |

---

## **🧠 八、真實例子一：SQS vs RabbitMQ**

| **項目** | **Amazon SQS**        | **RabbitMQ**           |
| ------ | --------------------- | ---------------------- |
| 定位     | Message Queue         | Message Broker         |
| 協定     | 自家協定                  | AMQP                   |
| 路由     | 無                     | Exchange + Routing Key |
| 傳遞模式   | 單一 Queue              | 多 Queue / 多消費者         |
| 使用場景   | 簡單任務隊列（Lambda、EC2 任務） | 微服務事件系統、Pub/Sub        |

📘 AWS 架構中常見組合：
```
Lambda Function ← SQS ← SNS (Pub/Sub Broker)
```
👉 SNS 是 Broker，SQS 是 Queue！

---
## **🏗️ 九、真實例子二：Kafka 的定位**

Kafka 常被誤認為是 Queue，其實它是 **分散式 Message Broker**。

它裡面有：

- **Topic（主題）**
- **Partition（分片）**
- **Consumer Group（消費群組）**

每個 Topic 底下可能有多個 Partition（每個就像 Queue），
但 Kafka 本身提供：

- 有序性（per partition）    
- 持久化（Log-based）
- 多訂閱者（Pub/Sub）

💡 所以 Kafka 是一種「以日誌為基礎的 Message Broker」。

---

# **📨 Kafka vs RabbitMQ**


Kafka vs RabbitMQ
https://www.youtube.com/watch?v=w8xWTIFU4C8

Kafka
https://www.youtube.com/watch?v=QkdkLdMBuL0

Kafka zero to hero
https://www.youtube.com/watch?v=B7CwU_tNYIE

## **💡 一、為什麼這兩個東西常被拿來比較？**

因為：

- 兩者都可以「非同步傳遞訊息」
- 都支援「Producer → Queue → Consumer」模式

但用途完全不同 👇

| **類型**          | **定位**                                        |
| --------------- | --------------------------------------------- |
| 🐇 **RabbitMQ** | 「傳統訊息佇列（Message Queue）」— 強調可靠傳遞與靈活路由          |
| ⚡ **Kafka**     | 「事件流平台（Event Streaming Platform）」— 強調高吞吐與持久訂閱 |

## **🧱 二、RabbitMQ 概念與架構**

> RabbitMQ 是基於 **AMQP（Advanced Message Queuing Protocol）** 的企業級 Message Broker。

📦 核心角色：
```
Producer → Exchange → Queue → Consumer
```

| **元件**       | **功能**                             |
| ------------ | ---------------------------------- |
| **Exchange** | 接收訊息並決定要送到哪個 Queue（透過 Routing Key） |
| **Queue**    | 暫存訊息                               |
| **Binding**  | Exchange 與 Queue 的連結規則             |
| **Consumer** | 消費訊息，並送回 ACK                       |

---

### **🧩 Exchange 類型**

|**類型**|**功能**|**範例**|
|---|---|---|
|**Direct**|根據 Routing Key 精準匹配|user.123|
|**Topic**|通配符匹配（user.*）|user.signup|
|**Fanout**|廣播到所有 Queue|通知系統|
|**Headers**|根據訊息 Header 過濾|content-type=json|

---

### **✅ 特點總覽**

| **特性** | **RabbitMQ 表現**       |
| ------ | --------------------- |
| 協定     | AMQP                  |
| 訊息保證   | ✅ 可設定 ACK、重送、DLQ      |
| 路由彈性   | ⭐⭐⭐⭐（Exchange 機制超靈活）  |
| 吞吐量    | 中（約十萬級 TPS）           |
| 延遲     | 低至中                   |
| 持久化    | 可選（Persisted Message） |
| 使用場景   | 任務隊列、交易通知、郵件派送        |

---
### **🧠 適合使用 RabbitMQ 的情境**

- 要「**可靠傳遞（Guaranteed Delivery）**」
- 任務可以「**被消費一次就刪除**」
- 系統之間關係是「**明確工作指派（Job Queue）**」
- 需要「**複雜路由**」（Fanout、Topic）

```
Order Service → RabbitMQ Exchange (order.created) → 
   ├─ Inventory Service
   ├─ Notification Service
   └─ Analytics Service
```

---

## **⚙️ 三、Kafka 概念與架構**

> Kafka 是由 LinkedIn 開發、後來捐給 Apache 的**分散式事件串流平台（Event Streaming Platform）**。
> 它不只是 Queue，而是一個**高效、持久的 Log 系統**。

### **📦 核心架構：**
```
Producer → Topic (Partitioned Log) → Consumer Group
```

|**元件**|**功能**|
|---|---|
|**Topic**|訊息分類單位（像是「主題頻道」）|
|**Partition**|分片（支援水平擴展、高併發）|
|**Offset**|消費者讀取位置指標|
|**Consumer Group**|多消費者分攤處理負載|
|**Broker**|儲存與管理訊息的節點|

---

### **🧠 Kafka 特性**

|**特性**|**Kafka 表現**|
|---|---|
|訊息儲存|永久（Log-based）|
|訊息重播|✅ 支援（根據 offset）|
|吞吐量|⭐⭐⭐⭐⭐（百萬級 TPS）|
|延遲|極低（ms 級）|
|擴展性|優秀（可水平擴展 Partition）|
|傳遞語意|At most once / At least once / Exactly once|
|使用場景|日誌收集、事件流、分析平台、即時監控|

---

### **💡 舉例：Kafka 消費機制**

```
Topic: "user.events"
 ├── Partition 0: msg1, msg2, msg3
 ├── Partition 1: msg4, msg5, msg6
 └── Partition 2: msg7, msg8, msg9

Consumer Group A:
  C1 處理 P0
  C2 處理 P1
  C3 處理 P2
```

💬 每個 Consumer 只讀取「自己負責的 Partition」。
Kafka 不會刪除訊息（除非過期），可以重播或供多群組訂閱。

---

## **🔍 四、RabbitMQ vs Kafka 比較總覽**

| **項目** | **RabbitMQ**              | **Kafka**                |
| ------ | ------------------------- | ------------------------ |
| 定位     | Message Broker            | Event Streaming Platform |
| 協定     | AMQP                      | Kafka Protocol（TCP 自定義）  |
| 資料模型   | Queue-based（Message 消費即刪） | Log-based（可重播）           |
| 傳遞語意   | At most / At least once   | At least / Exactly once  |
| 順序保證   | Per Queue                 | Per Partition            |
| 訊息保留   | 消費後刪除                     | 可設定時間（7 天 / 永久）          |
| 吞吐量    | 中（10⁴/s）                  | 高（10⁶/s）                 |
| 延遲     | 低                         | 極低                       |
| 擴展性    | 中等（需手動分佈）                 | 高（水平擴展）                  |
| 路由邏輯   | Exchange + Binding        | 以 Topic + Partition 為單位  |
| 儲存方式   | Memory / Disk Queue       | Append-only Log（磁碟）      |
| 消費模式   | Push（Broker 主動推）          | Pull（Consumer 主動拉）       |
| 適用場景   | 工作任務、可靠投遞                 | 日誌、事件流、串流分析              |

---

## **📘 五、使用場景建議**

| **需求**          | **建議使用**        |
| --------------- | --------------- |
| 任務排程（寄信、轉檔）     | RabbitMQ        |
| 即時交易事件、訂單流      | Kafka           |
| 多系統整合、事件廣播      | RabbitMQ        |
| 大量 log 收集、分析、監控 | Kafka           |
| IoT 資料上報（輕量）    | MQTT 或 RabbitMQ |
| 金融訂單處理（高可靠）     | RabbitMQ        |
| 分散式事件驅動架構（EDA）  | Kafka           |

---

## **💬 六、經典系統組合**

### **🧱 Microservices + RabbitMQ**

```
[Service A] → [Exchange] → [Queue] → [Service B]

                       ↘ [Queue] → [Service C]
```

用途：
- 確保每個任務都被確實處理（例如：寄信、建立帳號）

---

### **⚡ Event-driven Architecture + Kafka**

```
[Order Service] → Topic: order.events
                         ↓
                ├─ [Analytics Service]
                ├─ [Billing Service]
                └─ [Notification Service]
```

用途：
- 所有服務都能即時「訂閱」事件流
- 支援重播（例如重建狀態、測試環境模擬）

---

## **🧩 七、可以這樣記：**

|**設計哲學**|**RabbitMQ**|**Kafka**|
|---|---|---|
|像郵局：一次寄送、送達即刪|✅|❌|
|像 YouTube：影片可重播、多人訂閱|❌|✅|
|專注可靠傳遞|✅|✅|
|專注高吞吐、事件流|❌|✅|

## **🔐 八、整合使用的實際案例**

在大型系統中，兩者**經常並存**：
```
Event Source (Kafka) → Stream Processor (Flink / Spark)

                                ↓

                           RabbitMQ

                                ↓

                        Downstream Tasks
```

💡 Kafka 用於「事件儲存 & 廣播」，RabbitMQ 用於「實際任務執行」。

## **✅ 九、一句話總結**

> ⚡ **Kafka 是事件河流（Event Stream）**
> 🐇 **RabbitMQ 是任務郵局（Task Queue）**

- > 要「穩定傳訊息」→ RabbitMQ
- > 要「重播事件流」→ Kafka
- > 要「廣播高流量資料」→ Kafka
- > 要「多邏輯任務分派」→ RabbitMQ

> 📦 小系統選 RabbitMQ，大型分散式選 Kafka。


