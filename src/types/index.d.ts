declare module 'google-translate';
declare module 'async-csv';

interface ExistingYaml {
  path: string;
  locale: string;
  sig: string;
  key: string;
  value: string;
  vHash: string;
  matches?: {
    [key: string]: ExistingYaml;
  };
}

interface TranslatedYaml {
  path: string;
  locale: string;
  sig: string;
  key: string;
  dHash: string;
  defaultValue: string;
  value: string;
  update?: string;
}

interface Config {
  defaultLocale: string;
  filterKeys: string[];
  contentDir: string;
  managementDir: string;
}
