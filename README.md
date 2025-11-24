# Astro Techbook (Astro-based notes template)

Public template that turns a Markdown vault under `notes/` into a bilingual static site (en/zh by default). Navigation mirrors your folders, translations stay linked by `translationKey`, search filters by title/path, and images are copied automatically.

## Quick start
1. Clone this repo.
2. Install dependencies:
   ```bash
   cd site
   npm install
   ```
3. Configure `note_vault.config.json` (see below).
4. Add your notes under `notes/` with required frontmatter.
5. Run locally:
   ```bash
   cd site
   npm run dev   # http://localhost:4321
   ```

## Required frontmatter for every published note
```yaml
title: "My Note Title"
lang: "en"              # or "zh" (must be listed in config)
translationKey: "my-note-key"  # identical across language variants
published: true         # false to hide
tags: ["foo", "bar"]    # optional but recommended
```

## Where to write notes
- Put all Markdown under `notes/` (default content root).
- Keep images/assets next to your notes; relative links are rewritten and assets are copied to `/notes-assets/...` during build.
- Files/folders containing `todo` are ignored by `.gitignore` (adjust if you want them tracked).

## Language pairing
- Use the same `translationKey` across languages.
- All languages you use must appear in `note_vault.config.json -> i18n.languages` (default `["en","zh"]`).
- If a translation is missing, the language switcher falls back to the homepage for that language.

## Config (`note_vault.config.json`)
Key fields to update:
- `site.title`, `subtitle`, `defaultLang`
- `site.social.github|linkedin|email`
- `content.root` (default `notes`)
- `content.hiddenPaths` / `hiddenFiles` to exclude drafts/private content
- `content.defaultPublish` (fallback when `published` is absent)
- `i18n.languages` and `i18n.fallbacks`

## Running & testing locally
- Dev: `cd site && npm run dev`
- Build check: `cd site && npm run build` (validates frontmatter, copies assets to `site/public/notes-assets`, writes static HTML to `site/dist`).

## Search behavior
- Filters by normalized title + folder path (lowercased; dashes/underscores/spaces treated the same).
- Uses the full query string (spaces included); not split into multiple keywords.

## Deployment to Cloudflare Pages
1. Create a Cloudflare Pages project from your fork/clone.
2. Build settings:
   - **Root directory:** `site`
   - **Build command:** `npm install && npm run build`
   - **Build output directory:** `dist`
3. Set `NODE_VERSION` to 18+ if needed.
4. Deploy. Static output in `site/dist` will be served.

## Project layout
- `notes/` — your Markdown vault
- `assets/` — shared assets (optional)
- `note_vault.config.json` — site + i18n settings
- `site/` — Astro app (UI, loaders, build)

## Useful behaviors
- Sidebar folders are collapsible; homepage stays pinned to the top; `example` sits at the bottom.
- Social icons (GitHub/LinkedIn/Email) render only when provided in config.
- Syntax highlighting via Prism; Mermaid diagrams supported.
- Images: relative Markdown image links are rewritten to `/notes-assets/...` and files are auto-copied during build.

## Common tasks
- New note: create `notes/.../my-note.md` with the required frontmatter.
- Add translation: duplicate the note, change `lang`, keep `translationKey`.
- Hide a note: set `published: false` or add a hidden path pattern in config.
