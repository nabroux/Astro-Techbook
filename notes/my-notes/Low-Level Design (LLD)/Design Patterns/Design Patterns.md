---
title: "Design Patterns"
lang: "zh"
translationKey: "design-patterns"
published: false
tags: ["low level design", "design pattern"]
---

## **🏗️ 一、Creational Patterns（創建型）**

> 負責「**物件如何被建立**」，讓系統更靈活、更可測試。

| **模式**                       | 重要性  | **重點概念**            | **常見應用**                             |
| ---------------------------- | ---- | ------------------- | ------------------------------------ |
| **Singleton Pattern**        | ⭐⭐⭐⭐ | 全域唯一實例（例如：連線池、設定物件） | Redis client、Logger、Config Loader    |
| **Factory Method Pattern**   | ⭐⭐⭐⭐ | 封裝物件建立邏輯，統一介面       | DB client factory、API client factory |
| **Abstract Factory Pattern** | ⭐⭐   | 建立一組相關物件            | 多平台（AWS / GCP / Azure）connector      |
| **Builder Pattern**          | ⭐⭐⭐  | 分步建立複雜物件            | SQL Query builder、Request builder    |
| **Prototype Pattern**        | ⭐    | 複製現有物件，避免重新初始化      | 複製設定模板、任務複製                          |

---

## **🧱 二、Structural Patterns（結構型）**

> 關注「**物件之間如何組合**」以形成更大的結構。

| **模式**                | 重要性  | **重點概念**      | **常見應用**                                 |
| --------------------- | ---- | ------------- | ---------------------------------------- |
| **Adapter Pattern**   | ⭐⭐⭐⭐ | 將不同介面封裝成統一格式  | 第三方 API wrapper、Payment Gateway          |
| **Facade Pattern**    | ⭐⭐⭐  | 提供簡化介面給複雜子系統  | SDK 封裝層、Service Layer                    |
| **Decorator Pattern** | ⭐⭐⭐⭐ | 動態添加功能，不改原始類別 | FastAPI middleware、Logger Wrapper        |
| **Proxy Pattern**     | ⭐⭐⭐  | 控制對物件的訪問      | Cache Proxy、Circuit Breaker、Rate Limiter |
| **Composite Pattern** | ⭐⭐   | 組合樹狀結構        | 檔案系統、UI component tree                   |
| **Bridge Pattern**    | ⭐⭐   | 將抽象與實作分離      | Database Driver interface / strategy     |
| **Flyweight Pattern** | ⭐⭐   | 重複使用共享物件節省記憶體 | Connection pool、字型快取（Font Cache）         |

---

## **⚙️ 三、Behavioral Patterns（行為型）**

> 聚焦「**物件如何互動與溝通**」。

| **模式**                              | 重要性  | **重點概念**           | **常見應用**                            |
| ----------------------------------- | ---- | ------------------ | ----------------------------------- |
| **Strategy Pattern**                | ⭐⭐⭐⭐ | 將行為抽象化，可動態切換策略     | 不同推薦演算法、金流計算邏輯                      |
| **Observer Pattern**                | ⭐⭐⭐⭐ | 一對多事件通知            | Webhook、Kafka、Event-driven          |
| **Command Pattern**                 | ⭐⭐   | 將操作封裝成命令物件         | Undo 功能、Job Queue                   |
| **Chain of Responsibility Pattern** | ⭐⭐⭐  | 責任鏈式處理，直到被處理為止     | Middleware、Validation pipeline      |
| **State Pattern**                   | ⭐⭐   | 根據狀態改變行為           | 訂單狀態、Workflow Engine                |
| **Template Method Pattern**         | ⭐⭐   | 定義演算法骨架，允許子類覆寫部分步驟 | 資料導入流程、ETL pipeline                 |
| **Mediator Pattern**                | ⭐    | 中介者協調多對多互動         | Chat room 管理器、Workflow Orchestrator |
| **Memento Pattern**                 | ⭐⭐   | 儲存物件狀態以便回復         | Snapshot / Restore 功能               |
| **Visitor Pattern**                 | ⭐⭐   | 將新操作與資料結構分離        | AST 分析、JSON schema validator        |
| **Iterator Pattern**                | ⭐    | 遍歷集合而不暴露內部結構       | Database cursor、Paginator           |
| **Interpreter Pattern**             | ⭐    | 實作簡單語法解析           | Query DSL、Expression parser         |

---

## **🧩 四、Architecture-Level Patterns（架構實務延伸）**

> 這些不屬於 GoF 23 模式，但在**現代後端系統設計中更常見**

| **模式**                        | **來源**                    | **概念**             | **實際應用**                     |
| ----------------------------- | ------------------------- | ------------------ | ---------------------------- |
| **Repository Pattern**        | DDD（Domain-Driven Design） | 抽象化資料存取層           | FastAPI + SQLAlchemy 儲存層     |
| **Service Layer Pattern**     | Fowler (PoEAA)            | 封裝業務邏輯             | Microservice API 結構          |
| **CQRS Pattern**              | Fowler / DDD              | Command 與 Query 分離 | 讀寫分離架構                       |
| **Event Sourcing Pattern**    | DDD                       | 用事件重建狀態            | Audit log、系統回放               |
| **Saga Pattern**              | 分散式系統                     | 跨服務交易補償機制          | 金流退款流程、訂單一致性                 |
| **Circuit Breaker Pattern**   | 微服務容錯                     | 防止連鎖故障             | Netflix Hystrix、Resilience4J |
| **Retry / Backoff Pattern**   | 分散式重試策略                   | 指數退避與容錯            | API 重試、Task Queue            |
| **Observer / PubSub Pattern** | 分散式事件驅動                   | 非同步觸發              | Kafka, SNS, RabbitMQ         |
| **Unit of Work Pattern**      | ORM Transaction 控制        | 一致性交易              | SQLAlchemy session 管理        |