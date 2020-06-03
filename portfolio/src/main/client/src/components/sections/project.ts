import {htmlElement} from '@src/util/html';
import {LightboxItem} from '../controls/lightbox';
import {ResponsiveImageInfo} from '../controls/responsive-image';
import {ReadMore} from '../controls/readmore';
import '@res/style/sections/project.scss';

/**
 * Project information as translated by frontmatter-markdown-loader.
 */
export interface ProjectInfo {
  /**
   * The attributes contained in the front matter.
   */
  attributes: {
    /** Name of the project. */
    name: string;
    /** Programming languages used. */
    languages: string[];
    /** Technologies used. */
    technologies: string[];
    /** Year I started this project. */
    year: number;
  };

  /**
   * The HTML corresponding to the Markdown.
   */
  html: string;
}

const projectContext = require.context('@res/text/project', false);
const projectInfos = projectContext
  .keys()
  .map((key) => ({key, info: projectContext(key) as ProjectInfo}));

export const ProjectSection = (): HTMLElement =>
  htmlElement`
  <section id="project-section">
    ${projectInfos.map(({key, info}) => ProjectItem(key, info))}
  </section>`;

export const ProjectItem = (key: string, info: ProjectInfo): HTMLElement => {
  const section: HTMLElement = htmlElement`
  <div class="project-item">
    <div class="content">
      <h3>${info.attributes.name}</h3>
      ${ReadMore(info.html)}
    </div>
  </div>`;

  return section;
};
