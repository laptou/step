import * as Surplus from 'surplus';
import S from 's-js';
import {Header} from '@component/header';
import {IndexPage} from '@component/pages';
import {Footer} from './components/footer';
import {activate as activateThemeSwitcher} from '@src/components/controls/theme-switcher';
import {Lightbox} from './components/controls/lightbox';

import '@style/index.scss';

S.root(() => {
  activateThemeSwitcher();

  document.body.appendChild(Header());
  document.body.appendChild(IndexPage());
  document.body.appendChild(Footer());
  document.body.appendChild(Lightbox());
});
