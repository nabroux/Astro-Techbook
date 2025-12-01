---
title: "Authorization & Access Control"
lang: "zh"
translationKey: "authorization-access-control"
published: true
tags: ["system design", "concept"]
---

_權限控制與授權設計_

## **💡 一、Authentication vs Authorization**

在進入授權之前，先分清兩個老朋友：

| **名稱**                   | **意義**    | **範例**                   |
| ------------------------ | --------- | ------------------------ |
| **Authentication（身份驗證）** | 「你是誰？」    | 用戶登入時輸入帳密、OAuth token 驗證 |
| **Authorization（授權）**    | 「你可以做什麼？」 | 判斷該用戶能否刪除貼文、查看報表         |

🧠 一句話： 
> Authentication = 開門
> Authorization = 你進門後能去哪裡

---
## **🧱 二、Access Control（存取控制）是什麼？**

Access Control 指的是「決定誰能對什麼資源做哪些動作」的規則集合。
 
通常包含三個元素：
```
Subject（誰） → Action（做什麼） → Object（對誰／什麼）
```

---
## **🧩 三、常見的授權模型總覽**

| **模型**    | **全名**                            | **控制邏輯**          | **適用場景**             |
| --------- | --------------------------------- | ----------------- | -------------------- |
| **DAC**   | Discretionary Access Control      | 資料擁有者決定誰能訪問       | 檔案系統、簡易企業內網          |
| **MAC**   | Mandatory Access Control          | 系統根據安全等級自動判斷      | 軍事／政府系統              |
| **RBAC**  | Role-Based Access Control         | 根據角色授權            | 公司內部系統最常用            |
| **ABAC**  | Attribute-Based Access Control    | 根據屬性動態判斷          | 雲端平台、動態授權            |
| **PBAC**  | Policy-Based Access Control       | 用明確策略文件（Policy）定義 | 雲端 IAM（AWS IAM, OPA） |
| **ReBAC** | Relationship-Based Access Control | 根據使用者關係授權         | 社群平台（例如 Facebook）    |

---
## **🧰 四、DAC：Discretionary Access Control**

**使用者擁有自己的資料，並決定誰能存取。**

📦 概念：
> 「我是這份文件的 owner，我想給誰權限就給誰。」

🔹 優點：
- 靈活，使用者可自行管理
- 簡單直覺（像 Google Drive 的「分享」）
  
🔹 缺點：
- 難集中管理（權限容易亂）
- 安全性依賴使用者自律

🔹 範例：

| **User** | **File**   | **Permission** |
| -------- | ---------- | -------------- |
| Alice    | report.pdf | read/write     |
| Bob      | report.pdf | read           |

---

## **🧱 五、MAC：Mandatory Access Control**

**由系統根據安全等級進行授權。**

📦 概念：
> 「高機密資料只能被同等或更高等級的帳號存取。」

🔹 特性：
- 使用者無法改變權限（強制性）
- 每個 Subject/Object 都有「Security Label」

🔹 適用場景：
- 政府、軍方、醫療、金融等需要資料分級的系統
- 例：SELinux、Windows Mandatory Integrity Control

🔹 例子：

| **User** | **Level**    | **File** | **File Level** | **Access** |
| -------- | ------------ | -------- | -------------- | ---------- |
| Alice    | Secret       | fileA    | Confidential   | ✅          |
| Bob      | Confidential | fileA    | Secret         | ❌          |

---

## **🧩 六、RBAC：Role-Based Access Control**

**依據角色授權**，最常見、最企業化。

📘 範例：

> Admin 可以新增／刪除使用者
> Editor 只能修改文章
> Viewer 只能閱讀

### **🎯 RBAC 三層模型**
```
User → Role → Permission
```

| **User** | **Role** | **Permission** |
| -------- | -------- | -------------- |
| Alice    | Admin    | Create, Delete |
| Bob      | Editor   | Edit           |
| Carol    | Viewer   | Read           |
🔹 優點：
- 權限好管理（以「角色」為中心）    
- 符合組織架構（部門 / 職稱）

🔹 缺點：
- 靜態，不易應對動態條件（如「只能在上班時間改資料」）

🔹 實作範例：
```json
{
  "user": "alice",
  "roles": ["admin"],
  "permissions": ["create_user", "delete_user"]
}
```

---

## **🧮 七、ABAC：Attribute-Based Access Control**

**依據屬性（Attribute）動態判斷權限。**

📦 四大屬性來源：

| **類型**                     | **範例**              |
| -------------------------- | ------------------- |
| **Subject Attributes**     | 用戶職位、部門、年齡、地區       |
| **Object Attributes**      | 資料分類、擁有者、創建日期       |
| **Action Attributes**      | read, write, delete |
| **Environment Attributes** | 時間、IP、裝置、位置         |

🧠 判斷範例：
> 「部門是 Finance 且 IP 位於內網，才能下載報表。」

🔹 優點：
- 動態且彈性（無需硬編角色）
- 適合大型企業或雲端服務（如 AWS IAM Policies）

🔹 缺點：
- 規則設計複雜、難維護
- 執行效能需考量（判斷條件多）

🔹 範例策略：
```json
{
  "effect": "allow",
  "action": "read",
  "resource": "report",
  "condition": {
    "user.department": "finance",
    "request.ip": "10.0.0.0/8"
  }
}
```

---

## **🧾 八、PBAC：Policy-Based Access Control**

**以「Policy 文件」為中心的授權系統。**  

📘概念：

> 「把授權邏輯抽象成獨立策略文件，由 Policy Engine 評估。」

🔹 範例：
- AWS IAM Policies
- Google Zanzibar（Policy Expression）
- Open Policy Agent (OPA) / Rego 語言

🔹 優點：
- 高度彈性與可審查性
- 支援動態條件（時間、地點、身分、關聯）

🔹 例：
```
allow {
  input.user.role == "admin"
  input.action == "delete"
}
```

---

## **🧑‍🤝‍🧑 九、ReBAC：Relationship-Based Access Control**
  
**依據關係圖授權（Graph-based Access Control）**

📦 概念：

> 「授權不是看角色，而是看你跟資源的關係。」

🔹 例子：

|**關係**|**意義**|
|---|---|
|Alice → owns → Document1|擁有者|
|Bob → shared_with → Document1|有查看權|
|Carol → member_of → TeamA → has_access_to → FolderX|經由團隊關聯獲得權限|

🔹 應用：
- 社群平台（好友／群組權限）
- 企業協作（Google Drive、Notion、GitHub Teams）

🔹 實作技術：
- Graph-based Policy Store（如 Neo4j, Zanzibar）    
- 高速關係查詢（recursive access check）

---

## **⚖️ 十、各模型比較表**

|**模型**|**靜態 / 動態**|**優點**|**缺點**|**常見場景**|
|---|---|---|---|---|
|**DAC**|靜態|彈性、直覺|權限亂、難集中控|個人雲端空間（Drive, Dropbox）|
|**MAC**|靜態|高安全性|不靈活|政府、軍事系統|
|**RBAC**|靜態|管理方便|無法應對動態條件|一般企業系統|
|**ABAC**|動態|高彈性|複雜、成本高|雲端、跨組織平台|
|**PBAC**|動態|可審核、自動化|策略語法需學習|AWS IAM、OPA|
|**ReBAC**|動態|關係導向、自然|查詢成本高|社群、協作系統|

---

## **🧩 十一、實務應用與架構建議**

### **🏢 企業系統**  

> RBAC 為主、ABAC 為輔。

- 基本角色分層（Admin, Editor, Viewer）    
- 加上條件（地區、時間）判斷
- 可延伸為 PBAC（策略檔統一管理）

### **☁️ 雲端平台**

> PBAC + ABAC 結合

- AWS IAM Policy, GCP IAM 都是典型例子    
- 動態條件：region、requester、time

### **👥 社群產品 / SaaS 協作工具**  

> ReBAC 為主（Google Drive, Notion）

- 基於圖的授權模型    
- 「誰與誰的關係」決定能否訪問資源    

---

## **🚀 十二、延伸思考與實作提示**

- 🧱 權限儲存結構：
    - SQL：user_roles、role_permissions、user_permissions        
    - NoSQL：以 user_id → permission_set 快取
    
- 💾 快取：
    - 可用 Redis 快取已計算好的 permission 結果（TTL 控制）
    
- 🔍 Audit Trail：
    - 所有授權決策記錄（誰改了誰的權限）
    
- 🧮 測試：
    - 單元測試（policy evaluate）＋ 模擬情境測試（role hierarchy）    

---

## **✅ 十三、一句話總結**
  
> 🧠 **RBAC 是起點，ABAC 是進階，PBAC 是未來，ReBAC 是社交時代。**

- > 小系統：RBAC 足夠。  
- > 大企業：RBAC + ABAC 結合。
- > 雲端平台：PBAC（策略驅動）。
- > 社群產品：ReBAC（關係導向）。

> 📦 沒有完美模型，只有最適合的那一個。


