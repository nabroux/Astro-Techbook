---
title: "Server Scaling & High Availability"
lang: "zh"
translationKey: "server-scaling-high-availability"
published: true
tags: ["system design", "concept"]
---
_伺服器擴充與高可用架構設計_

---

## **💡 一、為什麼要考慮 Scaling & HA？**

> 當使用者變多、請求變多、資料變大時，
> 系統必須能「撐住、不掛掉、快速回應」。

這時候就需要：

1. **Scaling（擴充能力）** → 撐得起更多流量
2. **High Availability（高可用性）** → 掛一台不影響服務


## **⚙️ 二、Scaling（擴充）是什麼？**

> 🔸 **Scaling = 增加資源，讓系統能處理更多請求。**

有兩種主要方式：

|**類型**|**英文**|**說明**|**常見作法**|
|---|---|---|---|
|**垂直擴充**|Vertical Scaling (Scale-Up)|升級單一伺服器的硬體性能|增加 CPU、RAM、SSD|
|**水平擴充**|Horizontal Scaling (Scale-Out)|增加伺服器節點數量|多台伺服器 + 負載平衡器|

## **🧩 三、垂直擴充（Vertical Scaling）**

> 🚀 「救急用」的最直接方式：升級硬體！

例子：

- 把 EC2 t3.medium → t3.2xlarge
- MySQL 主機從 2 CPU → 16 CPU

### **✅ 優點**

- 簡單、快速（幾乎不改架構）
- 成本一開始低
- 不需分散式設計
  
### **❌ 缺點**

- 有**天花板**（硬體升級極限）
- 單點故障風險高
- 升級過程可能中斷服務
  
### **💬 實務建議：**

> 當系統開始撐不住，可以先垂直擴充救急，
> 再規劃後續的水平擴展方案。


## **⚖️ 四、水平擴充（Horizontal Scaling）**

> 🧠 「根本解法」：讓更多伺服器分攤壓力。

例子：

- 原本一台 API Server → 拆成 4 台
- 前面放一台 **Load Balancer** 做分流
  
### **📦 架構範例：**

```
          ┌──────────────┐
          │ LoadBalancer │
          └───────────┬──┘
       ┌──────────────┼────────────────┐
   [App Server1] [App Server2] [App Server3]
```

### **✅ 優點**

- 幾乎可無限擴展（只要錢夠）
- 某台掛了其他台可接手（高可用）
- 可結合 Auto Scaling Group 自動擴縮

### **❌ 缺點**

- 架構與資料同步更複雜（Session、DB、Cache）
- 部署成本高（多節點維護）
- Debug 變難（多節點環境）

---

## **⚙️ 五、搭配 Load Balancer（負載平衡器）**

> **水平擴充一定要搭配 LB，否則使用者不知道要連哪台伺服器。**

### **🧭 LB 的角色**

- 分配流量（Round Robin / Least Connection / Hash）    
- 偵測健康狀態（Health Check）
- 自動移除掛掉的節點（Failover）
- 可提供 SSL Offloading、Session Sticky 等功能

### **🌐 常見實作**

| **類型** | **範例**                                         |
| ------ | ---------------------------------------------- |
| 雲端 LB  | AWS ELB / GCP Load Balancer / Azure Front Door |
| 軟體 LB  | Nginx / HAProxy / Envoy                        |
| 硬體 LB  | F5 Networks / Citrix ADC                       |

詳見 [[Load Balancer]]

---

## **🧱 六、High Availability（高可用架構）**

> **高可用性（HA）** 是指系統在部分故障下仍能正常服務。

常見設計手法：

|**層級**|**作法**|**說明**|
|---|---|---|
|**伺服器層**|多實例 + LB|掛一台不影響整體（Failover）|
|**資料庫層**|Master-Slave / Replication|寫入掛掉可改讀庫升級|
|**快取層**|Redis Cluster / Sentinel|自動切換主節點|
|**儲存層**|S3、GCS、Ceph|多區備援存放|
|**網路層**|多 AZ、多 Region|斷線自動導流|

---
### **💡 例：多區域部署（Multi-AZ）**

```
        [Region 1] ─── [LoadBalancer] ─── [App Servers]
             │
             └── Replicate to
             │
        [Region 2] ─── [LoadBalancer] ─── [App Servers]
```

如果一個地區（AZ）故障，流量自動切往另一地區。

---

## **🔁 七、伺服器備援（Server Redundancy）**

> 🧩 「沒有備援的系統，就等著掛。」

### **類型：**

| **類型**             | **說明**           |
| ------------------ | ---------------- |
| **Active-Active**  | 所有節點同時服務（最常見）    |
| **Active-Passive** | 一台主用、一台備援，主掛時才切換 |
| **Hot Standby**    | 備援機持續同步、隨時可切換    |
| **Cold Standby**   | 備援機關機，掛掉後才啟動     |
### **📘 例子：**

- **Web Server**：Active-Active + LB    
- **DB Server**：Primary + Replica (Async / Sync Replication)
- **Cache / MQ**：Cluster 模式（主從自動選舉）

---
## **🔄 八、自動擴縮（Auto Scaling）**

現代雲服務提供「自動化水平擴縮」機制。

| **雲服務**                                    | **功能**             |
| ------------------------------------------ | ------------------ |
| AWS Auto Scaling Group                     | 根據 CPU / 請求量自動加減機器 |
| GCP Instance Group                         | 支援自動擴縮與健康檢查        |
| Kubernetes HPA (Horizontal Pod Autoscaler) | 根據負載自動增加 Pod       |

💡 **優點**：
- 流量高峰自動擴充
- 閒置時自動縮減省錢
- 搭配 Load Balancer 無縫流量分配

---

## **🧠 九、Scaling 實務策略**

| **狀況**     | **解法**                        |
| ---------- | ----------------------------- |
| 突然流量暴增     | 開啟 Auto Scaling / 增加節點        |
| 短期活動（限時搶購） | 提前預熱快取 / 增加節點 / 啟動 CloudFront |
| 特定 API 高負載 | 拆成獨立微服務 / 使用 Queue            |
| 資料庫瓶頸      | 讀寫分離 + Cache                  |
| 熱點伺服器負載高   | 使用 Consistent Hash + CDN      |

---
## **🧩 十、整體概念圖**

```
               ┌──────────────┐
               │  LoadBalancer│
               └──────┬───────┘
       ┌──────────────┼───────────────────┐
   [App Server 1]  [App Server 2]  [App Server 3]
       │              │                    │
       └───────────→ Database Cluster ←────┘
                      │
                    Cache
                      │
                   Storage
```

---

## **✅ 十一、一句話總結**

> ⚡ **Scaling 解決「撐不住」的問題，HA 解決「掛掉」的問題。**

- > 垂直擴充：救急用，簡單但有限    
- > 水平擴充：長期方案，要搭配 LB
- > 高可用架構：讓任何單點故障都不致於癱瘓

> 💡 真正的穩定系統，一定同時具備：
> **Scaling + Redundancy + Monitoring + Failover**


