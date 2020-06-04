import {htmlElement} from '@src/util/html';
import {LightboxItem} from '../controls/lightbox';
import {ResponsiveImageInfo, ResponsiveImage} from '../controls/responsive-image';
import '@res/style/sections/cooking.scss';

export interface DishInfo {
  attributes: { name: string; image?: string };
  html: string;
}

// get list of files in res/text/dish folder as webpack context
const dishContext = require.context('@res/text/dish', false);

// load each file from the context these are markdown files that are
// transformed into JS objects via frontmatter-markdown-loader, giving the
// front matter on property `attributes` and the HTML corresponding to the
// markdown on property `html`.

// type assertion b/c webpack context returns `any` since it does not know
// the type of the modules
const dishInfos = dishContext
  .keys()
  .map((key) => dishContext(key) as DishInfo);

export const CookingSection = (): HTMLElement =>
  htmlElement`
  <section id="cooking-section">
    ${dishInfos.map((info) => CookingItem(info))}
  </section>`;

export const CookingItem = (info: DishInfo): HTMLElement => {
  const section: HTMLElement = htmlElement`
  <div class="cooking-item">
    <div class="content">
      <h3>${info.attributes.name}</h3>
      ${info.html}
    </div>
  </div>`;

  if (info.attributes.image) {
    // require returns the mangled URL to the image, via file-loader
    const src = require(
      `@res/img/dish/${info.attributes.image}` +
      '?responsive&sizes[]=200,sizes[]=400,sizes[]=600') as ResponsiveImageInfo;

    const img = ResponsiveImage({
      src,
      alt: info.attributes.name,
    });

    img.classList.add('cooking-item-image');

    const thumbnail = htmlElement`
    <div class="thumbnail">
      ${LightboxItem({
        target: img,
      })}
    </div>`;

    section.insertBefore(thumbnail, section.firstChild);
  }

  return section;
};
