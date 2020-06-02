import {htmlElement} from '@src/util/html';
import '@res/style/sections/comments.scss';
import {LabeledInput} from '../controls/labeled-input';

type Cursor = string;

export interface CommentInfo {
  id: number;
  name: string;
  user: string;
  content: string;
  upvotes: number;
  downvotes: number;
}

export interface CommentData {
  comments: CommentInfo[];
  next: Cursor;
}

/**
 * Loads comments from server and adds them to the component.
 * @param el The element to load the comments into.
 * @param cursor Contains the server-provided cursor for the comment at the
 * start of each page. First one must be null because we get the first page by
 * not specifying a cursor.
 * @param limit The number of comments per page.
 */
async function load(
  el: HTMLElement,
  cursor: Cursor | null,
  limit: number) {
  const response = cursor ?
    await fetch(`/api/comments?limit=${limit}&cursor=${cursor}`) :
    await fetch(`/api/comments?limit=${limit}`);
  const data = await response.json() as CommentData;
  const comments = data.comments.map(Comment);

  const listEl = el.getElementsByTagName('ul')[0];
  while (listEl.firstChild) listEl.firstChild.remove();
  listEl.append(...comments);

  return data;
}

// eslint-disable-next-line valid-jsdoc
/**
 * Reloads the current page of comments.
 * @param el The element containing the comment list.
 * @param pages The comment page stack.
 * @param limit The number of comments per page.
 */
async function loadCurrentPage(
  el: HTMLElement,
  pages: [null, ...string[]],
  limit: number
) {
  // if pages.length is less than 2, then no page
  // has been loaded yet
  if (pages.length < 2) {
    throw new Error('no comments page is currently loaded');
  }

  const result = await load(el, pages[pages.length - 2], limit);
  pages[pages.length - 1] = result.next;
  return result;
}

/**
 * Loads the next page of comments.
 * @param el The element containing the comment list.
 * @param pages The comment page stack.
 * @param limit The number of comments per page.
 */
async function loadNextPage(
  el: HTMLElement,
  pages: [null, ...string[]],
  limit: number
) {
  const result = await load(el, pages[pages.length - 1], limit);
  pages.push(result.next);
  return result;
}

/**
 * Loads the previous page of comments.
 * @param el The element containing the comment list.
 * @param pages The comment page stack.
 * @param limit The number of comments per page.
 */
async function loadPreviousPage(
  el: HTMLElement,
  pages: [null, ...string[]],
  limit: number
) {
  pages.pop();
  return loadCurrentPage(el, pages, limit);
}

/**
 * @param commentsEl The element containing the comment list.
 * @param formEl The form to submit.
 * @param pages The comment page stack.
 * @param limit The number of comments per page.
 */
async function submitForm(
  commentsEl: HTMLElement,
  formEl: HTMLFormElement,
  pages: [null, ...string[]],
  limit: number) {
  try {
    await fetch(
      '/api/comments',
      {method: 'POST', body: new FormData(formEl)});

    // clear the inputs on successful submission
    usernameInput[1].value = '';
    commentInput[1].value = '';
  } catch {
    // TODO present toast to user notifying failure
  }

  await loadCurrentPage(commentsEl, pages, limit);
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

export const CommentSection = (): HTMLElement => {
  const pages: [null, ...string[]] = [null];

  const limit = 2;

  const usernameInput = LabeledInput({
    id: 'comment-username',
    label: 'Name',
    name: 'username',
    type: 'text',
    soft: true,
  });

  const commentInput = LabeledInput({
    id: 'comment-content',
    label: 'Comment',
    name: 'content',
    type: 'textarea',
    soft: true,
  });

  const formEl: HTMLFormElement = htmlElement`
    <form>
      ${usernameInput}
      ${commentInput}
      <button id="comment-submit" type="submit">
        Comment
      </button>
    </form>`;

  formEl.addEventListener('submit', (ev) => {
    ev.preventDefault();
    void submitForm(commentsEl, formEl, pages, limit);
  });

  const nextBtn: HTMLButtonElement = htmlElement`<button>Next</button>`;
  const prevBtn: HTMLButtonElement = htmlElement`<button>Previous</button>`;

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  nextBtn.addEventListener('click', async () => {
    const result = await loadNextPage(commentsEl, pages, limit);
    nextBtn.disabled = result.comments.length < limit;
    prevBtn.disabled = pages.length <= 2;
  });

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  prevBtn.addEventListener('click', async () => {
    await loadPreviousPage(commentsEl, pages, limit);
    nextBtn.disabled = false;
    prevBtn.disabled = pages.length <= 2;
  });

  const commentsEl: HTMLElement = htmlElement`
    <div class="comments">
      <h2>Comments</h2>
      <ul>
      </ul>
      <div class="comments-controls">
        ${prevBtn}
        ${nextBtn}
      </div>
      ${formEl}
    </div>`;

  void loadNextPage(commentsEl, pages, limit)
    .then(() => {
      nextBtn.disabled = false;
      prevBtn.disabled = pages.length <= 2;
    });

  return commentsEl;
};
