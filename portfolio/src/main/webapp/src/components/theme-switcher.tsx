import * as Surplus from 'surplus';
import S from 's-js';

import '@style/index.dark.scss';
import '@style/index.light.scss';

type Theme = 'light' | 'dark';

const currentTheme = S.data('light' as Theme);

/**
 * Initializes the theme switcher.
 */
export function activate() {
  S(() => {
    document.body.setAttribute('data-theme', currentTheme());
  });
}

/**
 * Toggles the theme between light and dark.
 */
export function toggle() {
  // sample because we don't want this to run again
  // in response to the theme being changed, that leads
  // to infinite loop
  if (S.sample(currentTheme) === 'light') {
    currentTheme('dark');
  } else {
    currentTheme('light');
  }
}

export const ThemeSwitcher = () =>
  <button class="theme-switcher" onClick={toggle}>Switch theme</button>;
