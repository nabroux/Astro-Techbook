---
title: "Real-time Transport Protocols (HTTP-based) (Short Polling, Long Polling, SSE, WebSocket, QUIC)"
lang: "zh"
translationKey: "real-time-transport-protocols-http-based-short-polling-long-polling-sse-websocket-quic"
published: true
tags: ["system design", "concept"]
---

參考資源：
https://www.youtube.com/watch?v=3Ud6Ds2abO8

| **範圍層級**          | **章節名稱**                                                         | **涵蓋主題**            | **層級說明**                             |
| ----------------- | ---------------------------------------------------------------- | ------------------- | ------------------------------------ |
| **網路傳輸層 / 連線協定層** | 🔹 **Short Polling vs Long Polling vs SSE vs WebSocket vs QUIC** | 討論「瀏覽器與伺服器如何即時連線」   | 偏向 _傳輸協定_、_HTTP 行為_、_通訊模式_           |
| **應用層 / 系統架構層**   | 🔹 **Real-time Communication (WebRTC, MQTT, AMQP)**              | 討論「分散式系統之間如何交換即時訊息」 | 偏向 _分散式通訊協定_、_IoT_、_Broker-based 通訊_ |

# **🌐 Real-Time Communication Protocols**

_Short Polling vs Long Polling vs SSE vs WebSocket vs QUIC_

## **💡 一、前言：為什麼需要「即時通訊」？**

在傳統 HTTP 模型中，
**瀏覽器只能「主動發請求 → 等回應」**。
但許多應用（聊天、通知、直播、股票報價）需要**伺服器主動推播資料**。  
為了實現這種「雙向即時互動」，
人類（工程師😎）發明了一系列技術：

> Short Polling → Long Polling → SSE → WebSocket → QUIC
> 每一代都更即時、更省資源。

---

## **⚙️ 二、比較總覽表**
| **技術**                       | **通訊方向**    | **底層協定**    | **是否保持連線** | **延遲** | **資源消耗** | **瀏覽器支援**       | **適合場景**  |
| ---------------------------- | ----------- | ----------- | ---------- | ------ | -------- | --------------- | --------- |
| **Short Polling**            | 客戶端拉取       | HTTP        | ❌ 短連線      | 高      | 高        | ✅               | 傳統系統兼容    |
| **Long Polling**             | 客戶端拉取（延遲回應） | HTTP        | ⏳ 半持續      | 中      | 中        | ✅               | 聊天、通知     |
| **SSE (Server-Sent Events)** | 伺服器推送（單向）   | HTTP        | ✅ 長連線      | 低      | 低        | ✅ (EventSource) | 即時更新、儀表板  |
| **WebSocket**                | 雙向          | TCP (ws://) | ✅ 持續連線     | 極低     | 低        | ✅               | 聊天、遊戲、股票  |
| **QUIC / HTTP/3**            | 雙向多路        | UDP         | ✅ 持續連線     | 極低     | 低        | ✅（現代瀏覽器）        | 高效傳輸、影音串流 |

---

## **🧩 三、Short Polling（短輪詢）**

> 客戶端每隔一段時間主動問伺服器：「有新消息嗎？」

### **🔹 機制：**

```
Client → Server: "有更新嗎？"
Server → Client: "暫時沒有"
(隔 5 秒)
Client → Server: "有更新嗎？"
Server → Client: "有！這是新資料"
```
### **✅ 優點：**

- 實作超簡單（傳統 HTTP 即可）
- 舊系統完全相容
### **❌ 缺點：**

- 延遲高（要等下一輪查詢）
- 伺服器負擔大（頻繁請求）
- 浪費頻寬與連線資源

### **💡 適用：**

> 後台批次查詢、舊式監控頁面、低頻通知

---

## **🕒 四、Long Polling（長輪詢）**

> 客戶端發出請求後，伺服器「暫不回應」，
> 等有新資料再回傳，或超時（例如 30 秒）。

### **🔹 機制：**

```
Client → Server: "請告訴我有新事件"
Server: （暫時掛起）
  ↓
有新事件！
Server → Client: "有更新"
Client → Server: "再開一條新連線"
```

### **✅ 優點：**

- 延遲低（幾乎即時）
- 無需額外協定（仍是 HTTP）
- 相容所有瀏覽器 
### **❌ 缺點：**

- 每次推送後要重建連線（有 overhead）
- 同時掛起大量連線會佔用伺服器資源
- 無法雙向通訊（Client 仍主動發出請求）

### **💡 適用：**

> 即時聊天（中低頻）、提醒通知、即時資料拉取

---

## **🔥 五、SSE（Server-Sent Events）**

> 伺服器主動透過「HTTP 單向長連線」持續推送事件。

📦 基於 **HTTP/1.1 keep-alive** 機制
使用 **text/event-stream** 格式。
### **🔹 機制：**

```
Client (EventSource) → Server (HTTP)
Server → Client:
data: new_message_1
data: new_message_2
```

### **✅ 優點：**

- 原生支援瀏覽器（EventSource API）
- 自動重連（連線斷掉自動重啟）
- 傳輸格式簡單（純文字流）
- 延遲極低
### **❌ 缺點：**

- 單向通訊（Server → Client）    
- 不支援二進位資料
- 不支援跨網域 POST

### **💡 適用：**  

> 即時監控面板、股票報價、新聞快訊、直播留言牆
### **📘 實作範例：**
```js
const evtSource = new EventSource("/events");
evtSource.onmessage = (e) => console.log("新事件:", e.data);
```

---

## **🔄 六、WebSocket（雙向即時通訊）**

> 🚀 真正的「全雙工」協定 —— Client 與 Server 可互相主動傳訊息。  
📦 底層是 **TCP 握手後升級協定**（HTTP Upgrade header）。

### **🔹 機制：**

```
Client ───┬──>  Server
          │        ↑
          ▼        │
    雙向即時資料傳輸（保持連線）
```

### **✅ 優點：**

- 全雙工（Client ↔ Server 皆可主動發送）
- 延遲極低（ms 級）
- 支援文字與二進位（binary）
- 可維持長連線，適合高頻互動

### **❌ 缺點：**

- 不走傳統 HTTP Cache / Proxy（除非特別支援）    
- 部署較複雜（需反向代理支援，如 Nginx、ALB）
- 不適合單向事件流

### **💡 適用：**

> 聊天室、遊戲同步、股票/幣價更新、協作編輯（Google Docs 類型）

---

## **⚡ 七、QUIC (Quick UDP Internet Connections)（HTTP/3）**

> 🔥 新一代傳輸協定，由 Google 開發，
> 結合 **UDP + TLS + Multiplexing**，
> 目標是取代 TCP + HTTP/2。

### **🔹 特點：**
|**特性**|**說明**|
|---|---|
|傳輸層|基於 UDP（不需三次握手）|
|安全性|內建 TLS 1.3|
|多路復用|同一連線可同時傳多個 Stream（不會 Head-of-Line Blocking）|
|快速重連|連線中斷可立即恢復（連線 ID）|
|適合應用|HTTP/3、WebRTC、即時串流|
### **✅ 優點：**

- 連線建立極快（比 TCP 快 30%）
- 移動裝置換網路（Wi-Fi → 4G）仍可保持連線
- 超適合低延遲應用
- QUIC 內建 TLS 1.3，加密層更深入。

### **❌ 缺點：**

- 實作複雜度高
- QUIC 建立在 UDP 上，而 UDP 常常被防火牆或 NAT 阻擋。
- 安全提升了，但可觀察性（observability）大幅下降，網管人員無法像監控 HTTP/TCP 一樣查看封包內容。


### **💡 適用：**

> 影音串流（YouTube、Netflix）、即時會議、雲端遊戲、WebRTC 傳輸底層

---

## **📘 八、選用建議**

|**使用情境**|**建議技術**|**理由**|
|---|---|---|
|舊系統、簡單查詢|**Short Polling**|無需改架構|
|即時通知、低頻更新|**Long Polling**|實作簡單、延遲低|
|即時資料推播、儀表板|**SSE**|單向、輕量、省資源|
|雙向互動（聊天、遊戲）|**WebSocket**|雙向即時、支援高頻更新|
|高頻影音傳輸 / 移動環境|**QUIC / HTTP/3**|UDP 底層、高效低延遲|

---

## **✅ 十、一句話總結**

> 💬 **Short Polling** 是「一直問」
> ⏳ **Long Polling** 是「等有再回」
> 🔁 **SSE** 是「伺服器主動說」
> ⚡ **WebSocket** 是「雙向聊天」
> 🚀 **QUIC** 是「TCP 的未來版」


**QUIC vs WebRTC**

> 🔹 **QUIC 是超進化版 TCP，用來傳資料。**
> 🔹 **WebRTC 是完整的影音即時通訊框架，用來「說話／看人」。**
> 它們的關係是：

```
QUIC = 傳輸技術
WebRTC = 使用者體驗（P2P影音框架）
```

> 👉 QUIC 更底層，WebRTC 建立在它之上。