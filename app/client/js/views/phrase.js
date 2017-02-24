import m from 'mithril';

var renderRawText = function(text) {
    let texts = text.split("\n");
    return m('.text', texts.map((text) => {
        return [text, m('br')]
    }));
};

var renderText = function(ctrl, lang, phrase) {
    let collapseIn = "";
    if (lang == ctrl.lang()) {
        collapseIn = " active";
    }
    let classNames = `${lang} ${collapseIn}`;
    return m('.phrase-tab.tab-pane[role="tabpanel"]',
        { id: `id-${phrase.id}-${lang}`, class: classNames },
        renderRawText(phrase[lang])
    );
};

var renderJa = function(ctrl, phrase) {
    return renderText(ctrl, 'ja', phrase);
};

var renderEn = function(ctrl, phrase) {
    return renderText(ctrl, 'en', phrase);
};

var renderNone = function(ctrl, phrase) {
    let collapseIn = "";
    if (ctrl.lang() != 'ja' && ctrl.lang() != 'en') {
        collapseIn = " active";
    }
    let classNames = `none ${collapseIn}`;
    return m('.phrase-tab.tab-pane[role="tabpanel"]',
        { id: `id-${phrase.id}-none`, class: classNames },
        m('span.text.glyphicon.glyphicon-bullhorn')
    );
}

var renderLangButton = function(ctrl, lang, phrase) {
    let className = "";
    let text = lang;
    if (lang == ctrl.lang()) {
        className = "active";
    }
    if (lang != 'en' && lang != 'ja') {
        text = m('span.glyphicon.glyphicon-bullhorn')
    }
    return m('li[role="presentation"]',
        { class: className },
        m('a[role="tab"][data-toggle="tab"]',
            { href: `#id-${phrase.id}-${lang}`, "aria-controls": `id-${phrase.id}-${lang}` },
            text
        )
    );
};

var renderLangButtons = function(ctrl, phrase) {
    return m('.tabs-below', m('ul.nav.nav-tabs[role="tablist"]', [
        renderLangButton(ctrl, 'en', phrase),
        renderLangButton(ctrl, 'ja', phrase),
        renderLangButton(ctrl, 'none', phrase)
    ]));
};

var createPlayPhraseHandler = function(ctrl, phrase) {
    return function() {
        let audio = document.getElementById(`audio-${phrase.id}`);
        audio.play();
        return false;
    }
}

var renderPlayButton = function(ctrl, phrase) {
    return m('a[title="key:\'p\'"]', {
        href: '#',
        onclick: createPlayPhraseHandler(ctrl, phrase)
    }, m('.phase-navigation.play', m('span.glyphicon.glyphicon-play')));
}

var createRedirectRandomHandler = function(ctrl, phrase) {
    return function() {
        let phrases = ctrl.duo().phrases;
        let random = phrases[Math.floor(Math.random() * phrases.length)];
        m.route(`/${ctrl.lang()}/phrase/${random.id}`);
        return false;
    }
}

var renderRandomButton = function(ctrl, phrase) {
    return m('a[title="key:\'r\'"]', {
        href: '#',
        onclick: createRedirectRandomHandler(ctrl, phrase)
    }, m('.phase-navigation', m('span.glyphicon.glyphicon-random')));
}

var directionMap = {
    'next': '→',
    'previous': '←'
}

var renderNavigation = function(ctrl, phrase, direction, caption) {
    let navigation = m('.phase-navigation',
        { class: direction },
        caption
    );
    if (phrase[direction]) {
        navigation = m('a',
            {
                href: `/${ctrl.lang()}/phrase/${phrase[direction].id}`,
                config: m.route,
                title: `key:'${directionMap[direction]}'`
            },
            navigation
        )
    }
    return navigation;
}

var renderSectionNavigation = function(ctrl, phrase, direction, caption) {
    let navigation = m('.phase-navigation',
        { class: direction },
        caption
    );
    let targetPhrase = null;
    let phrases = phrase.section.phrases;
    if (direction == 'previous') {
        targetPhrase = phrases[0];
    } else {
        targetPhrase = phrases[phrases.length - 1];
    }
    if (phrase[direction]) {
        navigation = m('a',
            { href: `/${ctrl.lang()}/phrase/${targetPhrase.id}`, config: m.route },
            navigation
        )
    }
    return navigation;
}

var renderNavigations = function(ctrl, phrase) {
    let stepBackward = m('span.glyphicon.glyphicon-step-backward');
    let backward = m('span.glyphicon.glyphicon-backward');
    let stepForward = m('span.glyphicon.glyphicon-step-forward');
    let forward = m('span.glyphicon.glyphicon-forward');
    return m('.phase-navigations', [
        renderPlayButton(ctrl, phrase),
        renderRandomButton(ctrl, phrase),
        renderSectionNavigation(ctrl, phrase, 'previous', stepBackward),
        renderNavigation(ctrl, phrase, 'previous', backward),
        renderNavigation(ctrl, phrase, 'next', forward),
        renderSectionNavigation(ctrl, phrase, 'next', stepForward)
    ]);
}

var renderSectionTitle = function(ctrl, phrase) {
    let text = `${phrase.section.name} (${phrase.id})`;
    return m('.section-title', m('p', text));
}

var renderAudio = function(ctrl, phrase) {
    let attr = {
        src: `resources/${phrase.path}`,
        id: `audio-${phrase.id}`
    }
    if (ctrl.lang() == 'none') {
        attr['autoplay'] = 'autoplay'
    }
    return m('.audio', m('audio[controls=controls]', attr));
}

var renderFooter = function(ctrl, phrase) {
    return m('.footer', [
        renderLangButtons(ctrl, phrase),
        renderNavigations(ctrl, phrase)
    ]);
}

var createEventHandler = function(ctrl, phrase) {
    return function(el, isInitialized, context) {
        let keyupHook = function(event) {
            if (event.keyCode == 39) {
                // Move next `key ->`
                m.route(`/${ctrl.lang()}/phrase/${phrase.next.id}`);
                return false;
            } else if (event.keyCode == 37) {
                // Move previous `key <-`
                m.route(`/${ctrl.lang()}/phrase/${phrase.previous.id}`);
                return false;
            } else if (event.keyCode == 80) {
                // Play phrase `key p`
                return createPlayPhraseHandler(ctrl, phrase)();
            } else if (event.keyCode == 82) {
                // Move random phrase `key r`
                return createRedirectRandomHandler(ctrl, phrase)();
            }
        }
        if (!isInitialized) {
            document.addEventListener('keyup', keyupHook);
            context.onunload = () => {
                document.removeEventListener('keyup', keyupHook);
            }
        }
    }
}

export default {
    controller: (args) => {
        args.lang(m.route.param("lang"));
        let id = parseInt(m.route.param("id"));
        args.phrase(id);
        localStorage.setItem('previousUrl', m.route());

        return {
            lang: args.lang,
            id: id,
            duo: args.duo()
        };
    },
    view: (ctrl, args) => {
        let phrase = ctrl.duo().index[ctrl.id];
        return [
            m('.container-fluid', {
                config: createEventHandler(ctrl, phrase)
            }, [
                renderSectionTitle(ctrl, phrase),
                m('.row', [
                    renderAudio(ctrl, phrase),
                    m('.tab-content', [
                        renderEn(ctrl, phrase),
                        renderJa(ctrl, phrase),
                        renderNone(ctrl, phrase)
                    ])
                ]),
            ]),
            renderFooter(ctrl, phrase)
        ];
    }
};
