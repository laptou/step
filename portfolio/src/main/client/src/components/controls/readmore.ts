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
  const contentEl: HTMLElement =
    htmlElement`<div class="content collapsed">${content}</div>`;
  const expanderEl: HTMLElement =
    htmlElement`<a href="javascript: void 0" class="expander">see more</a>`;

  const collapse = () => {
    contentEl.classList.add('collapsed');
    // let CSS transition max height from whatever it was to 0
    contentEl.style.maxHeight = '';
    expanderEl.innerText = 'see more';
  };

  const expand = () => {
    // this makes the CSS transition work, gracefully scaling from 100% to 0
    contentEl.style.maxHeight = `${contentEl.scrollHeight}px`;
    contentEl.classList.remove('collapsed');
    expanderEl.innerText = 'see less';
  };

  expanderEl.addEventListener('click', () => {
    if (!contentEl.classList.contains('collapsed')) {
      collapse();
    } else {
      expand();
    }
  });

  return {
    el: htmlElement`
      <div class="readmore">
        ${contentEl}
        ${expanderEl}
      </div>`,
    collapse,
    expand,
  };
};
