---
title: "Deep Link（深層連結）"
lang: "zh"
translationKey: "deep-link"
published: true
tags: ["system design", "concept"]
---
# 🔗 Deep Link（深層連結）

## 🧩 一、什麼是 Deep Link？

  
> **Deep Link（深層連結）** 是一種能直接開啟 App 內特定內容（而非首頁）的 URL。
> 它讓使用者從外部（如瀏覽器、訊息、社群貼文）點擊連結時，能**直接跳轉到 App 內特定頁面或資源**。
  

---
  
## 🎯 二、為什麼需要 Deep Link？


在行動應用時代，使用者可能：

- 從 LINE、IG、Messenger 收到一個連結
- 手機已安裝 App，但連結預設會開瀏覽器
  
➡️ 若沒有 Deep Link，就無法自動導向 App 內正確頁面。

➡️ 若實作了 Deep Link，體驗可以做到：

「點下連結 → 自動打開 Spotify App 播放那首歌」


---

## 🧱 三、Deep Link 的組成類型
  

| 類型                       | 範例                                      | 平台            | 特點                               |
| ------------------------ | --------------------------------------- | ------------- | -------------------------------- |
| **Custom URI Scheme**    | `spotify://track/abc123`                | iOS / Android | 最早期方式，需 App 註冊自有協定               |
| **Universal Link (iOS)** | `https://open.spotify.com/track/abc123` | iOS           | 若有 App → 開 App；否則開 Web           |
| **App Link (Android)**   | `https://open.spotify.com/...`          | Android       | Android 官方機制，與 Universal Link 類似 |
| **Deferred Deep Link**   | 安裝 App 後仍可跳回原目標                         | iOS / Android | 適合廣告或新用戶轉化流程                     |
  
---

## ⚙️ 四、運作原理

### 🔹 整體流程圖

```

[User 點擊連結]
↓
[系統判斷是否安裝 App]
↓
(Yes) → 啟動 App 並導向指定頁面
↓
(No) → 開啟 Web URL 或導向商店安裝頁

```

---
## 🧭 五、技術設計要點

1. **App 需註冊 URL Scheme / Domain**

- iOS：使用 Universal Links (`apple-app-site-association`)
- Android：設定 App Links (`assetlinks.json`)

2. **伺服器需配置 Redirect Gateway**

- 例：`https://open.spotify.com/...`
- 根據裝置判斷：有 App → 開 App；否則開 Web Player。

3. **App 啟動時解析目標參數**

- 例如 `spotify://track/{id}` → App 解析出 `track_id` 後自動開啟播放頁。

4. **支援未安裝 App 的用戶（Deferred Deep Link）**

- 先導向商店（App Store / Play Store）
- 安裝完成後自動返回原目標。

  

---
## 🎵 六、以 Spotify 為例

範例連結：

```

https://open.spotify.com/track/7GhIk7Il098yCjg4BQjzvb

```

### Spotify Gateway 流程：

1️⃣ 使用者點擊 → 進入 `open.spotify.com`

2️⃣ 伺服器檢查使用者裝置與環境

3️⃣ 若有 App → Redirect 到 `spotify://track/7GhIk7Il098yCjg4BQjzvb`

4️⃣ 若無 App → 開 Web Player 或導向商店安裝

5️⃣ App 啟動後解析 `track_id`，自動播放該首歌

  

---
## 🧠 七、優點

| 類別       | 說明                         |
| -------- | -------------------------- |
| 🔗 無縫體驗  | 使用者可直接進入 App 內特定內容         |
| 📈 提高轉化率 | 廣告 / 推播 點擊率提升              |
| 💡 多平台一致 | 同一條連結可同時支援 App / Web       |
| 📊 可追蹤性  | 可統計點擊來源、設備、使用者行為           |
| 🔐 可控導向  | App Gateway 可控制是否跳轉、加入登入檢查 |
  
---
## ⚠️ 八、實作挑戰

| 問題             | 描述                                                 |
| -------------- | -------------------------------------------------- |
| 版本差異           | iOS / Android Universal Link 規範略不同                 |
| 網頁快取           | 有時瀏覽器會直接開 Web，不跳 App                               |
| App 未註冊 domain | 導致無法開啟 App                                         |
| 安裝流程中跳轉失敗      | Deferred Deep Link 需額外實作（Firebase Dynamic Links 等） |

---
## 🧩 九、延伸實作工具
  
| 工具 / 平台                      | 功能                             |
| ---------------------------- | ------------------------------ |
| **Firebase Dynamic Links**   | 跨平台 Deep Link（含 Deferred 支援）   |
| **Branch.io**                | 企業級 Deep Link / Attribution 平台 |
| **Appsflyer / Adjust**       | 廣告追蹤與安裝轉化結合                    |
| **Bitly + Redirect Gateway** | 自建短連結 + 跳轉伺服器                  |

---
## ✅ 十、總結

> Deep Link 是連結 Web 世界與 App 世界的橋樑。
> 它讓使用者無論在哪個平台、哪個情境下點擊連結，

> 都能順利開啟應用程式中的正確內容頁。

> Spotify、YouTube、Instagram 等大型平台皆使用 Deep Link Gateway + Universal Link 機制
> 以達成一致、可追蹤、可控的用戶導向體驗。


