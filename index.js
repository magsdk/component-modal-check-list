/**
 * @license The MIT License (MIT)
 * @copyright Dmitry Fedotov <bas.jsdev@gmail.com>
 */

/* eslint no-path-concat: 0 */

'use strict';


var Modal     = require('mag-component-modal'),
    CheckList = require('mag-component-check-list'),
    Scroll    = require('stb-component-scrollbar'),
    dom       = require('spa-dom');


/**
 * Modal window implementation.
 *
 * @constructor
 * @extends Modal
 *
 * @param {Object} [config={}] init parameters (all inherited from the parent)
 * @param {String} [config.title] message title
 * @param {boolean} [config.titleCounter] counter in title
 * @param {String} [config.className] message class name
 * @param {String} [config.icon] icon at header
 * @param {boolean} [config.visible] visibility flag
 * @param {Array} [config.children] content (inherited from the parent)
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
 *             {state: true, title: 'All content', value: 1, unique: true},
 *             {state: false, title: 'Music', value: 2},
 *             {state: false, title: 'Video', value: 3}
 *         ]
 *     }
 * });
 *
 * page.add(modalCheckList);
 *
 * leftPanel.add(leftPanelList = new LayoutList({
 *     size: 6,
 *     data: [
 *         {
 *             items: page.modalCheckList.getListItem(),
 *             click: function () {
 *                 panelSet.blur();
 *                 modalCheckList.show();
 *             }
 *         }
 *     ]
 * }));
 *
 */


function ModalCheckList ( config ) {
    var self = this,
        index, listClickEvents;

    if ( DEVELOP ) {
        if ( typeof config !== 'object' ) {
            throw new Error(__filename + ': wrong config type');
        }
        if ( !config.list ) {
            throw new Error(__filename + ': wrong or empty mag-component-check-list component config config.list');
        }
    }

    // sanitize
    config = config || {};
    config.list = config.list || {};
    config.list.events = config.list.events || {};
    config.children = config.children || [];

    this.scroll = new Scroll({});
    config.list.scroll = this.scroll;

    this.list = new CheckList(config.list);

    for ( index = 0; index < this.list.data.length; index++ ) {
        if ( this.list.data[index].unique ) {
            this.uniqueItem = {
                data: this.list.data[index],
                index: index
            };

            break;
        }
    }

    if ( this.uniqueItem && this.uniqueItem.data.state && this.list.checkedData.length > 1 ) {
        this.list.clearChecked();
        if ( this.uniqueItem.index < this.list.$node.children.length + this.list.viewIndex && this.uniqueItem.index < this.list.viewIndex ) {
            this.list.changeState(this.list.$node.children[this.uniqueItem.index - this.list.viewIndex]);
        } else {
            this.uniqueItem.data.state = true;
            this.list.checkedData.push(this.uniqueItem.data);
        }
    }

    this.checkedData = this.list.checkedData;

    config.children.push(this.list);
    config.children.push(this.scroll);


    // parent constructor call
    Modal.call(this, config);

    if ( config.titleCounter ) {
        this.$header.appendChild(
            dom.tag('div', {className: 'theme-icon'},
                dom.tag('div', {className: 'theme-counter'},
                    self.$titleCount = dom.tag('div', {},
                        this.list.data.length && self.uniqueItem ?  this.list.data.length - 1 :  this.list.data.length
                    )
                )
            )
        );

        this.list.setData = function ( data ) {
            CheckList.prototype.setData.call(self.list, data);
            self.$titleCount.innerText = data.data.length && self.uniqueItem ? data.data.length - 1 : data.data.length;
        };
    }

    if ( config.list.data && config.list.data.length ) {
        this.scroll.show();
        this.scroll.init({realSize: config.list.data.length, viewSize: config.list.size || 5});
    } else {
        this.scroll.hide();
    }

    this.addListener('focus',
        /**
        * @this ModalCheckList
        */
        function () {
            this.list.focus();
        });

    listClickEvents = this.list.events['click:item'] || [];
    this.list.events['click:item'] = [];
    this.list.addListener('click:item',
        /**
         * @param {Object} event click event
         *
         * @this ModalCheckList.list
         */
        function ( event ) {
            var $item   = event.$item,
                data = $item.data;

            if ( self.uniqueItem ) {
                if ( data.unique && !data.state ) {
                    this.changeState($item);

                    return;
                }

                if ( data.unique ) {
                    this.clearChecked();
                    this.changeState($item);
                } else {
                    if ( self.uniqueItem.data.state ) {
                        index = self.uniqueItem.index - this.viewIndex;
                        if ( index < this.$node.children.length && index >= 0 ) {
                            this.changeState(this.$node.children[index]);
                        } else {
                            self.uniqueItem.data.state = false;
                            index = this.checkedData.indexOf(self.uniqueItem.data);
                            if ( index !== -1 ) {
                                this.checkedData.splice(index, 1);
                            }
                        }
                    }

                    if ( this.checkedData.length === this.data.length - 1 ) {
                        this.clearChecked();
                        index = self.uniqueItem.index - this.viewIndex;
                        if ( index < this.$node.children.length && index > 0 ) {
                            this.changeState(this.$node.children[index]);
                        } else {
                            self.uniqueItem.data.state = true;
                            this.checkedData.push(self.uniqueItem.data);
                        }
                    }
                }
            }

            for ( index = 0; index < listClickEvents.length; index++ ) {
                listClickEvents[index].call(this, event);
            }

            self.checkedData = this.checkedData;

            self.emit('checked:change', {checkedData: this.checkedData});
        });
}


// inheritance
ModalCheckList.prototype = Object.create(Modal.prototype);
ModalCheckList.prototype.constructor = ModalCheckList;

// set component name
ModalCheckList.prototype.name = 'mag-component-modal mag-component-modal-check-list';


/**
 * Reset data to default state and render inner structures and HTML.
 */
ModalCheckList.prototype.resetData = function () {
    this.list.resetData();

    if ( this.uniqueItem && this.uniqueItem.data.state && this.list.checkedData.length > 1 ) {
        this.list.clearChecked();
        if ( this.uniqueItem.index < this.list.$node.children.length + this.list.viewIndex && this.uniqueItem.index < this.list.viewIndex ) {
            this.list.changeState(this.list.$node.children[this.uniqueItem.index - this.list.viewIndex]);
        } else {
            this.uniqueItem.data.state = true;
            this.list.checkedData.push(this.uniqueItem.data);
        }
    }

    this.checkedData = this.list.checkedData;
    this.emit('checked:change', {checkedData: this.checkedData});
};


/**
 * Set all states to false and render inner structures and HTML.
 *
 * @param {number} focusIndex focus index
 */
ModalCheckList.prototype.clearChecked = function ( focusIndex ) {
    var state = this.uniqueItem && this.uniqueItem.data.defaultState;

    this.list.clearChecked(focusIndex);

    if ( state ) {
        this.uniqueItem.data.defaultState = state;
        if ( this.uniqueItem.index < this.list.$node.children.length + this.list.viewIndex && this.uniqueItem.index >= this.list.viewIndex ) {
            this.list.changeState(this.list.$node.children[this.uniqueItem.index - this.list.viewIndex]);
        } else {
            this.uniqueItem.data.state = true;
            this.list.checkedData.push(this.uniqueItem.data);
        }
    }

    this.checkedData = this.list.checkedData;
    this.emit('checked:change', {checkedData: this.checkedData});
};


// public
module.exports = ModalCheckList;
