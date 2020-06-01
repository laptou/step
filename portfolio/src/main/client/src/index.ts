import {Header} from '@component/header';
import {IndexPage} from '@component/pages';
import {Footer} from './components/footer';
import {Lightbox} from './components/controls/lightbox';

import '@style/index.scss';

document.body.appendChild(Header());
document.body.appendChild(IndexPage());
document.body.appendChild(Footer());
document.body.appendChild(Lightbox());
