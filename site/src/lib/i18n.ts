import type { NoteLang, NoteVaultConfig } from '../types';

export const uiStrings: Record<NoteLang, Record<string, string>> = {
  zh: {
    nav: '目錄',
    searchPlaceholder: '搜尋筆記',
    language: '語言',
    switchTo: '切換為',
    noTranslation: '尚無其他語言版本',
    backHome: '返回首頁'
  },
  en: {
    nav: 'Navigation',
    searchPlaceholder: 'Search notes',
    language: 'Language',
    switchTo: 'Switch to',
    noTranslation: 'No alternate language yet',
    backHome: 'Back to home'
  }
};

export function normalizeLang(lang: string | undefined, config: NoteVaultConfig): NoteLang {
  if (lang && config.i18n.languages.includes(lang as NoteLang)) {
    return lang as NoteLang;
  }
  return config.site.defaultLang;
}

export function getFallbackLang(lang: NoteLang, config: NoteVaultConfig): NoteLang | undefined {
  const fallback = config.i18n.fallbacks?.[lang];
  if (fallback && config.i18n.languages.includes(fallback as NoteLang)) {
    return fallback as NoteLang;
  }
  return undefined;
}
