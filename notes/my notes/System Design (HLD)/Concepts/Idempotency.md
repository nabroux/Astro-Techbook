---
title: "Idempotency（冪等性）"
lang: "zh"
translationKey: "idempotency"
published: true
tags: ["system design", "concept"]
---
# 🧱 Idempotency（冪等性）

## 🧩 一、定義

**Idempotency（冪等性）** 指的是：
不管同一個請求執行幾次，結果都一樣、不會造成副作用重複發生。

以數學語言表示：
```

f(f(x)) = f(x)

```

也就是「多次執行，結果不會改變」。


---

  

## 💡 二、白話例子


| 狀況                      | 是否冪等 | 說明               |
| ----------------------- | ---- | ---------------- |
| 查詢用戶資料 `GET /user/123`  | ✅ 是  | 查幾次都一樣，不影響狀態     |
| 刪除帳號 `DELETE /user/123` | ✅ 是  | 刪一次與刪十次結果都一樣     |
| 新增訂單 `POST /order`      | ❌ 否  | 多送幾次會多建立幾筆訂單     |
| 更新用戶資料 `PUT /user/123`  | ✅ 是  | 多次更新同樣內容不影響結果    |
| 增加餘額 `POST /deposit`    | ❌ 否  | 每次都會加錢（重複執行有副作用） |
  
---
## ⚙️ 三、為什麼要在 Webhook / API 中確保冪等性？

  
因為：
- 網路不穩、超時、重試常見（例如第三方服務會重送事件）
- 如果沒有冪等控制，可能導致「同一事件重複執行多次」
- 重複付款
- 重複寄信
- 重複入庫

**Webhook 與金融交易特別需要冪等性保證。**  

---
## 🧠 四、常見實作策略


### ✅ 1️⃣ 使用 Idempotency Key（冪等鍵）

客戶端在每次請求時附帶一個唯一識別碼：

```http

POST /payment

Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000

```

伺服器端邏輯：

```python

def create_payment(request):
	key = request.headers.get("Idempotency-Key")
	
	if key in cache:
		return cache[key] # 回傳之前的結果

	result = process_payment()
	cache[key] = result

	return result

```


---

### ✅ 2️⃣ 使用「唯一事件 ID」
  
Webhook 通常自帶事件編號：

```json

{

"id": "evt_123456789",

"type": "payment_succeeded"

}

```

你可以：
- 將事件 ID 存進資料庫（或 Redis）
- 若再收到相同 ID → 忽略處理

---

### ✅ 3️⃣ 使用交易 / 鎖機制（Database Transaction）

```sql

INSERT INTO payments (id, amount) VALUES ('evt_123', 100)
ON CONFLICT (id) DO NOTHING;

```

即使重複執行，也只會插入一次。


---

### ✅ 4️⃣ 在應用層設計「去重策略」

- 記錄最近已處理的事件 Hash / UUID
- 可結合 TTL（例如只保存近 24 小時的事件）
- 通常放在 Redis，查詢 O(1)

---
## 🔐 五、冪等與非冪等的 API 方法對照


| HTTP 方法 | 預期是否冪等   | 範例                            |
| ------- | -------- | ----------------------------- |
| GET     | ✅ 是      | 查詢資料                          |
| PUT     | ✅ 是      | 更新整個資源                        |
| DELETE  | ✅ 是      | 刪除資源                          |
| POST    | ❌ 否      | 新增資源（可透過 Idempotency Key 變冪等） |
| PATCH   | ⚠️ 視情況而定 | 更新部分欄位，取決於實作                  |
  
---
## 💡 六、實務場景舉例

### 📦 Stripe Webhook

- 每個事件有唯一 `event.id`
- Stripe 可能重送多次事件
- 官方建議：「伺服器要能根據 `event.id` 判斷是否已處理過」

### 🏦 銀行轉帳 API

- 每次轉帳請求都帶一個 `transaction_id`
- 後端只處理一次，重複傳相同 ID 會直接回「已完成」

---
  
## 🧱 七、與「重試機制」的關係

重試是為了「確保成功」
冪等是為了「確保不重複執行」

```

有重試 → 必須有冪等

```


否則在 timeout 重送時，就可能造成：

- 重複下單
- 重複扣款
- 重複通知

---

## 🚀 八、設計建議懶人包

| 主題      | 建議                                                |
| ------- | ------------------------------------------------- |
| 💡 核心觀念 | 同一請求多次執行結果一致                                      |
| 🔑 實作方式 | Idempotency Key / Event ID / DB unique constraint |
| 🧱 儲存位置 | Redis、DB、Message queue metadata                   |
| 🧩 典型應用 | 支付、Webhook、訂單建立、Email 寄送                          |
| ⚠️ 注意   | 伺服器端必須驗證與記錄，不可只靠前端                                |
| 🚀 目標   | 「重送沒事、只送一次生效」                                     |

---
## ✅ 總結一句話

> **Idempotency（冪等性）= 重送沒副作用的保險機制。**

在設計任何可能被重試、被重送的系統（例如 Webhook、交易 API）時，
冪等性是讓你「放心重送、不怕重複」的關鍵保護機制。

