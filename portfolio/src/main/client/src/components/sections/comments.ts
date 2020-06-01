import {htmlElement} from '@src/util/html';
import '@res/style/sections/comments.scss';

export interface Comment {
  id: number;
  name: string;
  user: string;
  content: string;
  upvotes: number;
  downvotes: number;
}

/**
 * Loads comments from server and adds them to the component.
 * @param el The element to load the comments into.
 */
async function load(el: HTMLElement) {
  try {
    const response = await fetch('/api/comments');
    const data = await response.json() as Comment[];
    const comments = data.map(Comment);

    const listEl = el.getElementsByTagName('ul')[0];
    while (listEl.firstChild) listEl.firstChild.remove();
    listEl.append(...comments);
  } catch (e) {
    el.append(htmlElement`<li class="error">Failed to load comments.</li>`);
  }
}

const Comment = (comment: Comment): HTMLElement => {
  // user supplied strings cannot be interpolated directly to avoid XSS
  const content: HTMLElement = htmlElement`<div class="content"></div>`;
  content.innerText = comment.content;

  const name: HTMLElement = htmlElement`<span class="name"></span>`;
  name.innerText = comment.name;

  return htmlElement`
  <li class="comment" data-id="${comment.id.toString()}">
    <span class="info">
      ${name}
      <span class="upvotes">+${comment.upvotes.toString()}</span>
      <span class="downvotes">-${comment.downvotes.toString()}</span>
    </span>
    ${content}
  </li>`;
};

export const CommentSection = (): HTMLElement => {
  const form: HTMLFormElement = htmlElement`
    <form>
      <input id="username" name="username" type="text" />
      <textarea name="content">
      </textarea>
      <button type="submit">
        Comment
      </button>
    </form>`;

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();

    try {
      const response = await fetch(
        '/api/comments',
        {method: 'POST', body: new FormData(form)});
    } catch {
      // TODO present toast to user notifying failure
    }

    void load(el);
  });

  const el: HTMLElement = htmlElement`
    <div class="comments">
      <h3>Comments</h3>
      <ul>
      </ul>
      ${form}
    </div>`;

  void load(el);

  return el;
};
