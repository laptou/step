import {htmlElement} from '@src/util/html';
import {LightboxItem} from '../controls/lightbox';
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
  .map((key) => ({key, info: projectContext(key) as ProjectInfo}))
  .sort((a, b) =>
    a.info.attributes.year <= b.info.attributes.year ? 1 : -1);

const ProjectItem = (key: string, info: ProjectInfo): HTMLElement => {
  const readmore = ReadMore(info.html);
  const content: HTMLElement = htmlElement`
        <div class="project-content">
          <h3>${info.attributes.name}</h3>
          <ul class="project-stats">
            <!-- don't nit me, if I put any whitespace in this line it will mess
                 up the presentation -->
            <li class="year">${info.attributes.year.toString()}</li><li class="languages">${info.attributes.languages.join(', ')}</li>
          </ul>
          ${readmore.root}
        </div>`;

  const lightbox = LightboxItem({
    target: content,
    preservePosition: true,
  });

  readmore.root.addEventListener('readmore-expand', () => lightbox.show());
  readmore.root.addEventListener('readmore-collapse', () => lightbox.hide());

  lightbox.root.addEventListener('lightbox-show', () => readmore.expand());
  lightbox.root.addEventListener('lightbox-hide', () => readmore.collapse());

  const section: HTMLElement = htmlElement`
        <div class="project-item">
          ${lightbox.root}
        </div>`;

  return section;
};

/**
 * @returns The code project section of the home page.
 */
export const ProjectSection = (): HTMLElement =>
  htmlElement`
  <section id="project-section">
    ${projectInfos.map(({key, info}) => ProjectItem(key, info))}
  </section>`;


