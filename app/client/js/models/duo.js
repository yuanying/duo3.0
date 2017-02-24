import m from 'mithril';

var addSection = function(sections, phrase) {
    let lastSection = sections[sections.length - 1];
    if (!lastSection || lastSection.name != phrase.section) {
        lastSection = {
            name: phrase.section,
            phrases: []
        }
        sections.push(lastSection);
    }
    lastSection.phrases.push(phrase);
    return lastSection;
};

var addPhrase = function(index, word) {
    let phrase = index[word.phrase_id];
    if (!phrase) {
        phrase = [];
        index[word.phrase_id] = phrase;
    }
    phrase.push(word);
}

export default {
    data: () => {
        return m.request({method: "GET", url: 'resources/index.js'}).then((list) => {
            let sections = [];
            let index = {};
            let previous = null;

            list.forEach((value) => {
                let section = addSection(sections, value);
                value.section = section;
                index[value.id] = value;
                if (previous) {
                    value.previous = previous;
                    previous.next = value;
                }
                previous = value;
            });
            return {
                sections: sections,
                phrases: list,
                index: index
            };
        });
    },
    words: () => {
        return m.request({method: "GET", url: 'resources/words.js'}).then((words) => {
            let dict = {};
            let index = {};
            words.forEach((word) => {
                addPhrase(index, word);
                dict[word.word] = word;
            });
            return {
                dict: dict,
                index: index
            };
        });
    }
};
