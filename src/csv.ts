import { promises as fs } from 'fs';

import csv from 'async-csv';

import type { TranslatedYaml } from './types';

const columns = [
  { key: 'dHash', header: 'dHash' },
  { key: 'path', header: 'Location' },
  { key: 'sig', header: 'Key' },
  { key: 'defaultValue', header: 'Default Language' },
  { key: 'value', header: 'Existing Translation' },
  { key: 'update', header: 'Updated Translation (or leave blank)' },
];

const parseColumns = columns.map(({ key }) => key);

export async function generate(data: TranslatedYaml[]) {
  return await csv.stringify(data, { header: true, columns });
}

export async function parse(path: string) {
  const str = await fs.readFile(path, 'utf8');
  return (await csv.parse(str, { columns: parseColumns, skip_empty_lines: true })).slice(1);
}
