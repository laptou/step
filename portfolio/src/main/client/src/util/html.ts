import type {Arrunk} from './types';

type InterpolationValue = Arrunk<string | Node | null | undefined> | EventListener;

/**
 * Helper function to iterate over all descendants of a node.
 * @param node The node to iterate over.
 */
function* descendants(node: Node): Generator<Node> {
  for (const child of node.childNodes) {
    yield child;
    for (const grandchild of descendants(child)) {
      yield grandchild;
    }
  }
}

/**
 * @param arr The array to flatten.
 * @returns The flattened array.
 */
function flatten<T>(arr: Arrunk<T>[]): T[] {
  const newArr = [];
  for (const item of arr) {
    if (Array.isArray(item)) {
      newArr.push(...item);
    } else {
      newArr.push(item);
    }
  }
  return newArr;
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
 * Finally, you can interpolate functions, but only to use them as event handlers
 * in @-attributes. Using them anywhere else is undefined behaviour.
 * ```
 * const myHandler = () => console.log('hi');
 * const myElem = htmls`<button @click='${myHandler}'>Say hi</button>`;
 * ```
 * @returns The HTML elements.
 */
export function htmlFragment(
  fragments: TemplateStringsArray,
  ...items: InterpolationValue[]): Node[] {
  // combine items first so that arrays can be flattened
  // without messing up indices
  const combined: InterpolationValue[] = [fragments[0]];

  for (let i = 0; i < items.length; i++) {
    combined.push(items[i]);
    combined.push(fragments[i + 1]);
  }

  const flattened = flatten(combined);

  /**
   * @param item The item to get the sentinel value for.
   * @param idx The index of the item within the items array.
   * @returns The sentinel value.
   */
  function getSentinel(
    item: InterpolationValue,
    idx: number): string {
    if (typeof item === 'function') {
      return `$$template_fn_${idx}`;
    } else if (item instanceof Node || Array.isArray(item)) {
      return `<slot data-template data-index="${idx}" />`;
    } else if (item !== null && item !== undefined) {
      return item.toString();
    } else {
      return '';
    }
  }

  const markup = flattened.map(getSentinel).join('');

  const template = document.createElement('template');

  template.innerHTML = markup.trim();

  for (const descendant of descendants(template.content)) {
    if (!(descendant instanceof Element)) continue;

    // use slots for substitution
    if (descendant.tagName === 'SLOT') {
      const slot = descendant as HTMLSlotElement;
      if (slot.hasAttribute('data-template')) {
        const index = parseInt(slot.getAttribute('data-index')!, 10);
        const item = flattened[index];
        // cannot be event handler b/c it uses a different sentinel
        // cannot be null or undefined b/c those don't produce sentinels
        slot.replaceWith(item as string | Node);
      }
    }

    // use all @attributes as event handlers
    for (const attr of descendant.getAttributeNames()) {
      if (!attr.startsWith('@')) continue;
      const event = attr.slice(1);

      const sentinel = descendant.getAttribute(attr);
      if (!sentinel) throw new Error(`Attribute ${attr} should have a function handler.`);

      const match = /^\$\$template_fn_(\d+)$/.exec(sentinel);
      if (!match) throw new Error(`Attribute ${attr} should have a function handler.`);

      const index = parseInt(match[1], 10);
      descendant.addEventListener(event, flattened[index] as EventListener);
    }
  }

  return Array.from(template.content.children);
}

// eslint-disable-next-line valid-jsdoc
/**
 * Helper function to parse HTML into a DOM node. Meant to be used
 * as a template literal tag:
 * ```
 * const myElem = htmlElement`<td>this is the html</td>`;
 * ```
 * @returns The HTML element.
 */
export function htmlElement<T extends Node>(
  fragments: TemplateStringsArray,
  ...items: InterpolationValue[]
): T {
  const result = htmlFragment(fragments, ...items);
  if (result.length !== 1) {
    throw new Error(
      'This HTML should contain exactly one element. ' +
      'For multiple elements, use htmls.');
  }
  return result[0] as T;
}
