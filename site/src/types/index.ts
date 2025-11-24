export type NoteLang = 'zh' | 'en';

export interface NoteMeta {
  title: string;
  lang: NoteLang;
  translationKey: string;
  published?: boolean;
  tags?: string[];
  filePath: string; // Path from repo root, e.g. "notes/system-design/rate-limiter.zh.md"
  slug: string;
  dirPath: string;
  rawDirPath?: string;
}

export interface NoteNode extends NoteMeta {
  content: string;
}

export interface NoteGroupByTranslationKey {
  translationKey: string;
  notesByLang: Record<NoteLang, NoteNode | undefined>;
}

export interface NavNode {
  type: 'folder' | 'note';
  name: string;
  path: string;
  children?: NavNode[];
  lang?: NoteLang;
  translationKey?: string;
  slug?: string;
}

export interface NoteVaultConfig {
  site: {
    title: string;
    basePath: string;
    defaultLang: NoteLang;
    subtitle?: string;
    social?: {
      github?: string;
      linkedin?: string;
      email?: string;
    };
  };
  content: {
    root: string;
    hiddenPaths: string[];
    hiddenFiles: string[];
    defaultPublish: boolean;
  };
  i18n: {
    languages: NoteLang[];
    fallbacks: Record<NoteLang, NoteLang>;
    fileStrategy: 'paired';
    langField: string;
    translationKeyField: string;
  };
}
