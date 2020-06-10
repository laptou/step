import {htmlElement} from '@src/util/html';
import '@res/style/sections/comments.scss';
import {LabeledInput} from '../controls/labeled-input';
import { Authentication } from '../controls/authentication';

type Cursor = string;

/**
 * Information about a comment returned by the server.
 */
export interface CommentData {
  id: number;
  name: string;
  user: string;
  content: string;
  upvotes: number;
  downvotes: number;
  /**
   * A comment is shameful if it appears to contain HTML.
   * Shame on you, for trying to do XSS on my website!
   */
  shameful: boolean;
}

/**
 * A page of comments returned by the server.
 */
interface CommentPageData {
  comments: CommentData[];

  /**
   * Can be used to fetch the next batch of comments from the server.
   */
  nextCommentCursor: Cursor;
}

/**
 * A page of comments stored by the client.
 */
interface CommentPage extends CommentPageData {
  previous: CommentPage | null;
}

let currentPage: CommentPage | null = null;

/**
 * Loads comments from server and adds them to the component.
 * @param container The element to load the comments into.
 * @param page The comment page containing the comments.
 * @param limit The number of comments per page.
 */
function updateComments(
  container: HTMLElement,
  page: CommentPage | null,
  limit: number) {
  const nextBtn = container.querySelector('#comment-next') as HTMLButtonElement;
  const prevBtn = container.querySelector('#comment-prev') as HTMLButtonElement;

  if (page) {
    nextBtn.disabled = page.comments.length < limit;
    prevBtn.disabled = page.previous === null;
  } else {
    prevBtn.disabled = true;
    return;
  }

  const comments = page.comments.map(Comment);

  const listEl = container.getElementsByTagName('ul')[0];
  while (listEl.firstChild) listEl.firstChild.remove();

  if (comments.length > 0) {
    listEl.append(...comments);
  } else {
    listEl.append(CommentEmptyState());
  }
}

/**
 * Fetches the comment page for a given cursor.
 * @param cursor The cursor of the page to fetch.
 * @param limit The size of the page.
 */
async function fetchPage(
  cursor: Cursor | null,
  limit: number):
  Promise<CommentPageData> {
  const response = cursor ?
    await fetch(`/api/comments?limit=${limit}&cursor=${cursor}`) :
    await fetch(`/api/comments?limit=${limit}`);
  return await response.json() as Promise<CommentPageData>;
}

/**
 * Fetches the current page of comments.
 * @param page The current comment page.
 * @param limit The number of comments per page.
 */
async function fetchCurrentPage(
  page: CommentPage | null,
  limit: number
): Promise<CommentPage> {
  if (page === null) {
    throw new Error('no comments page is currently loaded');
  }

  const data = await fetchPage(
    page.previous ? page.previous.nextCommentCursor : null,
    limit);

  return {
    previous: page.previous,
    ...data,
  };
}

/**
 * Fetches the next page of comments.
 * @param page The current comment page.
 * @param limit The number of comments per page.
 */
async function fetchNextPage(
  page: CommentPage | null,
  limit: number
): Promise<CommentPage> {
  if (page === null) {
    // we are loading the first page
    const data = await fetchPage(null, limit);
    return {
      previous: null,
      ...data,
    };
  } else {
    const data = await fetchPage(page.nextCommentCursor, limit);
    return {
      previous: page,
      ...data,
    };
  }
}

/**
 * Fetches the previous page of comments.
 * @param page The current comment page.
 * @param limit The number of comments per page.
 */
async function fetchPreviousPage(
  page: CommentPage | null,
  limit: number
) {
  if (page === null || page.previous === null) {
    return null;
  } else {
    return fetchCurrentPage(page.previous, limit);
  }
}

/**
 * @param commentsEl The element containing the comment list.
 * @param formEl The form to submit.
 * @param limit The number of comments per page.
 */
async function submitForm(
  commentsEl: HTMLElement,
  formEl: HTMLFormElement,
  limit: number) {
  if (!formEl.checkValidity()) {
    formEl.classList.add('show-validation');
  }

  const usernameInput =
    commentsEl.querySelector('#comment-username') as HTMLInputElement;
  const commentInput =
    commentsEl.querySelector('#comment-content') as HTMLTextAreaElement;

  try {
    await fetch(
      '/api/comments',
      {method: 'POST', body: new FormData(formEl)});

    // clear the inputs on successful submission
    usernameInput.value = '';
    commentInput.value = '';
  } catch {
    // TODO present toast to user notifying failure
  }

  // reset to the first page
  currentPage = await fetchCurrentPage(null, limit);
  updateComments(commentsEl, currentPage, limit);
}

/**
 * @param text The text to truncate.
 * @returns `text` truncated to 5 lines or 500 chars, whichever is shorter.
 */
function truncateText(text: string) {
  const truncatedByChars = text.slice(0, 500);
  const truncatedByNewlines = text.split('\n').slice(0, 5).join('\n');

  if (truncatedByChars.length < truncatedByNewlines.length) {
    return truncatedByChars;
  } else {
    return truncatedByNewlines;
  }
}

const Comment = (comment: CommentData): HTMLElement => {
  // user supplied strings cannot be interpolated directly to avoid XSS
  const contentEl: HTMLElement = htmlElement`<div class="content"></div>`;
  contentEl.innerText = comment.content;

  let truncatedContentEl: HTMLElement | null = null;
  let truncatedContentExpander: HTMLAnchorElement | null = null;
  const truncatedContent = truncateText(comment.content);

  if (truncatedContent.length < comment.content.length) {
    truncatedContentEl = document.createElement('div');
    truncatedContentEl.classList.add('content', 'truncated');
    truncatedContentEl.innerText = truncatedContent;

    truncatedContentExpander = document.createElement('a');
    truncatedContentExpander.href = 'javascript:void 0';
    truncatedContentExpander.classList.add('expander');
    truncatedContentExpander.innerText = 'see more';

    let isTruncated = true;
    truncatedContentExpander.addEventListener('click', () => {
      isTruncated = !isTruncated;

      if (isTruncated) {
        contentEl.replaceWith(truncatedContentEl!);
        truncatedContentExpander!.innerText = 'see more';
      } else {
        truncatedContentEl!.replaceWith(contentEl);
        truncatedContentExpander!.innerText = 'see less';
      }
    });
  }


  const name: HTMLElement = htmlElement`<span class="name"></span>`;
  name.innerText = comment.name;

  const commentEl: HTMLElement = htmlElement`
    <li class="comment" data-id="${comment.id.toString()}">
      <div class="inner">
        <span class="info">
          ${name}
          <span class="upvotes">+${comment.upvotes.toString()}</span>
          <span class="downvotes">
            -${comment.shameful ? '∞' : comment.downvotes.toString()}
          </span>
        </span>
        ${truncatedContentEl ?? contentEl}
        ${truncatedContentExpander}
      </div>
    </li>`;

  commentEl.classList.toggle('shameful', comment.shameful);

  return commentEl;
};

const CommentEmptyState = (): HTMLElement => {
  return htmlElement`
  <li class="comment-empty-state">
    You've reached the end. No more comments.
  </li>`;
};

/**
 * @returns The comments section of the page.
 */
export const CommentSection = (): HTMLElement => {
  const limit = 5;

  const usernameInput = LabeledInput({
    id: 'comment-username',
    label: 'Name',
    name: 'username',
    type: 'text',
  });

  usernameInput[1].required = true;

  const commentInput = LabeledInput({
    id: 'comment-content',
    label: 'Comment',
    name: 'content',
    type: 'textarea',
  });

  commentInput[1].required = true;

  const formEl: HTMLFormElement = htmlElement`
    <form>
      ${Authentication().root}
      ${usernameInput}
      ${commentInput}
      <button id="comment-submit" type="submit">
        Comment
      </button>
    </form>`;

  formEl.addEventListener('submit', (ev) => {
    ev.preventDefault();
    void submitForm(container, formEl, limit);
  });

  const nextBtn: HTMLButtonElement =
    htmlElement`<button id="comment-next">Next</button>`;
  const prevBtn: HTMLButtonElement =
    htmlElement`<button id="comment-prev">Previous</button>`;


  const container: HTMLElement = htmlElement`
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

  nextBtn.addEventListener('click', async () => {
    currentPage = await fetchNextPage(currentPage, limit);
    updateComments(container, currentPage, limit);
  });

  prevBtn.addEventListener('click', async () => {
    currentPage = await fetchPreviousPage(currentPage, limit);
    updateComments(container, currentPage, limit);
  });

  void (async () => {
    currentPage = await fetchNextPage(null, limit);
    updateComments(container, currentPage, limit);
  })();

  return container;
};
