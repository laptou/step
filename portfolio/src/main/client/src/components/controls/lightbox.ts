import {htmlElement} from '@src/util/html';

export interface LightboxItemProps {
  src: string;
  alt?: string;
}

/**
 * Shows the lightbox with the given image.
 * @param uri The URI of the image to be shown.
 */
function showLightbox(uri: string) {
  lightboxImg.src = uri;
  lightbox.classList.add('active');
}

/**
 * Hides the lightbox.
 */
function hideLightbox() {
  lightbox.classList.remove('active');
}

export const LightboxItem = ({alt, src}: LightboxItemProps): HTMLElement => {
  return htmlElement`
    <div class='lightbox-item' @click='${() => showLightbox(src)}'>
      <img alt='${alt}' src='${src}'>
    </div>`;
};

const lightboxImg = document.createElement('img');
lightboxImg.onclick = (e) => e.preventDefault();

const lightbox: HTMLDivElement = htmlElement`
  <div id='lightbox' @click=${hideLightbox}>
    ${lightboxImg}
  </div>`;

export const Lightbox = (): HTMLElement => lightbox;
