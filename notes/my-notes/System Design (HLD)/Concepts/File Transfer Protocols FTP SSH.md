---
title: "File Transfer Protocols FTP SSH"
lang: "zh"
translationKey: "file-transfer-protocols-ftp-ssh"
published: true
tags: ["system design", "concept"]
---
## **💡 一、為什麼要了解檔案傳輸協定？**

在系統設計裡，常見需求：

- 上傳 / 下載報表、備份檔、影片素材
- 服務之間交換檔案（Batch Job、Data Pipeline）
- 自動部署、同步伺服器資料
- Cloud Storage / Object Storage（底層也是 File Transfer 概念）

👉 所以「檔案傳輸協定」不只是「傳檔案」，
而是整個「資料流通」機制的基礎。

---

## **🧱 二、常見檔案傳輸協定總覽**

|**協定**|**全名**|**傳輸層**|**加密**|**常見 Port**|**備註**|
|---|---|---|---|---|---|
|**FTP**|File Transfer Protocol|TCP|❌ 無加密|21|最古老的傳檔協定|
|**FTPS**|FTP Secure|TCP + SSL/TLS|✅ 加密|21 (explicit) / 990 (implicit)|舊系統的安全版 FTP|
|**SFTP**|SSH File Transfer Protocol|SSH (TCP)|✅ 加密|22|最常見安全傳輸|
|**SCP**|Secure Copy Protocol|SSH (TCP)|✅ 加密|22|快速但功能少|
|**HTTP(S)**|Hypertext Transfer Protocol|TCP|✅ 加密（TLS）|80 / 443|REST / CDN / 雲端常用|

## **🧩 三、FTP：File Transfer Protocol**


🕰️ **起源**：1970 年代，老派但仍常見。
📦 **運作方式**：Client-Server 模式，分為兩條連線：

- **控制連線（Port 21）**：傳命令與回覆
- **資料連線（Port 20 或動態）**：傳檔案本體

### **模式種類：**
|**模式**|**說明**|**特點**|
|---|---|---|
|**Active Mode**|Server 主動開資料連線|容易被防火牆擋|
|**Passive Mode (PASV)**|Client 主動連線|現代系統普遍使用|

### **指令範例**
```bash
ftp> open ftp.example.com
ftp> user alice
ftp> get report.csv
ftp> put upload.txt
ftp> bye
```

### **缺點**

- ❌ 密碼明文傳輸
- ❌ 沒有傳輸加密（容易被竊聽）
- ❌ 防火牆難設定（多 port）

💡 **總結**：老派但仍在某些企業內網、設備、印表機中使用。

現代系統幾乎全面改用 **SFTP**。

---

## **🧰 四、SFTP：SSH File Transfer Protocol**

🧠 常被誤認為「Secure FTP」，其實它是 **完全不同的協定**，
SFTP 是 **基於 SSH** 的「檔案子系統」。

|**特性**|**說明**|
|---|---|
|傳輸層|SSH（Port 22）|
|加密|AES / RSA / Ed25519|
|驗證方式|密碼 / SSH Key|
|支援功能|上傳、下載、刪除、目錄操作、續傳|
📘 **適用場景：**

- 自動化資料交換（B2B, 金融業常用）
- 系統備份 / 批次同步
- 部署腳本（CI/CD 自動上傳檔案）

### **指令範例**
```bash
sftp user@host
sftp> put local.txt /remote/path/
sftp> get /remote/logs/app.log
sftp> exit
```

### **Python 自動化範例**
```
import paramiko

ssh = paramiko.Transport(("example.com", 22))
ssh.connect(username="alice", password="1234")
sftp = paramiko.SFTPClient.from_transport(ssh)
sftp.put("local.txt", "/remote/data.txt")
sftp.close()
ssh.close()
```

💡 **優點：**

- 安全（加密傳輸）
- 可整合 SSH Key（無密碼自動化）
- 易於自動化腳本與 CI/CD 整合

---

## **⚡ 五、SCP：Secure Copy Protocol**

📦 **用途**：用來「快速複製檔案」的一個簡化版本（同樣走 SSH）。

| **特性** | **說明**                     |
| ------ | -------------------------- |
| 協定     | 基於 SSH                     |
| Port   | 22                         |
| 功能     | 僅支援 copy，不支援 list / resume |
| 安全性    | 與 SSH 同等級                  |

範例：
```bash
# 上傳
scp file.txt user@server:/data/
# 下載
scp user@server:/data/file.txt .
```

💡 **對比 SFTP**

| **協定**   | **功能**         | **適用**   |
| -------- | -------------- | -------- |
| **SCP**  | 單純複製（copy）     | 一次性傳檔    |
| **SFTP** | 支援目錄操作、續傳、權限設定 | 自動化或批次任務 |

---

## **🧠 六、SSH：Secure Shell（安全殼層）**

SFTP、SCP 的老爸，就是 SSH。

它提供了一個「安全通道」，能同時進行：

- 遠端登入
- 命令執行
- 檔案傳輸

### **✈️ 常見用途：**

| **類型**          | **範例**                             |
| --------------- | ---------------------------------- |
| 遠端登入            | ssh user@host                      |
| 傳檔案             | scp / sftp                         |
| Port Forwarding | ssh -L 8080:localhost:80 user@host |
| 金鑰驗證            | ~/.ssh/id_rsa.pub                  |

💡 **SSH Key 認證比密碼安全得多**：

- 不需在伺服器儲存密碼
- 可限制來源 IP、指令範圍
- 可整合 CI/CD pipeline（Git、Ansible、Jenkins）

---
## **🧩 七、FTPS vs SFTP 對比**
|**項目**|**FTPS (FTP + TLS)**|**SFTP (SSH)**|
|---|---|---|
|協定基礎|FTP|SSH|
|Port|21 / 990|22|
|加密方式|TLS/SSL|SSH（AES / RSA）|
|控制與資料連線|分開（多 Port）|單一連線|
|防火牆友善度|較差|👍 單一連線|
|檔案操作|複雜（不支援續傳）|支援全面操作|
|自動化腳本|較難整合|👍 方便（支援 key login）|
|現代支援度|中|⭐⭐⭐⭐（最主流）|

---

## **🔒 八、安全實務建議**

|**做法**|**說明**|
|---|---|
|✅ **優先使用 SFTP 或 HTTPS**|傳輸加密、單一連線|
|🔑 使用 **SSH Key** 而非密碼|避免憑證外洩風險|
|📁 權限隔離|每個使用者有獨立 chroot 目錄|
|📊 啟用 Logging|追蹤誰上傳／下載了什麼|
|🧱 限制來源 IP / VPN|防止暴力破解|
|🚨 自動封鎖多次失敗登入|Fail2Ban、Cloudflare Access 等|

---

## **🧮 九、雲端替代方案（現代化 File Transfer）**

|**工具 / 服務**|**備註**|
|---|---|
|**AWS S3 + Pre-signed URL**|安全、臨時授權、可控權限|
|**Google Cloud Storage Signed URL**|類似 S3|
|**Azure Blob Storage SAS Token**|可設定到期時間、權限|
|**rclone / gsutil / aws cli**|現代 CLI 傳輸工具|
|**rsync over SSH**|檔案差異同步（DevOps 愛用）|

💡 這些服務本質上仍是「安全傳輸協定」的延伸，
只是抽象化成雲端 API。

---

## **🧱 十、實務架構舉例**

```
Client (Data Producer)
   │
   │  ── SFTP Upload (SSH Key)
   ▼
+------------------+
|  SFTP Server     |
|  ├── Validates SSH Key
|  ├── Stores file under /uploads/{tenant}/
|  └── Logs actions
+------------------+
   │
   ▼
ETL Job (Async) (**Extract · Transform · Load**)
   ├── Picks up file
   ├── Validates format
   ├── Loads to Data Warehouse
   └── Moves to Archive
```


👉 很多金融、保險、醫療業的資料交換就是這樣設計。

---

## **✅ 十一、一句話總結**


> 🧠 FTP 是歷史，SFTP 是主流，SSH 是一切的基礎。

- > 🚫 FTP：老舊、不安全
- > 🔒 SFTP：安全、穩定、可自動化
- > ⚡ SCP：快速傳單一檔
- > 🧰 SSH：遠端控制與傳輸的基礎層
    
> 若要讓系統安全又好維護，
> **能用 HTTPS / SFTP / Signed URL，就不要用 FTP。**