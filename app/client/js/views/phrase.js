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

var renderPlayButton = function(ctrl, phrase) {
    let playPhrase = function() {
        let audio = document.getElementById(`audio-${phrase.id}`);
        audio.play();
        return false;
    }
    return m('a', {
        href: '#',
        onclick: playPhrase
    }, m('.phase-navigation.play', m('span.glyphicon.glyphicon-play')));
}

var renderRandomButton = function(ctrl) {
    let redirectRandom = function() {
        let phrases = ctrl.duo().phrases;
        let random = phrases[Math.floor(Math.random() * phrases.length)];
        m.route(`/${ctrl.lang()}/phrase/${random.id}`);
    }
    return m('a', {
        href: '#',
        onclick: redirectRandom
    }, m('.phase-navigation', m('span.glyphicon.glyphicon-random')));
}

var renderNavigation = function(ctrl, phrase, direction, caption) {
    let navigation = m('.phase-navigation',
        { class: direction },
        caption
    );
    if (phrase[direction]) {
        navigation = m('a',
            { href: `/${ctrl.lang()}/phrase/${phrase[direction].id}`, config: m.route },
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
        renderRandomButton(ctrl),
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
    return m('.audio', m('audio[controls=controls]', {
        src: `resources/${phrase.path}`,
        id: `audio-${phrase.id}`
    }));
}

var renderFooter = function(ctrl, phrase) {
    return m('.footer', [
        renderLangButtons(ctrl, phrase),
        renderNavigations(ctrl, phrase)
    ]);
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
            m('.container-fluid', [
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
