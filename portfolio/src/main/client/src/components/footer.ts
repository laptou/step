import {htmlElement} from '@src/util/html';

export const Footer = (): HTMLElement =>
  htmlElement`
  <footer>
    <p>© 2020 Google, Inc.</p>
    <p>Because this stuff isn't owned by <em>me</em>...</p>
  </footer>`;
