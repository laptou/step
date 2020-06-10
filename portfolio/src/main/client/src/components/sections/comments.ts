import {htmlElement} from '@src/util/html';
import '@res/style/sections/comments.scss';
import {LabeledInput} from '../controls/labeled-input';
import {Authentication} from '../controls/authentication';
import {ReadMore} from '../controls/readmore';

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
 * Information about a comment returned by the server. This is only for comments
 * that did not appear to be written in English according to the Cloud Translate
 * API.
 */
export interface TranslatedCommentData extends CommentData {
  /** The language the comment was originally written in. */
  contentLang: string;

  /** The comment's content, translated to English. */
  contentTranslated: string;
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
 *
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
 *
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
 *
 * @param page The current comment page.
 * @param limit The number of comments per page.
 * @returns The comment page.
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
 *
 * @param page The current comment page.
 * @param limit The number of comments per page.
 * @returns The comment page.
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
 *
 * @param page The current comment page.
 * @param limit The number of comments per page.
 * @returns The comment page.
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
 * Submits the comment from the form.
 *
 * @param commentsEl The element containing the comment list.
 * @param formEl The form to submit.
 * @param limit The number of comments per page.
 */
async function submitForm(
  commentsEl: HTMLElement,
  formEl: HTMLFormElement
) {
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
}

type VoteKind = 'up' | 'down';
type VoteTally = {upvotes: number, downvotes: number};

/**
 * Submits a vote for a comment.
 *
 * @param commentId The ID of the comment to vote on.
 * @param kind The kind of vote to cast.
 */
async function submitVote(commentId: number, kind: VoteKind) {
  const res = await fetch(`/api/vote/${commentId}`, {
    method: 'POST',
    body: JSON.stringify({kind}),
  });

  if (res.status !== 200) {
    throw new Error('sending vote failed');
  }

  // TODO: handle errors using toast
}

/**
 * Refreshes the current page of comments, fetching them and loading them into
 * the page.
 *
 * @param commentsEl The container for the list of comments.
 * @param limit The number of comments per page.
 */
async function refreshComments(
  commentsEl: HTMLElement,
  limit: number
) {
  // reset to the first page
  currentPage = await fetchNextPage(null, limit);
  updateComments(commentsEl, currentPage, limit);
}

async function fetchCommentScore(commentId: number) {
  const res = await fetch(`/api/vote/${commentId}`);
  return await res.json() as VoteTally;
}

const Comment = (comment: CommentData): HTMLElement => {
  const nameSpan: HTMLElement =
    htmlElement`<span class="comment-name"></span>`;
  nameSpan.innerText = comment.name;
  nameSpan.title = comment.name;

  const upvoteBtn: HTMLButtonElement =
    htmlElement`
    <button type="button" class="comment-upvote-btn">
      Upvote
    </button>`;

  const downvoteBtn: HTMLButtonElement =
    htmlElement`
    <button type="button" class="comment-downvote-btn">
      Downvote
    </button>`;

  const scoreSpan = htmlElement`<span class="comment-score"></span>`;

  const updateScore = (tally: VoteTally) => {
    const score = tally.upvotes - tally.downvotes;
    const votes = tally.upvotes + tally.downvotes;
    const summary = votes > 0 ?
          `${comment.upvotes / votes * 100}% upvoted` :
          `No votes`;
    scoreSpan.title = comment.shameful ? 'Shameful!' : summary;
    scoreSpan.innerText = score.toString();
  };

  updateScore(comment);

  if (comment.shameful) {
    upvoteBtn.disabled = true;
    downvoteBtn.disabled = true;
  } else {
    upvoteBtn.addEventListener('click', async () => {
      await submitVote(comment.id, 'up');
      updateScore(await fetchCommentScore(comment.id));
    });
    downvoteBtn.addEventListener('click', async () => {
      await submitVote(comment.id, 'down');
      updateScore(await fetchCommentScore(comment.id));
    });
  }


  const readmore = ReadMore(new Text(comment.content));
  readmore.root.classList.add('comment-content');

  const commentEl: HTMLElement = htmlElement`
    <li class="comment" data-id="${comment.id.toString()}">
      <div class="inner">
        ${nameSpan}
        ${scoreSpan}
        ${upvoteBtn}
        ${downvoteBtn}
        ${readmore.root}
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
    name: 'name',
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

  formEl.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    await submitForm(container, formEl);
    await refreshComments(container, limit);
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
