---
title: "Rate Limiting"
lang: "zh"
translationKey: "rate-limiting"
published: true
tags: ["system design", "concept"]
---
Rate limiting 是所有大型系統都會實作的機制，用來防止：

- 惡意或爆量請求（DDoS / bot 攻擊）
- API 資源被濫用（免費額度、頻寬）
- 後端服務過載

# **🚦 Rate Limiting（速率限制）詳解**

## **一、概念說明**  

> **Rate Limiting** 是一種控制「在指定時間內，使用者（或 IP / Token）」
> 可發送的最大請求數的機制。


例如：

- 每個使用者每秒最多 10 次請求
- 每個 IP 每分鐘最多 100 次登入嘗試
  
**違反者** → 回傳 HTTP 429 Too Many Requests

---

## **二、為什麼要做 Rate Limiting？**

| **目的**          | **說明**              |
| --------------- | ------------------- |
| 🧱 **保護系統穩定性**  | 避免高併發讓後端掛掉          |
| 🛡️ **防止濫用與攻擊** | 阻擋爆量或惡意請求           |
| 💰 **控制成本**     | 雲端 API / 外部服務常依用量計費 |
| ⚙️ **公平分配資源**   | 避免單一使用者吃光頻寬         |

## **三、常見演算法總覽**

|**演算法**|**特點**|**優點**|**缺點**|
|---|---|---|---|
|**Fixed Window Counter**|固定時間窗口計數|簡單易實作|邊界效應 (boundary burst)|
|**Sliding Window Log**|精確記錄每次請求時間|精準、公平|記憶體成本高|
|**Sliding Window Counter**|混合前後兩窗平均|平滑、效能佳|實作稍複雜|
|**Token Bucket**|令牌桶演算法|支援突發流量|設定難度中等|
|**Leaky Bucket**|漏斗桶演算法|控制輸出速率穩定|不支援突發流量|
## **四、演算法逐一詳解**
### **🧮 1️⃣ Fixed Window Counter（固定時間窗口）**

#### **📘 概念**

將時間分成固定區段（例如每分鐘一段），
在每段期間內允許最多 N 次請求。

#### **🔧 範例**

```
限流規則：每分鐘最多 100 次
```

若 12:00:00～12:00:59 間發出 100 次請求 → 之後全部拒絕
到 12:01:00 重置計數。

#### **⚙️ 實作（Redis）**
```python
key = f"req:{user_id}:{current_minute}"
count = redis.incr(key)
if count == 1:
    redis.expire(key, 60)
if count > 100:
    return 429
```

#### **⚠️ 缺點**
在「邊界」容易出現 burst，例如：

12:00:59 發 100 次 + 12:01:00 發 100 次
→ 短時間內其實 200 次

---
### **🧮 2️⃣ Sliding Window Log（滑動窗口記錄）**

#### **📘 概念**
對每次請求記錄時間戳（timestamp log），
刪除超出時間窗的記錄，計算當前窗內的請求數。

#### **🔧 範例**
- 限制：每分鐘 100 次
- 請求時：
    - 移除超過 60 秒的舊紀錄
    - 計算剩下多少次
    - 若 < 100 → 通過並新增當前時間

#### **⚙️ Redis 實作（用 Sorted Set）**
```python
now = time.time()
window = 60
key = f"req:{user_id}"
redis.zremrangebyscore(key, 0, now - window)
count = redis.zcard(key)
if count >= 100:
    return 429
redis.zadd(key, {now: now})
```
#### **✅ 優點**
- 精準、公平
- 適合高安全要求（API Gateway）
#### **⚠️ 缺點**
- 需要儲存所有時間戳 → 記憶體佔用大

---

### **🧮 3️⃣ Sliding Window Counter（滑動計數平均）**
#### **📘 概念**
介於 fixed window 和 log 之間，
將前一個與當前窗口的請求數做加權平均。

#### **🔢 計算公式：**
```
current_rate = prev_count * overlap_ratio + current_count
```

#### **✅ 優點**
- 平滑邊界，減少突發效應
- 不用儲存全部時間戳
- 效率接近 Fixed Window
#### **⚠️ 缺點**
- 稍複雜，需要處理重疊比例

---

### **🧮 4️⃣ Token Bucket（令牌桶演算法）（最推薦）**
#### **📘 概念**
系統維持一個「令牌桶」，
- 按固定速率往桶裡加令牌
- 每次請求消耗一個令牌
- 桶滿則不再加；桶空則拒絕請求
  
#### **📊 規則例：**
- 桶容量：100 個令牌
- 加入速率：每秒 10 個
- 若桶空 → 回 429 Too Many Requests

#### **⚙️ 實作邏輯**
```python
def allow_request(bucket):
    now = time.time()
    elapsed = now - bucket["last_refill"]
    refill = elapsed * bucket["rate"]
    bucket["tokens"] = min(bucket["capacity"], bucket["tokens"] + refill)
    bucket["last_refill"] = now

    if bucket["tokens"] >= 1:
        bucket["tokens"] -= 1
        return True
    return False
```

#### **✅ 優點**
- 支援短期突發流量（burst）
- 常用於 CDN、API Gateway
#### **⚠️ 缺點**
- 實作比 fixed window 複雜
---
### **🧮 5️⃣ Leaky Bucket（漏桶演算法）**
#### **📘 概念**

想像一個漏斗：
- 請求以任意速度進入桶中
- 以固定速率「漏出」處理
當桶滿時，多餘的請求被丟棄。

#### **📊 特性**
- 控制輸出速率穩定（平滑化流量）
- 不支援突發流量（會直接掉封包）

#### **✅ 優點**
- 適合穩定輸出（例如排程系統、隊列節流）
- 實現簡單（queue + 固定速率消耗）
#### **⚠️ 缺點**
- 對突發流量不友好

# **🧠 實務建議**
| **規模**    | **建議實作層級**                | **理由**          |
| --------- | ------------------------- | --------------- |
| 小型 / 單機應用 | 應用層限流 (middleware)        | 簡單易控、維護方便       |
| 中型 / 多實例  | API Gateway + Redis       | 中央化控管、支援多節點     |
| 大型 / 全球性  | CDN + Gateway + Mesh 三層限流 | 多層防護、分層責任、可彈性調整 |
| 安全高敏感系統   | Gateway + 應用層雙重限流         | 防外部與內部誤觸發       |

# **✅ 總結一句話**

> **Rate Limiting 通常分層實作：**
- > CDN 層 → 阻擋惡意流量
- > Load Balancer / Gateway → 控制 API 流量
- > 應用層 → 控制商業邏輯
- > Service Mesh → 控制內部通訊