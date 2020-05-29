import {html} from '@src/util/html';
import {LightboxItem} from '../controls/lightbox';

export interface DishInfo {
  attributes: { name: string; image: string };
  html: string;
}

export interface CookingSectionProps {
  info: DishInfo;
}

export const CookingSection = ({info}: CookingSectionProps): HTMLElement => html`
  <section class="cooking-section">
    <div class="thumbnail">
      ${LightboxItem({
        src: require(`@res/img/dish/${info.attributes.image}`).default,
        alt: info.attributes.name,
      })}
    </div>
    <div class="content">
      <h3>${info.attributes.name}</h3>
      ${info.html}
    </div>
  </section>`;
