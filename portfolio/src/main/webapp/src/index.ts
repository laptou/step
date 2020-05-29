import S from 's-js';
import {Header} from '@component/header';
import {IndexPage} from '@component/pages';
import {activate as activateThemeSwitcher} from '@component/theme-switcher';
import {Lightbox} from './components/lightbox';

import '@style/index.scss';
import {Footer} from './components/footer';

S.root(() => {
  activateThemeSwitcher();

  document.body.appendChild(Header());
  document.body.appendChild(IndexPage());
  document.body.appendChild(Footer());
  document.body.appendChild(Lightbox());
});
