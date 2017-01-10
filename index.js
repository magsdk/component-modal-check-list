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
 *
 * @example
 * var modalCheckList = new ModalCheckList({
 *     title: 'sort',
 *     events: {
 *         hide: function () {
 *             page.panelSet.focus();
 *         }
 *     },
 *     labels:{
 *         icon:a,
 *         text:b,
 *         count:c
 *     },
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
 */


function ModalCheckList ( config ) {
    var self = this;

    // sanitize
    config = config || {};
    config.list = config.list || {};
    config.list.render = config.list.render || renderItem;
    config.list.events = config.list.events || {};
    config.children = config.children || [];
    config.labels = config.labels || {};

    if ( DEVELOP ) {
//        if ( typeof config !== 'object' ) {
//            throw new Error(__filename + ': wrong config type');
//        }
//        // init parameters checks
//        if ( config.icon && typeof config.icon !== 'string' ) {
//            throw new Error(__filename + ': wrong or empty config.icon');
//        }
//        if ( config.title && typeof config.title !== 'string' ) {
//            throw new Error(__filename + ': wrong or empty config.title');
//        }
//        if ( 'className' in config && (!config.className || typeof config.className !== 'string') ) {
//            throw new Error(__filename + ': wrong or empty config.className');
//        }
//        if ( config.$body ) {
//            throw new Error(__filename + ': config.$body should not be provided in Modal manually');
//        }
    }

    this.labels = {
        icon: config.labels.icon,
        text: config.labels.text,
        count: config.labels.count
    };

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

    self.$header.appendChild(
        dom.tag('div', {className: 'amountWrapper'},
            dom.tag('div', {className: 'theme-item-count'},
                self.$titleCount = dom.tag('div', {className: 'amount'},
                    config.list.data.length ? config.list.data.length - 1 : 0
                )
            )
        )
    );

    // TODO: checked by default
    this.labels.count.classList.add('amountWrapper');
    this.labels.count.appendChild(dom.tag('div', {className: 'theme-item-count'}, dom.tag('div', {className: 'amount'})));
    this.labels.count.style.visibility = 'hidden';

    // rewrite onclick listener
    this.list.events['click:item'] = undefined;
    this.list.addListener('click:item', function ( event ) {
        var item   = event.$item,
            marked = [],
            data   = self.list.data,
            title, count, i;

        item.checkBox.set(!item.checkBox.value);
        item.state = item.checkBox.value;
        data[item.index].state = item.checkBox.value;

        // go through list to collect selected items
        for ( i = 0; i < data.length; i++ ) {
            console.log('i: ' + i + ' ?: ' + data[i].state);
            if ( data[i].state ) {
                marked.push(data[i]);
            }
        }

        if (
            !marked.length || // if none set "All" as selected
            marked.indexOf(data[0]) !== -1 && marked.length > 1 && item.index === 0 || // if "All" was set (reset others)
            marked.indexOf(data[0]) === -1 && marked.length === data.length - 1  // if all except "All"  was selected
        ) {
            console.log('case 1 : set to "all"');
            for ( i = 0; i < data.length; i++ ) {
                data[i].state = i === 0; // mark only first
            }
            this.setData({data: data, focusIndex: this.$focusItem.index});
            self.labels.text.innerText = data[0].title;
            self.labels.icon.classList.remove('active');
            self.labels.count.firstChild.firstChild.innerText = 0;
            self.labels.count.style.visibility = 'hidden';
            return;
        }
        //  if "All" item selected (set to "all" and remove from others)
        if ( marked.indexOf(data[0]) !== -1 && marked.length > 1 && item.index !== 0 ) {
            console.log('case 2 : set to not "all"');
            data[0].state = false;
            this.setData({data: data, focusIndex: this.$focusItem.index});
            self.labels.count.style.visibility = 'inherit';
            self.labels.count.firstChild.firstChild.innerText = marked.length - 1;
            self.labels.text.innerText = marked[1].title + (marked[2] ? ', ' + marked[2].title : '');
            self.labels.icon.classList.add('active');
            return;
        }
        if ( marked.length ) {
            console.log('case 3 : set');
            self.labels.count.style.visibility = 'inherit';
            self.labels.count.firstChild.firstChild.innerText = marked.length;
            self.labels.text.innerText = marked[0].title + (marked[1] ? ', ' + marked[1].title : '');
            self.labels.icon.classList.add('active');
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


// public
module.exports = ModalCheckList;
