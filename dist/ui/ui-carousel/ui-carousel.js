Elliptical(function () {

    var _prevNavSelector = 'carousel-navigation.prev';
    var _nextNavSelector = 'carousel-navigation.next';
    var _indicatorNavSelector = 'carousel-navigation.indicators';
    var _innerContainer = 'carousel-inner-container';
    var _item = 'carousel-item';

    $.element.registerElement('carousel-inner-container');
    $.element.registerElement('carousel-navigation');
    $.element.registerElement('carousel-item');
   
    $.component("elliptical.carousel", "ui-carousel", {

        //Options to be used as defaults
        options: {
            //public
            prevNavSelector: _prevNavSelector, //prev nav selector {string}
            nextNavSelector: _nextNavSelector, //next nav selector {string}
            animation: 'slide',
            initOnload:true,
            auto: false, //auto {bool}
            autoInterval: null, //auto interval {int}
            desktopFadeDuration: 1000, //fade duration on desktop {int}
            desktopDuration: 350, //slide animation duration {int}
            touchFadeDuration: 0, //fade duration on touch devices {int}
            touchDuration: 300, //slide duration on touch {int}
            duration: 300, //duration {int}
            easing: 'ease', //easing {string}
            select: false,// handle select ui for multislider
            template: '', //template name
            model: [], //model
            border: 0,
            initInterval: 4000,
            hardwareAcceleration: false,
            slideDistance: null,
            preload: true,
            watch: false,
            templateSelector: '[template]',
            indicatorNav: false,
            captureEvents: false,
            showOnLoad: null,
            maxIntervals:null,
            crossFade:true,
            scopeBind:false

        },



        /*==========================================
         PRIVATE
         *===========================================*/


        /**
         * override onInit
         * @private
         */
        __onInit: function () {
           this._assignLocalData();
            if(this.options.initOnload){
                this._initCarousel();
            }
        },

        _assignLocalData:function(){
            this._data.set('innerContainer',null);
            this._data.set('innerContainerSelector',_innerContainer);
            this._data.set('size',0);
            this._data.set('iteration',0);
            this._data.set('prevNav',null);
            this._data.set('nextNav',null);
            this._data.set('readyState',false);
            this._data.set('timeoutId',null);
            this._data.set('intervalId',null);
            this._data.set('currentSlide',null);
            this._data.set('itemWidth',0);
            this._data.set('itemMargin',0);
            this._data.set('itemBorder',0);
            this._data.set('item',_item);
            this._data.set('visible','nav-visible');
            this._data.set('carouselItems',null);
            this._data.set('autoInterval',4000);
            this._data.set('fadeAutoInterval',8000);
            this._data.set('element',null);
        },

        _initCarousel:function(){
            if(!this._data){
                this.destroy();
            }
            var self=this;
            if (this.options.watch) {
                setTimeout(function(){
                    self._watchCarousel();
                },500);
            } else {
                this._initialization();
                this._onInitialization();
            }
        },

        _isPhone: function () {
            var width = window.innerWidth || $(window).width();
            return (width < 500);

        },

        /**
         *
         * @private
         */
        _initialization: function () {
            var element = this.element;
            //get size=total number of slides
            this._data.set('size',element.find(this._data.get('item')).size());
            //get the current slide=1st element
            this._data.set('currentSlide',element.find(this._data.get('item') + ':first'));
            this._data.set('iteration',0);
            var currentSlide = this._data.get('currentSlide');
            this._data.set('indicators',null);
            if (this.options.captureEvents === true) {
                //
            } else {
                this.options.captureEvents = false;
            }

            if (this.options.indicators) {
                this._initIndicatorNav();
            }
        },

        /**
         * watch carousel for template visibility before running _onInitialization
         * @private
         */
        _watchCarousel: function () {
            var element = this.element;
            var self = this;
            var item = this._data.get('item');
            var templateSelector = this.options.templateSelector;
            var template = element.find(templateSelector);
            if (!template[0] && template.html() !=='') {
                this._initialization();
                this._onInitialization();
            } else {
                this._initDisabledNav();
                var intervalId = setInterval(function () {
                    self._data.set('intervalId',intervalId);
                    if (template.isVisible()) {
                        clearInterval(self._data.get('intervalId'));
                        self._data.set('intervalId',null);
                        self._initialization();
                        self._onInitialization();
                    }

                }, 100);
            }
        },

        _onInitialization: function () {
            this._setDuration();
            var self = this;
            var animation = this.options.animation;
            
            if (animation === 'fade') {
                this._readyState();
                
                if (this._isPhone() && this.options.showOnLoad) {
                    var slideIndex_ = parseInt(this.options.showOnLoad);
                    this._FadeSlide(slideIndex_);
                } else {
                    if (this.options.auto) {
                        this._initAutoInterval();
                    }
                }

            } else {
                /* multi-slide or slide transition */
                if (!this._mq.touch && this.options.hardwareAcceleration) {
                    var body = $('body');
                    this._setHardwareAcceleration(body);
                }
                if (this.options.preload === true) {
                    this._preloadImages(this.element, this._onPreload.bind(this));
                } else {
                    this._onPreload(null, null);
                }
            }

            this._setInnerContainerVisibility();
        },

        /**
         * on preload handler
         * @param err
         * @param data
         * @private
         */
        _onPreload: function (err, data) {
            this._readyState();
            var animation = this.options.animation;
            var auto = this.options.auto;
            if (animation === 'multiSlide') {
                this._initMultiSlide();
            } else if (animation === 'slide') {
                this._initSlide();
            }
            this._setInnerContainerVisibility();
            var evtData = {};
            if (data) {
                evtData.length = data.length;
                this._triggerPreloadEvent(evtData);
            }

            if (animation === 'slide' && auto) {
                this._initAutoSlideInterval();
            }
        },

        /**
         * carousel component is ready to begin
         * @private
         */
        _readyState: function () {
            this._data.set('readyState',true);
            this._initContainers();
            this._initNav();
            this._events();
        },

        /**
         *
         * @private
         */
        _initAutoInterval: function () {
            if (this._isPhone()) {
                return false;
            }
            var self = this;
            setTimeout(function () {
                self._autoFadeSlide();
            }, self.options.initInterval);
        },

        /**
         *
         * @private
         */
        _initAutoSlideInterval: function () {
            var MAX_COUNT=this.options.maxIntervals;
            var count=0;
            var self = this;
            var intervalId = setInterval(function () {
                self._data.set('intervalId',intervalId);
                self._setIndicatorNav();
                self._nextSlide();
                if(MAX_COUNT){
                    count++;
                    if(count > MAX_COUNT){
                        clearInterval(intervalId);
                    }
                }
            }, self.options.autoInterval);
        },

        /**
         *
         * @private
         */
        _initSlide: function () {
            this._setCarouselWidth();
            /* disable prev nav */
            var prevNav=this._data.get('prevNav');
            var nextNav=this._data.get('nextNav');
            prevNav.addClass('disabled');
            var size = this._data.get('size');
            if (size < 2) {
                nextNav.addClass('disabled');
            }
        },

        /**
         * init multi-slide
         * @private
         */
        _initMultiSlide: function () {
            var ele = this.element;
            var size = this._data.get('size');
            var li = ele.find(this._data.get('item') + ':first');
            this._data.set('itemWidth',li.outerWidth());
            this._data.set('itemMargin',parseInt(li.css('margin-right'), 10));

            /* disable prev nav */
            var prevNav=this._data.get('prevNav');
            var nextNav=this._data.get('nextNav');
            prevNav.addClass('disabled');
            /* check to disable next nav */
            if (size < 2) {
                nextNav.addClass('disabled');
            } else {
                //if no content to slide
                if (!this._contentToSlide()) {
                    nextNav.addClass('disabled');
                }
            }
            this._setInnerContainerBorder();
        },

        /**
         * private method that sets the containers
         * @private
         */
        _initContainers: function () {
            var element = this.element;
            var containerSelector=this._data.get('innerContainerSelector');
            this._data.set('innerContainer',element.find(containerSelector));
            this._data.set('itemsContainer',element.find('carousel-items'));
        },

        /**
         * set inner container to visible
         * @private
         */
        _setInnerContainerVisibility: function () {
            var innerContainer=this._data.get('innerContainer');
            if(innerContainer){
                innerContainer.addClass('visible');
            }else{
                this._initContainers();
                innerContainer=this._data.get('innerContainer');
                innerContainer.addClass('visible');
            }

        },

        /**
         * for multi-slide, set a transparent border class, if no existing border
         * @private
         */
        _setInnerContainerBorder: function () {
            var innerContainer = this._data.get('innerContainer');
            var border = parseInt(innerContainer.css('border'), 10);
            if (border === 0) {
                innerContainer.addClass('multi-border');
            }
        },

        /**
         * deprecated method; using css instead
         * @private
         */
        _setCarouselWidth: function () {
            var innerContainerWidth = this._innerContainerWidth();
            var size = this._data.get('size');
            var carouselWidth = parseInt(size * innerContainerWidth);

        },

        /**
         * trigger preload event
         * @param evtData
         * @private
         */
        _triggerPreloadEvent: function (evtData) {
            var self = this;
            setTimeout(function () {
                self._onEventTrigger('preloaded', evtData);
            }, 10);
        },

        /**
         * private method that handles transition to next slide(css prop transitioned is margin-left)
         * @private
         */
        _nextSlide: function () {
            var ele = this._data.get('itemsContainer');
            var iteration = this._data.get('iteration');
            var self = this;
            var contentToSlide=this._contentToSlide();
            var isStore=this._data._store;
            if (contentToSlide && isStore) { //if the left offset position of last-child is greater than container width, we can do a next slide

                var slideDistanceFactor = this._slideDistanceFactor('last');
                iteration++;
                this._data.set('iteration',iteration);
                var marginLeft = (-1) * iteration * slideDistanceFactor + 'px';
                var evtData = {
                    slideIndex: iteration
                };
                this._onEventTrigger('sliding', evtData);

                this._transition(ele, {
                    'margin-left': marginLeft,
                    duration: this.options.duration,
                    easing: this.options.easing
                }, function () {

                    /* remove any disabled css markup from nav */
                    var prevNav=self._data.get('prevNav');
                    var nextNav=self._data.get('nextNav');
                    if(prevNav && prevNav!==undefined){
                        prevNav.removeClass('disabled');
                    }
                    /* check if nextNav needs to be disabled */

                    if (!self._contentToSlide()) {
                        nextNav.addClass('disabled');
                    }
                    self._onEventTrigger('slide', evtData);
                });
            }else{
                var intervalId=this._data.get('intervalId');
                if(intervalId){
                    clearInterval(intervalId);
                }
            }
        },

        _getCarouselItems: function () {
            var items = this._data.get('carouselItems');
            if (!items) {
                items = this.element.find('carousel-item');
            }
            return items;
        },

        _getSize: function () {
            var items = this._getCarouselItems();
            return items.size();
        },

        /**
         * private method that handles transition to prev slide (css prop transitioned is margin-left)
         * @private
         */
        _prevSlide: function () {
            var ele = this._data.get('itemsContainer');
            var iteration = this._data.get('iteration');
            var self = this;
            if (iteration > 0) {  //if first-child is not the first visible position, we can do a previous slide
                var slideDistanceFactor = this._slideDistanceFactor('first');
                iteration--;
                this._data.set('iteration',iteration);
                var marginLeft = (-1) * iteration * slideDistanceFactor + 'px';
                var evtData = {
                    slideIndex: iteration
                };
                this._onEventTrigger('sliding', evtData);
                this._transition(ele, {
                    'margin-left': marginLeft,
                    duration: this.options.duration,
                    easing: this.options.easing
                }, function () {
                    /* remove any disabled css markup from nav */
                    var prevNav=self._data.get('prevNav');
                    var nextNav=self._data.get('nextNav');
                    nextNav.removeClass('disabled');
                    /* check if prevNav needs to be disabled */
                    if (iteration === 0) {
                        prevNav.addClass('disabled');
                    }
                    self._onEventTrigger('slide', evtData);
                });
            }
        },


        /**
         * private method handles both next and prev slide for fade transition
         * @param slideIndex
         * @private
         */
        _FadeSlide: function (slideIndex) {
            var items = this._getCarouselItems();
            var nextSlide_ = items[slideIndex];
            var nextSlide = $(nextSlide_);
            var currentSlide = this._data.get('currentSlide');
            currentSlide.css({
                position: 'absolute',
                display: 'block',
                float: 'none',
                'z-index': 1
            });
            nextSlide.css({
                position: 'relative',
                display: 'list-item',
                float: 'left',
                'z-index': 2
            });

            var evtData = {
                slideIndex: slideIndex
            };

            var duration = this.options.duration;
            var crossFade = this.options.crossFade;
            this._data.set('currentSlide',nextSlide);
            this._data.set('iteration',slideIndex);
            
            if (crossFade===true) {
                this._crossFadeTransition(currentSlide, nextSlide, duration, evtData);
            } else {
                this._fadeTransition(currentSlide, nextSlide, duration, evtData);
            }
        },

        _crossFadeTransition: function(currentSlide,nextSlide,duration,evtData){
            this._transition(currentSlide, {
                opacity: 0,
                duration: duration
            });
            this._transition(nextSlide, {
                opacity: 1,
                duration: duration
            });

            this._onEventTrigger('slide', evtData);
        },

        _fadeTransition: function (currentSlide, nextSlide, duration, evtData) {
            var self = this;
            this._transition(currentSlide, {
                opacity: 0,
                duration: duration
            }, function () {
                self._transition(nextSlide, {
                    opacity: 1,
                    duration: duration
                });
                self._onEventTrigger('slide', evtData);
            });
        },

        /**
         * private method handles auto fade
         * @returns {boolean}
         * @private
         */
        _autoFadeSlide: function () {
            var MAX_COUNT=this.options.maxIntervals;
            var count=0;
            //abort if nav has been manually invoked
            if (!this.options.auto) {
                return false;
            }
            var iteration = this._data.get('iteration');
            iteration = (iteration < this._data.get('size') - 1) ? (iteration + 1) : 0;
            this._updateIndicatorNav(iteration);
            this._FadeSlide(iteration);
            var self = this;
            var timeoutId = setTimeout(function () {
                self._data.set('timeoutId',timeoutId);
                self._autoFadeSlide();
                if(MAX_COUNT){
                    count++;
                    if(count > MAX_COUNT){
                        clearInterval(intervalId);
                    }
                }
            }, self.options.autoInterval);

        },

        /**
         * private method that clears timeoutid for setTimeout
         * @private
         */
        _clearTimeout: function () {
            if (this._data.get('timeoutId')) {
                clearTimeout(this._data.get('timeoutId'));
            }
        },

        /**
         * private method that sets the transition duration
         * @private
         */
        _setDuration: function () {
            var animation = this.options.animation;
            if (animation === 'fade') {
                if (this._device.touch) {
                    this.options.duration = this.options.touchFadeDuration;
                } else {
                    this.options.duration = this.options.desktopFadeDuration;
                }
                if (!this.options.autoInterval) {
                    this.options.autoInterval = this._data.get('fadeAutoInterval');
                }
                
            } else {
                if (!this.options.autoInterval) {
                    this.options.autoInterval = this._data.get('autoInterval');
                }
                if (this._device.touch) {
                    this.options.duration = this.options.touchDuration;
                } else {
                    this.options.duration = this.options.desktopDuration;
                }
            }
        },

        /**
         * private method that returns the left position of requested li child
         * @param child
         @returns {int}
         * @private
         */
        _leftPos: function (child) {
            var innerContainer=this.element.find('carousel-inner-container');
            var innerContainerOffset = innerContainer.offset();
            var item = this.element.find(this._data.get('item') + ':' + child + '-child');
            var offset = item.offset();
            if(!offset){
                this.destroy();
                return;
            }
            var innerContainerOffsetLeft=innerContainerOffset.left;
            var scrollLeft=innerContainer.scrollLeft();
            offset.left -= innerContainerOffsetLeft - scrollLeft;
            return offset.left;
        },

        /**
         * private method that returns the inner container width
         * @returns {int}
         * @private
         */
        _innerContainerWidth: function () {
            var container = this._data.get('innerContainer');
            if(container===undefined){
                container=this.element.find('carousel-inner.container');
            }
            return container.width();
        },


        /**
         * private method that inits the nav controls
         * @private
         */
        _initNav: function () {
            var outerContainer = this.element;
            var next = outerContainer.find(this.options.nextNavSelector);
            var prev = outerContainer.find(this.options.prevNavSelector);
            prev.removeClass('disabled');
            next.removeClass('disabled');
            prev.addClass(this._data.get('visible'));
            next.addClass(this._data.get('visible'));
            this._data.set('nextNav',next);
            this._data.set('prevNav',prev);

        },

        /**
         * private method that int disables nav
         * @private
         */
        _initDisabledNav: function () {
            var outerContainer = this.element;
            var next = outerContainer.find(this.options.nextNavSelector);
            var prev = outerContainer.find(this.options.prevNavSelector);
            next.addClass('disabled');
            prev.addClass('disabled');
        },

        _initIndicatorNav: function () {
            var outerContainer = this.element;
            var indicators = outerContainer.find(_indicatorNavSelector);
            var length = this._getSize();
            var strLi = '';
            for (var i = 0; i < length; i++) {
                if (i === 0) {
                    strLi += '<li class="active">&nbsp;</li>';
                } else {
                    strLi += '<li>&nbsp;</li>';
                }
            }
            indicators.append($(strLi));
            indicators.addClass('show');
            this._data.set('indicatorNav',indicators);
            this._indicatorEvents();
        },

        _setIndicatorNav:function(){
            var iteration = this._data.get('iteration');
            iteration = (iteration !== undefined) ? (iteration) : 0;
            var size = this._getSize();
            size--;
            if (iteration < size) {
                iteration++;
                this._updateIndicatorNav(iteration);
            } else {
                this._clearTimeout();
            }
        },

        _updateIndicatorNav: function (index) {
            var indicatorNav = this._data.get('indicatorNav');
            if (!indicatorNav) {
                return false;
            }
            indicatorNav.find('.active')
                .removeClass('active');
            var items = indicatorNav.find('li');
            var item = items[index];
            if (item) {
                $(item).addClass('active');
            }
        },

        /**
         * private method that returns bool regarding not reaching the end of the hidden content to slide
         * @returns {boolean}
         * @private
         */
        _contentToSlide: function () {
            var child = 'last';
            var innerContainerWidth = this._innerContainerWidth();
            var left = this._leftPos(child);
            var width = this._slideDistanceFactor('last');
            left += width;
            left=left-2;
            return (left > innerContainerWidth);
        },

        /**
         * private method that returns the calculated width factor of the distance to slide
         * @param child
         * @returns {number}
         * @private
         */
        _slideDistanceFactor: function (child) {
            if (this.options.slideDistance !== null) {
                return this.options.slideDistance;
            } else {
                var ele = this.element;
                var item = ele.find(this._data.get('item') + ':' + child + '-child');
                var width = item.outerWidth();
                var margin = item.css('margin-right');
                var distance = parseInt(width) + parseInt(margin, 10);
                return distance;
            }
        },

        /**
         * event trigger handler for selected slide
         * @param index
         * @param item
         * @private
         */
        _onSelectedEventTrigger: function (index, item) {
            var __customElements = this.options.$customElements;
            console.log(item[0]);

            var url = (!__customElements) ? 'data-url' : 'url';
            var evtData = {
                index: index,
                url: item.attr(url),
                target: item
            };
            this._onEventTrigger('selected', evtData);

        },

        /**
         *
         * @param event {Object}
         * @private
         */
        _onSelected: function (event) {
            var target = event.currentTarget;
            if (this.options.multiSlide && this.options.select) {
                this._onSelection($(target));
            }
            this._onSelectedEventTrigger($(target).index(), $(target));
        },

        /**
         * private method that handles slide selection
         * @private
         */
        _itemSelected: function () {
            var element = this.element;

            var self = this;
            var click = this._data.click;

            this._event(element, click, 'carousel-item', function (event) {
                self._onSelected(event);
            });
        },


        /**
         * private method that changes the ui on selection
         * @param item
         * @private
         */
        _onSelection: function (item) {
            var ele = this.element;
            var all = ele.find(this._data.get('item'));
            all.removeClass('active');
            item.addClass('active');
        },

        /**
         * private method for next slide request
         * @private
         */
        _onNext: function (index) {
            var animation = this.options.animation;
            var iteration=index;
            if (this._data.get('readyState')) {
                this._clearTimeout();
                this.options.auto = false;
                if (animation === 'fade') {  /* fade */
                    if(iteration===undefined){
                        iteration= this._data.get('iteration');
                        iteration = (iteration < this._data.get('size') - 1) ? (iteration + 1) : 0;
                    }
                    this._FadeSlide(iteration);
                } else {
                    /* slide mode */
                    if (iteration !== undefined) {
                        iteration--;
                        this._data.set('iteration',iteration);
                    }
                    this._nextSlide();
                }
            }
        },

        /**
         * private method for prev slide request
         * @private
         */
        _onPrev: function (index) {
            var animation = this.options.animation;
            var iteration = index;
            if (this._data.get('readyState')) {
                this._clearTimeout();
                this.options.auto = false;
                if (animation === 'fade') {  /* fade */
                    if (iteration === undefined) {
                        var iteration = this._data.get('iteration');
                        iteration = (iteration > 0) ? (iteration - 1) : this._data.get('size') - 1;
                    }
                    this._FadeSlide(iteration);
                } else {
                    /* slide mode */
                    if (iteration !== undefined) {
                        iteration++;
                        this._data.set('iteration',iteration);
                    }
                    this._prevSlide();
                }
            }
        },

        _pause:function(){
            this._clearTimeout();
        },

        /**
         *
         * @private
         */
        _enableNav: function () {
            var size=this.element.find(this._data.item).size();
            this._data.set('size',size);
            var next = this._data.get('nextNav');
            var prev = this._data.get('prevNav');
            if (size > 1) {
                next.show();
                prev.show();
            }
        },

        /**
         *
         * @private
         */
        _disableNav: function () {

            var next = this._data.get('nextNav');
            var prev = this._data.get('prevNav');
            next.hide();
            prev.hide();
        },

        /**
         * for fade transitions, show slide at index
         * @param index {Number}
         * @private
         */
        _onSlide: function (index) {
            var animation = this.options.animation;
            if (animation === 'fade') {  /* fade */
                if (index < 0) {
                    index = 0;
                }
                if (index > this._data.size - 1) {
                    index = this._data.size - 1;
                }
                this._clearTimeout();
                this.options.auto = false;
                this._FadeSlide(index);
            }
        },

        _onOrientationChange: function () {
            var animation = this.options.animation;
            if (animation === 'slide') {
                this._data.set('iteration',0);
                this.element.css({ 'margin-left': 0 });
            }
        },

        _onIndicatorClick: function (event) {
            var indicatorNav = this._data.get('indicatorNav');
            var items = indicatorNav.find('li');
            var item = $(event.target);
            var index = items.index(item);
            var currentIndex = this._data.get('iteration');
            if (index > currentIndex) {
                this._onNext(index);
            } else {
                this._onPrev(index);
            }

            this._updateIndicatorNav(index);
        },


        /**
         * touch event handler
         * @param event {Object}
         * @private
         */
        _onGesture: function (event) {
            // disable browser scrolling

            switch (event.type) {

                case 'swiperight':
                    event.preventDefault();
                    if (this._data.get('readyState')) {
                        this._onPrev();
                    }
                    break;
                case 'swipeleft':
                    event.preventDefault();
                    if (this._data.get('readyState')) {
                        this._onNext();
                    }
                    break;

                case 'tap':
                    event.preventDefault();
                    var item = $(event.target);
                    var carouselItem;
                    if (item[0].nodeName.toLowerCase() === 'carousel-item') {
                        carouselItem = item;
                    } else {
                        carouselItem = item.parents('carousel-item');
                    }
                    this._onSelectedEventTrigger(carouselItem.index(), carouselItem);
                    break;

                case 'release':

                    break;

            }
        },


        /**
         * element events
         * @private
         */
        _events: function () {
            var element = this.element;
            var orientationEvent = this._device.orientationEvent + this.eventNamespace;
            var self = this;
            var next = this._data.get('nextNav');
            var prev = this._data.get('prevNav');
            if (this._data.get('size') < 1) {
                next.hide();
                prev.hide();
            }
            /* click special event name */
            //var click = this._data.click;
            var click = this.__press();
            /* for desktop click */

            if(next===undefined || prev===undefined){
                return;
            }
            this._event(next, click, function (event) {
                self._onNext();
            });

            this._event(prev, click, function (event) {
                self._onPrev();
            });

            var isTouch = this._device.touch;
            if (this.options.captureEvents && !isTouch) {
                this._itemSelected();
            }

            /* resize */
            this._event($(window), orientationEvent, function (event) {
                self._onOrientationChange();
            });

            /* touch swipe event handling */
            if (isTouch) {
                this._event(element, 'swipeleft swiperight tap', function (event) {
                    self._onGesture(event);
                });

            }
        },

        __press: function () {
            var press = 'click';
            if (this._device.touch) {
                press = 'tap';
            }
            return press;
        },

        _indicatorEvents: function () {
            var self = this;
            /* click special event name */
            var click = this._data.click;
            var indicatorNav = this._data.get('indicatorNav');
            var items = indicatorNav.find('li');
            this._event(items, click, function (event) {
                self._onIndicatorClick(event);
            });

        },

        _onDestroy:function(){
            var intervalId=this._data.get('intervalId');
            var timeoutId=this._data.get('timeoutId');
            if(intervalId){
                clearInterval(intervalId);
                this._data.set('intervalId',null);
            }
            if(timeoutId){
                clearTimeout(timeoutId);
                this._data.set('timeoutI',null);
            }
        },



        /*==========================================
         PUBLIC METHODS
         *===========================================*/

        /**
         * @public api
         */
        show: function () {
            var container = this.element;
            container.show();

        },

        /**
         * @public api
         */
        hide: function () {
            var container = this.element;
            container.hide();
        },

        /**
         *
         * @param direction
         * @public api
         */
        slide: function (direction) {
            if (typeof direction === 'number') {
                this._onSlide(direction);
            } else {
                (direction === 'next') ? this._onNext() : this._onPrev();
            }
        },

        /**
         * @public
         */
        enableNav: function () {
            this._enableNav();
        },

        /**
         * @public
         */
        disableNav: function () {
            this._disableNav();
        },

        pause:function(){
            this._pause();
        },

        runInit:function(){
            this._initCarousel();
        }

    });

});