import * as Surplus from 'surplus';
import S from 's-js';
import cx from 'classnames';

const currentImage = S.data('');
const isVisible = S.data(false);

export interface LightboxItemProps extends JSX.HTMLAttributes<HTMLImageElement> {
  src: string;
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

export const LightboxItem = ({className, ...props}: LightboxItemProps) =>
  <div className={cx('lightbox-item', className)} onClick={() => showLightbox(props.src)}>
    <img {...props} />
  </div>;

export const Lightbox = () =>
  (
    <div id='lightbox' className={cx({active: isVisible()})} onClick={hideLightbox}>
      <img src={currentImage()} onClick={(e) => e.preventDefault()} />
    </div>
  );
