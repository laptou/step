import * as Surplus from 'surplus';
import S from 's-js';
import {Header} from '@component/header';
import {IndexPage} from '@component/pages';
import {activate as activateThemeSwitcher} from '@component/theme-switcher';

import '@style/index.scss';

S.root(() => {
  activateThemeSwitcher();

  document.body.appendChild(
      <Header />
  );

  document.body.appendChild(
      <IndexPage />
  );

  document.body.appendChild(
      <footer>
        <p>© 2020 Google, Inc.</p>
        <p>Because this stuff isn't owned by <em>me</em>...</p>
      </footer>
  );
});
