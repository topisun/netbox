import { replaceAll } from './util';

describe('replaceAll', () => {
  const original = 'string1with2numbers3in4it5!';
  const expected = 'stringwithnumbersinit!';

  it('works with RegExp', () => {
    expect(replaceAll(original, new RegExp('\\d+'), '')).toBe(expected);
  });

  it('works with inline RegExp', () => {
    expect(replaceAll(original, /\d+/, '')).toBe(expected);
  });

  it('works with string', () => {
    expect(replaceAll(original, '\\d+', '')).toBe(expected);
  });

  it('works when global flag is already set', () => {
    expect(replaceAll(original, /\d+/g, '')).toBe(expected);
  });

  it('throws when input is not a string', () => {
    // @ts-expect-error intentional type check.
    expect(() => replaceAll(1, '\\d+', '')).toThrow(TypeError);
  });

  it('throws when pattern is not a string or RegExp', () => {
    // @ts-expect-error intentional type check.
    expect(() => replaceAll(original, 1, '')).toThrow(TypeError);
  });

  it('throws when replacement is not stringifyable', () => {
    // @ts-expect-error intentional type check.
    expect(() => replaceAll(original, /\d+/, [])).toThrow(TypeError);
  });
});
