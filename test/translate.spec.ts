jest.mock('google-translate');
import googleTranslate from 'google-translate';

googleTranslate.mockImplementation(() => {
  return {
    translate: (
      strings: string[],
      _from: string,
      _to: string,
      callback: (err: null, res: { translatedText: string }[]) => {},
    ) => {
      callback(
        null,
        strings.map((s) => ({ translatedText: `${s} ] (/  /! [＃！（）` })),
      );
    },
  };
});

import translate from '../src/translate';

const sampleData = [
  {
    path: 'string',
    locale: 'string',
    sig: 'string',
    key: 'string',
    value: 'string',
    vHash: 'string',
  },
  {
    path: 'string2',
    locale: 'string2',
    sig: 'string2',
    key: 'string2',
    value: 'string2',
    vHash: 'string2',
  },
];

describe('translate', () => {
  it('returns the correct translated YAML object', async () => {
    expect(await translate(sampleData, 'en', 'jp')).toMatchSnapshot();
  });
});
