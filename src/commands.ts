import read from './read';
import translate from './translate';
import { combine, match } from './utils';
import { parse } from './csv';
import write from './write';

import type { Config } from './types';

async function getTranslations(targetLocale: string, opts: Config) {
  const { contentDir, filterKeys, defaultLocale } = opts;
  const existing = await read(contentDir);
  const filtered = existing.filter(({ key }) => filterKeys.indexOf(key) === -1);
  const matched = match(filtered).filter(({ locale }) => locale === defaultLocale);
  const requiresTranslating = matched.filter(({ matches }) => !matches[targetLocale]);
  const translated = await translate(requiresTranslating, defaultLocale, targetLocale);
  return combine(matched, translated, targetLocale);
}

const commands: any = {
  // TODO generate-all
  generate: async ({ locale }: { locale: string }, config: Config) => {
    const translations = await getTranslations(locale, config);
    const outputDir = config.outputDir || config.contentDir;
    await write(translations, outputDir);
    console.log(`Wrote ${translations.length} translations to ${outputDir}`);
  },
  export: async ({ locale }: { locale: string }, config: Config) => {
    console.log('export', { locale, config });
  },
  import: async ({ csv }: { csv: string }, config: Config) => {
    const imports = await parse(csv);
    const outputDir = config.outputDir || config.contentDir;
    await write(imports, outputDir);
    console.log(`Wrote ${imports.length} imports to ${outputDir}`);
  },
  // TODO update
};

export default commands;
