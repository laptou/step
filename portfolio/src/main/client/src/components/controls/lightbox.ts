import {htmlElement} from '@src/util/html';
import '@res/style/controls/lightbox.scss';

export interface LightboxItemProps {
  /** The element to place in the lightbox. */
  target: HTMLElement;

  /**
   * If true, the element will appear in the same position in the lightbox as it
   * did on the page. The position will automatically be adjusted to fit in the
   * lightbox.
   */
  preservePosition?: boolean | { x: boolean; y: boolean; };
}

let currentItem: HTMLElement | null = null;
const placeholder = document.createElement('div');

/**
 * Shows the lightbox with the given element. Has no effect
 * if this element is already in the lightbox.
 *
 * @param el The lightbox item that is to be shown.
 * @param options The lightbox options.
 */
function showLightbox(el: HTMLElement, {target, preservePosition}: LightboxItemProps) {
  if (el === currentItem) return;

  const lightboxBounds = lightboxContent.getBoundingClientRect();
  const targetBounds = target.getBoundingClientRect();
  placeholder.style.width = `${targetBounds.width}px`;
  placeholder.style.height = `${targetBounds.height}px`;
  target.replaceWith(placeholder);

  const {x: preserveX, y: preserveY} =
    typeof preservePosition === 'object' ?
      preservePosition :
      typeof preservePosition === 'boolean' ?
        {x: preservePosition, y: preservePosition} :
        {x: false, y: false};

  if (preserveX) {
    // do not extend outside of lightbox
    let left = Math.min(
      targetBounds.left,
      lightboxBounds.width - targetBounds.width
    );
    left = Math.max(left, 0);

    lightboxContent.style.justifyContent = 'left';
    target.style.position = 'relative';
    target.style.width = `${targetBounds.width}px`;
    target.style.left = `${left}px`;
  } else {
    lightboxContent.style.justifyContent = '';
  }

  if (preserveY) {
    // do not extend outside of lightbox
    let top = Math.min(
      targetBounds.top - lightboxBounds.top,
      lightboxContent.clientHeight - targetBounds.height
    );
    top = Math.max(top, 0);

    lightboxContent.style.alignItems = 'start';
    target.style.position = 'relative';
    target.style.top = `${top}px`;
  } else {
    lightboxContent.style.alignItems = '';
  }

  // only the lightbox should scroll, not the body
  document.body.style.overflow = 'hidden';

  lightboxContent.appendChild(target);
  lightbox.classList.add('active');
  currentItem = el;
  el.dispatchEvent(new CustomEvent('lightbox-show'));
}

/**
 * Hides the lightbox. Has no effect if the lightbox is not open.
 *
 * @param el The lightbox item that is to be hidden.
 */
function hideLightbox(el: HTMLElement) {
  const target = lightboxContent.firstChild as (HTMLElement | null);
  if (!target) return;
  if (el !== currentItem) return;

  // reset any preservePosition styles
  target.style.position = '';
  target.style.width = '';
  target.style.left = '';
  target.style.top = '';
  document.body.style.overflow = '';

  placeholder.replaceWith(target);
  lightbox.classList.remove('active');
  currentItem = null;
  el.dispatchEvent(new CustomEvent('lightbox-hide'));
}

/**
 * Hides the currently displayed lightbox item.
 */
function hideCurrentLightbox() {
  if (currentItem) {
    hideLightbox(currentItem);
  }
}

interface LightboxItemComponent {
  /** The lightbox item. */
  root: HTMLDivElement;

  /** Shows the target in the lightbox. */
  show(): void;

  /** Dismisses the lightbox. */
  hide(): void;
}

/**
 * An item that contains a target. When this item is clicked, the target will be
 * displayed in the lightbox.
 *
 * @param props _
 * @event lightbox-show Fired when this item is shown in the lightbox.
 * @event lightbox-hide Fired when this item is hidden from the lightbox.
 * @returns A lightbox item which wraps `target`.
 */
export const LightboxItem =
  (props: LightboxItemProps): LightboxItemComponent => {
    const lbItem: HTMLDivElement = htmlElement`
      <div class='lightbox-item'>
        ${props.target}
      </div>`;

    lbItem.addEventListener('click', () => {
      showLightbox(lbItem, props);
    });

    return {
      root: lbItem,
      show: (): void => showLightbox(lbItem, props),
      hide: (): void => hideLightbox(lbItem),
    };
  };

const lightboxCloseBtn: HTMLElement =
  htmlElement`<button id="lightbox-close">Close</button>`;
lightboxCloseBtn.addEventListener('click', hideCurrentLightbox);

const lightboxContent: HTMLElement =
  htmlElement`<div id="lightbox-content"></div>`;
lightboxContent.addEventListener('click', (e) => e.stopPropagation());

const lightbox: HTMLDivElement = htmlElement`
  <div id="lightbox">
    ${lightboxCloseBtn}
    ${lightboxContent}
  </div>`;

lightbox.addEventListener('click', hideCurrentLightbox);

window.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  hideCurrentLightbox();
});

export const Lightbox = (): HTMLElement => lightbox;
