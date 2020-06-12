import {htmlElement, Renderable} from '@src/util/html';
import '@res/style/controls/readmore.scss';

/**
 * A component which encapuslates the functionality of a readmore and allows it
 * to be controlled programatically.
 */
export interface ReadMoreComponent {
  /** The wrapper element. */
  root: HTMLDivElement;

  /** Collapses the readmore. */
  collapse(): void;

  /** Expands the readmore. */
  expand(): void;

  /** Whether the readmore is currently collapsed. */
  getIsCollapsed(): boolean;

  /** Whether the content of the readmore exceeds its height. */
  getIsOverflowed(): boolean;
}

/**
 * Creates a readmore component, which is a control that contains long vertical
 * content and can be expanded to show all of it or collapsed to take up a fixed
 * amount of space.
 *
 * @param content The content to place inside of the readmore.
 * @param height The height of the readmore when collapsed. Defaults to 20rem.
 * @returns A @see {ReadMoreComponent}
 */
export const ReadMore = (
  content: Renderable,
  height = '20rem'
): ReadMoreComponent => {
  const contentEl: HTMLDivElement =
    htmlElement`<div class="readmore">${content}</div>`;

  const component: ReadMoreComponent = {
    root: contentEl,
    collapse() {
      if (this.getIsCollapsed) return;
      contentEl.classList.add('collapsed');

      // let CSS transition max height from whatever it was to 0
      contentEl.style.maxHeight = height;
      contentEl.style.webkitMaskImage =
        contentEl.style.maskImage =
          `linear-gradient(to bottom, 
                           white calc(${height} - 5rem), 
                           transparent calc(${height} - 1rem))`;
      contentEl.dispatchEvent(new Event('readmore-collapse'));
    },
    expand() {
      if (!this.getIsCollapsed) return;
      contentEl.classList.remove('collapsed');

      // this makes the CSS transition work, gracefully scaling from 100% to 0
      contentEl.style.maxHeight = `${contentEl.scrollHeight}px`;
      contentEl.style.webkitMaskImage =
        contentEl.style.maskImage =
          `linear-gradient(to bottom, white 100%, transparent)`;
      contentEl.dispatchEvent(new Event('readmore-expand'));
    },
    getIsCollapsed() {
      return contentEl.classList.contains('collapsed');
    },
    getIsCollapsed() {
      return contentEl.scrollHeight > contentEl.clientHeight;
    },
  };

  component.collapse();

  return component;
};
