/**
 * @license The MIT License (MIT)
 * @copyright Dmitry Fedotov <bas.jsdev@gmail.com>
 */


'use strict';


var Modal     = require('mag-component-modal'),
    List      = require('mag-component-list'),
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
 * @param {Object} [config.title] message title
 * @param {Object} [config.className] message class name
 * @param {Object} [config.icon] icon at header
 * @param {Object} [config.visible] visibility flag
 * @param {Object} [config.children] content (inherited from the parent)
 * @param {Object} [config.list] all init parameters for mag-component-check-list constructor
 * @param {Object} [config.labelIcon] left panel list item icon
 *
 * @example
 * var modalCheckList = new ModalCheckList({
 *     title: 'sort',
 *     events: {
 *         hide: function () {
 *             page.panelSet.focus();
 *         }
 *     },
 *     labelIcon: 'theme-icon-filter',
 *     list: {
 *         size: 2,
 *         data: [
 *             {state: true, title: 'All content', value: 1},
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
    var self = this;

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

    this.label = {};
    if ( config.labelIcon ) {
        this.label.$icon = dom.tag('div', {className: 'theme-icon ' + config.labelIcon});
    }
    this.label.$text = dom.tag('div', {className: 'leftListItemText'});
    this.label.$count = dom.tag('div', {className: 'theme-icon'},
        dom.tag('div', {className: 'theme-counter'},
            dom.tag('div')
        )
    );
    this.label.$count.style.visibility = 'hidden';
    // set title to left panel item
    if ( config.list.data && config.list.data.length && config.list.data[0].title ) {
        this.label.$text.innerText = config.list.data[0].title;
    }

    this.scroll = new Scroll({});
    config.list.scroll = this.scroll;

    this.list = new CheckList(config.list);

    this.list.setData = function ( config ) {
        List.prototype.setData.call(self.list, config);
        if ( self.$titleCount ) {
            self.$titleCount.innerText = config.data.length ? config.data.length - 1 : 0;
        }
    };
    config.children.push(this.list);
    config.children.push(this.scroll);


    // parent constructor call
    Modal.call(this, config);

    self.$header.appendChild(dom.tag('div', {className: 'theme-icon'},
        dom.tag('div', {className: 'theme-counter'},
            self.$titleCount = dom.tag('div', {},
                config.list.data.length ? config.list.data.length - 1 : 0
            )
        )
    ));

    if ( config.list.data && config.list.data.length ) {
        this.scroll.show();
        this.scroll.init({realSize: config.list.data.length, viewSize: config.list.size || 5});
    } else {
        this.scroll.hide();
    }

    // rewrite onclick listener
    this.list.events['click:item'] = undefined;
    this.list.addListener('click:item', function ( event ) {
        var item   = event.$item,
            marked = [],
            data   = self.list.data || [],
            count, i;

        item.checkBox.set(!item.checkBox.value);
        item.state = item.checkBox.value;
        data[item.index].state = item.checkBox.value;

        // go through list to collect selected items
        for ( i = 0; i < data.length; i++ ) {
            if ( data[i].state ) {
                marked.push(data[i]);
            }
        }

        if (
            !marked.length || // if none set "All cats" as selected
            marked.indexOf(data[0]) !== -1 && marked.length > 1 && item.index === 0 || // if "All cats" was set (reset others)
            marked.indexOf(data[0]) === -1 && marked.length === data.length - 1  // if all except "All" was selected
        ) {
            for ( i = 0; i < data.length; i++ ) {
                data[i].state = i === 0; // mark only first
            }
            this.setData({data: data, focusIndex: this.$focusItem.index});
            self.label.$icon.classList.remove('active');
            self.label.$text.innerText = data[0].title;
            self.label.$count.style.visibility = 'hidden';

            return;
        }
        //  if "All cats" item selected (set "selected" to "all cats" and remove from others)
        if ( marked.indexOf(data[0]) !== -1 && marked.length > 1 && item.index !== 0 ) {
            data[0].state = false;
            this.setData({data: data, focusIndex: this.$focusItem.index});
            self.label.$icon.classList.add('active');
            self.label.$text.innerText = marked[1].title;
            self.label.$count.style.visibility = 'hidden';

            return;
        }
        // some normal items were selected or unselected
        if ( marked.length ) {
            if ( marked.length > 1 ) {
                self.label.$text.innerText = marked[0].title + ', ' + marked[1].title;
                count = marked.length - 2;

                // If $text element was overflowed because of too long titles remove one title from $text and increment count.
                if ( self.label.$text.scrollWidth > self.label.$text.clientWidth ) {
                    self.label.$text.innerText = marked[0].title;
                    count = marked.length - 1;
                }

                if ( count ) {
                    self.label.$count.style.visibility = 'inherit';
                    self.label.$count.firstChild.firstChild.innerText = '+' + count;
                } else {
                    self.label.$count.style.visibility = 'hidden';
                }
            } else {
                self.label.$text.innerText = marked[0].title;
                self.label.$count.style.visibility = 'hidden';
            }
            self.label.$icon.classList.add('active');
        }
    });
}


// inheritance
ModalCheckList.prototype = Object.create(Modal.prototype);
ModalCheckList.prototype.constructor = ModalCheckList;

// set component name
ModalCheckList.prototype.name = 'mag-component-modal mag-component-modal-check-list';

/**
 * Get list of dom elements for use in right panel list
 * @return {Array} elements prepared for right panel layout list
 */
ModalCheckList.prototype.getListItem = function () {
    var elements = [];

    if ( this.label.$icon ) {
        elements.push(this.label.$icon);
    }

    elements.push(this.label.$text);
    elements.push(this.label.$count);

    return elements;
};


// public
module.exports = ModalCheckList;
