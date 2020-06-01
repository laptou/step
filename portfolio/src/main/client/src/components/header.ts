import {ThemeSwitcher} from './controls/theme-switcher';
import {htmlElement} from '@src/util/html';

export const Header = (): HTMLElement =>
  htmlElement`
  <header>
    <h1>Ibiyemi Abiodun</h1>
    ${ThemeSwitcher()}
  </header>`;
