import '@style/index.dark.scss';
import '@style/index.light.scss';
import {html} from '@src/util/html';

document.body.setAttribute('data-theme', 'light');

/**
 * Toggles the theme between light and dark.
 */
export function toggle(): void {
  // sample because we don't want this to run again
  // in response to the theme being changed, that leads
  // to infinite loop
  if (document.body.getAttribute('data-theme') === 'light') {
    document.body.setAttribute('data-theme', 'dark');
  } else {
    document.body.setAttribute('data-theme', 'light');
  }
}

export const ThemeSwitcher = (): HTMLElement => {
  const btn: HTMLButtonElement = html`<button class='theme-switcher'>Switch theme</button>`;
  btn.onclick = toggle;
  return btn;
};
