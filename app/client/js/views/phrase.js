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
    return m('ul.nav.nav-tabs[role="tablist"]', [
        renderLangButton(ctrl, 'en', phrase),
        renderLangButton(ctrl, 'ja', phrase),
        renderLangButton(ctrl, 'none', phrase)
    ]);
};

var renderNavigation = function(ctrl, phrase, direction, caption) {
    let navigation = m('.col-xs-6.phase-navigation',
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

var renderNavigations = function(ctrl, phrase) {
    return m('.row.phase-navigations', [
        renderNavigation(ctrl, phrase, 'previous', 'Previous'),
        renderNavigation(ctrl, phrase, 'next', 'Next')
    ]);
}

var renderSectionTitle = function(ctrl, phrase) {
    let text = `${phrase.section} (${phrase.id})`;
    return m('.section-title', m('p', text));
}

var renderAudio = function(ctrl, phrase) {
    return m('.audio', m('audio[controls=controls]', { src: `resources/${phrase.path}`}));
}

export default {
    controller: (args) => {
        args.lang(m.route.param("lang"));
        let id = parseInt(m.route.param("id"));
        args.phrase(id);

        return {
            lang: args.lang,
            id: id,
            duo: args.duo()
        };
    },
    view: (ctrl, args) => {
        let phrase = ctrl.duo().index[ctrl.id];
        return m('.container-fluid', [
            m('.row', [
                renderLangButtons(ctrl, phrase),
                renderAudio(ctrl, phrase),
                m('.tab-content', [
                    renderEn(ctrl, phrase),
                    renderJa(ctrl, phrase),
                    renderNone(ctrl, phrase)
                ])
            ]),
            renderSectionTitle(ctrl, phrase),
            renderNavigations(ctrl, phrase)
        ]);
    }
};
