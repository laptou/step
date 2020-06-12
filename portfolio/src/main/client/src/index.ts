import {IndexPage} from '@component/pages';
import {Lightbox} from './components/controls/lightbox';
import {Toast} from './components/controls/toast';

import '@style/index.scss';

document.body.append(...IndexPage());
document.body.appendChild(Lightbox());
document.body.appendChild(Toast());
