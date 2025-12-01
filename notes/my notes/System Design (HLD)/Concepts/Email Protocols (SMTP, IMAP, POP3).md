---
title: "Email Protocols (SMTP, IMAP, POP3)"
lang: "zh"
translationKey: "email-protocols-smtp-imap-pop3"
published: true
tags: ["system design", "concept"]
---
參考影片：
https://www.youtube.com/watch?v=IMLFrYqI-oQ

## **💡 一、Email Protocol 是什麼？**

> 電子郵件（Email）在網際網路上的傳遞，
> 是透過一系列「標準協定」進行傳送、接收與同步的。

在郵件系統中，通常包含三個主要角色：

| **類別**            | **角色**                       | **代表協定**            |
| ----------------- | ---------------------------- | ------------------- |
| **寄信（Sending）**   | 郵件伺服器之間傳輸郵件                  | **SMTP**            |
| **收信（Retrieval）** | 用戶端從郵件伺服器取信                  | **POP3** / **IMAP** |
| **存取（Access）**    | 用戶端（如 Gmail, Outlook）讀取或管理信件 | **IMAP**            |

## **🧭 二、Email 傳送與接收流程概覽**

```
[User A Client]
     │  (SMTP)
     ▼
[User A's Mail Server]
     │  (SMTP over Internet)
     ▼
[User B's Mail Server]
     │  (IMAP / POP3)
     ▼
[User B Client]
```

### **流程解釋：**

1️⃣ **SMTP**：用於將信件從寄件者的客戶端送到郵件伺服器，並在伺服器之間傳遞。

2️⃣ **IMAP / POP3**：用於收件者從伺服器讀取信件。

---

## **📨 三、SMTP（Simple Mail Transfer Protocol）**

  ### **📘 功能**  

> **SMTP** 是郵件的「寄送協定」，

> 用於將郵件從客戶端 → 郵件伺服器 → 目標伺服器。

### **⚙️ 運作流程**

1. 使用者的郵件客戶端（MUA）透過 SMTP 將信件傳給郵件伺服器（MSA）
    
2. 郵件伺服器（MTA）透過 SMTP 將信件傳送到收件者的郵件伺服器（MDA）

### **🔢 常用 Port**
| **Port** | **加密方式**       | **用途**         |
| -------- | -------------- | -------------- |
| **25**   | 無加密（Plaintext） | 伺服器對伺服器傳信（早期）  |
| **465**  | SSL/TLS        | 已被重啟使用為「SMTPS」 |
| **587**  | STARTTLS       | 用戶端安全寄信（推薦）    |
### **🔐 SMTP 安全擴充**
|**協定**|**功能**|
|---|---|
|**SMTP AUTH**|驗證使用者身份（防止垃圾信）|
|**STARTTLS**|支援傳輸加密|
|**SPF / DKIM / DMARC**|防止信件偽造與釣魚攻擊|

---
## **📥 四、POP3（Post Office Protocol v3）**

### **📘 功能**

> **POP3** 是「下載式收信協定」，
> 將信件從伺服器「拉回本地端」儲存，預設下載後伺服器會刪除副本。

  ### **⚙️ 特性**
|**特性**|**說明**|
|---|---|
|預設行為|下載後刪除伺服器副本（可設定保留）|
|離線使用|支援，信件都存在本機|
|多裝置同步|❌ 不支援（不同裝置收信後不一致）|
|效能|快速、低資源消耗|
|使用場景|單一裝置使用，如舊式 Outlook / Thunderbird|
### **🔢 常用 Port**
|**Port**|**加密方式**|
|---|---|
|**110**|無加密|
|**995**|SSL/TLS（POP3S）|

## **📂 五、IMAP（Internet Message Access Protocol）**
### **📘 功能**

> **IMAP** 是「即時同步式收信協定」，
> 信件保留在伺服器上，所有裝置（手機、筆電）都能即時同步狀態。

### **⚙️ 特性**
|**特性**|**說明**|
|---|---|
|資料儲存|郵件保留在伺服器端|
|離線使用|部分同步（快取）|
|多裝置同步|✅ 支援（標示、已讀、分類同步）|
|效能|較 POP3 高，但需要更多伺服器資源|
|使用場景|現代郵件系統（Gmail、Outlook、Yahoo）幾乎全採 IMAP|
### **🔢 常用 Port**
| **Port** | **加密方式**       |
| -------- | -------------- |
| **143**  | STARTTLS       |
| **993**  | SSL/TLS（IMAPS） |

---

## **🔄 六、SMTP vs POP3 vs IMAP 對照表**
|**項目**|**SMTP**|**POP3**|**IMAP**|
|---|---|---|---|
|功能|傳送郵件|收信（下載）|收信（同步）|
|流向|寄件人 → 收件伺服器|收件伺服器 → 客戶端|雙向同步|
|資料儲存|郵件伺服器中繼|下載到本地|保留於伺服器|
|多裝置同步|不適用|不支援|✅ 支援|
|加密 Port|465 / 587|995|993|
|使用者行為|寄信|收信（一次下載）|收信（同步所有裝置）|

---

## **🧰 七、常見應用範例**

### **📨 寄信（SMTP）**
```python
import smtplib
from email.mime.text import MIMEText

msg = MIMEText("Hello, this is a test email.")
msg['Subject'] = "Test Mail"
msg['From'] = "sender@example.com"
msg['To'] = "receiver@example.com"

with smtplib.SMTP("smtp.gmail.com", 587) as smtp:
    smtp.starttls()
    smtp.login("sender@example.com", "password")
    smtp.send_message(msg)
```

### **📥 收信（IMAP）**
```python
import imaplib, email

mail = imaplib.IMAP4_SSL("imap.gmail.com")
mail.login("user@example.com", "password")
mail.select("inbox")

result, data = mail.search(None, "ALL")
for num in data[0].split():
    result, msg_data = mail.fetch(num, "(RFC822)")
    msg = email.message_from_bytes(msg_data[0][1])
    print(msg["Subject"])
```

## **🔒 八、Email 安全機制**
|**協定**|**功能**|
|---|---|
|**SPF (Sender Policy Framework)**|驗證寄件 IP 是否授權寄送該網域郵件|
|**DKIM (DomainKeys Identified Mail)**|使用私鑰簽名郵件，防止內容被竄改|
|**DMARC (Domain-based Message Authentication, Reporting & Conformance)**|結合 SPF + DKIM，規範如何處理偽造信件|
|**STARTTLS / SMTPS / IMAPS / POP3S**|加密郵件傳輸過程|

## **🌍 九、Email 協定與現代雲端郵件服務**
| **平台**             | **發信協定**                  | **收信協定**    | **備註**      |
| ------------------ | ------------------------- | ----------- | ----------- |
| Gmail              | SMTP (smtp.gmail.com)     | IMAP / POP3 | 支援 OAuth 驗證 |
| Outlook            | SMTP (smtp.office365.com) | IMAP / POP3 | 支援多層驗證      |
| AWS SES            | SMTP API / HTTPS          | -           | 專業寄信服務      |
| SendGrid / Mailgun | SMTP API                  | -           | 常用於系統郵件、通知信 |
## **🧠 十、實務設計建議**
|**需求**|**建議使用**|
|---|---|
|系統寄信（驗證信 / 通知）|SMTP + 第三方寄信服務（SendGrid / SES）|
|收信與多裝置同步|IMAP|
|輕量單機應用 / 備份信件|POP3|
|安全寄信|SMTP + STARTTLS (Port 587)|
|防止偽造與釣魚|SPF + DKIM + DMARC|
## **✅ 十一、一句話總結**

- > **SMTP**：負責「寄信」 📤
- > **POP3**：負責「下載信件」 📩
- > **IMAP**：負責「同步信件狀態」 🔄

> 📬 現代郵件系統一般架構：
> 用戶端寄信 → SMTP → 郵件伺服器 → IMAP 收信

> 🚀 若要做系統級通知與郵件驗證，
> 建議使用 **SMTP API（SendGrid, SES, Mailgun）** 來實作安全可靠的寄信功能。