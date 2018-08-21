Modal check list component
==========================

[![build status](https://img.shields.io/travis/magsdk/component-modal-check-list.svg?style=flat-square)](https://travis-ci.org/magsdk/component-modal-check-list)
[![npm version](https://img.shields.io/npm/v/mag-component-modal-check-list.svg?style=flat-square)](https://www.npmjs.com/package/mag-component-modal-check-list)
[![dependencies status](https://img.shields.io/david/magsdk/component-modal-check-list.svg?style=flat-square)](https://david-dm.org/magsdk/component-modal-check-list)
[![devDependencies status](https://img.shields.io/david/dev/magsdk/component-modal-check-list.svg?style=flat-square)](https://david-dm.org/magsdk/component-modal-check-list?type=dev)
[![Gitter](https://img.shields.io/badge/gitter-join%20chat-blue.svg?style=flat-square)](https://gitter.im/DarkPark/magsdk)


Modal check list is a component to build user interface, an instance of [Component](https://github.com/stbsdk/component) module.
It is based on [mag-component-modal](https://github.com/magsdk/component-modal) and [mag-component-check-list](https://github.com/magsdk/component-check-list).


## Installation ##

```bash
npm install mag-component-modal-check-list
```


## Usage ##

Add component to the scope:

```js
var ModalCheckList = require('mag-component-modal-check-list');
```

The component config besides `mag-component-modal` contans `mag-component-check-list` config in property `list`.
This property `list` may contain one unique item. When unique item is checked, all other items will be unchecked. When another item is checked, unique item will be unchecked.

Create instance with custom config:

```js
var modalCheckList = new ModalCheckList({
    // mag-component-modal config
    title: 'sort',
    titleCounter: false,
    className: 'sort',
    events: {
        show: function () {
            this.focus();
        },
        'checked:change': function ( event ) {
            console.log(event);            
        }
    },
    // mag-component-check-list config
    list: {
        size: 2,
        data: [
            // unique item
            {state: true, title: 'All content', value: 1, unique: true},
            {state: false, title: 'Music', value: 2},
            {state: false, title: 'Video', value: 3}
        ]
    }
});

page.add(modalCheckList);
```

To work with `mag-component-check-list` properties:

```js
modalCheckList.list;
```

To change item state:

```js
modalCheckList.list.changeState($domItem);
```

To uncheck all items:

```js
modalCheckList.clearChecked(newFocusPosition);
```

To get all checked items data:

```js
console.log(modalCheckList.checkedData);
```

## Development mode ##

> There is a global var `DEVELOP` which activates additional consistency checks and protection logic not available in release mode.


## Contribution ##

If you have any problems or suggestions please open an [issue](https://github.com/magsdk/component-modal-check-list/issues)
according to the contribution [rules](.github/contributing.md).


## License ##

`mag-component-modal-check-list` is released under the [MIT License](license.md).
