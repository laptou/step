import classnames from 'classnames';
import {ClassValue} from 'classnames/types';

export type Attrs<K extends keyof HTMLElementTagNameMap> = Partial<HTMLElementTagNameMap[K]>;
export interface CreateOptions {
  className?: string;
}

/**
 * Helper function to create an HTML tag.
 * @param name The HTML tag to create.
 * @param setup A function that sets attributes and event handlers.
 * @param content The items that the HTML tag should contain.
 * @returns The HTML tag.
 */
export function create<K extends keyof HTMLElementTagNameMap>(
  name: K,
  setup?: ((el: HTMLElementTagNameMap[K]) => void) | null,
  ...content: (string | Node)[]): HTMLElementTagNameMap[K] {
  const elem = document.createElement(name);
  elem.append(...content);
  setup?.(elem);
  return elem;
}

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

/**
 * Returns a setup function that gives `el` the classes specified by `classes`.
 * @param el The element to set up.
 * @param classes The classes to add to `el`.
 * @returns The setup function.
 */
export function withClass<T extends HTMLElement>(...classes: ClassValue[]): (el: T) => void {
  return (el) => el.className = classnames(...classes);
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
export function html(fragments: TemplateStringsArray, ...items: any[]): Node {
  const markup = items.reduce((prev, curr, idx) => prev + curr + fragments[idx + 1], fragments[0]);

  const template = document.createElement('template');
  template.innerHTML = markup.trim();
  if (template.content.children.length !== 1) {
    throw new Error(
      'This HTML should contain exactly one element. ' +
      'For multiple elements, use htmls.');
  }
  return template.content.firstChild!;
}

// eslint-disable-next-line valid-jsdoc
/**
 * Helper function to parse HTML into multiple DOM nodes. Meant to be used
 * as a template literal tag:
 * ```
 * const myElem = htmls`<td>this is the html</td><td>this is the html</td>`;
 * ```
 * @returns The HTML elements.
 */
export function htmls(fragments: TemplateStringsArray, ...items: any[]): Node[] {
  const markup = items.reduce((prev, curr, idx) => prev + curr + fragments[idx + 1], fragments[0]);
  const template = document.createElement('template');
  template.innerHTML = markup.trim();
  return Array.from(template.content.children);
}
