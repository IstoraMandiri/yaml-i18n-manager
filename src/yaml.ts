import { TranslatedYaml, Config } from './types';
import YAML from 'yaml';
import { Pair, Scalar } from 'yaml/types';
import { Type } from 'yaml/util';
import { writeFile } from 'fs-extra';
import read from './read';
import { translateYaml } from './translate';
import { combine, match } from './utils';

function formatComment(str: string) {
  return str
    .trim()
    .split('\n')
    .map((s: string) => ` ${s}`)
    .join('\n');
}

export default async function generateYaml(translations: TranslatedYaml[], filePath: string) {
  // convert to yaml and include the english comment
  const doc = new YAML.Document() as any;
  doc.contents = YAML.createNode({});
  translations.forEach((t) => {
    const key = new Scalar(t.fullSig);
    const value = new Scalar(t.value);
    const pair = new Pair(key, value);
    value.type = Type.BLOCK_LITERAL;
    pair.commentBefore = formatComment(t.defaultValue);
    pair.spaceBefore = true;
    doc.contents.add(pair);
  });
  await writeFile(filePath, doc.toString());
}

export async function getYamlTranslations(targetLocale: string, opts: Config) {
  const { filterKeys, defaultLocale } = opts;
  const existing = await read(opts);
  const filtered = existing.filter(({ key, value }) => {
    return filterKeys.indexOf(key) === -1 && !value.startsWith('http');
  });
  const matched = match(filtered).filter(({ locale }) => locale === defaultLocale);
  const requiresTranslating = matched.filter(({ matches }) => !matches[targetLocale]);
  const translated = requiresTranslating.length
    ? await translateYaml(requiresTranslating, defaultLocale, targetLocale)
    : [];
  return combine(matched, translated, targetLocale);
}
