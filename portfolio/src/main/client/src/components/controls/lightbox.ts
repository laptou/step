import {htmlElement} from '@src/util/html';
import '@res/style/controls/lightbox.scss';
import {ResponsiveImage, ResponsiveImageInfo} from './responsive-image';

export interface LightboxItemProps {
  src: string | ResponsiveImageInfo;
  alt?: string;
}

/**
 * Shows the lightbox with the given image.
 * @param uri The URI of the image to be shown.
 */
function showLightbox(uri: string | ResponsiveImageInfo) {
  lightboxImg.src = uri.toString();
  lightbox.classList.add('active');
}

/**
 * Hides the lightbox.
 */
function hideLightbox() {
  lightbox.classList.remove('active');
}

export const LightboxItem = ({alt, src}: LightboxItemProps): HTMLElement => {
  const lbItem: HTMLDivElement = htmlElement`
    <div class='lightbox-item'>
      ${ResponsiveImage({alt, src})}
    </div>`;

  lbItem.addEventListener('click', () => showLightbox(src));

  return lbItem;
};

const lightboxImg = document.createElement('img');
lightboxImg.addEventListener('click', (e) => e.stopPropagation());

const lightboxCloseBtn = htmlElement`<button class='close'>Close</button>`;
lightboxCloseBtn.addEventListener('click', hideLightbox);

const lightbox: HTMLDivElement = htmlElement`
  <div id='lightbox'>
    ${lightboxImg}
    ${lightboxCloseBtn}
  </div>`;

lightbox.addEventListener('click', hideLightbox);
window.addEventListener('keydown', (e) => {
  if (e.keyCode !== 27) return;
  hideLightbox();
});

window.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  hideLightbox();
});

export const Lightbox = (): HTMLElement => lightbox;
