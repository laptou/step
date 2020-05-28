
/**
 * @param markup The HTML to place inside of this element.
 * @returns A Surplus function which operates on the element it is attached to, setting its
 * inner HTML to the value given by `markup`.
 */
export const html = (markup: string) => (elem: HTMLElement) => {
  elem.innerHTML = markup;
};
