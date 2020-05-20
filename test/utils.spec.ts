import { hash, match } from '../src/utils';

describe('utils', () => {
  describe('hash', () => {
    it('hashes', async () => {
      expect(hash('hello')).toMatchSnapshot();
    });
  });

  describe('match', () => {
    it('matches sibling translations', () => {
      expect(
        match(
          [
            { path: 'a.en.yaml', sig: 'a', locale: 'en' },
            { path: 'a.jp.yaml', sig: 'a', locale: 'jp' },
            { path: 'b.en.yaml', sig: 'a[0:test].thing', locale: 'en' },
            { path: 'b.jp.yaml', sig: 'a[0:test].thing', locale: 'jp' },
          ].map((item, i) => ({ ...item, value: 'a', key: 'b', vHash: 'c' })),
        ),
      ).toMatchSnapshot();
    });
  });
});
