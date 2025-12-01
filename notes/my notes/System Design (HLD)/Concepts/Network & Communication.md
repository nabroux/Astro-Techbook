---
title: "IPv4 vs IPv6"
lang: "zh"
translationKey: "ipv4-vs-ipv6"
published: true
tags: ["system design", "concept"]
---

# IPv4 vs IPv6

## 一、基本概念
- IPv4：32-bit（約 42 億組地址）
- IPv6：128-bit（幾乎無限），解決位址不足問題

## 二、封包結構
- IPv4 header vs IPv6 header 簡化比較
- 移除 checksum, 改 header extension

## 三、差異重點
| 項目 | IPv4 | IPv6 |
|------|------|------|
| 位元長度 | 32-bit | 128-bit |
| 表示方式 | 192.168.0.1 | 2001:0db8::1 |
| NAT 支援 | 常見 | 不需 NAT |
| Broadcast | 有 | 無（用 Multicast） |
| 安全性 | 可選 IPSec | 內建 IPSec |

## 四、應用場景
- IPv6 常見於 CloudFront、CDN、IoT
- AWS / GCP 全面支援 dual stack（IPv4 + IPv6）

## 五、實務觀察
- 大多數企業仍維持 IPv4 為主，但逐步轉向 IPv6。

---

# DNS（Domain Name System）

## 一、DNS 的角色
把網域（www.example.com）轉成 IP 位址（93.184.216.34）。

## 二、DNS 查詢流程
1. Client 向本機 Resolver 問
2. 若快取無 → 詢問 Root Server
3. Root → 回傳 TLD（例如 .com）
4. TLD → 回傳該域名的 Authoritative Server
5. 取得真實 IP

## 三、常見記錄類型
| 類型 | 說明 | 範例 |
|------|------|------|
| A | 網域對應 IPv4 | example.com → 93.184.216.34 |
| AAAA | 對應 IPv6 | example.com → 2001:db8::1 |
| CNAME | 別名轉址 | www → example.com |
| MX | 郵件伺服器 | mail.example.com |
| TXT | 驗證資訊 / SPF / DKIM | Google site verify |

## 四、DNS 與 CDN / LB

- [[CDN（Content Delivery Network）]] 常用 CNAME 導向不同 edge 節點  
- [[Load Balancer]] 常搭配 **DNS-based load balancing**（Route 53）

---

# 🏛️ ICANN / Domain Hierarchy
  
## 一、什麼是 ICANN？

ICANN（Internet Corporation for Assigned Names and Numbers）  

是一個非營利組織，負責管理全球：

- 網域名稱（Domain Names）

- IP 位址分配（via IANA）

- Root DNS 伺服器維護

  

## 二、網域分層
Root (.)
├── TLD (.com, .org, .tw, .io)
 │  ├── Second Level Domain (example.com)
 │   │   └── Subdomain (api.example.com)

## 三、Domain Registrar / Registry

- **Registry**：管理 TLD 的單位（如 Verisign 管理 .com）
- **Registrar**：你購買網域的公司（GoDaddy, Namecheap）
- **ICANN**：負責監督與授權這些單位


## 四、延伸概念

- WHOIS：查詢網域註冊資訊

- DNSSEC：簽章驗證防篡改

- gTLD vs ccTLD（.com vs .tw）

  
## 五、與系統設計的關係

- DNS TTL 太長 → 災難切換慢  

- 多地部署時要考慮不同 TLD 的延遲  

- CDN 與 Cloud Provider 都與 DNS 層緊密整合（Route 53, Cloudflare）


# TCP vs UDP 傳輸層協定詳解

  ## 一、基本概念

- TCP: 有連線、可靠、有序、流量控制
- UDP: 無連線、不保證順序、速度快、輕量

  
## 二、封包結構

- TCP Header（SYN、ACK、Seq）
- UDP Header（Port、Length、Checksum）


## 三、三次握手 / 四次揮手

- 為什麼要握手？
```
### **💡 為什麼要握手？**

簡單說：

> 因為 TCP 是「有連線、雙向可靠」的協定。

> 彼此要先確認「我能發、你能收」再開始正式通訊。

  

握手的目的有三個：

1. **確認雙方都在線**
    
2. **同步序號（Sequence Number）**
    
3. **協商連線參數（例如窗口大小、選項）**
   
   Client                               Server
   |                                     |
   | ---- SYN(seq=x) ------------------> | ① 想建立連線（我要開始說話）
   | <--- SYN+ACK(seq=y, ack=x+1) ----- | ② 我收到了，準備好了，你呢？
   | ---- ACK(ack=y+1) ----------------> | ③ 我也準備好了！
   |                                     |
連線建立成功 ✅


###  **每一步的意義**
|**步驟**|**發送方**|**對方**|**說的意思**|
|---|---|---|---|
|① SYN|Client|Server|「我想和你連線，初始序號是 X」|
|② SYN+ACK|Server|Client|「收到，我這邊初始序號是 Y，也請你確認」|
|③ ACK|Client|Server|「OK，我收到你的 Y，我的 X 你也確認過」|

完成後，雙方的發送、接收序號都已同步。

這樣接下來的資料封包才不會亂。

### **🧩 為什麼不是「兩次」就夠？**
因為：

- 若只雙方互傳一次（Client SYN，Server ACK），
    
    伺服器無法確定「Client 的 ACK 是否真的收到」。
    
- 第三次 ACK 是為了確認：
    
    > 「你確實知道我知道你知道」
    
    > 確保雙方狀態一致，不會出現半開連線（half-open connection）。
     
# **四次揮手（Four-way Handshake）**     
### **💡 為什麼斷開要四次？**

因為 TCP 是**全雙工（Full-duplex）的，**

**代表資料傳輸有兩條獨立的通道（Client→Server、Server→Client）。**

**要關閉連線時，兩邊都必須分別**關閉自己的發送端。
### **四次揮手流程圖**
Client                               Server
   |                                     |
   | ---- FIN(seq=u) ------------------> | ① 我這邊資料傳完了，準備關閉
   | <--- ACK(ack=u+1) ---------------- | ② 收到，等我也傳完再關
   | <--- FIN(seq=v) ------------------ | ③ 我也傳完了，準備關閉
   | ---- ACK(ack=v+1) ----------------> | ④ 收到，正式關閉
   |                                     |
連線終止 ✅

|**步驟**|**行為**|**含義**|
|---|---|---|
|① Client → Server: FIN|客戶端說「我沒資料要發了」|
|② Server → Client: ACK|伺服器回「我知道了」|
|③ Server → Client: FIN|伺服器也說「我也沒資料要發了」|
|④ Client → Server: ACK|客戶端回「OK，收到了」|

這樣才保證：

- 雙方都已傳完資料
    
- 不會有半途關閉導致資料遺失

```

- TIME_WAIT 問題
```
### **💥 問題場景**

當 **Client 發出最後一個 ACK**（第四次揮手）後，
理論上連線結束了。
但在實際上，**Client 端的 TCP 連線不會馬上釋放**，
而是進入一個叫 TIME_WAIT 的狀態。


你可以想像：

> Client 說「掰掰」之後，還要留在原地等一會，
> 以防 Server 沒聽清楚又說一次「掰掰」。
 
### **🕐 為什麼要等？**
TCP 為了確保：

1. 對方真的收到最後的 ACK（若沒收到會重送 FIN）
    
2. 避免舊連線的封包干擾新連線（尤其是同一組 IP/Port）
 

因此設計了 **TIME_WAIT = 2 * MSL（Maximum Segment Lifetime）**
→ 通常約 **30～120 秒**。


```

## 四、應用層範例

| 類型                | 常用協定           | 傳輸層    |
| ----------------- | -------------- | ------ |
| HTTP / HTTPS      | TCP            | Web 服務 |
| DNS / VoIP / Game | UDP            | 即時傳輸   |
| QUIC / HTTP3      | UDP（模擬 TCP 功能） | 雙重優勢   |
  
## 五、在系統設計中的思考

- 為什麼 gRPC 用 HTTP/2（基於 TCP）
```
### **🧩 1. gRPC 的核心目標：高可靠、高序、低延遲的** 

### **Request/Response RPC**

  

gRPC 是 Google 設計的跨語言遠端呼叫框架（Remote Procedure Call）。

它的典型使用情境是「**微服務之間傳遞業務資料**」，例如：

- Auth Service <-> User Service
    
- Billing Service <-> Payment Gateway
    

  

在這種情況下：

- 資料量相對小（幾 KB～MB）
    
- 但**可靠性**和**順序性**非常重要
    

  

> 一個 JSON 或 protobuf 的欄位錯亂，整個呼叫結果就會錯。
```

- 為什麼 WebRTC、遊戲、直播偏好 UDP
```
### **🚀 1. 核心目標不同：**

### **即時性 > 完整性**

  

這類應用在意的是「即時同步」而非「資料完整」。

- 一場直播如果掉幾個影格沒人會在意。
    
- 一場遊戲如果延遲 300ms，整場體驗就壞了。
    

  

UDP 沒有 TCP 那樣的「等待確認機制（ACK）」，

封包發出去就算，快而直接。
```

- TCP 對高延遲環境的影響
```
### **⏳ 1. 延遲放大效應（Latency Amplification）**

  

TCP 是「確認導向協定」：

每個封包都要經歷「發送 → 接收確認（ACK）」的往返。

  

當網路延遲變高（例如跨洲），

即使頻寬夠大，**等待 ACK 的時間仍然拖慢整體吞吐量**。

這就是所謂的 **TCP throughput ≈ 1 / RTT** 限制。

  

例子：

- 美國西岸到台灣 RTT 約 180ms
    
- 傳 10 次封包就可能耗掉超過 1.8 秒的等待時間。
    

---

### **📦 2. 慢啟動（TCP Slow Start）**

  

TCP 為了避免網路壅塞，一開始會**慢慢增加傳送速率**，

需要多次往返才能跑到最大頻寬。

→ 對高延遲連線（長距離用戶）特別吃虧。

---

### **🧩 3. Head-of-Line Blocking**

  

因為 TCP 需要「順序交付」，

若有一個封包遺失或延遲，整個資料流都會卡住。

→ 高延遲或丟包環境下體驗非常差。

---

### **⚙️ 4. 解法：QUIC（UDP + TCP 的優點）**

  

Google 設計 **QUIC（HTTP/3）** 來解決這個問題：

- 用 UDP 傳輸（避免 TCP 層的重傳阻塞）
    
- 在應用層實作可靠性（可重傳但不阻塞整流）
    
- 建立連線只需 1-RTT，支援 0-RTT 重連
    
- 連線可攜帶加密與 session 快取
    

  

👉 結果：更適合跨區、行動網路、直播、影音串流。
```