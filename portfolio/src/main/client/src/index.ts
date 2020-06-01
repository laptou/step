import {IndexPage} from '@component/pages';
import {Lightbox} from './components/controls/lightbox';

import '@style/index.scss';

document.body.append(...IndexPage());
document.body.appendChild(Lightbox());

(async () => {
  const result = await fetch('/data');
  const text = await result.text();
  document.body.append(text);
})().catch((err) => console.error(err));
