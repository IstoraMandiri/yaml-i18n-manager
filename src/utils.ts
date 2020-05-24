import { createHash } from 'crypto';
import { promises } from 'fs';
const { readdir } = promises;
import { resolve, relative } from 'path';

import type { ExistingYaml, TranslatedYaml, MatchedYaml } from './types';

export const K_SEP = '__';

export function replaceLocaleInPath(path: string, posftFix: string) {
  return `${path.split('.').slice(0, -2).join('.')}.${posftFix}`;
}

export function hash(str: string): string {
  return createHash('sha256').update(str, 'utf8').digest('base64').slice(0, 10);
}

export function match(yamls: ExistingYaml[]): MatchedYaml[] {
  return yamls.map((dYaml) => {
    const matches = yamls.reduce((o, tYaml) => {
      if (tYaml.locale == dYaml.locale || tYaml.fullSig !== dYaml.fullSig) {
        return o;
      }
      return { [tYaml.locale]: tYaml };
    }, {});
    return { ...dYaml, matches };
  });
}

export function combine(
  matched: MatchedYaml[],
  translated: TranslatedYaml[],
  locale: string,
): TranslatedYaml[] {
  return matched.map(
    (m): TranslatedYaml => {
      const match = (m.matches || {})[locale] || translated.find((t) => t.fullSig === m.fullSig);
      const path = replaceLocaleInPath(m.path, `${locale}.yaml`);
      return {
        path,
        locale: locale,
        sig: m.sig,
        key: m.key,
        dHash: m.vHash,
        defaultValue: m.value,
        fullSig: m.fullSig,
        value: match && match.value,
      };
    },
  );
}

export function log(str: string, ...rest: any) {
  console.log(str, ...rest);
}

export async function scanDir(
  contentDir: string,
  dir?: string,
): Promise<{ name: string; path: string; relative: string; ext: string }[]> {
  const target = dir || contentDir;
  const dirEntries = await readdir(target, { withFileTypes: true });
  const files = await Promise.all(
    dirEntries.map((entry: any): any => {
      const res = resolve(target, entry.name);
      if (entry.isDirectory()) {
        return scanDir(contentDir, res);
      }
      const ext = entry.name.split('.').pop();
      return { ...entry, path: res, ext, relative: relative(contentDir, res) };
    }),
  );
  return Array.prototype.concat(...files.filter((i) => i));
}
