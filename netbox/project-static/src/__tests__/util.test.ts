import {
  cToF,
  replaceAll,
  createElement,
  getNetboxData,
  uniqueByProperty,
  toggleVisibility,
  findFirstAdjacent,
} from '../util';

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

describe('uniqueByProperty', () => {
  it('deduplicates the object by id property', () => {
    const objIn = [
      { id: 1, name: 'One' },
      { id: 2, name: 'Two' },
      { id: 3, name: 'Three' },
      { id: 1, name: 'Other One' },
    ];
    const expected = [
      { id: 1, name: 'One' },
      { id: 2, name: 'Two' },
      { id: 3, name: 'Three' },
    ];
    expect(uniqueByProperty(objIn, 'id')).toStrictEqual(expected);
  });
});

describe('cToF', () => {
  it('converts freezing', () => {
    expect(cToF(0)).toBe(32);
  });

  it('converts boiling', () => {
    expect(cToF(100)).toBe(212);
  });
});

describe('createElement', () => {
  it('creates a basic element', () => {
    const element = createElement('div', {});
    expect(element).toBeEmptyDOMElement();
  });

  it('creates an element with props', () => {
    const element = createElement('div', { id: 'with-props' });
    expect(element.id).toBe('with-props');
  });

  it('creates an element with classes', () => {
    const element = createElement('div', {}, ['blue', 'box']);
    expect(element.classList.toString()).toBe('blue box');
  });

  it('creates an element with children', () => {
    const child = createElement('span', {});
    const element = createElement('div', {}, [], [child]);
    expect(element.hasChildNodes()).toBe(true);
  });

  it('creates a complex element', () => {
    const element = createElement(
      'div',
      { id: 'box', title: 'Title' },
      ['blue', 'box'],
      [
        createElement('span', { hidden: true }, ['red', 'line']),
        createElement('span', { id: '2' }, ['red', 'line']),
      ],
    );

    const first = element.children[0];
    const second = element.children[1];

    expect(element.id).toBe('box');
    expect(element.title).toBe('Title');
    expect(element.classList.toString()).toBe('blue box');
    expect(element.childElementCount).toBe(2);

    expect(first?.getAttribute('hidden')).toBe('');
    expect(first?.classList.toString()).toBe('red line');

    expect(second?.id).toBe('2');
    expect(second?.classList.toString()).toBe('red line');
  });
});

describe('findFirstAdjacent', () => {
  it('finds an adjacent element', () => {
    document.body.innerHTML = `
      <div id="root">
          <div class="parent" success="true">
              <div>
                  <div>
                    <div id="nested" />
                  </div>
              </div>
          </div>
      </div>`;
    const base = document.getElementById('nested');
    const result = findFirstAdjacent(base!, 'div.parent');
    expect(result).toBeInstanceOf(HTMLDivElement);
    expect(result?.getAttribute('success')).toBe('true');
  });

  it('stops at boundary', () => {
    document.body.innerHTML = `
      <div id="root">
          <div class="parent">
              <div class="boundary">
                  <div>
                    <div id="nested" />
                  </div>
              </div>
          </div>
      </div>`;
    const base = document.getElementById('nested');
    const result = findFirstAdjacent(base!, '.parent', '.boundary');
    expect(result).toBeNull();
  });
});

describe('toggleVisibility', () => {
  it('toggles with action', () => {
    document.body.innerHTML = `
    <div id="root">
        <div id="toggle-me"></div>
    </div>
  `;
    const element = document.getElementById('toggle-me')!;
    toggleVisibility(element, 'hide');
    expect(element.style.display).toBe('none');
    toggleVisibility(element, 'show');
    expect(element.style.display).toBe('');
  });

  it('toggles without action', () => {
    document.body.innerHTML = `
    <div id="root">
        <div id="toggle-me"></div>
    </div>
  `;
    const element = document.getElementById('toggle-me')!;
    toggleVisibility(element);
    expect(element.style.display).toBe('none');
    toggleVisibility(element);
    expect(element.style.display).toBe('');
  });

  it('toggles node with display:none already set', () => {
    document.body.innerHTML = `
    <div id="root">
        <div id="toggle-me" style="display:none;"></div>
    </div>
  `;
    const element = document.getElementById('toggle-me')!;
    toggleVisibility(element);
    expect(element.style.display).toBe('');
    toggleVisibility(element);
    expect(element.style.display).toBe('none');
  });
});

describe('getNetboxData', () => {
  it('gets data with prefix', () => {
    document.body.innerHTML = `
      <div id="netbox-data">
          <span data-foo="bar">
      </div>
    `;
    expect(getNetboxData('data-foo')).toBe('bar');
  });
  it('gets data without prefix', () => {
    expect(getNetboxData('foo')).toBe('bar');
  });
});
