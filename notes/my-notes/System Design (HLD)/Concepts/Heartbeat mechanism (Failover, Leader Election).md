---
title: "Heartbeat mechanism (Failover, Leader Election)"
lang: "zh"
translationKey: "heartbeat-mechanism-failover-leader-election"
published: true
tags: ["system design", "concept"]
---

Heartbeat（心跳機制）是讓系統能「自動發現節點是否存活」的核心，
幾乎所有的叢集、微服務、容器管理、雲平台、甚至遊戲伺服器都用得到。


# **💓 Heartbeat Mechanism（心跳機制）**
## **一、定義**  

> **Heartbeat（心跳）機制** 是一種讓節點之間定期發送訊號（heartbeat message）
> 以確認「對方是否仍然在線、健康、可服務」的機制。

  
換句話說，它是：

- 一種 **定期健康檢查 (health check)** 的協議。  
- 一種 **故障偵測 (failure detection)** 的手段。

---
## **二、為什麼需要 Heartbeat？**

在分散式系統中，伺服器或節點可能：

- 當機（crash）
- 網路延遲 / 中斷
- 被防火牆擋住
- CPU 卡死但程序還在跑

系統若**沒有心跳檢測**，就無法知道：

- 哪些節點要被移出集群
- 哪些任務要重新分配
- 哪些副本已失效

✅ **Heartbeat 的目標：**

「**快速發現異常節點，確保系統高可用性與一致性。**」

---

## **三、核心概念與關鍵參數**

|**參數**|**說明**|
|---|---|
|**Interval（間隔時間）**|心跳訊號的發送頻率（例：每 5 秒一次）|
|**Timeout（超時時間）**|若超過此時間沒收到回覆，視為節點離線（例：15 秒）|
|**Retry Count（重試次數）**|超時後嘗試重新連線幾次|
|**Failure Threshold（失敗門檻）**|多少次連續失敗才判定為宕機|
|**Recovery Detection（恢復檢測）**|節點恢復時要如何重新加入集|

---

## **四、工作流程**

```
[ 主節點 / 管理者 ]
      ↓
定期發送心跳訊號 (ping)
      ↓
[ 其他節點回覆 ack ]
      ↓
若未回覆 → 標記為失聯
      ↓
觸發故障處理（Failover / 任務遷移）
```

💬 心跳訊號通常是一個小封包，例如：
```json
{
  "node_id": "worker-3",
  "timestamp": 1735200000,
  "status": "alive"
}
```

## **五、常見架構模式**
### **🧱 1️⃣** **中心化（Centralized）**
- 一個「管理節點（Coordinator / Master）」負責監控所有節點。
- 常見於早期架構（例如 Redis Sentinel、ZooKeeper、Elasticsearch master）。

📘 優點：簡單明確
⚠️ 缺點：中心點壓力大、單點風險（需冗餘）

---
### **🌐 2️⃣** 分散式（Decentralized / Gossip-based）
- 節點彼此互相發送心跳（peer-to-peer）
- 常見於 Cassandra、Consul、Serf、Kubernetes Node Controller

📘 優點：去中心化、可擴充
⚠️ 缺點：流量略高，需處理「暫時網路延遲（false positive）」


💡 Gossip Protocol：
每個節點週期性隨機選其他節點「問候一下」
→ 最後整個集群都能知道誰死誰活。

---
## **六、常見實作方式**

|**層級**|**技術 / 實作**|**說明**|
|---|---|---|
|**網路層**|TCP Keepalive, ICMP ping|低階偵測，粒度粗|
|**應用層**|HTTP / gRPC Health Check|可自訂邏輯，例如 /healthz|
|**分散式系統層**|Gossip / RPC 心跳|用在叢集成員管理|
|**中間件層**|Redis Sentinel, ZooKeeper, Kafka|監控 broker / leader 存活|
|**Kubernetes 層**|Node Controller 心跳報告|kubelet 每隔 10s 向 API Server 報告狀態|

## **與其他機制的關係**

| **機制**                         | **目的**   | **關聯**            |
| ------------------------------ | -------- | ----------------- |
| **Health Check**               | 偵測服務健康狀態 | 心跳常是健康檢查的一種形式     |
| **Failover**                   | 故障切換     | 心跳超時後觸發           |
| **Leader Election**            | 選出主節點    | 心跳協助判斷主節點是否還在     |
| **Load Balancer Health Check** | 負載平衡器使用  | 心跳結果可同步至 LB 移除壞節點 |
| **Cluster Membership**         | 成員管理     | 心跳維護「誰在線上」的清單     |

## **實務最佳實踐**
|**項目**|**建議**|
|---|---|
|🔁 心跳間隔|5~15 秒為常見值|
|⏱️ 超時設定|通常為間隔的 3 倍|
|🧩 重試機制|連續失敗 3 次再判定離線|
|📦 故障處理|觸發移除、重新平衡、通知監控系統|
|🧠 狀態同步|以「最終一致性」方式更新成員列表|
|🧰 可視化|Prometheus + Grafana 監控心跳延遲與失敗率|

## **✅ 總結一句話**

> **Heartbeat 是分散式系統的生命訊號。**>   
> 它讓系統能即時知道「誰還活著、誰掛了」，
> 並據此觸發 **failover、leader election、重新分配任務** 等關鍵動作。



# **💓 Heartbeat 與其他機制的關係**

Heartbeat 是分散式系統的「生命訊號」。
但真正讓系統能自我修復、穩定運作的，
其實是 **Heartbeat 與其他機制之間的配合**——
像是 **Failover（故障轉移）**、**Leader Election（主節點選舉）**、**Service Discovery（服務註冊）** 等。
它們就像一整套神經系統，互相牽動，維持著系統的「生命體徵」。

---

## **🧱 1. Heartbeat 與 Failover（故障轉移）**

你可以把 Heartbeat 想像成「心跳監測器」。
只要它的節奏一停，系統就知道：

> 「有節點失去意識了！」

當監控端（像是 Controller、Orchestrator、或 Sentinel）在一段時間內**沒有收到心跳**時：
1. 它會先確認這是不是暫時的網路問題。
2. 如果連續幾次都沒回應，就正式判定該節點「失聯」。
3. 這時就會觸發 **Failover** 機制。


Failover 通常會做的事包括：
- 把壞掉的節點從流量池中移除。
- 把它的任務移交給其他健康節點。
- 如果是主從架構，則提升備援節點成為新的主節點。
  
🕓 時間上的關鍵在於：
- **Heartbeat 間隔（interval）** 要小於 **Failover 超時（timeout）**。    
- 通常設成大約 1:3 或 1:5 的比例，讓系統有緩衝，避免誤判。


💡 一個常見錯誤是「過度敏感的心跳」。
太快觸發 failover，反而會造成「頻繁切換」的抖動。
所以很多系統會設一個「連續失敗 N 次」的門檻，
等真的確定節點掛了，才進行轉移。

---

## **🧭 2. Heartbeat 與 Leader Election（主節點選舉）**

在有多個節點的系統裡，
總要有一個人出來「領導大家」——這就是 **Leader**。
而 Heartbeat 的角色，就是用來**證明 Leader 還活著**。

只要大家定期收到 Leader 的心跳，
就會乖乖當 follower。
但如果在一段時間（election timeout）內都沒收到 Leader 的心跳，
大家就會開始懷疑：「欸，老大是不是掛了？」

接著，**選舉流程**就會自動展開。

選舉的過程通常是這樣：

1. 節點沒收到 Leader 的心跳，轉成候選人（Candidate）。
2. Candidate 向其他節點「拉票」。
3. 得到多數支持者後，成為新的 Leader。
4. 新 Leader 上任後，立刻開始發送新的 Heartbeat。
  
💡 為了避免「大家同時參選」造成混亂，
election_timeout 通常會加入一點「隨機抖動（jitter）」。

---
## **🔁 3. Heartbeat 與 Replication（資料複寫）**

Heartbeat 在這裡不只是「你在不在」，
更是「你資料同步到哪裡了」。


例如在 Raft 或 Kafka 這類系統中，
Leader 會把 log entry 跟 heartbeat 一起發送給 followers。
這樣 followers 不但能證明自己活著，
還能確認目前同步的進度。

如果有節點長時間沒回 heartbeat，
Leader 就知道這個副本「落後了」，
可能要補資料或暫時從 quorum 裡排除。

---

## **🌐 4. Heartbeat 與 Service Discovery（服務註冊）**

Service Discovery 是整個集群的「通訊錄」。
Heartbeat 則是用來「確認這本通訊錄的資訊還正確」。

當某個服務啟動時，它會向 Registry 註冊自己：
  
> 「嗨，我是 service A，在這個 IP、這個 port。」

之後它會定期上報心跳，讓系統知道自己還在。
一旦超過設定時間沒更新，
Registry 就會自動把它從清單中移除。

像 Consul、Eureka、或 AWS Cloud Map 這些系統，
都透過心跳或 TTL 來維護服務列表的準確性。

---

## **⚙️ 5. Heartbeat 與 Load Balancer（負載平衡器）**
  
這裡有趣的是：
**Load Balancer 的健康檢查，其實就是 Heartbeat 的「外部版本」。**

應用程式自己會對 Registry 報心跳（內部健康）。
而 Load Balancer（像 ALB、NGINX、Traefik）
會定期 ping 你的 /healthz 或 /ready endpoint（外部健康）。

這兩層搭配起來，
一個從內部告訴「我還能工作」，
另一個從外部確認「你真的回得來」。

很多系統在滾動更新（rolling update）時，
也會先暫停對該節點送流量、等活連線結束、再關閉心跳，
讓切換過程平滑又安全。

---

## **🧩 6. Heartbeat 與 Circuit Breaker（斷路器）**

Heartbeat 是**監控層的健康信號**，
而 Circuit Breaker 則是**請求層的防護機制**。

當心跳偵測到某個服務不穩，
斷路器就會立刻停止請求該服務（open state），
並在一段時間後再「試探性」開放少量請求（half-open），
確認服務是否恢復。

這兩者的協作讓系統能「自動止血」，
防止故障擴散或形成雪崩效應。

---

## **🌄 7. Heartbeat 與 Auto Healing（自我修復）**

最後一個連動關係是最直覺的。
Heartbeat 掛掉 → 系統判斷該節點已經死亡 → 觸發自動重啟或替換。

這整套流程在 AWS、Kubernetes、或 GCP 裡早已內建：
- Kubelet 沒回 heartbeat → Node 被標記 NotReady → Controller 重新排程 Pod。
- EC2 instance 沒過 health check → ASG 自動啟新機替換。

也就是說，Heartbeat 是雲端「自癒能力」的核心來源。


## **🧠 一句話總結**

> **Heartbeat 告訴系統誰還活著；**
> **Failover 決定該怎麼救；**
> **Leader Election 則讓新的人接手。**

這三者一起構成了分散式系統的「呼吸系統」。