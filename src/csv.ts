import csv from 'async-csv';
import { promises as fs } from 'fs';

import type { TranslatedYaml } from './types';
import { log } from './utils';

const columns = [
  { key: 'dHash', header: 'dHash' },
  { key: 'path', header: 'Location' },
  { key: 'sig', header: 'Key' },
  { key: 'defaultValue', header: 'Default Language' },
  { key: 'value', header: 'Existing Translation' },
  { key: 'update', header: 'Updated Translation (or leave blank)' },
];

const parseColumns = columns.map(({ key }) => key);

async function makeBackup(path: string, i = 0) {
  const target = i === 0 ? path : `${path.split('.').slice(0, -1).join('.')}.${i}.csv`;
  try {
    await fs.access(`${target}`);
    await makeBackup(path, i + 1);
  } catch (e) {
    if (i !== 0) {
      await fs.link(path, target);
      log(`Created backup ${target}`);
    }
  }
}

export async function generate(data: TranslatedYaml[], path: string) {
  const content = await csv.stringify(data, { header: true, columns });
  await makeBackup(path);
  await fs.writeFile(path, content, 'utf8');
  log(`Wrote to ${path}`);
}

export async function parse(path: string) {
  const str = await fs.readFile(path, 'utf8');
  const data: any[] = await csv.parse(str, {
    columns: parseColumns,
    skip_empty_lines: true,
  });
  return data
    .slice(1)
    .filter(({ update }) => update !== '')
    .map(({ update, ...y }) => ({ ...y, value: update }));
}
