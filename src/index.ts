import read from './read';
import translate from './translate';
import write from './write';
import generate from './csv';
import match from './match';
import resolve from './resolve';

const filterKeys = ['link'];

// TODO manage comments etc...

/* prompts */
/*
-- generate

-- export

-- import

TODO:
-- update
*/

const inDir = './test/data/content-input';
const outDir = './test/data/content-output';

const defaultLocale = 'en';

async function getTranslations(targetLocale: string) {
  const existing = await read(inDir);
  const filtered = existing.filter(({ key }) => filterKeys.indexOf(key) === -1);
  const matched = match(filtered).filter(({ locale }) => locale === defaultLocale);
  const requiresTranslating = matched.filter(({ matches }) => !matches[targetLocale]);
  const translated = await translate(requiresTranslating, defaultLocale, targetLocale);
  return resolve(matched, translated, targetLocale);
}

(async () => {
  const translations = await getTranslations('ja');

  // await write(translations, outDir);
  // const csv = await generate(translations);
  console.log(translations);
})();
