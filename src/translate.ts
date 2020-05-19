import googleTranslate from 'google-translate';

if (!process.env.GT_KEY) {
  throw new Error('You must specify a google translate key `export GT_KEY=XXX`');
}

const gt = googleTranslate(process.env.GT_KEY);

function transformTranslation(translated: string, original: string) {
  let str = translated
    // english stuff
    .replace(/] \(/g, '](')
    .replace(/\/ /g, '/')
    .replace(/ \//g, '/')
    .replace(/! \[/g, '![')
    // chinese characters
    .replace(/＃/g, '#')
    .replace(/！/g, '!')
    .replace(/（/g, '(')
    .replace(/）/g, ')');

  if (original.endsWith('  ')) {
    str = `${str}  `;
  }
  return str;
}

export default async function translate(
  normalized: ExistingYaml[],
  from: string,
  to: string,
): Promise<TranslatedYaml[]> {
  return await new Promise((resolve, reject) => {
    gt.translate(
      normalized.map(({ value }) => value),
      from,
      to,
      (err: Error, _res: { translatedText: string }[]) => {
        if (err) {
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
