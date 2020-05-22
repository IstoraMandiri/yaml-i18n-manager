import read from './read';
import translate from './translate';
import { combine, match, log } from './utils';
import { parse, generate as generateCsv } from './csv';
import eject from './eject';

import type { Config } from './types';
import generateYaml from './yaml';

async function getTranslations(targetLocale: string, opts: Config) {
  const { contentDir, filterKeys, defaultLocale } = opts;
  const existing = await read(opts);
  const filtered = existing.filter(({ key, value }) => {
    return filterKeys.indexOf(key) === -1 && !value.startsWith('http');
  });
  const matched = match(filtered).filter(({ locale }) => locale === defaultLocale);
  const requiresTranslating = matched.filter(({ matches }) => !matches[targetLocale]);
  const translated = await translate(requiresTranslating, defaultLocale, targetLocale);
  return combine(matched, translated, targetLocale);
}

const commands: any = {
  generate: async ({ locale }: { locale: string }, config: Config) => {
    // generate
    const translations = await getTranslations(locale, config);
    const outputDir = `${config.outputDir || config.contentDir}/${config.yamlDir}`;
    const filePath = `${outputDir}/${locale}.yaml`;
    await generateYaml(translations, filePath);
    log(`Wrote ${translations.length} translations to ${filePath}`);
  },
  eject: async ({ locale }: { locale: string }, config: Config) => {
    const translations = await getTranslations(locale, config);
    const outputDir = config.outputDir || config.contentDir;
    await eject(translations, outputDir);
    log(`Wrote ${translations.length} translations to ${outputDir}`);
  },
  export: async ({ locale }: { locale: string }, config: Config) => {
    const translations = await getTranslations(locale, config);
    const filePath = `${config.csvDir}/${locale}.csv`;
    await generateCsv(translations, filePath);
    log(`Wrote to ${filePath}`);
  },
  import: async ({ csv }: { csv: string }, config: Config) => {
    const imports = await parse(csv);
    const outputDir = config.outputDir || config.contentDir;
    await eject(imports, outputDir);
    log(`Wrote ${imports.length} imports to ${outputDir}`);
  },
};

export default commands;
