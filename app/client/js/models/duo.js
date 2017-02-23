import m from 'mithril';

var addSection = function(sections, phrase) {
    let lastSection = sections[sections.length - 1];
    if (!lastSection) {
    }
    if (!lastSection || lastSection.name != phrase.section) {
        lastSection = {
            name: phrase.section,
            phrases: []
        }
        sections.push(lastSection);
    }
    lastSection.phrases.push(phrase);
};

export default {
  data: () => {
    return m.request({method: "GET", url: 'resources/index.js'}).then((list) => {
        let sections = [];
        let index = {};
        let previous = null;

        list.forEach((value) => {
            addSection(sections, value);
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
  }
};
