import { createLiveSelector } from '..';

describe('createLiveSelector()', () => {
  const factory = createLiveSelector({ prefix: 'cool' });

  test('Prefix can be specified', () => {
    expect(factory('my key').startsWith('cool:')).toBe(true);
  });

  test('Returns unique selectors for each item call', () => {
    const used = [];
    const assert = value => {
      expect(used.includes(value)).toBe(false);
      used.push(value);
    };

    while (used.length < 1000) {
      const factory = createLiveSelector();

      assert(factory('1'));
      assert(factory('2'));
      assert(factory('3'));
    }
  });

  describe('.strict(key)', () => {
    test('null as key throws error', () => {
      expect(() => factory.strict(null)).toThrow();
    });

    test('undefined as key throws error', () => {
      expect(() => factory.strict(undefined)).toThrow();
    });
  });
});
