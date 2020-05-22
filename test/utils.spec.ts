import { hash, match } from '../src/utils';

describe('utils', () => {
  describe('match', () => {
    it('matches sibling translations', () => {
      expect(
        match(
          [
            { path: 'a.en.yaml', sig: 'a', locale: 'en' },
            { path: 'a.jp.yaml', sig: 'a', locale: 'jp' },
            { path: 'b.en.yaml', sig: 'a__test__thing', locale: 'en' },
            { path: 'b.jp.yaml', sig: 'a__test__thing', locale: 'jp' },
          ].map((item, i) => ({ ...item, value: 'a', key: 'b', vHash: 'c' })),
        ),
      ).toMatchSnapshot();
    });
  });
});
