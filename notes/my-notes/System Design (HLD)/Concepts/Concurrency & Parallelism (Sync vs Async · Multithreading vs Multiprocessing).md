---
title: "Concurrency & Parallelism (Sync vs Async · Multithreading vs Multiprocessing)"
lang: "zh"
translationKey: "concurrency-parallelism-sync-vs-async-multithreading-vs-multiprocessing"
published: true
tags: ["system design", "concept"]
---

## **💡 一、先搞清楚：這些詞到底在吵什麼？**

工程師界最常聽到的幾句話：
  
> 「要用 async 才快！」
> 「這邊要開多執行緒啊！」
> 「Python 有 GIL，沒救啦～」

聽起來都對，但如果你問一句：  

> 「到底什麼情況該用哪一個？」

大多數人其實講不出來 🤯。
所以我們用生活例子講清楚這幾個概念：

## **🍜 二、同步 vs 非同步：煮泡麵的比喻**

|**模式**|**狀況**|**範例**|
|---|---|---|
|**同步 (Synchronous)**|你煮麵時一直站在瓦斯爐前，等 3 分鐘後再去倒飲料。|time.sleep()|
|**非同步 (Asynchronous)**|你煮麵 → 開計時器 → 轉身倒飲料、滑手機，計時器響了再回來撈麵。|asyncio, Promise, await|
🧠 差別是什麼？

- 同步：**一步做完再做下一步**。    
- 非同步：**丟出去等回應的時候可以做別的事**。

➡️ 在系統裡，非同步就等於「**我不浪費時間卡在 I/O 上**」。

---

## **🚦 三、並發 vs 並行：廚房的比喻**
| **概念**              | **說明**                      | **比喻**    |
| ------------------- | --------------------------- | --------- |
| **Concurrency（並發）** | 一個廚師同時準備三道菜，但輪流切一點這個、炒一點那個。 | 單人快手切換多任務 |
| **Parallelism（並行）** | 三個廚師各自煮一道菜，真的同時在進行。         | 多人同時動手    |

💡 小結：  
> 並發是「交錯進行」的假象，
> 並行才是「真的同時」在跑。

---

## **💻 四、Thread vs Process**

| **類型**          | **記憶體** | **切換速度** | **風險**    | **適用**                |
| --------------- | ------- | -------- | --------- | --------------------- |
| **Thread（執行緒）** | 共享記憶體   | 快        | 有競態條件、需要鎖 | I/O-bound（大量外部請求）     |
| **Process（行程）** | 獨立記憶體   | 慢        | 隔離好，不共享   | CPU-bound（影像處理、AI 計算） |
👉 用人話講：

- Thread = 同一間辦公室的同事（共用白板，有時會搶筆）
- Process = 不同公司的人（各自的辦公室，互不干擾）

---
## **⚔️ 五、你該用哪一種？**

| **狀況**             | **用什麼比較好**                             | **為什麼**          |
| ------------------ | -------------------------------------- | ---------------- |
| 要打很多外部 API / 等資料庫  | **Async / Threading**                  | I/O-bound，不要卡住主線 |
| 要做大量計算（AI、壓縮）      | **Multiprocessing**                    | CPU-bound，用多核心   |
| 要處理用戶一堆請求（Web API） | **Async event loop**（FastAPI, Node.js） | 高併發、輕量           |
| 要轉檔、寄信、生成報表        | **Background Queue**（Celery / SQS）     | 可以慢慢跑、重試         |
| 要保證交易成功            | **Sync + Transaction**                 | 一致性最重要           |

---

## **⚙️ 六、同步與非同步在 Web 架構的樣子**

```
Client
  │
  ├─> Synchronous API (Flask, Spring MVC)
  │       └─ 處理完才回傳結果
  │
  └─> Asynchronous API (FastAPI, Node.js)
          └─ 發請求 → 等資料庫 → 同時能服務別的請求
```

💬 範例：
```python
# 同步
def get_user():
    data = db.query("SELECT * FROM user")   # 等待
    return data

# 非同步
async def get_user():
    data = await db.query_async("SELECT * FROM user")  # 不阻塞
    return data
```

## **🧩 七、Python 的痛點：GIL（Global Interpreter Lock）**

Python 的多執行緒其實是假的多執行緒（受限於 GIL）。
同一時間只有一個 Thread 能執行 Python bytecode。

💡 意思是：
- Thread 適合 I/O-bound（等待網路、資料庫）    
- CPU-bound 要用 **multiprocessing** 或 **C 擴充 / numba**

```python
from multiprocessing import Pool

def crunch(n):
    return sum(i * i for i in range(n))

with Pool(4) as p:
    print(p.map(crunch, [10**6]*4))
```

✅ 這才是真正「多核並行」。

---

## **🕹 八、日常系統裡的 async 用法**

|**場景**|**描述**|**解法**|
|---|---|---|
|🔔 寄 Email / 發通知|不用讓用戶等寄信完成|丟進 Queue（Celery, SQS）|
|📊 匯出報表|計算久、產生檔案|非同步任務 + 狀態查詢 API|
|💬 即時聊天室|長連線、WebSocket|Async Server（uvicorn, Node.js）|
|🎥 上傳轉檔|CPU + I/O 都重|Queue + Worker Pool|
|💾 資料同步|延遲可接受|定時 Job（Cron / Cloud Scheduler）|

---

## **🧠 九、鎖與陷阱**

### **常見鎖**

- **Mutex（互斥鎖）**：一次只能一人進入關鍵區。
- **Semaphore（信號量）**：限制同時進入數量。
- **RWLock（讀寫鎖）**：多讀可併發、寫要獨占。

### **常見陷阱**
| **問題**                     | **描述**         | **解法**                        |
| -------------------------- | -------------- | ----------------------------- |
| **Race Condition**         | 兩人同時改同個資料      | 加鎖或用原子操作                      |
| **Deadlock**               | 互相等鎖不放         | 控制鎖順序、設定 timeout              |
| **Starvation**             | 某些任務永遠排不到      | 公平鎖或輪詢排程                      |
| **Blocking call in async** | async 裡面呼叫阻塞函式 | 用 await run_in_executor() 包起來 |

---
## **🧮 十、系統設計裡的 async 思維**

當你的 API 負載變高時，
同步程式會這樣：

> 客戶一多 → Thread 爆光 → 系統 Timeout

而非同步會這樣：

> 一條 event loop 處理成千上萬請求，
> 只在 I/O 等待時切出去。

💡 **FastAPI + Uvicorn**、**Node.js + Express**、**Go goroutine** 都是這個模型。
  
而背景任務的世界（Celery、Kafka、SQS）也是同樣的哲學：
> “慢的事放到後面跑。”

---
## **📊 十一、活用範例：**

假設你要設計一個寄信 API：
### **同步版（使用者要等信寄完）**
```python
@app.post("/send_email")
def send_email(data):
    send_smtp(data)
    return {"status": "ok"}
```

### **非同步版（先回覆，再寄信）**
```python
@app.post("/send_email")
async def send_email(data):
    queue.publish("email_job", data)
    return {"status": "queued"}
```

→ Email Worker 之後在背景寄信
→ User 不用傻等 3 秒鐘

---
## **🎯 十二、一句話總結**

| **類型**                    | **重點**         |
| ------------------------- | -------------- |
| **同步 (Sync)**             | 安全、直覺，但慢       |
| **非同步 (Async)**           | 高效、輕量，但邏輯更複雜   |
| **多執行緒 (Threading)**      | 快速 I/O、共享記憶體   |
| **多行程 (Multiprocessing)** | 真並行、CPU 密集任務專用 |

>「I/O 用 Async，CPU 用 Process。
> 真的搞不定，就丟 Queue。」 😎

