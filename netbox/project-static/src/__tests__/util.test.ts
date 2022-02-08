import {
  all,
  createElement,
  cToF,
  elementWidth,
  findFirstAdjacent,
  getCsrfToken,
  getElement,
  getElements,
  getNetboxData,
  getSelectedOptions,
  hasError,
  hasMore,
  isApiError,
  isElement,
  isTruthy,
  removeElements,
  replaceAll,
  resetSelect,
  toggleLoader,
  toggleVisibility,
  uniqueByProperty,
} from '../util';

describe('all', () => {
  it('all strings', () => expect(all(['one', 'two', 'three'])).toBe(true));

  it('with nulls', () => expect(all(['one', 'two', 'three', null])).toBe(false));

  it('with undefined', () => expect(all(['one', 'two', 'three', null, undefined])).toBe(false));
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

describe('cToF', () => {
  it('converts freezing', () => {
    expect(cToF(0)).toBe(32);
  });

  it('converts boiling', () => {
    expect(cToF(100)).toBe(212);
  });
});

describe('elementWidth', () => {
  it('gets the width of a valid element', () => {
    document.body.innerHTML = `
      <div id="root">
          <div id="test" style="width:128px;"></div>
      </div>
  `;
    const base = document.getElementById('test')!;
    const result = elementWidth(base);
    expect(result).toBe(128.0);
  });

  it('returns 0 on a null element', () => {
    document.body.innerHTML = `
        <div id="root">
            <div style="width:128px;"></div>
        </div>
    `;
    const base = document.getElementById('test');
    const result = elementWidth(base);
    expect(result).toBe(0);
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

describe('getCsrfToken', () => {
  it('gets the token when it is set', () => {
    document.cookie = 'csrftoken=testvalue';
    const result = getCsrfToken();
    expect(result).toBe('testvalue');
  });

  it('throws when it is not set', () => {
    document.cookie = 'csrftoken=;expires=1 Jan 1970 00:00:00 GMT;';
    expect(getCsrfToken).toThrow(Error);
  });
});

describe('getElement', () => {
  document.body.innerHTML = `<div id="root"></div>`;
  expect(getElement('root')).toBeInstanceOf(HTMLDivElement);
  expect(getElement('not-there')).toBeNull();
});

describe('getElements', () => {
  it('finds basic element', () => {
    document.body.innerHTML = `
      <div id="root">
          <span class="get-me"></span>
      </div>
    `;
    const result = Array.from(getElements('span'))[0];
    expect(result).toBeInstanceOf(HTMLSpanElement);
  });

  it('finds elements with multiple selectors', () => {
    document.body.innerHTML = `
      <div id="root">
          <span class="get-me-1"></span>
          <span class="get-me-2"></span>
          <span class="get-me-3"></span>
      </div>
    `;
    const results = Array.from(getElements<HTMLSpanElement>('.get-me-1', '.get-me-2', '.get-me-3'));
    for (const result of results) {
      expect(result).toBeInstanceOf(HTMLSpanElement);
    }
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

  it('gets data without prefix', () => expect(getNetboxData('foo')).toBe('bar'));

  it('is null when not found', () => expect(getNetboxData('not-there')).toBeNull());
});

describe('getSelectedOptions', () => {
  it('gets options from single multi-select', () => {
    document.body.innerHTML = `
      <div id="root">
          <select name="test" multiple>
              <option value="one" selected>One</option>
              <option value="two" selected>Two</option>
              <option value="three">Three</option>
          </select>
      </div>
    `;
    const base = document.getElementById('root')!;
    const result = getSelectedOptions(base);
    const expected = [{ name: 'test', options: ['one', 'two'] }];
    expect(result).toStrictEqual(expected);
  });

  it('gets options from multiple multi-selects', () => {
    document.body.innerHTML = `
      <div id="root">
          <select name="select1" multiple>
              <option value="one">One</option>
              <option value="two" selected>Two</option>
              <option value="three">Three</option>
          </select>
          <select name="select2" multiple>
              <option value="four" selected>Four</option>
              <option value="five">Five</option>
              <option value="six" selected>Six</option>
          </select>
          <select name="select3" multiple>
              <option value="seven">Seven</option>
              <option value="eight" selected>Eight</option>
              <option value="nine">Nine</option>
          </select>
      </div>
    `;
    const base = document.getElementById('root')!;
    const result = getSelectedOptions(base);
    const expected = [
      { name: 'select1', options: ['two'] },
      { name: 'select2', options: ['four', 'six'] },
      { name: 'select3', options: ['eight'] },
    ];
    expect(result).toStrictEqual(expected);
  });
});

describe('hasError', () => {
  it('has an error', () => expect(hasError({ error: 'error' })).toBe(true));

  it('does not have an error', () => expect(hasError({ data: '' })).toBe(false));
});

describe('hasMore', () => {
  it('has more', () => {
    const stub = {
      count: 1,
      next: '',
      previous: null,
      results: [],
    };
    expect(hasMore(stub)).toBe(true);
  });
  it('does not have more', () => {
    const stub = {
      count: 1,
      next: null,
      previous: null,
      results: [],
    };
    expect(hasMore(stub)).toBe(false);
  });
});

describe('isApiError', () => {
  it('is an api error', () => expect(isApiError({ error: '', exception: '' })).toBe(true));

  it('is not an api error', () => expect(isApiError({ data: '' })).toBe(false));
});

describe('isElement', () => {
  it('is element', () => {
    document.body.innerHTML = `<div id="root"></div>`;
    const element = document.getElementById('root');
    expect(isElement(element)).toBe(true);
  });

  it('is not element (null)', () => {
    expect(isElement(null)).toBe(false);
  });

  it('is not element (undefined)', () => {
    expect(isElement(undefined)).toBe(false);
  });
});

describe('isTruthy', () => {
  it('non-empty string', () => expect(isTruthy('value')).toBe(true));

  it('empty string', () => expect(isTruthy('')).toBe(false));

  it('null string', () => expect(isTruthy('null')).toBe(false));

  it('undefined string', () => expect(isTruthy('undefined')).toBe(false));

  it('zero', () => expect(isTruthy(0)).toBe(true));

  it('bool true', () => expect(isTruthy(true)).toBe(true));

  it('bool false', () => expect(isTruthy(true)).toBe(true));

  it('empty array', () => expect(isTruthy([])).toBe(false));

  it('populated array', () => expect(isTruthy([1, 2, 3])).toBe(true));

  it('object', () => expect(isTruthy({ one: 1 })).toBe(true));
});

describe('removeElements', () => {
  it('removes an element that exists', () => {
    document.body.innerHTML = `
      <div id="root">
          <div id="remove-me"></div>
      </div>
    `;
    removeElements('#remove-me');
    const missing = document.getElementById('remove-me');
    expect(missing).toBeNull;
  });
});

describe('replaceAll', () => {
  const original = 'string1with2numbers3in4it5!';
  const expected = 'stringwithnumbersinit!';

  it('with RegExp', () => {
    expect(replaceAll(original, new RegExp('\\d+'), '')).toBe(expected);
  });

  it('with inline RegExp', () => expect(replaceAll(original, /\d+/, '')).toBe(expected));

  it('with string', () => expect(replaceAll(original, '\\d+', '')).toBe(expected));

  // @ts-expect-error intentional type check.
  it('with boolean', () => expect(replaceAll('is1', '\\d+', true)).toBe('istrue'));

  // @ts-expect-error intentional type check.
  it('with number', () => expect(replaceAll('is1', '\\d+', 2)).toBe('is2'));

  it('global flag is already set', () => expect(replaceAll(original, /\d+/g, '')).toBe(expected));

  it('throws when input is not a string', () =>
    // @ts-expect-error intentional type check.
    expect(() => replaceAll(1, '\\d+', '')).toThrow(TypeError));

  it('throws when pattern is not a string or RegExp', () => {
    // @ts-expect-error intentional type check.
    expect(() => replaceAll(original, 1, '')).toThrow(TypeError);
  });

  it('throws when replacement is not stringifyable', () => {
    // @ts-expect-error intentional type check.
    expect(() => replaceAll(original, /\d+/, [])).toThrow(TypeError);
  });
});

describe('resetSelect', () => {
  it('should reset options', () => {
    document.body.innerHTML = `
      <div id="root">
          <select name="select">
              <option value="one" selected></option>
              <option value="two"></option>
              <option value="three"></option>
          </select>
      </div>
    `;
    const element = document.querySelector<HTMLSelectElement>('select[name=select]')!;
    expect(element.value).toBe('one');
    resetSelect(element);
    expect(element.value).toBe('');
  });
});

describe('toggleLoader', () => {
  it('toggles', () => {
    document.body.innerHTML = `<div id="root"><div class="card-overlay"></div></div>`;
    const element = document.querySelector<HTMLDivElement>('div.card-overlay')!;
    toggleLoader('hide');
    expect(element.style.display).toBe('none');
    toggleLoader('show');
    expect(element.style.display).toBe('');
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
