import {htmlElement} from '@src/util/html';
import {LightboxItem} from '../controls/lightbox';

export interface DishInfo {
  attributes: { name: string; image: string };
  html: string;
}

export const CookingSection = (info: DishInfo): HTMLElement => htmlElement`
  <section class="cooking-section">
    <div class="thumbnail">
      ${LightboxItem({
        // require returns the mangled URL to the image, via file-loader
        src: require(`@res/img/dish/${info.attributes.image}`).default,
        alt: info.attributes.name,
      })}
    </div>
    <div class="content">
      <h3>${info.attributes.name}</h3>
      ${info.html}
    </div>
  </section>`;
