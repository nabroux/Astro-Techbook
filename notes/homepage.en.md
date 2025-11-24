---
title: "Welcome to Astro Techbook"
lang: "en"
translationKey: "homepage"
published: true
tags: []
---

# Welcome to Astro Techbook

Your `notes/` Markdown vault becomes a navigable site. The left sidebar mirrors your folders, and zh/en pairs stay linked by `translationKey`.

## How to use

- Add Markdown under `notes/` with frontmatter (`title`, `lang`, `translationKey`).
- Hide drafts or private folders via `hiddenPaths` in `note_vault.config.json`.
- For language pairs, create `.zh.md` / `.en.md` siblings (or set `lang`) with the same `translationKey`.

## What’s wired now

- Nav tree follows your folder structure.
- Language switcher appears when an alternate exists.
- Dark theme with Tailwind + Typography.
- Quick search: top-right search box filters by note title and folder path; click a suggestion or hit Enter to jump straight to that page.

## Next steps

Drop in your notes, add frontmatter, and watch them surface in the sidebar.
