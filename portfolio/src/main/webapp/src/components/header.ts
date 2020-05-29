import {ThemeSwitcher} from './theme-switcher';
import {create} from '@src/util/html';

export const Header = () =>
  create('header', null,
    create('h1', null, 'Ibiyemi Abiodun'),
    ThemeSwitcher()
  );
