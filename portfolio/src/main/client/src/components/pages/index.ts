import {CookingSection, DishInfo} from '@src/components/sections/cooking';
import {htmlElement} from '@src/util/html';

export const IndexPage = (): HTMLElement => {
  // get list of files in res/text/dish folder as webpack context
  const dishContext = require.context('@res/text/dish', false);
  // load each file from the context
  // these are markdown files that are transformed into JS objects via
  // frontmatter-markdown-loader, giving the front matter on property `attributes`
  // and the HTML corresponding to the markdown on property `html`.
  const dishInfos = dishContext.keys().map((key) => dishContext(key) as DishInfo);
  const dishComponents = dishInfos.map((info) => CookingSection({info}));

  return htmlElement`
  <main>
    <h2>Hi!</h2>
    <p>
      I'm a rising sophomore at Cornell, double majoring in electrical & computer engineering, and
      computer science. I love cooking & baking, karate, VFX, cinematography, and of course,
      coding.
    </p>
    <p>
      I was born in Nigeria, and I've lived all over the U.S. When people ask I tell
      them I'm from Seattle because I lived in Bellevue & Kirkland for about 9 years.
    </p>
    <h2>Coding</h2>
    <p>
      You want my resume? <a href="${require('@res/dl/resume.pdf').default}">Here you go</a>.
    </p>
    <h2>Cooking</h2>
    <p>
      I know, we're in quarantine, everyone is cooking and baking. But look at this:
    </p>
    ${dishComponents}
  </main>`;
};
