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
async function initComments(el: HTMLElement) {
  try {
    const response = await fetch('/data');
    const data = await response.json() as Comment[];
    const comments = data.map(Comment);
    el.append(...comments);
  } catch {
    el.append(htmlElement`<li class="error">Failed to load comments.</li>`);
  }
}

const Comment = (comment: Comment): HTMLElement => htmlElement`
  <li class="comment" data-id="${comment.id.toString()}">
    <span class="info">
      <span class="name">${comment.name}</span>
      <span class="upvotes">+${comment.upvotes.toString()}</span>
      <span class="downvotes">-${comment.downvotes.toString()}</span>
    </span>
    <div class="content">
      ${comment.content}
    </div>
  </li>`;

export const CommentSection = (): HTMLElement => {
  const el: HTMLElement = htmlElement`
    <div class="comments">
      <h3>Comments</h3>
      <ul>
      </ul>
    </div>`;

  void initComments(el);

  return el;
};
