import S from 's-js';
import cx from 'classnames';
import {html} from '@src/util/html';

const currentImage = S.data('');
const isVisible = S.data(false);

export interface LightboxItemProps {
  src: string;
  alt?: string;
}

/**
 * Shows the lightbox with the given image.
 * @param uri The URI of the image to be shown.
 */
function showLightbox(uri: string) {
  currentImage(uri);
  isVisible(true);
}

/**
 * Hides the lightbox.
 */
function hideLightbox() {
  isVisible(false);
}

export const LightboxItem = ({alt, src}: LightboxItemProps): HTMLElement => {
  const lbItem: HTMLDivElement = html`
    <div class="lightbox-item">
      <img alt="${alt}" src="${src}">
    </div>`;

  lbItem.onclick = () => showLightbox(src);
  return lbItem;
};

export const Lightbox = (): HTMLElement => {
  const lightboxImg = document.createElement('img');
  lightboxImg.onclick = (e) => e.preventDefault();

  S(() => {
    lightboxImg.src = currentImage();
  });

  const lightbox: HTMLDivElement = html`
    <div id="lightbox">
      ${lightboxImg}
    </div>`;
  lightbox.onclick = hideLightbox;

  S(() => {
    lightbox.className = cx({active: isVisible()});
  });

  return lightbox;
};
