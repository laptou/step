import S from 's-js';
import cx from 'classnames';
import {create, CreateOptions, set} from '@src/util/html';

const currentImage = S.data('');
const isVisible = S.data(false);

export interface LightboxItemProps extends CreateOptions {
  src: string;
  alt?: string;
}

/**
 * Shows the lightbox with the given image.
 * @param uri The URI of the image to be shown.
 */
function showLightbox(uri: string) {
  console.log('hi');
  currentImage(uri);
  isVisible(true);
}

/**
 * Hides the lightbox.
 */
function hideLightbox() {
  isVisible(false);
}

export const LightboxItem = ({className, alt, src}: LightboxItemProps) =>
  create(
    'div',
    (lbItem) => {
      lbItem.className = cx('lightbox-item', className);
      lbItem.onclick = () => showLightbox(src);
    },
    create('img', (img) => {
      set(img, 'alt', alt);
      set(img, 'src', src);
    })
  );

export const Lightbox = () =>
  create(
    'div',
    (lightbox) => {
      lightbox.id = 'lightbox';
      lightbox.onclick = hideLightbox;

      S(() => {
        lightbox.className = cx({active: isVisible()});
      });
    },
    create('img',
      (img) => {
        img.onclick = (e) => e.preventDefault();
        S(() => {
          img.src = currentImage();
        });
      }
    )
  );
