import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { minimatch } from 'minimatch';
import MarkdownIt from 'markdown-it';
import prism from 'markdown-it-prism';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-markup-templating';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-python';
import { getContentRootAbsolute, getRepoRoot, loadConfig, toPosixPath } from './config';
import { slugifySegment } from './slug';
import type {
  NoteGroupByTranslationKey,
  NoteLang,
  NoteNode,
  NavNode,
  NoteVaultConfig
} from '../types';

const markdown = new MarkdownIt({
  html: true,
  linkify: true
}).use(prism);

const defaultFence = markdown.renderer.rules.fence;
markdown.renderer.rules.fence = (tokens, idx, options, env, self) => {
  const token = tokens[idx];
  const info = (token.info || '').trim();
  if (info === 'mermaid') {
    const escaped = escapeHtml(token.content);
    return `<div class="mermaid">${escaped}</div>`;
  }
  if (defaultFence) {
    return defaultFence(tokens, idx, options, env, self);
  }
  return self.renderToken(tokens, idx, options);
};

const defaultImage = markdown.renderer.rules.image;
markdown.renderer.rules.image = (tokens, idx, options, env, self) => {
  const token = tokens[idx];
  const srcIndex = token.attrIndex('src');
  if (srcIndex >= 0) {
    const src = token.attrs?.[srcIndex][1] || '';
    const baseDir = env?.noteDir || '';
    const rewritten = rewriteImageSrc(src, baseDir);
    token.attrs[srcIndex][1] = rewritten;
  }
  if (defaultImage) {
    return defaultImage(tokens, idx, options, env, self);
  }
  return self.renderToken(tokens, idx, options);
};

let cachedNotes: NoteNode[] | null = null;
let assetsCopied = false;

export function getNotePath(note: NoteNode): string {
  return [note.dirPath, note.slug].filter(Boolean).join('/');
}

export function renderMarkdown(note: NoteNode): string {
  const env = { noteDir: note.rawDirPath ?? '' };
  return markdown.render(note.content, env);
}

export async function loadNotes(refresh = false): Promise<NoteNode[]> {
  if (cachedNotes && !refresh) return cachedNotes;

  const config = await loadConfig(refresh);
  const contentRoot = getContentRootAbsolute(config);
  const markdownFiles = await collectMarkdownFiles(contentRoot, config);

  if (!assetsCopied || refresh) {
    await copyAssets(contentRoot, config);
    assetsCopied = true;
  }

  const notes: NoteNode[] = [];

  for (const file of markdownFiles) {
    const relativeToContent = toPosixPath(path.relative(contentRoot, file));
    if (shouldHidePath(relativeToContent, config)) continue;

    const note = await parseNoteFile(file, relativeToContent, config);
    if (note) {
      notes.push(note);
    }
  }

  cachedNotes = notes;
  return notes;
}

export async function getNoteBySlugAndLang(
  lang: NoteLang,
  slugPath: string
): Promise<NoteNode | undefined> {
  const targetSlug = normalizeSlugPath(slugPath);
  const notes = await loadNotes();
  return notes.find(
    (note) => note.lang === lang && getNotePath(note) === targetSlug
  );
}

export async function getGroupByTranslationKey(
  translationKey: string
): Promise<NoteGroupByTranslationKey | undefined> {
  const groups = await groupNotesByTranslationKey();
  return groups.find((group) => group.translationKey === translationKey);
}

export async function groupNotesByTranslationKey(): Promise<NoteGroupByTranslationKey[]> {
  const notes = await loadNotes();
  const map = new Map<string, NoteGroupByTranslationKey>();

  for (const note of notes) {
    if (!map.has(note.translationKey)) {
      map.set(note.translationKey, {
        translationKey: note.translationKey,
        notesByLang: { zh: undefined, en: undefined }
      });
    }
    const entry = map.get(note.translationKey);
    if (entry) {
      entry.notesByLang[note.lang] = note;
    }
  }

  return Array.from(map.values());
}

export async function buildNavTree(lang?: NoteLang): Promise<NavNode[]> {
  const notes = await loadNotes();
  const filtered = lang ? notes.filter((note) => note.lang === lang) : notes;
  const tree: NavNode[] = [];

  for (const note of filtered) {
    const originalSegments = getOriginalDirSegments(note);
    const slugSegments = note.dirPath ? note.dirPath.split('/') : [];
    let children = tree;
    const accumulatedSlug: string[] = [];

    originalSegments.forEach((segment, idx) => {
      const slugSegment = slugSegments[idx] || slugifySegment(segment);
      accumulatedSlug.push(slugSegment);
      const folderPath = ['/', lang ?? note.lang, ...accumulatedSlug]
        .filter(Boolean)
        .join('/')
        .replace(/\/+/g, '/');

      let folder = children.find(
        (child) => child.type === 'folder' && child.path === folderPath
      );

      if (!folder) {
        folder = {
          type: 'folder',
          name: segment,
          path: folderPath,
          children: []
        };
        children.push(folder);
      }

      if (!folder.children) folder.children = [];
      children = folder.children;
    });

    const notePath = ['/', lang ?? note.lang, getNotePath(note)]
      .filter(Boolean)
      .join('/')
      .replace(/\/+/g, '/');

    children.push({
      type: 'note',
      name: note.title,
      path: notePath,
      lang: note.lang,
      translationKey: note.translationKey,
      slug: note.slug
    });
  }

  const sorted = sortNavNodes(tree);
  return moveHomepageToTop(sorted);
}

function sortNavNodes(nodes: NavNode[]): NavNode[] {
  const sorted = [...nodes].sort((a, b) => {
    const aName = a.name.toLowerCase();
    const bName = b.name.toLowerCase();
    const aIsExample = aName === 'example' || aName === 'examples';
    const bIsExample = bName === 'example' || bName === 'examples';

    if (aIsExample !== bIsExample) return aIsExample ? 1 : -1;
    if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  sorted.forEach((node) => {
    if (node.children) {
      node.children = sortNavNodes(node.children);
    }
  });

  return sorted;
}

function moveHomepageToTop(nodes: NavNode[]): NavNode[] {
  const idx = nodes.findIndex(
    (node) => node.type === 'note' && node.translationKey === 'homepage'
  );

  if (idx > 0) {
    const [homepage] = nodes.splice(idx, 1);
    nodes.unshift(homepage);
  }

  nodes.forEach((node) => {
    if (node.children) {
      node.children = moveHomepageToTop(node.children);
    }
  });

  return nodes;
}

function normalizeSlugPath(slugPath: string): string {
  return slugPath.replace(/^\/+/, '').replace(/\/+$/, '');
}

async function collectMarkdownFiles(
  root: string,
  config: NoteVaultConfig
): Promise<string[]> {
  const files: string[] = [];

  async function walk(current: string) {
    const entries = await fs.readdir(current, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      const relative = toPosixPath(path.relative(root, fullPath));

      if (entry.isDirectory()) {
        if (shouldSkipDir(relative, config)) continue;
        await walk(fullPath);
      } else if (entry.isFile() && isMarkdownFile(entry.name)) {
        files.push(fullPath);
      }
    }
  }

  try {
    await walk(root);
  } catch (error) {
    console.error(`[notesLoader] Failed to read notes directory at ${root}:`, error);
  }

  return files;
}

async function copyAssets(root: string, config: NoteVaultConfig): Promise<void> {
  const publicRoot = path.resolve(process.cwd(), 'public', 'notes-assets');

  async function walk(current: string) {
    const entries = await fs.readdir(current, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      const relative = toPosixPath(path.relative(root, fullPath));

      if (entry.isDirectory()) {
        if (shouldSkipDir(relative, config)) continue;
        await walk(fullPath);
      } else if (entry.isFile() && !isMarkdownFile(entry.name)) {
        if (shouldHidePath(relative, config)) continue;
        const target = path.join(publicRoot, relative);
        await fs.mkdir(path.dirname(target), { recursive: true });
        await fs.copyFile(fullPath, target);
      }
    }
  }

  try {
    await walk(root);
  } catch (error) {
    console.error(`[notesLoader] Failed to copy assets from ${root}:`, error);
  }
}

function isMarkdownFile(name: string): boolean {
  return name.toLowerCase().endsWith('.md');
}

function shouldSkipDir(relativeDir: string, config: NoteVaultConfig): boolean {
  const normalized = toPosixPath(relativeDir);

  return config.content.hiddenPaths.some((pattern) =>
    minimatch(normalized, pattern, { dot: true }) ||
    minimatch(`${normalized}/`, pattern, { dot: true }) ||
    minimatch(`${normalized}/**`, pattern, { dot: true })
  );
}

function shouldHidePath(relativePath: string, config: NoteVaultConfig): boolean {
  const normalized = toPosixPath(relativePath);
  const fileName = path.posix.basename(normalized);

  if (config.content.hiddenFiles.includes(fileName)) return true;

  return config.content.hiddenPaths.some((pattern) =>
    minimatch(normalized, pattern, { dot: true })
  );
}

async function parseNoteFile(
  absolutePath: string,
  relativeToContent: string,
  config: NoteVaultConfig
): Promise<NoteNode | null> {
  try {
    const raw = await fs.readFile(absolutePath, 'utf-8');
    const { data, content } = matter(raw);

    const missing = ['title', 'lang', 'translationKey'].filter(
      (field) => !(field in data)
    );

    if (missing.length) {
      console.warn(
        `[notesLoader] Missing required frontmatter (${missing.join(', ')}) in ${relativeToContent}. Skipping.`
      );
      return null;
    }

    const lang = String(data.lang) as NoteLang;
    if (!config.i18n.languages.includes(lang)) {
      console.warn(
        `[notesLoader] Unsupported lang "${data.lang}" in ${relativeToContent}. Expected one of ${config.i18n.languages.join(', ')}.`
      );
      return null;
    }

    const published = typeof data.published === 'boolean'
      ? data.published
      : config.content.defaultPublish;

    if (!published) return null;

    const filePath = toPosixPath(path.relative(getRepoRoot(), absolutePath));
    const dirPath = getDirPath(relativeToContent);
    const rawDirPath = getRawDir(relativeToContent);
    const slug = getSlugFromFilename(path.posix.basename(relativeToContent), lang, String(data.translationKey));

    const note: NoteNode = {
      title: String(data.title),
      lang,
      translationKey: String(data.translationKey),
      published,
      tags: Array.isArray(data.tags) ? data.tags.map(String) : undefined,
      filePath,
      slug,
      dirPath,
      rawDirPath,
      content
    };

    return note;
  } catch (error) {
    console.error(`[notesLoader] Failed to parse ${relativeToContent}:`, error);
    return null;
  }
}

function getSlugFromFilename(
  filename: string,
  lang: NoteLang,
  fallbackKey: string
): string {
  const base = filename.replace(/\.md$/i, '');
  const stripped = base.replace(new RegExp(`\\.${lang}$`, 'i'), '');
  const slug = slugifySegment(stripped);
  return slug || slugifySegment(fallbackKey);
}

function getDirPath(relativePath: string): string {
  const dir = toPosixPath(path.posix.dirname(relativePath));
  if (dir === '.' || dir === '') return '';
  return dir
    .split('/')
    .filter(Boolean)
    .map((segment) => slugifySegment(segment))
    .join('/');
}

function getOriginalDirSegments(note: NoteNode): string[] {
  const relative = toPosixPath(note.filePath);
  const withoutRoot = relative.startsWith('notes/') ? relative.replace(/^notes\//, '') : relative;
  const dir = path.posix.dirname(withoutRoot);
  if (dir === '.' || dir === '') return [];
  return dir.split('/').filter(Boolean);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getRawDir(relativePath: string): string {
  const dir = toPosixPath(path.posix.dirname(relativePath));
  return dir === '.' ? '' : dir;
}

function rewriteImageSrc(src: string, noteDir: string): string {
  let cleaned = src.trim();
  if (cleaned.startsWith('<') && cleaned.endsWith('>')) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  if (/^(https?:)?\/\//i.test(cleaned) || cleaned.startsWith('data:')) {
    return cleaned;
  }
  if (cleaned.startsWith('/')) {
    return cleaned;
  }

  let decoded = cleaned;
  try {
    decoded = decodeURIComponent(cleaned);
  } catch {
    decoded = cleaned;
  }

  const resolved = path.posix
    .normalize(path.posix.join(noteDir || '', decoded))
    .replace(/^(\.\/)+/, '');

  return `/notes-assets/${resolved}`;
}
