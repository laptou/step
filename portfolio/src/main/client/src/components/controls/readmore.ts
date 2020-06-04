import {htmlElement, Renderable} from '@src/util/html';
import '@res/style/controls/readmore.scss';
import {Component} from '..';

/**
 * Creates a readmore, which can be expanded to show all of its content.
 */
export class ReadMore implements Component {
  private readonly _el: HTMLDivElement;
  private _expanded = false;

  /**
   * @param content The content of this readmore.
   */
  public constructor(content: Renderable) {
    this._el =
      htmlElement`<div class="readmore collapsed">${content}</div>`;
  }

  public get content(): Renderable {
    return this._el;
  }

  public get expanded(): boolean {
    return this._expanded;
  }

  public set expanded(val: boolean) {
    this._expanded = val;

    if (!val) {
      this._el.classList.add('collapsed');
      // let CSS transition max height from whatever it was to 0
      this._el.style.maxHeight = '';
    } else {
      // this makes the CSS transition work, gracefully scaling from 100% to 0
      this._el.style.maxHeight = `${this._el.scrollHeight}px`;
      this._el.classList.remove('collapsed');
    }
  }
}
