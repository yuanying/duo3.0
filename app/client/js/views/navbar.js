import m from 'mithril';

var renderRightControl = function(ctrl) {
    return m('.control', [
        renderFavButton(ctrl),
        renderLangButton(ctrl),
    ]);
}

var renderFavButton = function(ctrl) {
    if (ctrl.id() == '') {
        return '';
    }
    var classNames = "glyphicon glyphicon-star-empty";
    var url = "#";

    return m('span.fav', m('a', {
        class: classNames,
        href: url
    }));
}

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
            renderRightControl(ctrl),
        ]));
    }
}

export default NavBar;
