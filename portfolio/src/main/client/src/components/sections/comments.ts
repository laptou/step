import {htmlElement} from '@src/util/html';
import '@res/style/sections/comments.scss';
import {LabeledInput} from '../controls/labeled-input';

/**
 * Information about a comment returned by the server.
 */
export interface CommentInfo {
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
    const data = await response.json() as CommentInfo[];
    const comments = data.map(Comment);

    const listEl = el.getElementsByTagName('ul')[0];
    listEl.innerHTML = '';
    listEl.append(...comments);
  } catch (e) {
    const reloadLink =
      htmlElement`<a href="javascript:void(0)">Click here to reload.</a>`;
    reloadLink.addEventListener('click', () => void load(el));

    el.append(htmlElement`
      <li class="error">Failed to load comments. ${reloadLink}</li>
    `);
  }
}

/**
 * @param el The element containing the comment list.
 * @param form The form to submit.
 */
async function submitForm(el: HTMLElement, form: HTMLFormElement) {
  try {
    await fetch(
      '/api/comments',
      {method: 'POST', body: new FormData(form)});
  } catch {
    // TODO present toast to user notifying failure
  }

  await load(el);
}

const Comment = (comment: CommentInfo): HTMLElement => {
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

/**
 * @returns The comments section of the page.
 */
export const CommentSection = (): HTMLElement => {
  const form: HTMLFormElement = htmlElement`
    <form>
      ${LabeledInput({
        id: 'comment-username',
        label: 'Name',
        name: 'username',
        type: 'text',
      })}
      ${LabeledInput({
        id: 'comment-content',
        label: 'Comment',
        name: 'content',
        type: 'textarea',
      })}
      <button id="comment-submit" type="submit">
        Comment
      </button>
    </form>`;

  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    void submitForm(el, form);
  });

  const el: HTMLElement = htmlElement`
    <div class="comments">
      <h2>Comments</h2>
      <ul>
      </ul>
      ${form}
    </div>`;

  void load(el);

  return el;
};
