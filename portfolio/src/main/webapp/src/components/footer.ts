import {create, html} from '@src/util/html';

export const Footer = () =>
  create(
    'footer',
    null,
    create('p', null, '© 2020 Google, Inc.'),
    create('p', null, html`Because this stuff isn't owned by <em>me</em>...`)
  );
