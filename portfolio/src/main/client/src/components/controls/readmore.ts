import {htmlElement, Renderable} from '@src/util/html';
import '@res/style/controls/readmore.scss';

export interface ReadMoreComponent {
  /** The wrapper element. */
  el: HTMLDivElement;

  /** Collapses the readmore. */
  collapse(): void;

  /** Expands the readmore. */
  expand(): void;
}

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
