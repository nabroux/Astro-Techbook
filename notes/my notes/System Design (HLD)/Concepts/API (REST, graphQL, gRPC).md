---
title: API (REST, graphQL, gRPC)
lang: zh
translationKey: API
published: true
tags: ["system design", "concept"]
---


## **🧩 1️⃣ REST API （Representational State Transfer）**

**核心概念：**

把系統中的每個資源（Resource）當作「可透過 URL 存取的對象」，用 HTTP 動詞（GET、POST、PUT、DELETE）進行操作。

→ 強調 **「以資源為中心」而非「以動作為中心」**。
  

**範例：**

```
GET    /users            # 取得所有使用者
GET    /users/42         # 取得特定使用者
POST   /users            # 建立使用者
PUT    /users/42         # 更新使用者
DELETE /users/42         # 刪除使用者
```

**優點：**
- 符合 HTTP 標準，瀏覽器原生支援。
- 可快取（cacheable）。
- 學習曲線低、文件多、相容性高。

  
**缺點：**
- 前端常出現「過多資料」（over-fetch）或「不足資料」（under-fetch）。
- 每次更新或查詢多個資源都要多次請求。
- 結構難一致，版本控制（v1、v2）麻煩。
  

**常見應用：**
- Web / Mobile App 主流通用 API（如 Instagram、YouTube、Twitter Public API）。

## **🧩 2️⃣ GraphQL（由 Facebook 推出）**
  

**核心概念：**

Client 自己定義要哪些欄位，Server 依 schema 執行「查詢語言」(query)。

→ 強調 **「以資料需求為中心」**，避免 REST 的 over-fetch 問題。

**範例：**
```
query {
  user(id: 42) {
    name
    posts {
      title
      likes
    }
  }
}
```

**伺服器回傳：**
```
{
  "data": {
    "user": {
      "name": "Frankie",
      "posts": [
        { "title": "CDN explained", "likes": 12 },
        { "title": "Latency tuning", "likes": 8 }
      ]
    }
  }
}
```

**優點：**
- Client 控制回傳內容，減少冗餘。
- 單一端點即可取多種資源。
- 強型別 schema（SDL）讓前後端一致。    
- 有 introspection，可自動產文件。


**缺點：**
- 實作較複雜。
- 難以使用 HTTP 快取。
- 查詢過於彈性可能導致效能問題（需 Query Complexity Control）。

**常見應用：**
- 複雜前端（如 Facebook、Shopify、GitHub API v4）
- Mobile app：減少多次請求。


## **🧩 3️⃣ gRPC（Google Remote Procedure Call）**

**核心概念：**

以 **Protobuf（二進位序列化格式）** 定義資料結構與函式，透過 **HTTP/2** 傳輸。

→ 強調「高效、型別安全、雙向串流」。


**範例：**（Protobuf 定義）
```
service UserService {
  rpc GetUser (UserRequest) returns (UserReply);
}

message UserRequest {
  int32 id = 1;
}

message UserReply {
  string name = 1;
  string email = 2;
}
```

**優點：**
- 高效（Protobuf < JSON）。
- 內建雙向串流（streaming）。
- 自動產生多語言 client SDK。
- 非常適合微服務間通訊。


**缺點：**
- 不適合 public API（瀏覽器不支援原生 gRPC）。
- Debug 不如 REST 直覺。
- JSON → Protobuf 轉換需額外工具（如 gRPC-Gateway）。


**常見應用：**
- 微服務架構內部溝通（例如 Kubernetes、Google Cloud）
- 高頻 RPC 通訊（遊戲伺服器、金融交易引擎）。


---

## **🧩 核心設計理念比較**
| **項目**   | **REST**                      | **GraphQL**                | **gRPC**                        |
| -------- | ----------------------------- | -------------------------- | ------------------------------- |
| **核心思想** | 以「資源」為中心（Resource-Oriented）   | 以「資料需求」為中心（Query-Oriented） | 以「動作/函式」為中心（Procedure-Oriented） |
| **通訊模型** | Request → Response            | Request → Response         | RPC 呼叫（支援雙向串流）                  |
| **傳輸協定** | HTTP 1.1                      | HTTP 1.1 / 2               | HTTP/2                          |
| **資料格式** | JSON / XML                    | JSON                       | Protobuf（二進位）                   |
| **端點設計** | 多個 Endpoint（如 /users, /posts） | 單一 Endpoint（通常 /graphql）   | 以 service / method 定義           |
|          |                               |                            |                                 |

## **🧠開發與維運層面**
| **比較項目**      | **REST**            | **GraphQL**                 | **gRPC**                    |
| ------------- | ------------------- | --------------------------- | --------------------------- |
| **開發難度**      | 低，快速上手              | 中等，需要 schema / resolver     | 高，需要 Protobuf / stub 生成     |
| **前端資料控制**    | 固定，由後端定義            | 高，自由決定欄位                    | 低，由 proto 決定                |
| **型別安全性**     | 弱（JSON 任意結構）        | 中（Schema 驗證）                | 強（Protobuf 嚴格型別）            |
| **版本控制**      | 需透過 /v1、/v2 URL 管理  | Schema 可演化（deprecate field） | 透過 proto message versioning |
| **快取能力**      | 強（HTTP Cache）       | 弱（大多 POST 請求）               | 弱（非 HTTP 風格）                |
| **Debug 容易度** | 高（用 curl / Postman） | 中（需專用 IDE，如 GraphiQL）       | 低（需專用工具，如 BloomRPC）         |

## **💬 實務選擇建議**
| **使用情境**                    | **推薦流派**                | **原因**              |
| --------------------------- | ----------------------- | ------------------- |
| **前後端分離的 Web / Mobile App** | REST                    | 成本低、通用標準            |
| **複雜頁面（一次需要多個資料源）**         | GraphQL                 | 避免 over-fetch、減少請求數 |
| **微服務間通訊 / 內部系統整合**         | gRPC                    | 高效、型別安全、支援串流        |
| **需要全端型別安全（TS + Protobuf）** | gRPC（或 GraphQL Codegen） | 強約束型別減少 bug         |
| **第三方 API（開放給外部開發者）**       | REST                    | 兼容性最高、工具最完整         |

# 參考資料

https://www.youtube.com/watch?v=pBASqUbZgkY


> **🧠 一句話總結：**
> 
> **REST**：通用、簡單、成熟，最適合「對外」與「多端整合」。
> 
> **GraphQL**：彈性取數據、前端主導、減少請求，但伺服器端較複雜。
> 
> **gRPC**：高效能、強型別、低延遲，是微服務和內部系統的最強選擇。
> 
> graphQL請求夾帶參數 server回傳所需參數，較精準所以節省網路流量
> 但是server side會需要比較多的處理 而且也不好快取 不像REST API