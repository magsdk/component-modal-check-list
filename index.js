/**
 * @license The MIT License (MIT)
 * @copyright Fedotov <bas.jsdev@gmail.com>
 */

/* eslint no-path-concat: 0 */

'use strict';


var Modal     = require('mag-component-modal'),
    CheckList = require('mag-component-check-list'),
    dom       = require('spa-dom'),
    List      = require('mag-component-list'),
    CheckBox  = require('spa-component-checkbox');


/**
 * Modal window implementation.
 *
 * @constructor
 * @extends Modal
 *
 * @param {Object} [config={}] init parameters (all inherited from the parent)
 * @param {Object} [config.title] message title
 * @param {Object} [config.className] message classname
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
    config.list.render = config.list.render || renderItem;
    config.list.events = config.list.events || {};
    config.children = config.children || [];

    this.label = {};
    if ( config.labelIcon ) {
        this.label.$icon = dom.tag('div', {className: 'theme-icon ' + config.labelIcon});
    }
    this.label.$text = dom.tag('div');
    this.label.$count = dom.tag('div', {className: 'amountWrapper'},
        dom.tag('div', {className: 'theme-item-count'},
            dom.tag('div', {className: 'amount'})
        )
    );
    this.label.$count.style.visibility = 'hidden';
    this.label.$end = dom.tag('div', {className: 'theme-icon-more theme-item-more-box'});
    // set title to left panel item
    if ( config.list.data && config.list.data.length && config.list.data[0].title ) {
        this.label.$text.innerText = config.list.data[0].title;
    }

    this.list = new CheckList(config.list);

    this.list.setData = function ( config ) {
        List.prototype.setData.call(self.list, config);
        if ( self.$titleCount ) {
            self.$titleCount.innerText = config.data.length ? config.data.length - 1 : 0;
        }
    };
    config.children.push(this.list);


    // parent constructor call
    Modal.call(this, config);

    self.$header.appendChild(dom.tag('div', {className: 'amountWrapper'},
        dom.tag('div', {className: 'theme-item-count'},
            self.$titleCount = dom.tag('div', {className: 'amount'},
                config.list.data.length ? config.list.data.length - 1 : 0
            )
        )
    ));

    // rewrite onclick listener
    this.list.events['click:item'] = undefined;
    this.list.addListener('click:item', function ( event ) {
        var item   = event.$item,
            marked = [],
            data   = self.list.data || [];

        item.checkBox.set(!item.checkBox.value);
        item.state = item.checkBox.value;
        data[item.index].state = item.checkBox.value;

        // go through list to collect selected items
        for ( var i = 0; i < data.length; i++ ) {
            //console.log('i: ' + i + ' ?: ' + data[i].state);
            if ( data[i].state ) {
                marked.push(data[i]);
            }
        }

        if (
            !marked.length || // if none set "All" as selected
            marked.indexOf(data[0]) !== -1 && marked.length > 1 && item.index === 0 || // if "All" was set (reset others)
            marked.indexOf(data[0]) === -1 && marked.length === data.length - 1  // if all except "All"  was selected
        ) {
            //console.log('case 1 : set to "all"');
            for ( i = 0; i < data.length; i++ ) {
                data[i].state = i === 0; // mark only first
            }
            this.setData({data: data, focusIndex: this.$focusItem.index});
            self.label.$text.innerText = data[0].title;
            self.label.$icon.classList.remove('active');
            self.label.$count.style.visibility = 'hidden';
            return;
        }
        //  if "All" item selected (set to "all" and remove from others)
        if ( marked.indexOf(data[0]) !== -1 && marked.length > 1 && item.index !== 0 ) {
            //console.log('case 2 : set to not "all"');
            data[0].state = false;
            this.setData({data: data, focusIndex: this.$focusItem.index});
            self.label.$count.style.visibility = 'inherit';
            self.label.$count.firstChild.firstChild.innerText = marked.length - 1;
            self.label.$text.innerText = marked[1].title + (marked[2] ? ', ' + marked[2].title : '');
            self.label.$icon.classList.add('active');
            return;
        }
        if ( marked.length ) {
            //console.log('case 3 : set');
            self.label.$count.style.visibility = 'inherit';
            self.label.$count.firstChild.firstChild.innerText = marked.length;
            self.label.$text.innerText = marked[0].title + (marked[1] ? ', ' + marked[1].title : '');
            self.label.$icon.classList.add('active');
        }
    });

    function renderItem ( $item, data ) {
        var table   = document.createElement('table'),
            tr      = document.createElement('tr'),
            td      = document.createElement('td'),
            wrapper = document.createElement('div'),
            check   = new CheckBox({
                value: data.state || false
            });

        if ( this.data[0] === $item.data ) {  // set underline for first item
            wrapper.classList.add('theme-header');
        }

        $item.innerHTML = '';

        table.appendChild(tr);

        td.appendChild(check.$node);
        td.className = 'checkBoxWrapper';
        tr.appendChild(td);

        td = document.createElement('td');
        td.className = 'title';
        td.innerText = data.title || '';
        tr.appendChild(td);

        $item.checkBox = check;
        $item.state = check.value;
        $item.value = data.value;

        wrapper.appendChild(table);
        $item.appendChild(wrapper);
    }
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
    elements.push(this.label.$end);


    return elements;
};


// public
module.exports = ModalCheckList;
