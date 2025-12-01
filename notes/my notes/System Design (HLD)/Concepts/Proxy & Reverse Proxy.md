---
title: Proxy & Reverse Proxy.md
lang: zh
translationKey: proxy-and-reverse-proxy
published: true
tags: ["system design", "concept"]
---


> Proxy act as a middleman, hide your ip and location
> 
> Reverse proxy works the other way around (server side) 

### **🧩 Proxy（代理伺服器）**

![Pasted image 20251024184101](<assets/Proxy & Reverse Proxy/Pasted image 20251024184101.png>)
  
**中文：代理伺服器**

**定義：**

代理伺服器是位於 **客戶端與目標伺服器之間的中介層**。

它幫使用者轉送請求（request）與回應（response），可用來**隱藏用戶身分、快取內容、過濾請求**等。


**運作方向：**

> Client → Proxy → Server
  
**用途：**

- 保護用戶端的真實 IP
    
- 提升存取速度（透過快取）
    
- 控制與監控用戶端的網路使用（例如企業網路）
    
- 繞過地區限制（例如 VPN 原理之一）
    


**例子：**

> 你在公司上網，請求會先送到公司 Proxy，再由 Proxy 代你去訪問 Google。

---

### **🔁 Reverse Proxy（反向代理伺服器）**

  ![Pasted image 20251024184129](<assets/Proxy & Reverse Proxy/Pasted image 20251024184129.png>)

**中文：反向代理伺服器**

**定義：**

反向代理是位於 **伺服器端前面的中介層**。

用戶端以為自己連到的就是原始伺服器，但其實請求被轉送給背後多台真正的伺服器。

  

**運作方向：**

> Client → Reverse Proxy → (multiple backend servers)


**用途：**

- **負載平衡（Load Balancing）**：將請求分配給多台伺服器
    
- **快取靜態內容**，減輕後端壓力
    
- **安全防護（WAF）**：隱藏後端伺服器的真實 IP，防止攻擊
    
- **SSL 終止（SSL termination）**：集中處理 HTTPS 加密
    
- **請求路由（Routing）**：依路徑或網域轉發到不同服務（例如 /api → API Server、/static → CDN）
    

  
**例子：**


> 你連到 https://example.com，實際上請求被 Nginx 反向代理轉發給三台後端的應用伺服器。

---

| **類型**        | **英文**        | **中文** | **位於哪一側** | **主要用途**      | **範例軟體**                         |
| ------------- | ------------- | ------ | --------- | ------------- | -------------------------------- |
| Proxy         | Forward Proxy | 正向代理   | 客戶端端      | 用戶匿名、快取、過濾、跨區 | Squid、Shadowsocks、VPN            |
| Reverse Proxy | Reverse Proxy | 反向代理   | 伺服器端      | 負載平衡、安全、快取、路由 | Nginx、HAProxy、Traefik、Cloudflare |
Reverse Proxy Use Case: Load Balancer, CDN, WAF (firewall), SSL Offloading
