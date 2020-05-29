import {ThemeSwitcher} from './controls/theme-switcher';
import {html} from '@src/util/html';

export const Header = (): HTMLElement =>
  html`
  <header>
    <h1>Ibiyemi Abiodun</h1>
    ${ThemeSwitcher()}
  </header>`;
