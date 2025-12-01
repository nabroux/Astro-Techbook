---
title: "Designing Rate Limiter"
lang: "zh"
translationKey: "designing-rate-limiter"
published: true
tags: ["system design", "example"]
---
https://www.youtube.com/watch?v=MIJFyUPG4Z4

https://www.hellointerview.com/learn/system-design/problem-breakdowns/distributed-rate-limiter


一台redis一秒大概可以處理10萬流量 兩個動作就除以2，5萬流量

redis cluster 不是用  Consistent Hashing 而是 hash slot 

Redis Lua scripting 可以解決 Race condition

Rate Limiter 對 Redis 要用長連線池，不要每次重新連

三種方案，trade-off

演算法參考  [[Rate Limiting]]

---


Delivery Framework here

![Pasted image 20251107104539](<assets/Designing Rate Limiter/Pasted image 20251107104539.png>)

Funtional Requirements
- identify users by id IP or API key
- limit requests based on configurable rules
- return proper error and status code

詢問面試官，這是個什麼面相的限流器，面向使用者端像是社群平台嗎？
不用問是不是後端限流，一定是後端，前端限流沒意義使用者可以偽造

Scale
- 100M DAU 一億每日活躍用戶
- 1M rps (requests per second)

這邊列出來的都會被問，也要能做到，要特別注意
Non-functional requirements
- availability >> consistency  社群平台，可以犧牲一致性 高分區容錯、高可用性才是中店
- low latency rate limit checks (<10 ms) 單純列出 low latency 意義不大
- scalable to 1M rps

問一下面試官，我有漏掉什麼嗎？還有哪裡要補充嗎？otherwise im ready to move on


### Core Entities
- Request
- Client (IP, userId, Api key)
- Rules (100 rps)


### System Interface

isRequestedAllowed(clientId, rulesId) -> {is_allowed: boolean, remaining: number, resetTim: timestamp}


### High-level Design
1. where should we place the rate limiter?
2. how should we identify clients?


![Pasted image 20251106021653](<assets/Designing Rate Limiter/Pasted image 20251106021653.png>)

放在各個微服務：
優點：速度很快，都是in-memory，但缺點很明顯 沒有global picture，無法正確限流

那如果把RL拉出來 獨立成一個服務呢？

![Pasted image 20251106022420](<assets/Designing Rate Limiter/Pasted image 20251106022420.png>)

解決了微服務間沒有global picture的問題，但會應加 latency，在Non-functional Requirements中我們有提出要讓延遲降低至10ms。

![Pasted image 20251106022533](<assets/Designing Rate Limiter/Pasted image 20251106022533.png>)

如果把 RL 移動到 gateway，可以扮演門衛角色，速度也會快 因為in-memory
問題是不會知道後端應用層邏輯，不能像後端彈性調整，但可以透過JWT夾帶分析使用者的身份資訊  clienId, API key, IP

可以問面試官：使用者有身份驗證過嗎？

這邊可以做混合式的有驗證過的使用者套用規則，沒驗證的可能會套用通用規則，限制單IP流量的規則，透過這個方式保護服務



### Rate limiting algorithm 

**fixed window counter** 
最單純容易實作的方案，但可能會有邊界爆發的問題 boundary effect，在邊界兩邊爆量請求，可能會產生超出預期的請求量。

**Sliding Window Log**
平滑處理解決 Fixed-window 的問題
- implemented with a heap, using more memory
- **對每一個 key（user / IP / API-key）**，維護一個資料結構：
- 一個 **min-heap**（小根堆），元素是 request_timestamp
- 或者你也可以存 (timestamp, request_id)，但通常只需要 timestamp

為什麼是 **min-heap**？
> 因為我們每次都只關心「最舊的請求是哪一個？」
> 這樣才能把「已經超過 window 的請求」全部移除。
> min-heap 的 heap[0] 永遠是**最小的 timestamp**，
> 所以可以很快知道哪一些是過期的。
> 你也可以用 queue 實作，因為 timestamp 是隨時間不斷增加的。
> 用 heap 是更 general 的版本（例如事件來源可能不是完全單一時間序）。

**Sliding Window Counter**
舉例：前一分鐘8個請求，目前分鐘經過了42秒，已經有了6個請求
時間經過了70%(42秒)，所以 6 + (30% * 8) = 8.4，假設我們的請求門檻是 10 ，8.4 < 10 所以有過


### Token Bucket
業界常用，AWS、Stripe 等等的都是用這模式
token refilled at a steady rate 
remove 1 token each request, If no tokens in bucket, reject
桶子大小就是最大請求接受數，解決爆量問題，補充token速率 則可以控制瞬間吞吐量

實作容易，只要管理兩個數字：tokens、last_refill_time
有請求來的時候
```
1. 計算時間差：delta = now - last_refill_time
2. 根據速率補充：new_tokens = delta * refill_rate
3. 更新桶內令牌：
   tokens = min(capacity, tokens + new_tokens)
   last_refill_time = now
4. 令牌有剩的話請求通過
```


實際情況可能會有多個 Gateway，這時候就要使用Redis
![Pasted image 20251107111951](<assets/Designing Rate Limiter/Pasted image 20251107111951.png>)

What happens here:
1. request come in
2. gateway fetch token and last_refill_time from redis HMGET ex. frankie:bucket tokens last_refill_time
3. Update counts based on rate and last_refill_time
4. Respond pass or fail based on if tokens > 0
5. Update bucket status

### Race Condition ?

ex. gateway A, gateway B  同時要從Redis取資料 it has to be atomic
可以透過 Lua scripting 來維持一致性避免race condition

Lua Scripting
1. read from redis
2. write back to redis


回到第三個 functional request，回傳相關錯誤、資訊、status code
這邊一定要用到 429 too many requests ，這個 status code就是專門為這種情況產生的

以下這些不一定要記，偏深，但可提

Example 429 response
```r

HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1640995200
Retry-After: 60
Content-Type: application/json

{
  "error": "Rate limit exceeded",
  "message": "You have exceeded the rate limit of 100 requests per minute. Try again in 60 seconds."
}

```



### 最後階段 Deep dive - 處理 non-functional requirements

#### 先來看看scalability的部分

目標是 1M rps，一個 Redis 大概可以處理 100k rps
但我們做兩個動作 HMGET HMSET （在實作token bucket的時候）所以處理流量一台redis保守估計除以2 = 50k rps。

1M / 50k = 需要至少 20個 redis instance，可能還需要抓個備用10% 保險起見
怎麼知道我們需要的資料在哪一台實例，理論上可以用 consistent hashing 方式，
但實務上會直接用Redis cluster，Redis 直接是用 Hash slots的方式而不是 consistent hashing


#### 下一個是 High Availability

如果某一台Redis掛掉怎麼辦？

首先評估一下 沒有正確答案
fail open（失敗照樣開著，服務就沒受到limiter保護）
fail close（整個服務請求不給進，保護服務不被攻擊）

折衷方案：如果Redis 掛掉了，使用最單純的fixed window counter方案 直接在Gateway節點 in-memory，至少還能運作，也有一定基礎保護，暫時性的，等redis修復回來就沒事了

再來就是 redis replica，Redis 本來就有這樣的設置可以調整，主從架構


#### 再來一個 non-functional requirements，latency < 10ms

redis 的處理速度是毫秒級的，有網路連線或是額外操作會影響很多

1. 使用長連線池，避免重複連線，降低延遲，redis本身就有這個設置
2. 地理位置部署，gateway部署在使用者最多的地方


#### 如果要動態調整 rate limiter 怎麼設計？

poll-based
設計另外一個後端服務、資料庫來提供動態調整服務，gateway定期(每10秒之類的)拉取新規則資料，定期polling的問題就是非即時（看定期拉取的間隔）、做這種constant polling 浪費gateway效
能。

push-based
zookeeper or etcd 就是被設計來處理 分散式系統的configuration，可以主動推送到有連線的實例TCP接口。



Use a push-based system where configuration changes are immediately sent to all API gateways. This is exactly what [ZooKeeper](https://www.hellointerview.com/learn/system-design/deep-dives/zookeeper) was designed for - distributed configuration management with real-time notifications. ZooKeeper maintains configuration data and notifies all connected clients (your API gateways) immediately when any configuration changes. Other options include Redis pub/sub or custom configuration services that maintain persistent connections to gateways.

When an operator changes a rate limit rule, the configuration service immediately notifies all connected gateways, which update their rules within seconds.

![Pasted image 20251107121246](<assets/Designing Rate Limiter/Pasted image 20251107121246.png>)
###### Challenges

This approach adds a lot more complexity. You need to handle connection failures, ensure all gateways receive updates, and deal with partial failures where some gateways update successfully while others don't. You also need fallback mechanisms when the push system is unavailable.

The operational complexity is usually only justified for systems that need very fast rule updates, like those dealing with security incidents or high-frequency trading scenarios.


# What about Load Balancer

- ✅ 如果你要的是「**全局精準的 per-user / per-IP Rate Limit**」    
    → 那 Rate Limiter 必須是「集中視角」：
    - 放在 **LB / API Gateway 層**，或
    - 雖然在後端服務裡跑，但 **用 shared storage（Redis）共用計數**
    
- ❌ 如果只是「每台機器自己 in-memory 算」
    → 被 LB 分流之後就一定**不準**（只會是「per-instance 限流」）


> **Load Balencer：專注在“連線、流量、分配”。不懂 API。**
>   
> **API Gateway：專注在“API 管理、策略、認證、限流”。懂 API。**




### English Mock Interview Script (~40 minutes)
- Timing cues are just guidance; speak naturally and keep answers crisp but complete.

**0-3 min | Warm-up**
Interviewer: "In one or two sentences, what is a rate limiter and why does it matter?"
Candidate: "A rate limiter controls how many requests a client can make in a given window so we protect shared resources, keep latency predictable, and enforce fair usage tiers."
Candidate (optional follow-up): "For this scenario, are we prioritizing protecting downstream services from abuse, enforcing paid API tiers, or both?"

**3-8 min | Requirements + Scope**
Interviewer: "List the functional requirements." 
Candidate: "Identify the caller (IP, user ID, API key), enforce configurable limits per rule, return allow/deny, and surface remaining quota plus a clear error/status when blocked."
Interviewer: "Non-functional requirements?"
Candidate: "Availability over strict consistency, single-digit millisecond check time (<10ms), scale to ~1M rps, horizontal scale, and predictable latency even under bursts."
Candidate (ask): "Should limits be per IP, per authenticated user, per API key, or org-level? Do we have different tiers (free/pro/enterprise)?"
Interviewer: "How do you return feedback?"
Candidate: "HTTP 429 with `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`, and `Retry-After`; JSON body with a clear message."

**8-15 min | Traffic + Interfaces**
Interviewer: "Capacity plan for 1M rps—how many Redis nodes?"
Candidate: "Redis handles ~100k rps per instance; our flow does HMGET+HMSET, so I budget ~50k rps/node → ~20 nodes plus ~10% buffer."
Candidate (ask): "Is traffic spiky (product launches) or steady? Any regional concentration?"
Interviewer: "Define the API between gateway and limiter."
Candidate: "`isRequestAllowed(clientId, ruleId) -> {allowed: bool, remaining: int, resetTime: epoch_ms}`. Keep it a single Lua script call to stay atomic."

**15-25 min | High-level Architecture**
Interviewer: "Where do you place the rate limiter?"
Candidate: "I’ll run it at the API gateway for global visibility and low latency, enriched with JWT identity. For resilience, services can have a lightweight in-memory fallback counter if Redis is down."
Interviewer: "How do multiple gateways stay consistent?"
Candidate: "Use Redis Cluster (hash slots), long-lived connection pools, and a single Lua script to atomically fetch/refill/decide/write. No per-node in-memory writes without Redis unless in controlled degradation mode."
Candidate (ask): "Do we need per-endpoint vs global rules? Any rules based on HTTP method or cost weights?"

**25-33 min | Algorithm Deep Dive**
Interviewer: "Which algorithm and why?"
Candidate: "Token Bucket: simple state (tokens, last_refill_time), supports bursts up to bucket size, and steady refill controls sustained rate. Alternatives: fixed window (boundary spikes), sliding window counter (smoother but a bit more math), sliding log (accurate but memory heavy)."
Interviewer: "Show me the token bucket steps." 
Candidate: "1) Read tokens + last_refill_time from Redis. 2) Compute delta = now - last_refill_time, add `delta * refill_rate`, cap at capacity. 3) If tokens > 0, decrement and allow; else deny. 4) Write back tokens + last_refill_time atomically via Lua."
Interviewer: "Prevent race conditions across gateways." 
Candidate: "Wrap steps in one Lua script so read/compute/write is atomic; avoid client-side transactions."
Candidate (ask): "Do we need dynamic per-tenant rules updated in real time? If yes, I’d push changes via etcd/ZooKeeper/Redis pub-sub instead of polling." 

**33-38 min | Reliability, Latency, Degradation**
Interviewer: "Redis node fails—what happens?"
Candidate: "We choose fail-open vs fail-close per product risk. I’d default to fail-open with alarms, but keep a temporary in-gateway fixed-window fallback to blunt abuse. Add replicas/Sentinel for failover, health checks, and circuit breaking if Redis latency spikes." 
Interviewer: "How do you keep checks under 10ms?"
Candidate: "Co-locate gateways with users, use connection pooling, keep the Lua script tiny, avoid extra network hops, and precompute rule metadata in memory so Redis only holds counters."
Candidate (ask): "Do we need audit logs of allow/deny for abuse investigations? If yes, sample logs asynchronously to avoid latency impact."

**38-40 min | Wrap-up**
Interviewer: "What would you monitor?"
Candidate: "Redis p95/p99 latency, error rate/timeouts, allowed vs blocked ratio per rule, burst detection, rule-update propagation success, and fallback activation events." 
Candidate closing: "Happy to dive deeper into multi-region consistency, tenant isolation, or cost-weighted limits if you’d like." 


