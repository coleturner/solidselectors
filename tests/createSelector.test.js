import { createSelector } from '..';

describe('createSelector()', () => {
  test('Prefix can be specified', () => {
    expect(createSelector({ prefix: 'cool' }).startsWith('cool:')).toBe(true);
  });

  test('Returns unique selectors for each call', () => {
    const used = [];
    while (used.length < 1000) {
      const selector = createSelector();

      expect(used.includes(selector)).toBe(false);
      used.push(selector);
    }
  });
});
