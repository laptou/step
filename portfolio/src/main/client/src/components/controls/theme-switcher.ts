import {htmlElement} from '@src/util/html';

const now = new Date();
if (now.getHours() >= 21 || now.getHours() < 9) {
  // if it is before 9:00 or after 21:00, use dark theme automatically
  setTheme('dark');
} else {
  setTheme('light');
}

/**
 * @param theme The theme to apply.
 */
export function setTheme(theme: string): void {
  document.body.classList.remove('theme-light');
  document.body.classList.remove('theme-dark');
  document.body.classList.add(`theme-${theme}`);
}

/**
 * Toggles the theme between light and dark.
 */
export function toggleTheme(): void {
  if (document.body.classList.contains('theme-light')) {
    setTheme('dark');
  } else {
    setTheme('light');
  }
}

export const ThemeSwitcher = (): HTMLElement => {
  const btn: HTMLButtonElement =
    htmlElement`<button class='theme-switcher'>Switch theme</button>`;
  btn.onclick = toggleTheme;
  return btn;
};
