---
title: "歡迎來到 Astro Techbook"
lang: "zh"
translationKey: "homepage"
published: true
tags: []
---

# 歡迎來到 Astro Techbook

這裡會自動把 `notes/` 的 Markdown 轉成網站，依據資料夾結構建立導覽，並支援 zh/en 雙語切換。

## 怎麼使用

- 在 `notes/` 新增 Markdown，填上 frontmatter（title, lang, translationKey）。
- 想隱藏草稿或私密資料夾，更新 `note_vault.config.json` 的 `hiddenPaths`。
- zh/en 配對：同樣的 `translationKey`，各自建立 `.zh.md` / `.en.md` 或標註不同的 `lang`。

## 目前已接上的功能

- 導覽樹：隨資料夾與檔名變動。
- 語言切換：有另一語言版本就顯示切換按鈕。
- 深色風格：Tailwind + Typography 已預設。
- 快速搜尋：右上角搜尋框即時依照標題與資料夾路徑篩出筆記，點選或按 Enter 就能直接跳轉。

## 下一步

把你的筆記搬進來，補上 frontmatter，就能在左側看到新的章節。
