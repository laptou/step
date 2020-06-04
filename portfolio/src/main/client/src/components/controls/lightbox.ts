import {htmlElement} from '@src/util/html';
import '@res/style/controls/lightbox.scss';

export interface LightboxItemProps {
  target: HTMLElement;
  onshow?: () => void;
  onhide?: () => void;
}

const shim = document.createElement('div');

/**
 * Shows the lightbox with the given element.
 * @param target The element to show in the lightbox.
 */
function showLightbox(target: HTMLElement) {
  const {width, height} = target.getBoundingClientRect();
  shim.style.width = `${width}px`;
  shim.style.height = `${height}px`;
  target.replaceWith(shim);
  lightboxContent.appendChild(target);
  lightbox.classList.add('active');
}

/**
 * Hides the lightbox.
 */
function hideLightbox() {
  const target = lightboxContent.firstChild as HTMLElement;
  shim.replaceWith(target);
  lightbox.classList.remove('active');
}

export const LightboxItem = ({target}: LightboxItemProps): HTMLElement => {
  const lbItem: HTMLDivElement = htmlElement`
    <div class='lightbox-item'>
      ${target}
    </div>`;

  lbItem.addEventListener('click', () => showLightbox(target));

  return lbItem;
};

const lightboxCloseBtn = htmlElement`<button id="lightbox-close">Close</button>`;
lightboxCloseBtn.addEventListener('click', hideLightbox);

const lightboxContent = htmlElement`<div id="lightbox-content"></div>`;
lightboxContent.addEventListener('click', (e) => e.stopPropagation());

const lightbox: HTMLDivElement = htmlElement`
  <div id="lightbox">
    ${lightboxCloseBtn}
    ${lightboxContent}
  </div>`;

lightbox.addEventListener('click', hideLightbox);

window.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  hideLightbox();
});

export const Lightbox = (): HTMLElement => lightbox;
