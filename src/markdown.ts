import yaml from 'yaml';
import fs from 'fs-extra';
import { resolve } from 'path';
import { Config } from './types';
import { scanDir } from './utils';
import { translateYaml } from './translate';

async function parseMarkdonwFile(file: string): Promise<{ header?: any; body: string }> {
  const data = await fs.readFile(file, 'utf8');
  let header, body;
  if (data.startsWith('---')) {
    const [_, _header, _body] = data.split('---');
    body = _body;
    header = yaml.parse(_header);
  } else {
    body = data;
  }
  return { header, body };
}

function normalize(n: string): string {
  const str = n.split('.').slice(0, -2).join('.');
  console.log(str);
  return str;
}

export async function generateMarkdown(locale: string, opts: Config) {
  const markdownFiles = (await scanDir(opts.contentDir))
    .filter(({ ext }) => ['md', 'mdx'].includes(ext))
    .filter(({ relative }) => !opts.filterMarkdown.find((p) => relative.startsWith(p)))
    .map((md) => ({ ...md, locale: md.name.split('.').slice(-2)[0] }))
    .filter(({ locale }) => [opts.defaultLocale, locale].includes(locale));
  const deduped = markdownFiles.filter(
    ({ relative, locale }) =>
      locale === opts.defaultLocale &&
      !markdownFiles.find(
        ({ relative: r2, locale: l2 }) => l2 !== locale && normalize(r2) === normalize(relative),
      ),
  );
  const contents = await Promise.all(
    deduped.map(async (file) => ({ ...file, data: await parseMarkdonwFile(file.path) })),
  );
  const normalized = contents.reduce((a, i): any => {
    const {
      data: { header, body },
      relative,
    } = i;
    const items = [{ relative, key: 'body', value: body }];
    Object.keys(header)
      .filter((k) => !opts.filterKeys.includes(k))
      .forEach((k) => {
        items.push({ relative, key: `header.${k}`, value: header[k] });
      });
    return [...a, ...items];
  }, []);

  const translated = await translateYaml(normalized, opts.defaultLocale, locale);
  const constructed = translated.reduce((o: any, { relative, key, value }: any) => {
    const [k, subKey] = key.split('.');
    const update = o[relative] || {};
    update[k] = subKey ? { ...update[k], [subKey]: value } : value;
    return { ...o, [relative]: update };
  }, {});
  // now write the files.
  await Promise.all(
    Object.keys(constructed).map(async (k) => {
      const newFileName = `${k.split('.').slice(0, -2).join('.')}.${locale}.${k.split('.').pop()}`;
      const { header, body } = constructed[k];
      const data = `---\n${yaml.stringify(header).trim()}\n---${body}`;
      await fs.writeFile(resolve(opts.contentDir, newFileName), data);
    }),
  );
}
