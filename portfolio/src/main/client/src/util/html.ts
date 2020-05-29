import type {Thunk, Arrunk} from './types';


/**
 * Sets an attribute on an element, unless `value` is null or undefined, in which case it is
 * removed.
 * @param el The element.
 * @param attr The attribute to set or remove.
 * @param value The value to set.
 * @returns The element.
 */
export function set<T extends Element>(el: T, attr: string, value: any): T {
  if (value !== null && value !== undefined) {
    el.setAttribute(attr, value);
  } else {
    el.removeAttribute(attr);
  }
  return el;
}

// eslint-disable-next-line valid-jsdoc
/**
 * Helper function to parse HTML into multiple DOM nodes. Meant to be used
 * as a template literal tag:
 * ```
 * const myElem = htmls`<td>this is the html</td><td>this is the html</td>`;
 * ```
 *
 * You can interpolate HTML elements into the template literal, and it will
 * insert them properly:
 * ```
 * const btn = document.createElement('button');
 * btn.addEventListener(() => ...);
 * const myElem = htmls`<p>some text<p>${btn}<p>with a button inside</p>`;
 * ```
 *
 * You can also interpolate arrays of HTML elements, or a function which
 * returns a string, an HTML element, or an array of HTML elements.
 * @returns The HTML elements.
 */
export function htmls(
  fragments: TemplateStringsArray,
  ...items: Thunk<Arrunk<string | Node | null | undefined>>[]): Node[] {
  const markup = items.reduce((prev: string, curr, idx) => {
    if (typeof curr === 'string') {
      return prev + curr + fragments[idx + 1];
    } else {
      return prev + `<slot data-template data-index="${idx}" />` + fragments[idx + 1];
    }
  }, fragments[0]);

  const template = document.createElement('template');
  template.innerHTML = markup.trim();
  template.content.querySelectorAll('slot[data-template]').forEach((slot) => {
    const index = parseInt(slot.getAttribute('data-index')!, 10);
    let item = items[index];
    // dethunk
    item = typeof item === 'function' ? item() : item;
    // arrayify
    item = Array.isArray(item) ? item : [item];
    item = item.filter((i) => i !== null && i !== undefined);
    slot.replaceWith(...item as (string | Node)[]);
  });

  return Array.from(template.content.children);
}

// eslint-disable-next-line valid-jsdoc
/**
 * Helper function to parse HTML into a DOM node. Meant to be used
 * as a template literal tag:
 * ```
 * const myElem = html`<td>this is the html</td>`;
 * ```
 * @returns The HTML element.
 */
export function html<T extends Node>(
  fragments: TemplateStringsArray,
  ...items: Thunk<Arrunk<string | Node | null | undefined>>[]
): T {
  const result = htmls(fragments, ...items);
  if (result.length !== 1) {
    throw new Error(
      'This HTML should contain exactly one element. ' +
      'For multiple elements, use htmls.');
  }
  return result[0] as T;
}
