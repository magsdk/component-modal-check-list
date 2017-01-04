/**
 * @license The MIT License (MIT)
 * @copyright Fedotov <bas.jsdev@gmail.com>
 */

/* eslint no-path-concat: 0 */

'use strict';


var StbComponentModal = require('mag-component-modal'),
    CheckList         = require('mag-component-check-list'),
    Component         = require('stb-component');


/**
 * Modal window implementation.
 *
 * @constructor
 * @extends StbComponentModal
 *
 * @param {Object} [config={}] init parameters (all inherited from the parent)
 * @param {Object} [config.title] message title
 * @param {Object} [config.className] message classname
 * @param {Object} [config.icon] icon at header
 * @param {Object} [config.visible] visibility flag
 * @param {Object} [config.children] content (inherited from the parent)
 * @param {Object} [config.list] all init parameters for mag-component-check-list constructor
 *
 * @example
 * var modalCheckList = new ModalCheckList({
 *     title: 'sort',
 *     events: {
 *         hide: function () {
 *             page.panelSet.focus();
 *         }
 *     },
 *     list: {
 *         size: 2,
 *         data: [
 *             {state: true, title: 'Video', value: 1},
 *             {state: false, title: 'Music', value: 2}
 *         ]
 *     }
 * });
 * page.add(modalCheckList);
 */


function Modal ( config ) {
    var $overlay, $body,
        self = this;

    // sanitize
    config = config || {};
    config.events = config.events || {};

    if ( DEVELOP ) {
        if ( typeof config !== 'object' ) {
            throw new Error(__filename + ': wrong config type');
        }
        // init parameters checks
        if ( config.icon && typeof config.icon !== 'string' ) {
            throw new Error(__filename + ': wrong or empty config.icon');
        }
        if ( config.title && typeof config.title !== 'string' ) {
            throw new Error(__filename + ': wrong or empty config.title');
        }
        if ( 'className' in config && (!config.className || typeof config.className !== 'string') ) {
            throw new Error(__filename + ': wrong or empty config.className');
        }
        if ( config.$body ) {
            throw new Error(__filename + ': config.$body should not be provided in Modal manually');
        }
    }

    // usually can't accept focus
    config.focusable = config.focusable || false;
    // hide by default
    config.visible = config.visible || false;
    // add default close by click
    config.events.click = config.events.click || function () { self.hide(); };

    // parent constructor call
    StbComponentModal.call(this, config);

    // add table-cell wrappers
    this.$node.appendChild(document.createElement('div'));
    this.$node.firstChild.classList.add('alignBox');
    this.$node.firstChild.appendChild(document.createElement('div'));

    // add header div
    this.$header = document.createElement('div');
    this.$header.className = 'header';

    // insert caption placeholder
    this.$text = this.$header.appendChild(document.createElement('div'));
    this.$text.classList.add('text');
    this.$text.innerText = config.title || '';

    // optional icon
    if ( config.icon ) {
        this.$icon = this.$header.appendChild(document.createElement('div'));
        this.$icon.className = 'icon ' + config.icon;
    }

    $overlay = document.createElement('div');
    $overlay.className = 'overlay';

    // add to dom
    $body = this.$body.parentNode.removeChild(this.$body); // add body wrapper
    this.$node.firstChild.firstChild.appendChild(this.$header);
    this.$node.firstChild.firstChild.appendChild($body);
    this.$node.firstChild.firstChild.appendChild($overlay);
}


// inheritance
Modal.prototype = Object.create(StbComponentModal.prototype);
Modal.prototype.constructor = Modal;

// set component name
Modal.prototype.name = 'mag-component-modal';


/**
 * Redefine default component focus to set additional css
 */
Modal.prototype.focus = function () {
    this.$node.classList.add('active');
    StbComponentModal.prototype.focus.call(this);
    if ( this.children[0] && this.children[0] instanceof Component ) {
        this.children[0].focus();
    }
};


/**
 * Blur message
 */
Modal.prototype.blur = function () {
    this.$node.classList.remove('active');
    StbComponentModal.prototype.blur.call(this);
};


// public
module.exports = Modal;
