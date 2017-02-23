import m from 'mithril';
import $ from 'jquery'
import 'bootstrap';

import Duo from './models/duo'

import Home from './views/home';
import Phrase from './views/phrase';
import NavBar from './views/navbar';
import '../css/littlebox.min.css';
import '../css/bootstrap.min.css';
import '../css/main.css';
// import 'bootstrap/dist/css/bootstrap.min.css'

m.route.mode = "hash";

var lang = m.prop("en");
var phrase = m.prop("");

const homeView = m.component(Home, { duo: Duo.data, lang: lang, phrase: phrase });
const phraseView = m.component(Phrase, { duo: Duo.data, lang: lang, phrase: phrase });

m.route(document.getElementById('root'), '/', {
    '/': homeView,
    '/:lang': homeView,
    '/:lang/phrase/:id': phraseView
});

m.mount(document.getElementById('navbar'),
    m.component(NavBar, {title: 'Duo3.0', duo: Duo.data, lang: lang, phrase: phrase })
);

if (m.route().split('/')[1] != 'phrase') {
    let previousUrl = localStorage.getItem('previousUrl');
    if (previousUrl) {
        m.route(previousUrl);
    }
}
