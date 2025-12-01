---
title: "Webhooks 詳解"
lang: "zh"
translationKey: "webhooks"
published: true
tags: ["system design", "concept"]
---

# 🧩 Webhooks 詳解

## 一、什麼是 Webhook？


**Webhook** 是一種由伺服器主動發出的 **HTTP 回呼（callback）** 機制。
當某個事件發生時，系統會主動以 **HTTP POST** 的方式，把事件資料推送到另一個指定的 URL。

> Webhook = 「事件 → 自動發通知給你的伺服器」

  
**例子：**

- Stripe 收到付款成功 → `POST` 一筆交易資訊到 `/stripe/webhook`

- GitHub 有人 push → `POST` JSON payload 到 `/github/events`

- Slack 有人發訊息 → `POST` 到 `/slack/incoming`

  

---

## 二、Webhook 的流程架構
  

```

[ 事件來源系統 ]

│

│ (1) 事件發生 (e.g. user paid)

▼

[ Webhook Sender ]

│

│ (2) 發送 HTTP POST

▼

[ Webhook Receiver (你的伺服器) ]

│

│ (3) 處理 JSON payload

▼

[ 執行後續動作 (update DB, 通知, callback...) ]

```

  

---
## 三、Webhook vs 傳統 API

| 項目   | Webhook          | 傳統 API           |
| ---- | ---------------- | ---------------- |
| 主動方  | 事件源（server push） | 使用者（client pull） |
| 傳輸方式 | HTTP POST 推送     | HTTP GET/POST 請求 |
| 時間特性 | 即時（事件觸發）         | 定期輪詢             |
| 節省頻寬 | ✅（只有事件發生才傳）      | ❌（需要一直查）         |
| 用途   | 通知、整合、事件觸發       | 查詢、操作資源          |


> Webhook 就像「反向 API」：不是你問它資料，而是它主動把資料丟給你。

  

---

## 四、Webhook 的關鍵要素

  
| 元素                | 說明                                                               |
| ----------------- | ---------------------------------------------------------------- |
| **Endpoint URL**  | 你提供給對方的接收位址，例如 `https://api.example.com/webhook/stripe`          |
| **HTTP Method**   | 通常是 `POST`（也可能是 `PUT`）                                           |
| **Headers**       | 包含 `Content-Type`（通常 `application/json`）、簽章驗證（如 `X-Signature`）   |
| **Payload Body**  | JSON 格式事件資料，例如：<br>`{"event":"payment_succeeded","amount":1000}` |
| **Response Code** | 200/2xx 表示接收成功；非 2xx 會重試                                         |


---

## 五、實際例子：Stripe Webhook


### 1️⃣ Stripe 發送

```http

POST https://yourdomain.com/webhook/stripe

Content-Type: application/json

Stripe-Signature: t=12345,v1=abcd1234...

  

{

"id": "evt_1234",

"type": "payment_intent.succeeded",

"data": { "object": { "amount": 1000, "currency": "usd" } }

}

```

  
### 2️⃣ 你的伺服器處理

- 驗證簽章
- 更新資料庫
- 發送通知 / Email

  
### 3️⃣ 回應

```http

HTTP/1.1 200 OK

```

  

---
## 六、安全設計重點

| 技術                                  | 說明                                                   |
| ----------------------------------- | ---------------------------------------------------- |
| ✅ **簽章驗證 (Signature Verification)** | 發送端在 Header 加上簽章（HMAC-SHA256），接收端用 secret 驗證防偽造。     |
| 🔐 **HTTPS**                        | 一定要走 HTTPS 避免竊聽。                                     |
| 🧱 **驗證來源 IP**                      | 像 GitHub、Stripe 會公布 Webhook IP 範圍。                   |
| ⏱️ **Timeout + Retry**              | 接收端要快速回 200；超時對方會重試。                                 |
| 🧾 **冪等設計 (Idempotent)**            | 同一事件可能被送多次，要保證不重複處理。                                 |
| 📦 **排隊機制**                         | 若處理需要時間，可先放入 message queue（如 RabbitMQ、Kafka、Celery）。 |
  

### Python 範例：簽章驗證

```python

import hmac, hashlib

  

def verify_signature(payload, header_signature, secret):

computed = hmac.new(

secret.encode(), payload, hashlib.sha256

).hexdigest()

return hmac.compare_digest(computed, header_signature)

```

  

---

  

## 七、Webhook 設計最佳實踐


| 主題           | 建議                                       |
| ------------ | ---------------------------------------- |
| **Endpoint** | 使用專屬路由 `/webhook/<source>`，避免與一般 API 混用。 |
| **響應時間**     | 處理邏輯重的話，先回 200，後台異步處理（用 MQ）。             |
| **重試與冪等**    | 使用事件 ID 確保不重複處理。                         |
| **監控與重送**    | 記錄所有 Webhook 事件，提供 dashboard / replay。   |
| **驗證與加密**    | 簽章 + HTTPS + IP 白名單。                     |
  
---

## 八、FastAPI 實作範例
  

```python

from fastapi import FastAPI, Request, HTTPException

import hmac, hashlib

  

app = FastAPI()

WEBHOOK_SECRET = "mysecretkey"

  

@app.post("/webhook/stripe")

async def stripe_webhook(request: Request):

	payload = await request.body()

	signature = request.headers.get("Stripe-Signature")

  

	computed = hmac.new(WEBHOOK_SECRET.encode(), payload, hashlib.sha256).hexdigest()

	if not hmac.compare_digest(computed, signature):

	raise HTTPException(status_code=400, detail="Invalid signature")

  

data = await request.json()

event_type = data["type"]

  

if event_type == "payment_intent.succeeded":

print("✅ 收款成功！")

# update DB, send email...

  

return {"status": "ok"}

```

  

---

  

## 九、Webhook vs Polling vs Queue


| 模式                | 資料傳遞方式                   | 延遲    | 效能   | 常見應用      |
| ----------------- | ------------------------ | ----- | ---- | --------- |
| **Webhook**       | 事件推送（HTTP POST）          | 低（即時） | 高效   | 外部整合、通知   |
| **Polling**       | 週期性查詢（GET）               | 中高    | 浪費頻寬 | 前端輪詢、狀態查詢 |
| **Message Queue** | 內部非同步消息（Kafka, RabbitMQ） | 可控    | 高效   | 微服務內部通訊   |
  

> Webhook 適合外部系統整合；內部服務之間用 MQ。  

---

  

## 十、Webhook 在微服務中的角色

  

Webhook 可作為 **事件觸發器（Event Trigger）**：

  

```

[ Payment Service ] --(Webhook)--> [ Notification Service ]

└--> [ CRM Service ]

```

  

當一個服務完成任務（例如付款成功），

可用 Webhook 通知其他服務執行後續動作，避免耦合。

  

---

  

## 十一、常見支援 Webhook 的平台

  
| 平台                    | 用途                    |
| --------------------- | --------------------- |
| GitHub / GitLab       | push / PR / deploy 通知 |
| Stripe / PayPal       | 支付成功 / 退款事件           |
| Slack / Discord       | Bot、訊息事件              |
| Notion / Airtable     | 資料更新回呼                |
| Vercel / Netlify      | 部署完成通知                |
| Cloudflare / Telegram | 網路事件、Bot 整合           |

  

---

  

## 十二、總結懶人包


| 主題 | 重點 |
|------|------|
| 📩 **Webhook 定義** | 事件驅動、HTTP 推送通知 |
| 🧠 **與 API 差別** | 被動 vs 主動；輪詢 vs 回呼 |
| ⚙️ **組成元素** | Endpoint、Payload、Header、簽章 |
| 🔒 **安全** | 簽章驗證、HTTPS、冪等、防重送 |
| 💡 **實作** | 設 `/webhook/<source>` endpoint，POST JSON，回 200 |
| 🚀 **應用場景** | 支付通知、GitHub push、CI/CD 整合、事件觸發 |

---


_最後建議：_

實務上建立 webhook receiver 時，

要 **快速回應 + 簽章驗證 + 冪等處理 + 重試機制**，

這樣才能應付外部服務不穩定或事件重送的情況。