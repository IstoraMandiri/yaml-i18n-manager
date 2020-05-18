import { normalizeSig, replaceLocaleInPath } from './utils';

export default function (
  matched: ExistingYaml[],
  translated: TranslatedYaml[],
  locale: string,
): TranslatedYaml[] {
  return matched.map((m) => {
    const match = m.matches[locale] || translated.find((t) => normalizeSig(t) === normalizeSig(m));
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
  });
}
