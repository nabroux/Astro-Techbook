---
title: "Load Balancer"
lang: "zh"
translationKey: "load-balancer"
published: true
tags: ["system design", "concept"]
---

## **🧩 一、什麼是 Load Balancer（負載平衡器）**

![Pasted image 20251026103028](<assets/Load Balancer/Pasted image 20251026103028.png>)

**定義：**

> Load Balancer 是一個位於「客戶端與伺服器」之間的中介層，用來**分配流量**，確保請求能平均或最有效率地分攤到多台後端伺服器上。


簡單說：
👉 「一堆人來排隊」 → 「Load Balancer 幫你分配到不同窗口」


**主要目標：**
1. ✅ **均勻分流**：避免部分伺服器過載
2. ⚙️ **高可用性**：若有節點掛掉，自動移除
3. 📈 **可擴展性**：可以水平擴充後端節點
4. 🔄 **可觀測性**：提供流量監控與健康檢查

**分類**

| **類型**   | **主要工作層**           | **範例**                  | **特點**                           |
| -------- | ------------------- | ----------------------- | -------------------------------- |
| L4 (傳輸層) | TCP / UDP           | Linux IPVS、NLB、HAProxy  | 根據 IP、Port 分流，效能高，速度快            |
| L7 (應用層) | HTTP / HTTPS / gRPC | Nginx、Envoy、ALB、Traefik | 根據 URL、Header、Cookie、Path 分流，彈性強 |

## **⚙️ 二、常見的負載平衡演算法（Load Balancing Algorithms）**
不同演算法對應不同流量特性：

### 1️⃣ Round Robin（輪詢法）

每個請求依序分配給下一台伺服器，周而復始。
```
Request1 → Server A
Request2 → Server B
Request3 → Server C
Request4 → Server A
```

✅ 優點：
- 實作簡單
- 分佈平均（在伺服器性能相同時）

❌ 缺點：
- 沒考慮伺服器當前負載
- 若伺服器效能差異大，會出現不平衡

📌 **應用：**
最常見於 Nginx、HAProxy 預設策略。

 
### 2️⃣ Weighted Round Robin（加權輪詢）

給每台伺服器設定「權重」，按比例分配流量。
```
Server A (weight=2)
Server B (weight=1)
分配順序：A, A, B, A, A, B, ...
```

✅ 適合異質硬體（不同CPU/RAM）
❌ 若負載隨時間波動大，仍無法動態調整

📌 **應用：**
雲端LB、CDN節點分配（依機房效能或流量成本權重）

---
### 3️⃣Least Connections（最少連線數）

將新請求導向當前「連線數最少」的伺服器。

✅ 適合：
- 請求持續時間差異大（例如 WebSocket、長輪詢）
- 長連線服務

❌ 缺點：
- 需即時統計連線數，開銷較高

📌 **應用：**
Nginx least_conn、HAProxy、Kubernetes Ingress 支援。

---

### **4️⃣** **Least Response Time（最短回應時間）**

每次選擇「平均延遲最短」或「回應最快」的伺服器。
  
✅ 適合：
- 微服務 / API Gateway
- 延遲敏感的系統

❌ 缺點：
- 需要定期收集延遲資料
- 不同網段 latency 可能失真

📌 **應用：**
AWS ALB、Envoy Adaptive Load Balancer、HAProxy Dynamic LB。

---

### **5️⃣** **Random（隨機選擇）**

每次隨機選擇一台伺服器。

✅ 優點：
- 非常簡單，沒有狀態開銷

❌ 缺點：
- 有機率造成流量不均

📌 改良版：**Power of Two Choices (P2C)**👇

---
### **6️⃣** **Power of Two Choices（兩次隨機法）**

隨機挑兩台伺服器，比較它們負載，選較輕的那台。

✅ 優點：
- 幾乎跟最少連線法一樣好
- 實現簡單、無需全域負載資訊

❌ 缺點：
- 仍需監控部分負載指標

📌 **實務：**
雲端平台（例如 Envoy、Nginx Plus）常採用。

> 效能與公平性極佳，為近年主流策略。

---

### **7️⃣** IP Hash（依 IP 雜湊）

根據 client IP 做 hash，確保同一 client 永遠打到同一台伺服器。

✅ 優點：
- 保持 session 黏著性（sticky session）
- 避免 session 重建

❌ 缺點：
- 若節點增刪，hash 結果全變（session 分佈亂掉）

📌 改良版 → **Consistent Hashing**

---

### **8️⃣** **Consistent Hashing（一致性哈希）**

把伺服器與 key 映射到同一個「hash 環（hash ring）」上，
新增或移除節點時，只有少部分 key 需重新分配。

✅ 優點：
- 節點增刪時影響最小
- 適合分布式快取、聊天室、遊戲房間
    
❌ 缺點：
- 實作較複雜
  
📌 **應用：**
Redis Cluster、Cassandra、Envoy Maglev Hash、Kubernetes Topology Aware Routing。

##### **📦 為什麼需要？**
傳統做法：
server = hash(key) % N
如果伺服器數 N 改變（例如多加一台），
→ 幾乎所有 key 的分配都要重算，導致整個系統 cache 全失效。

### **💡 一致性哈希的做法：**

1. 把伺服器和 key 都映射到一個「環（hash ring）」上。
2. key 落在環上，順時針找到的第一個伺服器節點負責該 key。
3. 新增 / 移除節點時，只影響相鄰的一小段 key。

##### **📘 例子：**
環上有三台伺服器：
```
Server A → hash = 10
Server B → hash = 80
Server C → hash = 200
```

key = “user123” → hash = 90
→ 順時針找到 Server C → 分配給 C。

如果新增一台 Server D (hash=100)
→ 只有範圍 (80,100] 的 key 被轉移到 D，其他不受影響。

✅ 用途：
- Redis Cluster 分片
- CDN / API Gateway 黏著性路由
- 分散式快取

---

### **9️⃣** **Weighted Least Connections（加權最少連線）**

綜合「連線數」與「伺服器權重」考量，適合異質叢集。

---
### **🔟** **Least Bandwidth / Least Load**

根據即時 CPU、網路、I/O 使用率分配。

✅ 適合：影音串流、CDN、雲端負載分配

❌ 實作複雜，需要實時監控

---

### **🧠** **Adaptive / AI-based Balancing（自適應負載）**

Envoy / GCP / AWS ALB 的進階演算法會根據：

- 請求延遲分佈
- 錯誤率
- 繁忙度
	-動態調整權重。

📌 實際上常基於 EWMA（指數加權移動平均）預測反應時間。

---
## **實務選擇建議**
| **場景**                | **建議演算法**                 | **理由**         |
| --------------------- | ------------------------- | -------------- |
| Web API（短請求）          | Round Robin / Weighted RR | 輕量簡單           |
| WebSocket / Streaming | Least Connections         | 長連線負載差異大       |
| 遊戲 / 聊天室              | Consistent Hash           | 需要 session 黏著性 |
| 分散式快取（Redis）          | Consistent Hash / Maglev  | 節點增刪平滑         |
| 高併發雲服務                | Power of Two Choices      | 分佈均衡 + 輕量      |
| 延遲敏感應用                | Least Response Time       | 動態調整效能         |

---

> 「Load Balancer 跟 API Gateway 到底是什麼關係？要自己寫還是用現成的服務？請求到底先經過哪一個？」

## **🧩 一、Load Balancer（負載平衡器）是什麼**

**角色定位：**
> LB 位於「網路層 / 傳輸層」或「應用層」的前端，用來把流量分配給多台後端伺服器。


它的主要任務只有兩個：
1. **分流（Distribute Traffic）**
2. **健康檢查 + 自動移除壞節點**

## **⚙️ 二、常見的 Load Balancer 服務（不用自己寫）**
  
在實務上，**99% 的情況你不會自己寫 LB**。
市面上已經有成熟且高可用的方案，分為「雲端型」與「自架型」。

|**分類**|**常見產品**|**備註**|
|---|---|---|
|☁️ **雲端托管型（Managed）**|AWS ELB / ALB / NLB、GCP Load Balancer、Azure Front Door|雲端服務自動擴展與維護，不需管理節點|
|🧱 **自架型（Open Source / 軟體LB）**|NGINX、HAProxy、Envoy、Traefik|通常部署在 Kubernetes / VM 上|
|🚀 **硬體LB（傳統企業）**|F5 Big-IP、Citrix ADC|貴、穩、用於銀行或資料中心|
|🧩 **Kubernetes 原生**|Service (ClusterIP / NodePort / LoadBalancer) + Ingress Controller|Ingress Controller 本質上是 L7 LB|

實務架構上：
Client → CDN (可選) → Load Balancer → API Gateway → 微服務群

### **🔄 流程說明**
1️⃣ **CDN / WAF（可選）**：做靜態資源快取、安全防禦。

2️⃣ **Load Balancer**：
- 分配到多台 API Gateway 節點。
- 健康檢查，確保只有健康節點接請求。

3️⃣ **API Gateway**：
- 做認證（JWT、OAuth2）
- 流控（Rate Limiting）
- 路由至對應微服務。


> **API Gateway 幾乎不會自己從零寫。**
> 正確做法是：
	- > 小規模：用 Nginx / Traefik
	- > 中大型：用 Kong / Envoy
	- > 高度客製：在現成 Gateway 上寫 Plugin



## **Load Balancer Health Check（健康檢查）**

> LB 會**定期測試後端伺服器的健康狀態**，
> 如果發現節點異常，就自動將它從流量分配池中移除，
> 確保使用者永遠只被導向「可用節點」。

常見方式

| **類型**             | **說明**                       | **範例**                      |
| ------------------ | ---------------------------- | --------------------------- |
| **TCP Check**      | 檢查指定 port 是否可連線              | 檢查 TCP 連接成功                 |
| **HTTP Check**     | 發送 HTTP GET/HEAD，檢查狀態碼是否 200 | /healthz 或 /ping            |
| **HTTPS Check**    | 同上但走 TLS，驗證證書有效性             | /status                     |
| **gRPC Check**     | 透過 gRPC 健康檢查服務               | grpc.health.v1.Health/Check |
| **Custom Command** | 執行自定義腳本或 SQL Ping            | 監控特殊業務邏輯                    |
### **📘 範例（Nginx）**

```
upstream backend {
    server 10.0.0.1:8080 max_fails=3 fail_timeout=10s;
    server 10.0.0.2:8080 max_fails=3 fail_timeout=10s;
}

# 每次請求前檢查 server 狀態，自動移除掛掉的節點
```

📌 AWS / GCP LB 也會內建健康檢查機制
例如 AWS ALB 會定期對 /healthz 發送 GET，
若連續 5 次失敗，就暫時將該 instance 移出 target group。


## **🧱 Load Balancer Redundancy（冗餘 / 高可用）**

> 避免「單一 LB 掛掉 → 整個服務停擺」。
> 要做到 **Load Balancer 自己也要有備援**。

 Load Balancer 基本上如果也是單點架構，也是有一定的風險，
 相關備援機制非常重要，常見做法：

| **類型**                         | **說明**                                                      | **圖解 / 備註**         |
| ------------------------------ | ----------------------------------------------------------- | ------------------- |
| **Active-Passive (主備切換)**      | 主 LB 處理流量，備 LB standby。主掛了自動切換（通常靠 VIP / VRRP / Keepalived） | 傳統企業常見              |
| **Active-Active (雙活)**         | 多台 LB 同時處理流量，前方用 DNS / Anycast / GSLB 導流                    | 雲端或大型系統             |
| **雲端 Multi-AZ / Multi-Region** | LB 部署在多可用區（AZ），流量自動 Failover                                | AWS ALB、GCP LB 原生支援 |
| **DNS 層冗餘 (GSLB)**             | 不同地區有多組 LB，DNS 根據延遲/健康狀態分配                                  | CDN、跨區部署常用          |
| **Kubernetes Ingress HA**      | 多個 ingress controller + External LB                         | 雲原生環境常見             |
