import {html} from '@src/util/html';
import {LightboxItem} from './lightbox';

interface CookingSectionProps {
  info: {
    attributes: { name: string; image: string };
    html: string;
  };
}

export const CookingSection = ({info}: CookingSectionProps) => html`
  <section class='cooking-section'>
    <div class='thumbnail'>
      ${LightboxItem({
        src: require(`@res/img/dish/${info.attributes.image}`).default,
        alt: info.attributes.name,
      })}
    </div>
    <div class='content'>
      <h3>${info.attributes.name}</h3>
      ${info.html}
    </div>`;
