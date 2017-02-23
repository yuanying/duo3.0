import m from 'mithril';

var renderSection = function(ctrl, section) {
    return m('.section.panel.panel-default', [
        m('.panel-heading[role="tab"]', { id: `${section.name}-head`},
            m('h1',
                m('a[role="button"][data-toggle="collapse"][data-parent="#accordion"][aria-expanded="true"]',
                    { href: `#${section.name}-collapse`, "aria-controls": `${section.name}-collapse`},
                    section.name
                )
            )
        ),
        renderPhrases(ctrl, section, section.phrases)
    ]);
}

var renderPhrases = function(ctrl, section, phrases) {
    return m('.panel-collapse.collapse[role="tabpanel"]',
        { "aria-labelledby": `${section.name}-head`, id: `${section.name}-collapse` },
        m('.panel-body', m('ul', phrases.map((phrase) => {
            return renderPhrase(ctrl, phrase);
        })))
    );
};

var renderPhrase = function(ctrl, phrase) {
    return m('li',
        m('a',
            { href: `/${ctrl.lang()}/phrase/${phrase.id}`, config: m.route },
            phrase.basename
        )
    );
};

export default {
    controller: (args) => {
        args.lang(m.route.param("lang") || "en");
        args.phrase("");
        return {
            duo: args.duo(),
            lang: args.lang
        };
    },
    view: (ctrl, args) => {
        return m('.container-fluid',
            m('.row.sections.panel-group[role="tablist"][aria-multiselectable="true"][id="accordion"]',
                ctrl.duo().sections.map((section) => {
                    return renderSection(ctrl, section);
                })
            )
        );
    }
};
