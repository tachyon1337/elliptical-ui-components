Elliptical(function () {
    $.element("ui.navigation","ui-navigation", $.ui.drawer, {

        /**
         * shortcut method to create a touch navigation
         * @param element {Object}
         * @param dataClass {String}
         * @private
         */
        _createTouchNavigation: function (element, dataClass) {
            this._data.set('input',null);
            this._data.set('touchInput',null);
            this._createDrawer(element, dataClass);
            this._createTouchMenu(element);
        },

        /**
         * remove touch navigation
         * @param element
         * @private
         */
        _removeTouchNavigation: function (element) {
            //unbind touch search
            var touchInput=this._data.get('touchInput');
            if (touchInput) {
                this._unbindSearch(touchInput);
            }
            //remove drawer
            this._removeDrawer();
            //reset element
            this.element.css({
                position: ''
            });
            this._data.set('navLocked',false);
        },

        /**
         *  create a touch drawer menu from element desktop navigation widget
         * @param element {Object}
         * @private
         */
        _createTouchMenu: function (element) {
            //prevent multiple menus
            if(this._data.get('navLocked')){
                return;
            }
            this._data.set('navLocked',true);


            //var __customElements=this.options.$customElements;

            //get the drawer
            var drawer = this._data.get('drawer');

            //get the drawer
            var drawerSection = this._data.get('drawerSection');
            if(!drawerSection){
                return;
            }

            //get the drawer header
            var drawerHeader = this._data.get('drawerHeader');

            //create the drawer menu element
            var drawerMenu = $('<touch-ui-menu></touch-ui-menu>');

            //add home menu item at the top
            if (this.options.includeHome) {
                drawerMenu.append(this._methods.createHomeListItem(this.options.homeUrl, this.options.homeIcon));

            }

            if(this.options.touchMenu !==undefined && this.options.touchMenu===false){
                //append menu to drawer
                drawerSection.append(drawerMenu);
                //save ref to menu
                this._data.set('drawerMenu',drawerMenu);
                return;
            }

            var menu=this._getMenu(element);

            //clone it
            var clone = menu.clone();

            //extract items from clone
            var items=this._extractMenuItems(clone);


            /* unwrap button dropdowns */
            items.find('ui-button-dropdown').contents().unwrap();


            //touchify the ui-dropdowns
            this._methods.touchifyUIDropdowns(items);

            //iconify menu items
            this._methods.iconifyTouchMenuItems(items);

            //append to menu
            drawerMenu.append(items);

            //add any linkable parent node to the child touch dropdown(it is then linkable within the child dropdown)
            drawerMenu = this._methods.addParentNodesToChildDropDowns(drawerMenu, 'ui-dropdown');


            /* ---attach search to drawerHeader----------------*/
            this._appendSearch(drawerMenu,drawerHeader);



            //add any menu items from plugin opts
            var optsItems = this._methods.createMenuItemsFromArray(this.options.model);
            if (optsItems) {
                drawerMenu.append(optsItems);
            }


            //append menu to drawer
            drawerSection.append(drawerMenu);

            //save ref to menu
            this._data.set('drawerMenu',drawerMenu);

        },

        /**
         *
         * @param element
         * @returns {*}
         * @private
         */
        _getMenu:function(element){
            //find DOM element menus
            return element.find('ui-menu').not('[touch-menu="false"]').add(element.find('[role="menu"]'));

        },

        _extractMenuItems:function(clone){
            var excludeMenuItemSelector='[touch-menu-item="false"]';
            var items = clone.children().not(excludeMenuItemSelector);
            return this._methods.filterMenuItems(items);
        },

        _appendSearch:function(drawerMenu,drawerHeader){
            /* first check in cloned menu items */
            var self=this;
            setTimeout(function(){
                var search=self.element.find('[role=search]');
                if(search[0]){
                    var clone=search.clone();
                    drawerHeader.append(clone);
                }
            },1000);

        },

        /**
         * append menu items from a model
         * @private
         */
        _appendMenuModel: function () {
            if (this._mq.touch) {
                var drawerMenu = this._data.get('drawerMenu');
                //add menu items from plugin opts
                var optsLi = this._methods.createMenuItemsFromArray(this.options.model);
                if (optsLi) {
                    drawerMenu.append(optsLi);
                }
            }
        },

        /**
         *
         * @param model {Array}
         * @private
         */
        _addMenuModel:function(model){
            var drawerMenu = $('touch-ui-menu');
            var items = this._methods.createMenuItemsFromArray(model);
            drawerMenu.append(items);
        },

        /**
         * pass an input to the search handler
         * @returns {*}
         * @private
         */
        _initSearchHandler:function(){
            var searchSelector='ui-search';
            var search_ =this.element.find(searchSelector);
            if(search_[0]){
                /* desktop search box */
                var input=search_.find('input');
                this._data.set('input',input);
                /* setup handler for desktop */
                this._onSearch(input,'desktop');
                return search_;
            }else{
                return null;
            }
        },

        /**
         * pass a touch input to the search handler
         * @param search
         * @param drawerHeader
         * @private
         */
        _initTouchSearchHandler:function(search,drawerHeader){
            /* touch search box */
            var searchClone=search.clone();
            var touchInput = searchClone.find('input');
            if (touchInput[0]) {
                this._data.set('touchInput',touchInput);
                /* append touch search box */
                drawerHeader.append(searchClone);
                /* touch search handler */
                this._onSearch(touchInput,'touch');
            }
        },

        /**
         * search handler mediator
         * @param input {object}
         * @param device {string}
         * @private
         */
        _onSearch: function (input,device) {
            if(device==='desktop'){
                if(this._data.get('searchRegistered')){
                    return false;
                } else{
                    this._data.set('searchRegistered',true);
                    this._onDesktopSearch(input)
                }

            }else{
                if(this._data.get('touchSearchRegistered')){
                    return false;
                } else {
                    this._data.set('touchSearchRegistered',true);
                }
            }
        },

        _onDesktopSearch:function(input){
            var eventTrigger=this._onEventTrigger.bind(this);
            input.on('focus', function () {
                input.on('click', function (event) {
                    if ($(this).hasClass('focused')) {
                        handleEvent(input);
                    } else {
                        input.addClass('focused');
                    }
                });
                input.keypress(function (event) {
                    if (event.which === 13) {
                        handleEvent(input);
                        return true;
                    }
                });
            });
            input.on('blur', function () {
                input.removeClass('focused');
                input.off('click');
            });


            function handleEvent(input){
                var val = input.val();
                var eventData = {
                    value: val
                };
                eventTrigger('search', eventData);
            }
        },

        _onTouchSearch:function(input){
            var eventTrigger=this._onEventTrigger.bind(this);

            input.on('focus', function () {
                input.on('tap', function (event) {
                    if ($(this).hasClass('focused')) {
                        handleEvent(input);
                    } else {
                        input.addClass('focused');
                    }
                });
            });
            input.on('blur', function () {
                input.removeClass('focused');
                input.off('tap');
            });


            function handleEvent(input){
                var val = input.val();
                var eventData = {
                    value: val
                };
                eventTrigger('search', eventData);
            }

        },


        /**
         * get the correct touch-ui-dropdown selector
         * @returns {string}
         * @private
         */
        __dropdownSelector:function(){
            return 'touch-ui-dropdown';
        },

        /**
         * get the correct item dropdown selector
         * @returns {string}
         * @private
         */
        __menuItemSelector:function(){
            return 'menu-item-dropdown';
        },

        /**
         * toggles touch sub-menu
         * @param item {Object}
         * @private
         */
        _touchToggleDropdown:function(item){
            var selector=this.__dropdownSelector();
            var dropdown=item.find(selector);
            if (dropdown.hasClass('show')) {
                item.removeClass('close');
                dropdown.removeClass('show');
            } else {
                item.addClass('close');
                dropdown.addClass('show');
            }
        },

        /**
         * link element triggers location or a dev handled event
         * @param a {object} link element
         * @param handleTouchEvents {Boolean}
         * @private
         */
        _touchMenuItem:function(a,handleTouchEvents){
            var self=this;
            var duration=this.options.transformDuration;
            duration+=100;
            var id = a.attr('data-id');
            var href = a.attr('href');
            var action = a.attr('data-action');
            if (typeof href != 'undefined' && href != '#' && (typeof action === 'undefined' && handleTouchEvents)) {
                /* fire an event for SPA, that the route is being triggered/captured by the navigation element.
                 location is a provider, so app framework should set $.element's location provider to handle the request
                 */
                this.element.trigger('route.cancellation',href);
                /* close the drawer */
                this._hide();
                /* trigger location after the drawer has closed */
                setTimeout(function(){
                    if(typeof href !=='undefined'){
                        //self._location(href);
                    }
                },duration);
            } else {
                var data = {
                    id: id,
                    action: action,
                    mode: 'touch',
                    href:href
                };
                this._onEventTrigger('selected', data);
            }
        },

        /**
         * currentTarget link element triggers submenu toggle or link element location/handled event
         * @param a {Object}
         * @param handleTouchEvents {Boolean}
         * @private
         */
        _touchMenuLink:function(a,handleTouchEvents){
            var href= a.attr('href');
            if(typeof href==='undefined' || href==='#'){
                var item= a.parent('menu-item-dropdown');
                if(item[0]){
                    this._touchToggleDropdown(item);
                }
            }else{
                this._touchMenuItem(a,handleTouchEvents);
            }
        },

        /**
         * reset touch menu--hide dropdown and remove close arrow css
         * @private
         */
        _resetMenu:function(){
            var menu=this._data.get('drawerMenu');
            menu.find('.show').removeClass('show');
            menu.find('.close').removeClass('close');
        },


        _methods: {
            /**
             *
             * @returns {boolean}
             */
            customElements:function(){
                return true;
            },

            /**
             * returns menu item selector
             * @returns {string}
             */
            listItem:function(){
                return 'menu-item';
            },

            /**
             * returns dropdown menu item selector
             * @returns {string}
             */
            dropdownListItem:function(){
                return 'menu-item-dropdown';
            },

            /**
             * returns icon attribute selector
             * @returns {string}
             */
            iconAttribute:function(){
                return 'touch-icon';
            },

            /**
             *
             */
            dropdownElement:function(){
                return '<ui-dropdown></ui-dropdown>';
            },

            /**
             *
             * @param text {String}
             * @returns {*|HTMLElement}
             */
            createSpanItem: function (text) {
                return $('<span>' + text + '</span>');
            },

            /**
             *
             * @param href {String}
             * @param text {String}
             * @returns {*|HTMLElement}
             */
            createCloneListItem: function (href, text) {
                return $('<' + this.listItem() + '<a href="' + href + '">' + text + '</a></' + this.listItem() + '>');
            },

            /**
             * in a menu item dropdown, add the parent node as the first linkable item in the
             * dropdown. This is done to avoid tbe conflict of the parent triggering a dropdown
             * and being url linkable
             * @param menu {Object}
             * @param dropdownClass {String}
             * @returns {Object}
             */
            addParentNodesToChildDropDowns: function (menu, dropdownClass) {
                var li = menu.find(this.dropdownListItem());
                var self = this;
                li.each(function (i, ele) {
                    var a = $(ele).children('a');
                    var href = a.attr('href');
                    if (typeof href != 'undefined' && href != '#') {
                        var text = a.html();
                        var item = self.createCloneListItem(href, text);
                        var ul = $(ele).find('.' + dropdownClass);
                        ul.prepend(item);
                        var spanItem = self.createSpanItem(text);
                        a.replaceWith(spanItem);
                    }
                });

                return menu;
            },

            /**
             *
             * @param arr {Array}
             * //@param dropdownClass {String}
             * @returns {Array}
             */
            createMenuItemsFromArray: function (arr) {
                if (arr.length === 0) {
                    return null;
                }
                var itemArray = [];
                var a, item;
                for (var i = 0; i < arr.length; i++) {

                    if (arr[i].dropdown && arr[i].dropdown.length > 0) {
                        if (typeof arr[i].icon != 'undefined') {
                            item = $('<menu-item-dropdown><span class="touch-icon ' + arr[i].icon + '"></span><a>' + arr[i].label + '</a></menu-item-dropdown>');
                        } else {
                            item = $('<menu-item-dropdown><a>' + arr[i].label + '</a></menu-item-dropdown>');
                        }
                        var dropdown = $('<touch-ui-dropdown></touch-ui-dropdown>');
                        for (var j = 0; j < arr[i].dropdown.length; j++) {
                            var _item = $('<menu-item><a href="' + arr[i].dropdown[j].url + '">' + arr[i].dropdown[j].label + '</a></menu-item>');
                            dropdown.append(_item);
                        }

                        item.append(dropdown);
                        itemArray.push(item);

                    } else {
                        if (typeof arr[i].icon != 'undefined') {
                            item = $('<menu-item><span class="touch ' + arr[i].icon + '"><a href="' + arr[i].url + '">' + arr[i].label + '</a></span></menu-item>');
                        } else {
                            item = $('<menu-item><a href="' + arr[i].url + '">' + arr[i].label + '</a></menu-item>');
                        }
                        itemArray.push(item);
                    }
                }

                return itemArray;
            },

            /**
             *
             * @param homeUrl {String}
             * @param homeIcon {String}
             * @returns {Object}
             */
            createHomeListItem: function (homeUrl, homeIcon) {
                var item;
                var menuItem=this.listItem();
                var home='home';
                if (homeIcon === null) {
                    item = $('<' + menuItem + ' ' + home + '><a href="' + homeUrl + '">Home</a></' + menuItem + '>');
                } else {
                    item = $('<' + menuItem + ' ' + home + '><span class="touch-icon ' + homeIcon + '"></span><a href="' + homeUrl + '">Home</a></' + menuItem + '>');
                }

                return item;
            },

            filterMenuItems:function(items){
                var exclude=items.find('[data-touch="false"]');
                $.each(exclude,function(i,ele){
                    $(ele).remove();
                });
                return items;
            },

            /**
             *
             * @param items {Object}
             */
            touchifyUIDropdowns: function (items) {
                var self=this;
                $.each(items, function (index, element) {
                    var dropdown = $(element).find('ui-dropdown');
                    var megaDropdown=$(element).find('ui-mega-dropdown');
                    if (dropdown && dropdown.length > 0) {
                        dropdown.replaceWith( "<touch-ui-dropdown>" + dropdown.html() + "</touch-ui-dropdown>" );
                        if(megaDropdown && megaDropdown.length >0){
                            self.createTouchMenuItemsFromMegaDropdown(megaDropdown,dropdown);
                            megaDropdown.remove();
                        }
                    }else if(megaDropdown && megaDropdown.length >0){
                        dropdown=$('<touch-ui-dropdown></touch-ui-dropdown>');
                        self.createTouchMenuItemsFromMegaDropdown(megaDropdown,dropdown);
                        megaDropdown.replaceWith(dropdown);
                    }
                });
            },

            /**
             *
             * @param items {Array}
             */
            iconifyTouchMenuItems:function(items){
                var iconAttr=this.iconAttribute();
                $.each(items, function (index, item) {
                    var $item=$(item);
                    var icon=$item.attr(iconAttr);
                    if(icon !== undefined){
                        var span=$('<span class="touch ' + icon + '"></span>');
                        $item.prepend(span);
                    }
                });
            },

            /**
             *
             * @param mega {Element}
             * @param dropdown {Element}
             */
            createTouchMenuItemsFromMegaDropdown:function(mega,dropdown){
                var a=mega.find('a').not('[touch-menu-item="false"]');
                $.each(a,function(i,link){
                    var menuItem=$('<menu-item></menu-item>');
                    menuItem.append(link);
                    dropdown.append(menuItem);
                });
            }
        },

        /**
         *
         * @param input {object}
         * @private
         */
        _unbindSearch: function (input) {
            input.off('focus');
            input.off('blur');

        },


        /**
         *
         * @private
         */
        _onDestroy:function(){
            this._unbindSearch();
        },


        /*==========================================
         PUBLIC METHODS
         *===========================================*/

        /**
         *  @public
         */
        show: function () {
            this._show();
        },

        /**
         *
         * @public
         */
        hide: function () {
            this._hide();
        }

    });

});