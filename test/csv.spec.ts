import data from './data/misc/translated.json';
import csvGenerate from '../src/csv';

describe('writeCsv', () => {
  it('formats the CSV file correctly', async () => {
    expect(await csvGenerate(data)).toMatchSnapshot();
  });
});
