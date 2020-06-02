import {htmlElement} from '@src/util/html';

/**
 * Responsive image info, as provided by Webpack responsive-loader.
 */
export interface ResponsiveImageInfo {
  srcSet: string;
  images: { height: number; width: number; path: string; }[];
  src: string;
}

export interface ResponsiveImageOptions {
  src: string | ResponsiveImageInfo;
  alt?: string;
}

export const ResponsiveImage =
  ({src, alt}: ResponsiveImageOptions): HTMLImageElement =>
    typeof src === 'string' ?
      htmlElement`<img src="${src}" alt="${alt}" />` :
      htmlElement`<img srcset="${src.srcSet}" src="${src.src}" alt="${alt}" />`;
