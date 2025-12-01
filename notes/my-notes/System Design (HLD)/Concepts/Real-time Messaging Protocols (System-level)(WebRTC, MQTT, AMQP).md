---
title: "Real-time Messaging Protocols (System-level)(WebRTC, MQTT, AMQP)"
lang: "zh"
translationKey: "real-time-messaging-protocols-system-level-webrtc-mqtt-amqp"
published: true
tags: ["system design", "concept"]
---

WebRTC 
https://www.youtube.com/watch?v=WmR9IMUD_CY

MQTT vs AMQP
https://www.youtube.com/watch?v=fm4wqrh0LFw&t=47s

## **💡 一、為什麼需要「即時通訊」？**

在一般 HTTP 架構中（Request → Response）：

- 用戶端發出請求後，伺服器才回應。
- 沒有人主動通知用戶端「有新事件」。

但現代應用常常需要「即時互動」：

- 💬 聊天室、即時通知、打字中提示
- 📈 股票/幣價更新
- 🎮 多人遊戲狀態同步
- 🎥 視訊通話、直播串流
- 🏠 IoT 裝置即時回報狀態

這些都需要「**持續的連線通道**」，
讓伺服器能主動推送資料。

---

## **🔁 二、常見的即時通訊技術對照**

|**技術**|**傳輸協定**|**通訊模式**|**用途**|
|---|---|---|---|
|**WebSocket**|TCP|雙向、持久連線|一般即時應用（聊天室、遊戲）|
|**WebRTC**|UDP（SRTP + STUN/TURN）|雙向、多媒體|音影片傳輸、P2P 互動|
|**MQTT**|TCP|發布/訂閱（Pub/Sub）|IoT、輕量設備通訊|
|**AMQP**|TCP|發布/訂閱 + 佇列|企業級訊息系統（RabbitMQ）|
|**Server-Sent Events (SSE)**|HTTP (單向)|伺服器推送|簡易通知流（低頻）|

---

## **🌐 三、WebRTC：瀏覽器之間的即時媒體通訊**

> **WebRTC (Web Real-Time Communication)** 是一套由 Google 推出的開放標準，
> 讓兩個瀏覽器或裝置能**直接互相傳輸影音與資料**。

### **🎯 用途：**

- 視訊會議（Google Meet、Zoom、LINE）
- 即時音訊（Discord、Clubhouse）
- P2P 傳檔（Firefox Send、Snapdrop）
- 遊戲串流、遠端控制

---
### **⚙️ 運作流程圖：**

```
A ──(Offer)──▶ Signaling Server ──(Answer)──▶ B
A ◀─(ICE Candidate)──▶ B (透過 STUN/TURN)  
A ⇄ B 建立 P2P 連線
```

💡 WebRTC 不是傳輸協定，而是一整套機制：

|**組件**|**功能**|
|---|---|
|**STUN**|找出裝置的公共 IP（穿透 NAT）|
|**TURN**|若無法直連，經由中繼伺服器轉發|
|**Signaling Server**|初始協商通訊用（通常走 WebSocket）|
|**SRTP**|安全媒體傳輸協定，保證音影片加密|

---

### **🧠 特點：**

- ✅ P2P 架構：低延遲、高效率
- 🔒 預設加密（SRTP / DTLS）
- ⚠️ 不保證 100% P2P（防火牆情況下需 TURN relay）
- 🚀 可傳 **媒體流（Audio/Video）** 與 **DataChannel（任意資料）**

---

### **📘 實務範例（WebRTC DataChannel）：**

```js
const pc = new RTCPeerConnection();
const channel = pc.createDataChannel("chat");

channel.onmessage = e => console.log("收到:", e.data);
channel.onopen = () => channel.send("Hello!");

navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  .then(stream => pc.addTrack(stream.getTracks()[0], stream));
```

---

## **📡 四、MQTT：輕量的 IoT 通訊協定**

> **MQTT (Message Queuing Telemetry Transport)**
> 是專為 **IoT 裝置與低頻寬環境** 設計的「發布/訂閱（Pub/Sub）」訊息協定。

---

### **💬 運作模式：**

```
Client A → (Publish: topic="sensor/temp") → MQTT Broker
Client B → (Subscribe: "sensor/#") ← MQTT Broker
```

🧩 角色說明：

|**元件**|**功能**|
|---|---|
|**Publisher**|發布訊息|
|**Subscriber**|訂閱主題（topic）|
|**Broker**|中介者（轉發訊息）|

### **⚙️ 協定特性：**
|**特點**|**說明**|
|---|---|
|傳輸層|TCP（可封裝於 WebSocket）|
|輕量封包|適合微控制器（ESP32、Raspberry Pi）|
|QoS 等級|三層可靠度保證|
|保留訊息（Retained Message）|新訂閱者可立即收到最後一筆狀態|
|斷線持續會話|Client 重新連線可補收未處理訊息|

📊 QoS 等級：

|**等級**|**意義**|**保證**|
|---|---|---|
|0|At most once|不保證送達|
|1|At least once|可能重送|
|2|Exactly once|最可靠但開銷最大|

### **🧠 適用場景：**

- 🏠 IoT（智慧家居、感測器、機台）
- 📱 即時狀態回報（App online/offline 狀態）
- 🚗 車聯網（車輛位置同步）

---
### **📘 實務範例：**

```python
import paho.mqtt.client as mqtt

def on_message(client, userdata, msg):
    print(f"收到 {msg.topic}: {msg.payload.decode()}")

client = mqtt.Client()
client.connect("broker.hivemq.com", 1883)
client.subscribe("home/livingroom/temp")
client.on_message = on_message
client.loop_forever()
```

## **📨 五、AMQP：企業級訊息佇列協定**

> **AMQP (Advanced Message Queuing Protocol)**
> 是一種針對「可靠訊息傳遞」設計的協定標準，
> 代表實作：**RabbitMQ、ActiveMQ、Azure Service Bus**。

### **📦 結構概念：**
Publisher → Exchange → Queue → Consumer

| **元件**       | **功能**                                      |
| ------------ | ------------------------------------------- |
| **Exchange** | 負責「路由」訊息（fanout / direct / topic / headers） |
| **Queue**    | 暫存訊息直到被消費                                   |
| **Consumer** | 接收並處理訊息                                     |
### **⚙️ 特點：**

- 基於 TCP、具備確認機制（ACK）
- 支援交易（Transactional Message）
- 可設定重試、延遲、死信佇列（DLQ）
- 適合可靠傳遞要求高的系統（金融、訂單、工作任務）

### **📘 實務範例（Python pika）：**
```python
import pika

connection = pika.BlockingConnection(pika.ConnectionParameters("localhost"))
channel = connection.channel()

channel.queue_declare(queue="tasks")

channel.basic_publish(exchange="", routing_key="tasks", body="Hello World")
print("訊息已送出")

def callback(ch, method, properties, body):
    print(f"收到任務: {body.decode()}")
    ch.basic_ack(delivery_tag=method.delivery_tag)

channel.basic_consume(queue="tasks", on_message_callback=callback)
channel.start_consuming()
```

## **🧮 六、MQTT vs AMQP vs WebRTC 對比**
|**協定**|**模式**|**傳輸層**|**重點**|**適用**|
|---|---|---|---|---|
|**WebRTC**|P2P、雙向|UDP|音影片即時傳輸|視訊通話、互動遊戲|
|**MQTT**|Pub/Sub|TCP|輕量、低耗能|IoT、感測資料|
|**AMQP**|Pub/Sub + Queue|TCP|可靠性高、保證送達|金融、企業任務系統|

---

## **🔐 七、即時系統設計小抄**

|**挑戰**|**解法**|
|---|---|
|**防止訊息重複處理**|使用訊息 ID + 去重邏輯|
|**掉線重連**|MQTT session resume / WebRTC ICE restart|
|**防止資料丟失**|QoS=2（MQTT）或 ACK 機制（AMQP）|
|**防火牆問題**|WebRTC TURN / MQTT over WebSocket|
|**訊息順序問題**|用 message timestamp 或 sequence ID|
|**多客戶端廣播**|Broker（MQTT / AMQP）或 SFU（WebRTC）|

---

## **🧭 八、實際應用案例**

| **系統**              | **使用協定**           | **說明**      |
| ------------------- | ------------------ | ----------- |
| **Zoom / Meet**     | WebRTC             | 即時視訊通話      |
| **Discord / Slack** | WebSocket + WebRTC | 訊息 & 語音聊天室  |
| **Tesla / IoT 家電**  | MQTT               | 車輛 / 感測資料上報 |
| **Binance / Bybit** | WebSocket / AMQP   | 即時行情與訂單簿    |
| **銀行交易系統**          | AMQP               | 訂單佇列、重試機制   |

---

## **🧩 九、整合架構示意**

```
             ┌──────────────────────┐
             │   Web App / Mobile   │
             │   (WebRTC + MQTT)    │
             └─────────┬────────────┘
                       │
             ┌─────────▼─────────┐
             │   Realtime Gateway │
             │  (WebSocket Server)│
             └─────────┬─────────┘
                       │
        ┌──────────────┼──────────────┐
        │                              │
  ┌─────▼─────┐                ┌───────▼──────┐
  │  MQTT Broker │              │   AMQP Broker │
  │ (IoT Streams)│              │ (Tasks / Jobs)│
  └──────────────┘              └──────────────┘
```


---

## **✅ 十、一句話總結**

> ⚡ **WebRTC 傳媒體、MQTT 傳感測、AMQP 傳任務。**

- > WebRTC = 真即時（低延遲、多媒體）    
- > MQTT = 輕量連線（IoT 最愛）
- > AMQP = 穩重可靠（企業後端首選）

> 🧠 選擇原則：

- > 「速度」優先 → WebRTC / WebSocket
- > 「省電穩定」→ MQTT    
- > 「可靠保證送達」→ AMQP

