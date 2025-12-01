---
title: "CICD (Continuous Integration, Continuous Delivery, Deployment）"
lang: "zh"
translationKey: "cicd-continuous-integration-continuous-delivery-deployment"
published: true
tags: ["system design", "concept"]
---
## **🧩 一、什麼是 CI/CD？**  

簡單說：

> CI/CD 是讓「寫完的程式」**自動從開發 → 測試 → 上線**的整套流程。
> 它的目標是「讓上線變得像呼吸一樣自然」。

- **CI（Continuous Integration）**：
	→ 自動整合程式碼、跑測試、建構出可用版本。
    
- **CD（Continuous Delivery / Deployment）**：
    → 自動把通過測試的版本**部署**到測試或正式環境。  

兩者合在一起，讓軟體更新可以：

- 一天多次上線
- 不怕人為失誤
- 自動驗證品質

---
## **🔄 二、完整流程一覽**
```
┌────────────┐
│  Developer │
└─────┬──────┘
      │ push code (Git)
      ▼
┌────────────┐
│   CI Stage │───🧪 單元測試 / Lint / Build
└─────┬──────┘
      │ build artifact (e.g. Docker image)
      ▼
┌────────────┐
│   CD Stage │───🚀 部署至測試 / 預備 / 正式環境
└─────┬──────┘
      │ monitor & rollback
      ▼
┌────────────┐
│ Production │
└────────────┘
```

---
## **🧠 三、CI（持續整合）詳解**

### **💡 1️⃣ 核心理念**

> 「不要一次整合一座山，而是每天整合一塊磚。」  

每位開發者提交程式（commit / PR）後，
CI 系統會自動執行以下動作：

| **階段**  | **任務**          | **範例**                 |
| ------- | --------------- | ---------------------- |
| 🔍 程式檢查 | Lint、格式化、靜態分析   | ESLint、Black、Flake8    |
| 🧪 測試   | 單元測試、整合測試       | pytest、JUnit、Jest      |
| 🏗️ 建構  | 產出可部署的 Artifact | Docker build、jar、wheel |
| 🧰 安全檢查 | 套件漏洞掃描          | Snyk、Trivy、Dependabot  |
**CI 的目標是：**

「每次 commit 都能立即驗證，保證主分支永遠是穩定的。」

### **🛠️ 2️⃣ 常見 CI 工具**
| **類型**   | **工具**                            | **特點**     |
| -------- | --------------------------------- | ---------- |
| SaaS（雲端） | GitHub Actions、GitLab CI、CircleCI | 易用、整合良好    |
| 自架       | Jenkins、Drone、TeamCity            | 可自訂、高自由度   |
| 輕量       | Travis CI、Buddy                   | 快速上手、小團隊常用 |

---
## **🚀 四、CD（持續交付 / 部署）詳解**

### **💡 1️⃣ Continuous Delivery（持續交付）**

- 代表程式**隨時可上線**，但上線動作仍需「人工確認」。
- 通常部署到「Staging」或「Pre-production」環境。
- 強調**品質驗證**、**手動批准**、**最終信心檢查**。

### **💡 2️⃣ Continuous Deployment（持續部署）**

- 更進一步：**自動上線到 Production**。    
- 只要測試通過，就直接推送至正式環境。
- 適用於：
    - 大型 SaaS 服務（每天多次部署）
    - 有完整自動化測試與監控的團隊

### **⚙️ 3️⃣ CD 常見步驟**
| **階段**              | **任務**               | **範例**                   |
| ------------------- | -------------------- | ------------------------ |
| 🧱 Build & Tag      | 產出 Docker image，打版本號 | myapp:1.2.3              |
| 📦 Push to Registry | 上傳到倉庫                | DockerHub、ECR            |
| ☁️ Deploy           | 發佈到環境                | k8s apply、Helm、Terraform |
| 🔎 Smoke Test       | 基礎健康檢查               | /healthz                 |
| 🩺 Monitor          | 偵測異常                 | Prometheus、Grafana       |
| 🔁 Rollback         | 錯誤時回滾                | Canary / Blue-Green      |

---
## **🐳 五、CI/CD 與容器（Docker / Kubernetes）**


在現代架構中，CI/CD 幾乎都會搭配：

- **Docker**：每次 build 產生不可變映像（immutable image）
- **Kubernetes (k8s)**：自動化部署、滾動更新（Rolling update）

流程範例：

1. CI 建構 Docker image → push 到 AWS ECR (Amazon Elastic Container Registry)
2. CD 觸發 Helm / ArgoCD → 部署新版本
3. K8s Controller 自動滾更 → 新 Pod Ready → 舊 Pod 移除
4. 若健康檢查失敗 → 自動 rollback

---
## **🧱 六、Branch 策略與 CI/CD 配合**

常見分支模式：

```
main (穩定)
├── develop（開發整合）
│   ├── feature/login
│   ├── feature/payment
└── hotfix/production-bug
```

CI/CD 可根據 branch 觸發不同 pipeline：

- PR → 執行 Lint + Unit Test
- develop → 自動部署到 staging
- main → 自動部署到 production（需手動批准）

## **🧩 七、Pipeline 的實際範例（YAML）**
### **GitHub Actions**
```yaml
name: CI/CD Pipeline
on:
  push:
    branches: [ main, develop ]
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: "3.11"

      - name: Install dependencies
        run: pip install -r requirements.txt

      - name: Run tests
        run: pytest

      - name: Build Docker image
        run: docker build -t myapp:${{ github.sha }} .

      - name: Deploy to Staging
        if: github.ref == 'refs/heads/develop'
        run: ./scripts/deploy_staging.sh
```


## **📈 八、CI/CD 的好處**
| **類別** | **效果**                    |
| ------ | ------------------------- |
| ⏱️ 速度  | 自動測試 + 自動部署，大幅縮短上線時間      |
| 🔒 穩定  | 減少人工錯誤，主分支永遠健康            |
| 🧪 可回溯 | 每個版本都有 build 紀錄與 artifact |
| 🤝 協作  | 多人開發不再衝突，整合變簡單            |
| 💰 成本  | 長期維護成本下降，部署更頻繁但更安全        |

## **⚠️ 九、常見陷阱與最佳實踐**
| **問題**   | **原因**      | **改進方式**                            |
| -------- | ----------- | ----------------------------------- |
| Build 太慢 | 測試多、鏡像大     | Cache、拆 pipeline、並行化                |
| 測試不準     | 測試覆蓋率不足     | 加強 unit / integration test          |
| 部署失敗     | 環境不一致       | Infrastructure as Code（IaC）         |
| 無法回滾     | 缺乏版本管理      | 使用 artifact tagging、rollback script |
| 成本上升     | 太多 job / VM | 使用輕量 runner 或雲端 trigger             |

## **🔗 十、CI/CD 與 DevOps 生態整合**
|**領域**|**工具 / 概念**|**說明**|
|---|---|---|
|**Source Control**|Git / GitHub / GitLab|版本管理與觸發點|
|**Build System**|Jenkins / GitHub Actions / CircleCI|執行 pipeline|
|**Artifact Registry**|DockerHub / ECR / Nexus|儲存 build 產物|
|**Deployment**|ArgoCD / Spinnaker / Helm / Terraform|自動化部署|
|**Monitoring**|Prometheus / Grafana / ELK / Datadog|偵測與回滾依據|
|**ChatOps**|Slack / Discord Bot / Webhook|通知部署狀態|


## **✅ 十一、總結一句話**

> CI/CD 就是把「上線」變成一條自動化生產線。
> 
> CI 保證每一行程式都是健康的，
> CD 保證每次改動都能安全抵達使用者。
> 
> 它讓工程師可以「放心改、快速推、輕鬆回」，
> 是現代軟體開發團隊的基礎肌肉。


---


# 🧩 CI/CD 測試環節與實作範例
  
## 🚀 一、測試在哪個環節執行？

整條 CI/CD pipeline 大致如下：

```

[ Developer 提交程式碼 ]

↓

🔹 CI 階段（整合）

├── Lint & 靜態檢查
├── 🧪 測試（單元 / 整合 / API）
├── Build（編譯 / 打包 / Docker image）

↓

🔹 CD 階段（交付 / 部署）

├── Deploy to staging
├── 🧩 部署後測試（Smoke test / E2E）
└── Deploy to production

```
  
- **主要測試在 CI 階段進行**
- **CD 階段則執行驗證類測試**（確認部署是否成功）

---

## 🧠 二、各階段的測試種類與目的

| 測試階段                          | 時機        | 目的            | 常見工具                         |
| ----------------------------- | --------- | ------------- | ---------------------------- |
| ✅ 單元測試 (Unit Test)            | CI 最早     | 驗證程式邏輯        | pytest、JUnit、Jest            |
| 🔗 整合測試 (Integration Test)    | CI 後段     | 驗證模組間互動 / API | Postman CLI、pytest、Supertest |
| ⚙️ 靜態分析 / Lint                | CI 開頭     | 檢查語法與格式       | Flake8、ESLint、MyPy           |
| 🧱 建構後測試 (Build Verification) | Build 完成後 | 驗證建構產物可用性     | bash script、Makefile         |
| 🧩 部署後測試 (Smoke Test / E2E)   | CD 階段     | 驗證部署後服務可用     | Cypress、Playwright、Selenium  |
| 🩺 健康檢查 (Health Check)        | 部署後       | 檢查端點狀態        | curl、k6、Prometheus probe     |
  
---

## ⚙️ 三、在哪些 CI/CD 工具裡安排測試

### 🧱 GitHub Actions

```yaml
name: CI Pipeline
on: [push, pull_request]
jobs:
test:
runs-on: ubuntu-latest
steps:
- uses: actions/checkout@v3
- name: Install dependencies
run: pip install -r requirements.txt
- name: Run tests
run: pytest tests/ --maxfail=1 --disable-warnings -q

```

📍 每次 push / PR 都會自動跑測試。若測試失敗，整個 pipeline 終止。
  

---
### 🧰 GitLab CI/CD


```yaml

stages:

- lint
- test
- build
- deploy

test:
stage: test
image: python:3.11
script:
- pip install -r requirements.txt
- pytest --junitxml=report.xml
artifacts:
reports:
junit: report.xml

```

💡 GitLab 以 stage 明確定義流程：測試 → 建構 → 部署。

---
### ☕ Jenkins Pipeline


```groovy

pipeline {

agent any

stages {

stage('Checkout') {

steps { checkout scm }

}

stage('Install & Test') {

steps {

sh 'pip install -r requirements.txt'

sh 'pytest'
}
}

stage('Build') {

steps { sh 'docker build -t myapp .' }

}

stage('Deploy') {

steps { sh './deploy.sh' }

}
}
}

```

📌 Jenkins 常見結構：測試通常在 Build 前、Deploy 前。

---
### 🐳 Docker 建構內部測試

```dockerfile

FROM python:3.11

WORKDIR /app

COPY . .

RUN pip install -r requirements.txt

RUN pytest --disable-warnings

```

💡 Build 過程中內嵌測試，確保映像建構即代表通過驗證。

---
## 🧩 四、測試失敗的行為

在 CI/CD pipeline 中，測試是「阻斷點 (blocking step)」。

- 測試未通過 → pipeline 停止
- 未通過測試 → 不會進入建構或部署階段
- 這保證主分支始終保持「可部署狀態」

> 🧠 測試就是 CI/CD 的守門員。沒通過他，誰都別想上線。

---
## 💡 五、實務策略建議

| 情境                  | 測試策略                              |
| ------------------- | --------------------------------- |
| 小型專案 / Side Project | 單元測試 + Lint                       |
| 微服務架構               | 各服務獨立 CI 測試，整合測試集中於 staging       |
| 高流量產品               | 增加 Canary / Smoke Test（CD 驗證）     |
| 需安全審查               | 加入漏洞掃描（Snyk / Trivy / Dependabot） |

---
## ✅ 六、總結


> **CI 階段**：確保每個 commit 都健康。
> **CD 階段**：確保每次部署都穩定。
> 
> 測試是 CI/CD 流水線的核心節點，
> 讓「自動化」不只是快，更是安全與可靠。
