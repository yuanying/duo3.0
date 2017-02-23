import m from 'mithril';

var renderLangButton = function(ctrl) {
    var classNames = "glyphicon glyphicon-bullhorn";
    var url = "/en";
    if (ctrl.lang() == 'ja') {
        classNames = "lb-icon lb-flag-japan"
        url = "/none"
    } else if (ctrl.lang() == 'en') {
        classNames = "lb-icon lb-flag-us"
        url = "/ja"
    }
    if (ctrl.id() != "") {
        url = `${url}/phrase/${ctrl.id()}`
    }
    return m('span.lang', m('a', {
        class: classNames,
        href: url,
        config: m.route
    }));
}

const NavBar = {
    controller: (args) => {
        return {
            lang: args.lang,
            id: args.phrase,
            duo: args.duo()
        };
    },
    view: (ctrl, args) => {
        return m("nav.duo-nav", m(".container", [
            m('span.home', m('a', {
                href: `/${ctrl.lang()}`,
                config: m.route
            }, args.title)),
            renderLangButton(ctrl),
        ]));
    }
}

export default NavBar;
