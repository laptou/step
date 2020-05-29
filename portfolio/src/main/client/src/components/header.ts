import {ThemeSwitcher} from './theme-switcher';
import {html} from '@src/util/html';

export const Header = () =>
  html`
  <header>
    <h1>Ibiyemi Abiodun</h1>
    ${ThemeSwitcher()}
  </header>`;
