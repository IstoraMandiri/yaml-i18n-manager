import googleTranslate from 'google-translate';

import type { ExistingYaml } from './types';

if (!process.env.GT_KEY) {
  throw new Error('You must specify a google translate key `export GT_KEY=XXX`');
}

const gt = googleTranslate(process.env.GT_KEY);

function transformTranslation(translated: string, original: string) {
  let str = translated
    // URL formatting
    .replace(/] \(/g, '](')
    .replace(/\/ /g, '/')
    .replace(/ \//g, '/')
    .replace(/! \[/g, '![')
    // chinese characters
    .replace(/＃/g, '#')
    .replace(/！/g, '!')
    .replace(/（/g, '(')
    .replace(/）/g, ')')
    // markdown multiline titles (##X => ## X)
    .replace(/^#+(?=[^\s#])/gm, '$& ');

  // line breaks
  if (original.endsWith('  ')) {
    str = `${str}  `;
  }

  return str;
}

export async function translateYaml(
  normalized: ExistingYaml[],
  from: string,
  to: string,
): Promise<any> {
  console.log(`Using google to translate ${normalized.length} items`);
  return await new Promise((resolve, reject) => {
    gt.translate(
      normalized.map(({ value }) => value),
      from,
      to,
      (err: Error, _res: { translatedText: string }[]) => {
        if (err) {
          console.log(err);
          return reject(err);
        }
        const res = Array.isArray(_res) ? _res : [_res];
        return resolve(
          res.map(({ translatedText: translated }, i) => {
            const { vHash, value: defaultValue, ...original } = normalized[i];
            const value = transformTranslation(translated, defaultValue);
            return { ...original, dHash: vHash, defaultValue, value, locale: to };
          }),
        );
      },
    );
  });
}
