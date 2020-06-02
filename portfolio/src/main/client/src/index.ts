import {IndexPage} from '@component/pages';
import {Lightbox} from './components/controls/lightbox';

import '@style/index.scss';

document.body.append(...IndexPage());
document.body.appendChild(Lightbox());
