import read from './read';
import translate from './translate';
import { combine, match } from './utils';

async function getTranslations(targetLocale: string, opts: Config) {
  const { contentDir, filterKeys, defaultLocale } = opts;
  const existing = await read(contentDir);
  const filtered = existing.filter(({ key }) => filterKeys.indexOf(key) === -1);
  const matched = match(filtered).filter(({ locale }) => locale === defaultLocale);
  const requiresTranslating = matched.filter(({ matches }) => !matches[targetLocale]);
  const translated = await translate(requiresTranslating, defaultLocale, targetLocale);
  return combine(matched, translated, targetLocale);
}

const commands: { [k: string]: (p: any, c: Config) => Promise<void> } = {
  // TODO generate-all
  generate: async ({ locale }: { locale: string }, config: Config) => {
    const res = await getTranslations(locale, config);
    // TODO write them!
    console.log('got', res);
  },
  export: async ({ locale }: { locale: string }, config: Config) => {
    console.log('export', { locale, config });
  },
  import: async ({ csv }: { csv: string }, config: Config) => {
    console.log('import', { csv, config });
  },
  // TODO update
};

export default commands;
