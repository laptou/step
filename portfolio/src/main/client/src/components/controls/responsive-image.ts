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
  info: ResponsiveImageInfo;
  alt?: string;
}

export const ResponsiveImage =
  ({info, alt}: ResponsiveImageOptions): HTMLImageElement =>
    htmlElement`<img srcset="${info.srcSet}" src="${info.src}" alt="${alt}" />`;
