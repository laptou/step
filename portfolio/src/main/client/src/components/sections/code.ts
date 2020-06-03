import {htmlElement} from '@src/util/html';
import {LightboxItem} from '../controls/lightbox';
import {ResponsiveImageInfo} from '../controls/responsive-image';
import {ReadMore} from '../controls/readmore';

export interface ProjectInfo {
  attributes: { name: string; languages: string[]; year: number; };
  html: string;
}

export const CookingSection = (info: ProjectInfo): HTMLElement => {
  const section: HTMLElement = htmlElement`
  <section class="code-section">
    <div class="content">
      <h3>${info.attributes.name}</h3>
      ${ReadMore(info.html)}
    </div>
  </section>`;

  return section;
};
