import csv from 'async-csv';

const columns = [
  { key: 'dHash', header: 'dHash' },
  { key: 'path', header: 'Location' },
  { key: 'sig', header: 'Key' },
  { key: 'defaultValue', header: 'Default Language' },
  { key: 'value', header: 'Existing Translation' },
  { key: 'update', header: 'Updated Translation (or leave blank)' },
];

export default async function generate(data: TranslatedYaml[]) {
  return await csv.stringify(data, { header: true, columns });
}
