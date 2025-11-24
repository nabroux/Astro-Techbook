import fs from 'node:fs/promises';
import path from 'node:path';
import type { NoteVaultConfig } from '../types';

const REPO_ROOT = path.resolve(process.cwd(), '..');
const CONFIG_PATH = path.join(REPO_ROOT, 'note_vault.config.json');

const defaultConfig: NoteVaultConfig = {
  site: {
    title: 'Astro Techbook',
    basePath: '/',
    defaultLang: 'zh',
    subtitle: 'Your Obsidian vault, published.',
    social: {
      github: '',
      linkedin: '',
      email: ''
    }
  },
  content: {
    root: 'notes',
    hiddenPaths: [],
    hiddenFiles: [],
    defaultPublish: true
  },
  i18n: {
    languages: ['zh', 'en'],
    fallbacks: {
      en: 'zh',
      zh: 'en'
    },
    fileStrategy: 'paired',
    langField: 'lang',
    translationKeyField: 'translationKey'
  }
};

let cachedConfig: NoteVaultConfig | null = null;

export function getRepoRoot(): string {
  return REPO_ROOT;
}

export async function loadConfig(refresh = false): Promise<NoteVaultConfig> {
  if (cachedConfig && !refresh) return cachedConfig;

  try {
    const raw = await fs.readFile(CONFIG_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as NoteVaultConfig;
    cachedConfig = {
      ...defaultConfig,
      ...parsed,
      site: { ...defaultConfig.site, ...parsed.site },
      content: { ...defaultConfig.content, ...parsed.content },
      i18n: { ...defaultConfig.i18n, ...parsed.i18n }
    };
    return cachedConfig;
  } catch (error) {
    console.warn(
      `Failed to read config at ${CONFIG_PATH}. Falling back to defaults. Error:`,
      error
    );
    cachedConfig = defaultConfig;
    return defaultConfig;
  }
}

export function getContentRootAbsolute(config: NoteVaultConfig): string {
  return path.resolve(REPO_ROOT, config.content.root || 'notes');
}

export function toPosixPath(input: string): string {
  return input.split(path.sep).join('/');
}
