import {htmlElement} from '@src/util/html';
import {LightboxItem} from '../controls/lightbox';
import {ResponsiveImageInfo} from '../controls/responsive-image';

export interface DishInfo {
  attributes: { name: string; image?: string };
  html: string;
}

export const CookingSection = (info: DishInfo): HTMLElement => {
  const section: HTMLElement = htmlElement`
  <section class="cooking-section">
    <div class="content">
      <h3>${info.attributes.name}</h3>
      ${info.html}
    </div>
  </section>`;

  if (info.attributes.image) {
    const src = require(
      `@res/img/dish/${info.attributes.image}` +
      '?responsive&sizes[]=200,sizes[]=400,sizes[]=600') as ResponsiveImageInfo;

    const thumbnail = htmlElement`
    <div class="thumbnail">
      ${LightboxItem({
        // require returns the mangled URL to the image, via file-loader
        src,
        alt: info.attributes.name,
      })}
    </div>`;

    section.insertBefore(thumbnail, section.firstChild);
  }

  return section;
};
