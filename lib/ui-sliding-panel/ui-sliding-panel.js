Elliptical(function () {
    $.controller("elliptical.slidingPanel", "ui-sliding-panel", {

        //Options to be used as defaults
        options: {
            dataBind:false,
            durationIn: 1000,
            durationOut: 3000,
            transitionIn: 'slideInRight',
            transitionOut: 'slideOutRight',
            modal: true,
            modalCssClass: null,
            modalZIndex: 99999,
            modalOpacity: .3
        },

        /**
         * init
         * @private
         */
        _initController: function () {
            this._data.isOpen=false;
            this._data.isAnimating=false;
        },

        _subscriptions:function(){
            this._subscribe('sliding.panel.toggle',this._toggle.bind(this));
            this._subscribe('sliding.panel.show',this._show.bind(this));
            this._subscribe('sliding.panel.hide',this._hide.bind(this));
        },

        /**
         * show the panel
         * @private
         */
        _show: function () {
            var self = this;
            var body = $('body');
            this._data.isAnimating = true;
            this._onEventTrigger('showing', {});
            if (this.options.modal) {
                var opts = {};
                if (this.options.modalCssClass) {
                    opts.cssClass = this.options.modalCssClass;
                }
                opts.opacity = this.options.modalOpacity;
                opts.zIndex = this.options.modalZIndex;
                this._setModal(body, opts, function () {
                    self._open();
                });

            } else {
                this._open();
            }
        },

        /**
         * opens the panel
         * @private
         */
        _open: function () {
            var self = this;
            var duration = this.options.durationIn;
            var transition = this.options.transitionIn;
            var element = this.element;
            this._transitions(element, {
                preset: transition,
                duration: duration
            }, function () {
                self._data.isOpen = true;
                self._data.isAnimating = false;
                self._onEventTrigger('show', {});
            });
        },

        /**
         * closes the panel
         * @private
         */
        _hide: function () {
            var self = this;
            var element = this.element;
            var duration = this.options.durationOut;
            var transition = this.options.transitionOut;
            this._data.isAnimating = true;
            self._onEventTrigger('hiding', {});
            this._killModal();
            this._transitions(element, {
                preset: transition,
                duration: duration
            }, function () {
                self._data.isOpen = false;
                self._data.isAnimating = false;
                self._onEventTrigger('hide', {});
            });
        },

        _toggle:function(){
            var isOpen = this._data.isOpen;
            var isAnimating = this._data.isAnimating;
            if (isAnimating) {
                return;
            }
            if (!isOpen) {
                this._show();
            } else {
                this._hide();
            }
        },

        /**
         * remove modal
         * @private
         */
        _killModal: function () {
            var self = this;
            if (this.options.modal) {
                setTimeout(function () {
                    self._removeModal();
                }, 500);
            }
        },

        /*==========================================
         PUBLIC METHODS
         *===========================================*/

        /**
         * open the panel
         * @public
         */
        show: function () {
            var isOpen = this._data.isOpen;
            var isAnimating = this._data.isAnimating;
            if (!isOpen && !isAnimating) {
                this._show();
            }
        },

        /**
         * hide the panel
         * @public
         */
        hide: function () {
            var isOpen = this._data.isOpen;
            var isAnimating = this._data.isAnimating;
            if (isOpen && !isAnimating) {
                this._hide();
            }
        },

        /**
         * toggle the panel
         * @public
         */
        toggle: function () {
           this._toggle();
        }

    });
});