import '@style/index.dark.scss';
import '@style/index.light.scss';
import {htmlElement} from '@src/util/html';

// not adding this in HTML for encapsulation
document.body.classList.add('theme-light');

/**
 * Toggles the theme between light and dark.
 */
export function toggle(): void {
  if (document.body.classList.contains('theme-light')) {
    document.body.classList.remove('theme-light');
    document.body.classList.add('theme-dark');
  } else {
    document.body.classList.remove('theme-dark');
    document.body.classList.add('theme-light');
  }
}

export const ThemeSwitcher = (): HTMLElement => {
  const btn: HTMLButtonElement =
    htmlElement`<button class='theme-switcher'>Switch theme</button>`;
  btn.onclick = toggle;
  return btn;
};
