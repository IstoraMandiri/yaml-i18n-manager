declare global {
  namespace NodeJS {
    interface ProcessEnv {
      GT_KEY: string;
      NODE_ENV: 'development' | 'production';
      PWD: string;
    }
  }
}

export interface ExistingYaml {
  path: string;
  locale: string;
  sig: string;
  key: string;
  value: string;
  vHash: string;
  fullSig: string;
}

export interface MatchedYaml extends ExistingYaml {
  matches: {
    [key: string]: ExistingYaml;
  };
}

export interface TranslatedYaml {
  path: string;
  locale: string;
  sig: string;
  key: string;
  dHash: string;
  defaultValue: string;
  value: string;
  fullSig: string;
  update?: string;
}

export interface Config {
  defaultLocale: string;
  filterKeys: string[];
  filterMarkdown: string[];
  contentDir: string;
  csvDir: string;
  yamlDir: string;
  outputDir?: string;
}
