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

var renderRelatedWordLink = function(ctrl, word) {
    let link = ctrl.words().dict[word];
    if (link) {
        return m('a', {
            href: `/${ctrl.lang()}/phrase/${link.phrase_id}`,
            config: m.route
        }, word);
    }
    return word;
}

var renderRelatedWordLinks = function(ctrl, words) {
    return words.map((word) => {
        return m('span.word', renderRelatedWordLink(ctrl, word));
    });
}

var renderSynonyms = function(ctrl, phrase, synonyms) {
    return m('span.synonyms', renderRelatedWordLinks(ctrl, synonyms));
}

var renderAntonyms = function(ctrl, phrase, antonyms) {
    let translation = antonyms.translation;
    let words = antonyms.words;
    let contents = [ renderRelatedWordLinks(ctrl, words) ];
    if (translation) {
        contents.push(m('span.an_trans', translation));
    }
    return m('span.antonyms', contents);
}

var renderWordDetail = function(ctrl, phrase, word) {
    let detail = [m('span.translation', word.translation)]
    if (word.synonyms) {
        detail.push(renderSynonyms(ctrl, phrase, word.synonyms));
    }
    if (word.antonyms) {
        detail.push(renderAntonyms(ctrl, phrase, word.antonyms));
    }
    return m('dd', detail);
}

var renderWordNotes = function(ctrl, phrase, word) {
    if (word.notes) {
        return m('dd.note', m('ul', word.notes.map((note) => {
            return m('li', note);
        })));
    }
    return "";
}

var renderWord = function(ctrl, phrase, word) {
    return [
        m('dt', word.word),
        renderWordDetail(ctrl, phrase, word),
        renderWordNotes(ctrl, phrase, word)
    ];
}

var renderWords = function(ctrl, phrase) {
    let words = ctrl.words().index[phrase.id];
    if (words) {
        return m('dl.words', words.map((word) => {
            return renderWord(ctrl, phrase, word);
        }));
    }
    return "";
}

var renderNote = function(ctrl, phrase) {
    return m('.phrase-tab.tab-pane[role="tabpanel"]',
        { id: `id-${phrase.id}-note`, class: "note" },
        renderWords(ctrl, phrase)
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

var renderNoteButton = function(ctrl, phrase) {
    return m('li[role="presentation"]',
        { class: 'note' },
        m('a[role="tab"][data-toggle="tab"]',
            { href: `#id-${phrase.id}-note`, "aria-controls": `id-${phrase.id}-note` },
            m('span.glyphicon.glyphicon-list-alt')
        )
    );
}

var renderLangButtons = function(ctrl, phrase) {
    return m('.tabs-below', m('ul.nav.nav-tabs[role="tablist"]', [
        renderLangButton(ctrl, 'en', phrase),
        renderLangButton(ctrl, 'ja', phrase),
        renderLangButton(ctrl, 'none', phrase),
        renderNoteButton(ctrl, phrase)
    ]));
};

var createPlayAudioPhraseHandler = function(ctrl, phrase) {
    return function() {
        let audio = document.getElementById(`audio-${phrase.id}`);
        audio.currentTime = 0;
        audio.play();
        return false;
    }
}

var createStopAudioPhraseHandler = function(ctrl, phrase) {
    return function() {
        let audio = document.getElementById(`audio-${phrase.id}`);
        let duration = audio.duration;
        let currentTime = audio.currentTime;
        if (duration - currentTime < 2) {
            audio.currentTime = 0;
            audio.play();
        } else {
            audio.pause();
        }
        return false;
    }
}

var renderPlayButton = function(ctrl, phrase) {
    let icon = null;
    let handler = null;
    if (ctrl.audioStatus() == 'ended') {
        icon = m('span.glyphicon.glyphicon-play');
        handler = createPlayAudioPhraseHandler(ctrl, phrase);
    } else {
        icon = m('span.glyphicon.glyphicon-pause');
        handler = createStopAudioPhraseHandler(ctrl, phrase);
    }
    return m('a[title="key:\'p\'"]', {
        href: '#',
        onclick: handler
    }, m('.phase-navigation.play', icon));
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
    'next': 'j',
    'previous': 'k'
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

var firstOrLastPhaseInSection = function(ctrl, phrase, direction) {
    if (phrase) {
        let phrases = phrase.section.phrases;
        if (direction == 'previous') {
            return phrases[0];
        } else {
            return phrases[phrases.length - 1];
        }
    }
    return null;
}

var stepForwardOrBackwordPhrase = function(ctrl, phrase, direction) {
    let targetPhrase = firstOrLastPhaseInSection(ctrl, phrase, direction);
    if (targetPhrase.id == phrase.id) {
        let nextDirection = 'previous';
        if (direction == 'previous') {
            nextDirection = 'next';
        }
        targetPhrase = firstOrLastPhaseInSection(ctrl, phrase[direction], nextDirection);
    }
    return targetPhrase;
}

var renderSectionNavigation = function(ctrl, phrase, direction, caption) {
    let navigation = m('.phase-navigation',
        { class: direction },
        caption
    );
    let targetPhrase = stepForwardOrBackwordPhrase(ctrl, phrase, direction);

    if (targetPhrase) {
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
    return m('.section-title', [
        m('p', text),
        renderSectionBreadcrumb(ctrl, phrase)
    ]);
}

var createPlayingAudioHandler = function(ctrl, phrase) {
    return function(event) {
        ctrl.audioStatus("playing");
        return false;
    }
}

var createEndedAudioHandler = function(ctrl, phrase) {
    return function(event) {
        ctrl.audioStatus("ended");
        return false;
    }
}

var renderAudio = function(ctrl, phrase) {
    let attr = {
        src: `resources/${phrase.path}`,
        id: `audio-${phrase.id}`,
        onplay: createPlayingAudioHandler(ctrl, phrase),
        onplaying: createPlayingAudioHandler(ctrl, phrase),
        onended: createEndedAudioHandler(ctrl, phrase),
        onpause: createEndedAudioHandler(ctrl, phrase)
    }
    if (ctrl.lang() == 'none') {
        attr['autoplay'] = 'autoplay'
    }
    return m('.audio', m('audio[controls=controls]', attr));
}

var renderSectionBreadcrumb = function(ctrl, phrase) {
    let phrases = phrase.section.phrases;
    return m('.breadcrumb', phrases.map((_phrase) => {
        let attr = {
            class: _phrase.id == phrase.id ? 'current' : '',
            href: `/${ctrl.lang()}/phrase/${_phrase.id}`,
            config: m.route,
        };
        return m('a.phrase-nav', attr, ' ')
    }));
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
            let targetPhrase = null;
            if (event.keyCode == 39 || event.keyCode == 74) {
                // Move next `key -> / j`
                m.route(`/${ctrl.lang()}/phrase/${phrase.next.id}`);
                return false;
            } else if (event.keyCode == 37 || event.keyCode == 75) {
                // Move previous `key <- / k`
                m.route(`/${ctrl.lang()}/phrase/${phrase.previous.id}`);
                return false;
            } else if (event.keyCode == 72) {
                // Move step previous `key h`
                targetPhrase = stepForwardOrBackwordPhrase(ctrl, phrase, 'next');
                m.route(`/${ctrl.lang()}/phrase/${targetPhrase.id}`);
                return false;
            } else if (event.keyCode == 76) {
                // Move previous next `key l`
                targetPhrase = stepForwardOrBackwordPhrase(ctrl, phrase, 'previous');
                m.route(`/${ctrl.lang()}/phrase/${targetPhrase.id}`);
                return false;
            } else if (event.keyCode == 80) {
                // Play phrase `key p`
                if (ctrl.audioStatus() == 'ended') {
                    return createPlayAudioPhraseHandler(ctrl, phrase)();
                } else {
                    return createStopAudioPhraseHandler(ctrl, phrase)();
                }
            } else if (event.keyCode == 82) {
                // Move random phrase `key r`
                return createRedirectRandomHandler(ctrl, phrase)();
            }
        }
        let swipeLeftHook = function(event) {
            // console.log('swipeleft')
            // console.log(event.detail.x2 - event.detail.x1);
            let absX = Math.abs(event.detail.x2 - event.detail.x1);
            if ( absX > window.innerWidth / 4) {
                window.history.forward();
            }
            return false;
        }
        let swipeRightHook = function(event) {
            // console.log('swiperight')
            // console.log(event.detail.x2 - event.detail.x1);
            let absX = Math.abs(event.detail.x2 - event.detail.x1);
            if ( absX > window.innerWidth / 4) {
                window.history.back();
            }
            return false;
        }
        if (!isInitialized) {
            document.addEventListener('keyup', keyupHook);
            if (window.navigator.standalone) {
                document.addEventListener('swipeleft', swipeLeftHook);
                document.addEventListener('swiperight', swipeRightHook);
            }

            context.onunload = () => {
                document.removeEventListener('keyup', keyupHook);
                if (window.navigator.standalone) {
                    document.removeEventListener('swipeleft', swipeLeftHook);
                    document.removeEventListener('swiperight', swipeRightHook);
                }
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
        let audioStatus = m.prop("ended");

        return {
            lang: args.lang,
            id: id,
            duo: args.duo(),
            words: args.words(),
            audioStatus: audioStatus
        };
    },
    view: (ctrl, args) => {
        let phrase = ctrl.duo().index[ctrl.id];
        return [
            m('.container-fluid.phrase', {
                config: createEventHandler(ctrl, phrase)
            }, [
                renderSectionTitle(ctrl, phrase),
                m('.row.contents', [
                    renderAudio(ctrl, phrase),
                    m('.tab-content', [
                        renderEn(ctrl, phrase),
                        renderJa(ctrl, phrase),
                        renderNone(ctrl, phrase),
                        renderNote(ctrl, phrase)
                    ])
                ]),
            ]),
            renderFooter(ctrl, phrase)
        ];
    }
};
