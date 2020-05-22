import { createHash } from 'crypto';

import type { ExistingYaml, TranslatedYaml, MatchedYaml } from './types';

export const K_SEP = '__';

export function normalizeSig({ path, sig }: ExistingYaml | TranslatedYaml) {
  const nPath = path.split('.').slice(0, -2).join('.');
  return `${nPath}:${sig.replace(/\[.*?\:/g, '[')}`;
}

export function replaceLocaleInPath(path: string, posftFix: string) {
  return `${path.split('.').slice(0, -2).join('.')}.${posftFix}`;
}

export function hash(str: string): string {
  return createHash('sha256').update(str, 'utf8').digest('base64').slice(0, 10);
}

export function match(yamls: ExistingYaml[]): MatchedYaml[] {
  return yamls.map((dYaml) => {
    const matches = yamls.reduce((o, tYaml) => {
      if (tYaml.locale == dYaml.locale || normalizeSig(tYaml) !== normalizeSig(dYaml)) {
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
      const match =
        (m.matches || {})[locale] || translated.find((t) => normalizeSig(t) === normalizeSig(m));
      const path = replaceLocaleInPath(m.path, `${locale}.yaml`);
      return {
        path,
        locale: locale,
        sig: m.sig,
        key: m.key,
        dHash: m.vHash,
        defaultValue: m.value,
        value: match && match.value,
      };
    },
  );
}

export function log(str: string, ...rest: any) {
  console.log(str, ...rest);
}
