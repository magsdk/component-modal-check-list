Modal component
===============

[![build status](https://img.shields.io/travis/magsdk/component-modal.svg?style=flat-square)](https://travis-ci.org/magsdk/component-modal)
[![npm version](https://img.shields.io/npm/v/mag-component-modal.svg?style=flat-square)](https://www.npmjs.com/package/mag-component-modal)
[![dependencies status](https://img.shields.io/david/magsdk/component-modal.svg?style=flat-square)](https://david-dm.org/magsdk/component-modal)
[![devDependencies status](https://img.shields.io/david/dev/magsdk/component-modal.svg?style=flat-square)](https://david-dm.org/magsdk/component-modal?type=dev)
[![Gitter](https://img.shields.io/badge/gitter-join%20chat-blue.svg?style=flat-square)](https://gitter.im/DarkPark/magsdk)


Modal is a component to build user interface, an instance of [Component](https://github.com/stbsdk/component) module.


## Installation ##

```bash
npm install mag-component-modal
```


## Usage ##

Add component to the scope:

```js
var Modal = require('mag-component-modal');
```

Create instance with custom config:

```js
page.modal = new Modal({
    title: 'My Title',
    icon: 'star',
    children: [new Button({value: 'Create'})]
});
```

Add component to the page and show it:

```js
page.add(page.modal);
page.modal.show();
```


## Development mode ##

> There is a global var `DEVELOP` which activates additional consistency checks and protection logic not available in release mode.


## Contribution ##

If you have any problem or suggestion please open an issue [here](https://github.com/magsdk/component-modal/issues).
Pull requests are welcomed with respect to the [JavaScript Code Style](https://github.com/DarkPark/jscs).


## License ##

`mag-component-modal` is released under the [MIT License](license.md).
