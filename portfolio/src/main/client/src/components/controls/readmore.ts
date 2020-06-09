import {htmlElement, PrimitiveRenderable} from '@src/util/html';
import '@res/style/controls/readmore.scss';

/**
 * A component which encapuslates the functionality of a readmore and allows it
 * to be controlled programatically.
 */
export interface ReadMoreComponent {
  /** The wrapper element. */
  el: HTMLDivElement;

  /** Collapses the readmore. */
  collapse(): void;

  /** Expands the readmore. */
  expand(): void;
}

/**
 * Creates a readmore component, which is a control that contains long vertical
 * content and can be expanded to show all of it or collapsed to take up a fixed
 * amount of space.
 *
 * @param content The content to place inside of the readmore.
 * @returns A @see {ReadMoreComponent}
 */
export const ReadMore = (content: Renderable): ReadMoreComponent => {
  const contentEl: HTMLDivElement =
    htmlElement`<div class="readmore collapsed">${content}</div>`;

  const collapse = () => {
    if (contentEl.classList.contains('collapsed')) return;

    contentEl.classList.add('collapsed');

    // let CSS transition max height from whatever it was to 0
    contentEl.style.maxHeight = '';
    contentEl.dispatchEvent(new Event('readmore-collapse'));
  };

  const expand = () => {
    if (!contentEl.classList.contains('collapsed')) return;

    // this makes the CSS transition work, gracefully scaling from 100% to 0
    contentEl.style.maxHeight = `${contentEl.scrollHeight}px`;
    contentEl.classList.remove('collapsed');
    contentEl.dispatchEvent(new Event('readmore-expand'));
  };

  return {
    el: contentEl,
    collapse,
    expand,
  };
};
