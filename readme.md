Modal component
===============

[![build status](https://img.shields.io/travis/magsdk/component-modal-check-list.svg?style=flat-square)](https://travis-ci.org/magsdk/component-modal-check-list)
[![npm version](https://img.shields.io/npm/v/mag-component-modal-check-list.svg?style=flat-square)](https://www.npmjs.com/package/mag-component-modal-check-list)
[![dependencies status](https://img.shields.io/david/magsdk/component-modal-check-list.svg?style=flat-square)](https://david-dm.org/magsdk/component-modal-check-list)
[![devDependencies status](https://img.shields.io/david/dev/magsdk/component-modal-check-list.svg?style=flat-square)](https://david-dm.org/magsdk/component-modal-check-list?type=dev)
[![Gitter](https://img.shields.io/badge/gitter-join%20chat-blue.svg?style=flat-square)](https://gitter.im/DarkPark/magsdk)


Modal check list is a component to build user interface, an instance of [Component](https://github.com/stbsdk/component) module.


## Installation ##

```bash
npm install mag-component-modal-check-list
```


## Usage ##

Add component to the scope:

```js
var ModalCheckList = require('mag-component-modal-check-list');
```

Create instance with custom config:

```js
var modalCheckList = new ModalCheckList({
    title: 'sort',
    events: {
        hide: function () {
            page.panelSet.focus();
        }
    },
    labelIcon: 'theme-icon-filter',
    list: {
        size: 2,
        data: [
            {state: true, title: 'All content', value: 1},
            {state: false, title: 'Music', value: 2},
            {state: false, title: 'Video', value: 3}
        ]
    }
});
page.add(modalCheckList);

leftPanel.add(leftPanelList = new LayoutList({
    size: 6,
    data: [
        {
            items: page.modalCheckList.getListItem(),
            click: function () {
                panelSet.blur();
                modalCheckList.show();
            }
        }
    ]
}));
```

Add component to the page and show it:

```js
page.add(page.modal);
page.modal.show();
```


## Development mode ##

> There is a global var `DEVELOP` which activates additional consistency checks and protection logic not available in release mode.


## Contribution ##

If you have any problem or suggestion please open an issue [here](https://github.com/magsdk/component-modal-check-list/issues).
Pull requests are welcomed with respect to the [JavaScript Code Style](https://github.com/DarkPark/jscs).


## License ##

`mag-component-modal-check-list` is released under the [MIT License](license.md).
