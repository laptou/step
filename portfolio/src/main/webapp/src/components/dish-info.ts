import {create, htmls, withClass} from '@src/util/html';
import {LightboxItem} from './lightbox';

interface CookingSectionProps {
  info: {
    attributes: { name: string; image: string };
    html: string;
  };
}

export const CookingSection = ({info}: CookingSectionProps) => {
  return create('section', withClass('cooking-section'),
    create('div', withClass('thumbnail'),
      LightboxItem({
        src: require(`@res/img/dish/${info.attributes.image}`).default,
        alt: info.attributes.name,
      }),
    ),
    create('div', withClass('content'),
      create('h3', null, info.attributes.name),
      ...htmls`${info.html}`
    )
  );
};
