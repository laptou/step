import type {Arrunk} from './types';

/**
 * Any item that can be rendered by interpolating it with the @see htmlElement
 * function.
 */
export type Renderable = Arrunk<string | Node | null | undefined>;

/**
 * Gets the sentinel for an item.
 *
 * @param item The item to get the sentinel value for.
 * @param idx The index of the item within the items array.
 * @returns The sentinel value.
 */
function getSentinel(
  item: string | Node,
  idx: number): string {
  if (item instanceof Node) {
    // will be replaced with actual element later
    return `<slot data-template data-index="${idx}"></slot>`;
  }

  return item;
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
 * You can also interpolate arrays of HTML elements or strings.
 *
 * @param fragments The HTML fragements to interpolate into.
 * @param items The items to interpolate into the HTML.
 * @returns The HTML elements.
 */
export function htmlFragment(
  fragments: TemplateStringsArray,
  ...items: Renderable[]): Node[] {
  // combine items first so that arrays can be flattened
  // without messing up indices
  const combined: Renderable[] = [fragments[0]];

  for (let i = 0; i < items.length; i++) {
    combined.push(items[i]);
    combined.push(fragments[i + 1]);
  }

  // type assertion b/c TS does not recognize that this will remove null and
  // undefined from the array
  const flattened = combined
    .flat()
    .filter((r) => r !== null && r !== undefined) as Array<string | Node>;

  const markup = flattened.map(getSentinel).join('');
  const template = document.createElement('template');
  template.innerHTML = markup.trim();

  template.content.querySelectorAll('slot[data-template]').forEach((slot) => {
    const index = parseInt(slot.getAttribute('data-index')!, 10);
    const item = flattened[index];

    // replace with provided item instead of just inserting HTML text
    // to preserve event handlers, etc.
    slot.replaceWith(item);
  });

  return Array.from(template.content.children);
}

// eslint-disable-next-line valid-jsdoc
/**
 * Helper function to parse HTML into a DOM node. Meant to be used
 * as a template literal tag:
 * ```
 * const myElem = htmlElement`<td>this is the html</td>`;
 * ```
 *
 * @param fragments The HTML fragements to interpolate into.
 * @param items The items to interpolate into the HTML.
 * @returns The HTML element.
 */
export function htmlElement<T extends Node = HTMLElement>(
  fragments: TemplateStringsArray,
  ...items: Renderable[]
): T {
  const result = htmlFragment(fragments, ...items);
  if (result.length !== 1) {
    throw new Error(
      'This HTML should contain exactly one element. ' +
      'For multiple elements, use htmls.');
  }
  return result[0] as T;
}
