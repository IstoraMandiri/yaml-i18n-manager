import { resolve } from 'path';
import data from './data/misc/translated.json';
import { generate, parse } from '../src/csv';

const sampleImport = resolve(__dirname, './data/misc/import.csv');

describe('csv', () => {
  it('generates csv', async () => {
    expect(await generate(data)).toMatchSnapshot();
  });
  it('parses csv', async () => {
    expect(await parse(sampleImport)).toMatchSnapshot();
  });
});
