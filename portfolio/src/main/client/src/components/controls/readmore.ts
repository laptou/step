import {htmlElement, Renderable} from '@src/util/html';
import '@res/style/controls/readmore.scss';

export const ReadMore = (content: Renderable): HTMLElement => {
  const contentEl: HTMLElement =
    htmlElement`<div class="content collapsed">${content}</div>`;
  const expanderEl: HTMLElement =
    htmlElement`<a href="javascript: void 0" class="expander">see more</a>`;

  expanderEl.addEventListener('click', () => {
    if (!contentEl.classList.contains('collapsed')) {
      contentEl.classList.add('collapsed');
      // let CSS transition max height from whatever it was to 0
      contentEl.style.maxHeight = '';
      expanderEl.innerText = 'see more';
    } else {
      // this makes the CSS transition work, gracefully scaling from 100% to 0
      contentEl.style.maxHeight = `${contentEl.scrollHeight}px`;
      contentEl.classList.remove('collapsed');
      expanderEl.innerText = 'see less';
    }
  });

  return htmlElement`
    <div class="readmore">
      ${contentEl}
      ${expanderEl}
    </div>`;
};
