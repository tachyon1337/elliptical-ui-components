Elliptical(function () {
    var _containerSelector='body';

    $.element("elliptical.tooltip", {

        /* Options to be used as defaults */
        options:{
            placement:'top',
            tipHeight:8,
            tipWidth:10,
            animationIn:'none',
            animationOut:'none',
            duration:250,
            proxyUpgrade:true

        },


        /*==========================================
         PRIVATE
         *===========================================*/


        /**
         * show the tooltip
         * @param tooltip {Object}
         * @param element {Object}
         * @private
         */
        _show: function(tooltip,element){
            var props=this._getAnimationInProps(element);
            if(props.preset.toLowerCase() !='none'){
                this._transition(tooltip,{
                    preset:props.preset,
                    duration:props.duration
                });
            }else{
                tooltip.show();
            }
        },

        /**
         * hide the tooltip
         * @param tooltip {Object}
         * @param element {Object}
         * @private
         */
        _hide: function(tooltip,element){
            var props=this._getAnimationOutProps(element);
            if(props.preset.toLowerCase() !='none'){
                this._transition(tooltip,{
                    preset:props.preset,
                    duration:props.duration
                });
            }else{
                tooltip.hide();
            }
        },

        /**
         * creates the animation object for tooltip animationIn
         * @param element {Object}
         * @returns {Object}
         * @private
         */
        _getAnimationInProps: function(element){
            var props={
                preset:this.options.animationIn,
                duration:this.options.duration
            };
            if (typeof element.attr('data-animation-in')!=='undefined'){
                props.preset=this._utils.string.dashToCamelCase(element.attr('data-animation-in'));
            }
            if (typeof element.attr('data-duration')!=='undefined'){
                props.preset=element.attr('data-duration');
            }
            return props;
        },

        /**
         * creates the animation object for tooltip animationOut
         * @param element {Object}
         * @returns {Object}
         * @private
         */
        _getAnimationOutProps: function(element){
            var props={
                preset:this.options.animationOut,
                duration:this.options.duration
            };
            if (typeof element.attr('data-animation-out')!=='undefined'){
                props.preset=this._utils.string.dashToCamelCase(element.attr('data-animation-out'));
            }
            if (typeof element.attr('data-duration')!=='undefined'){
                props.preset=element.attr('data-duration');
            }
            return props;
        },

        /**
         * gets the hex color to apply to canvas tip
         * @param canvas {Object}
         * @returns {String}
         * @private
         */
        _tipColor:function(canvas){
            return this._utils.color.rgb2hex(canvas.css('color'));
        },

        /**
         * get the tooltip padding(top,bottom,left or right)
         * @param tooltip {Object}
         * @param direction {String}
         * @returns {String}
         * @private
         */
        _toolTipPadding: function(tooltip,direction){
            return tooltip.css('padding-' + direction);
        },


        /**
         * get the tooltip placement
         * @param element {Object}
         * @returns {String}
         * @private
         */
        _placement:function(element){
            return (typeof element.attr('data-placement') != 'undefined') ? element.attr('data-placement') : this.options.placement;
        },

        /**
         * get the tip padding for element tooltip
         * @param element {Object}
         * @returns {Number}
         * @private
         */
        _padding:function(element){
            return (typeof element.attr('data-padding') != 'undefined') ? element.attr('data-padding') : 1;
        },

        /**
         * add css class to the element tooltip
         * @param element {Object}
         * @param tooltip {Object}
         * @private
         */
        _tooltipClass:function(element,tooltip){
            var cssClass=element.attr('data-css');
            if(cssClass && cssClass!==undefined){
                tooltip.addClass(cssClass);
            }
        },

        /**
         * create element tooltip for 'right' placement
         * @param element {Object}
         * @param tooltip {Object}
         * @param canvas {Object}
         * @param dimensions {Object}
         * @param coords {Object}
         * @private
         */
        _right:function(element,tooltip,canvas,dimensions,coords){
            var left,top,tipHeight,tipWidth;
            tipHeight=this.options.tipHeight;
            tipWidth=this.options.tipWidth;

            //left position of the tooltip(element left + element width + canvas tip height + padding factor)
            left=coords.left;
            left=left + parseInt(dimensions.element.width);
            left=left + parseInt(tipHeight) + this._padding(element);

            //top position of the tooltip(element top - 1/2 element height)
            //coords.top=coords.top-50;
            top=coords.top - parseInt(element.height()/2);

            tooltip.css({
                left:left.toFloatPixel(),
                top:top.toFloatPixel()
            });

            var topPadding=this._toolTipPadding(tooltip,'top').toInteger()/2;

            //set the canvas element css positioning
            canvas.css({
                left:'-' + (tipHeight.toFloatPixel()),
                top:'-' + parseInt(topPadding).toFloatPixel()
            });

            //canvas attributes
            canvas.attr('width',tipHeight);
            canvas.attr('height',dimensions.tooltip.height);

            //draw the triangle tip
            var ctx=canvas[0].getContext("2d");
            ctx.fillStyle=this._tipColor(canvas);

            var x1=1;
            var y1=parseInt(dimensions.tooltip.height/2);
            var x2=tipHeight;
            var y2=y1 - parseInt(tipWidth/2);
            var y3=y2 + tipWidth;

            ctx.moveTo(x1,y1);
            ctx.lineTo(x2,y2);
            ctx.lineTo(x2,y3);


            ctx.fill();
        },

        /**
         * create element tooltip for 'left' placement
         * @param element {Object}
         * @param tooltip {Object}
         * @param canvas {Object}
         * @param dimensions {Object}
         * @param coords {Object}
         * @private
         */
        _left:function(element,tooltip,canvas,dimensions,coords){
            var left,top,tipHeight,tipWidth;
            tipHeight=this.options.tipHeight;
            tipWidth=this.options.tipWidth;

            //left position the tooltip(element left - tooltip width - canvas tip height - padding factor)
            left=coords.left;
            left=left - parseInt(dimensions.tooltip.width);
            left=left - parseInt(tipHeight) - this._padding(element);

            //top position of the tooltip(element top - 1/2 element height)
            top=coords.top - parseInt(element.height()/2);

            //set the tooltip positioning
            tooltip.css({
                left:left.toFloatPixel(),
                top:top.toFloatPixel()
            });

            var topPadding=this._toolTipPadding(tooltip,'top').toInteger()/2;

            //set the canvas element css positioning
            canvas.css({
                left:dimensions.tooltip.width-this._padding(element)-1,
                top:'-' + parseInt(topPadding).toFloatPixel()
            });

            //canvas attributes
            canvas.attr('width',tipHeight);
            canvas.attr('height',dimensions.tooltip.height);

            //draw the triangle tip
            var ctx=canvas[0].getContext("2d");
            ctx.fillStyle=this._tipColor(canvas);

            var x1=0;
            var y1=parseInt(dimensions.tooltip.height/2)-parseInt(tipWidth/2);
            var x2=tipHeight;
            var y2=parseInt(dimensions.tooltip.height/2);
            var x3=0;
            var y3=parseInt(dimensions.tooltip.height/2)+ parseInt(tipWidth/2);

            ctx.moveTo(x1,y1);
            ctx.lineTo(x2,y2);
            ctx.lineTo(x3,y3);


            ctx.fill();
        },

        /**
         * create element tooltip for 'top' placement
         * @param element {Object}
         * @param tooltip {Object}
         * @param canvas {Object}
         * @param dimensions {Object}
         * @param coords {Object}
         * @private
         */
        _top:function(element,tooltip,canvas,dimensions,coords){

            var left,top,tipHeight,tipWidth;
            tipHeight=this.options.tipHeight;
            tipWidth=this.options.tipWidth;

            //left position the tooltip
            left=coords.left + parseInt(dimensions.element.width/2) - parseInt(dimensions.tooltip.width/2);
            //force coords.left if specified
            if(typeof element.attr('data-left') !=='undefined'){
                left=coords.left;
            }

            //top position of the tooltip
            top=coords.top - dimensions.tooltip.height - tipHeight - this._padding(element);

            //set the tooltip positioning
            tooltip.css({
                left:left.toFloatPixel(),
                top:top.toFloatPixel()
            });

            var bottom=tipHeight-2;
            //set the canvas element css positioning
            canvas.css({
                bottom:'-' + (bottom.toFloatPixel())
            });

            //canvas attributes
            canvas.attr('width',dimensions.tooltip.width);
            canvas.attr('height',tipHeight);

            //draw the triangle tip
            var ctx=canvas[0].getContext("2d");
            ctx.fillStyle=this._tipColor(canvas);

            var x1=parseInt(dimensions.tooltip.width/2)-tipWidth;
            var y1=1;
            var x2=x1 + parseInt(tipWidth/2);
            var y2=tipHeight;
            var x3=x1 + tipWidth;

            ctx.moveTo(x1,y1);
            ctx.lineTo(x2,y2);
            ctx.lineTo(x3,y1);
            ctx.fill();

        },

        /**
         * create element tooltip for 'bottom' placement
         * @param element {Object}
         * @param tooltip {Object}
         * @param canvas {Object}
         * @param dimensions {Object}
         * @param coords {Object}
         * @private
         */
        _bottom:function(element,tooltip,canvas,dimensions,coords){

            var left,top,tipHeight,tipWidth;
            tipHeight=this.options.tipHeight;
            tipWidth=this.options.tipWidth;

            //left position the tooltip
            left=coords.left;
            left=left-parseInt(dimensions.tooltip.width/2);
            left=left + parseInt(tipWidth/2);
            left=left + parseInt(dimensions.element.width/2);

            //top position of the tooltip
            top=coords.top + dimensions.element.height + tipHeight + this._padding(element);


            //set the tooltip positioning
            tooltip.css({
                left:left.toFloatPixel(),
                top:top.toFloatPixel()
            });

            //set the canvas element css positioning
            canvas.css({
                top:'-' + (tipHeight.toFloatPixel()),
                left:'-2px'
            });

            //canvas attributes
            canvas.attr('width',dimensions.tooltip.width);
            canvas.attr('height',tipHeight);

            //draw the triangle tip
            var ctx=canvas[0].getContext("2d");
            ctx.fillStyle=this._tipColor(canvas);

            var x1=parseInt(dimensions.tooltip.width/2)-tipWidth/2;
            var y1=tipHeight;
            var x2=parseInt(dimensions.tooltip.width/2);
            var y2=0;
            var x3=parseInt(dimensions.tooltip.width/2) + tipWidth/2;

            ctx.moveTo(x1,y1);
            ctx.lineTo(x2,y2);
            ctx.lineTo(x3,y1);
            ctx.fill();

        },

        /**
         * creates the dimensions object and pipes tooltip creation to the applicable placement create method
         * @param element {Object}
         * @param tooltip {Object}
         * @param canvas {Object}
         * @param coords {Object}
         * @private
         */
        _renderTooltip:function(element,tooltip,canvas,coords){
            var placement=this._placement(element);

            var dimensions={
                element:{
                    width:element.outerWidth(),
                    height:element.outerHeight()
                },
                tooltip:{
                    width:tooltip.outerWidth(),
                    height:tooltip.outerHeight()
                }
            };

            switch(placement){
                case 'top':
                    this._top(element,tooltip,canvas,dimensions,coords);
                    break;

                case 'left':
                    this._left(element,tooltip,canvas,dimensions,coords);
                    break;

                case 'right':
                    this._right(element,tooltip,canvas,dimensions,coords);
                    break;

                case 'bottom':
                    this._bottom(element,tooltip,canvas,dimensions,coords);
                    break;
            }
        },

        /**
         * create method for an element tooltip
         * @param element {Object}
         * @private
         */
        _createToolTip: function(element){
            var attr=this._utils.string.random();
            element.data('tooltip',attr);
            var txt=element.attr('data-title');
            txt=(typeof txt==='undefined') ? 'Tooltip' : txt;
            var coords=this._offset(element[0]);
            var canvas=$('<canvas></canvas>');
            var tooltip=$('<div class="data-tooltip"></div>');
            this._tooltipClass(element,tooltip);
            tooltip.attr('data-id',attr);
            tooltip.html(txt);
            tooltip.append(canvas);
            $(_containerSelector).append(tooltip);
            this._renderTooltip(element,tooltip,canvas,coords);
            this._show(tooltip,element);
        },

        /**
         * parses a tooltip show request(show or create)
         * @param target {Object}
         * @private
         */
        _parseShowRequest:function(target){
            //show or create tooltip
            var attr=target.data('tooltip');
            if(typeof attr ==='undefined'){
                //tooltip for element has not been created
                this._createToolTip(target);
            }else{
                //find and show
                var tooltip=$('[data-id="' + attr + '"]');
                this._show(tooltip,target);
            }
        },

        /**
         * parses a tooltip hide request
         * @param target {Object}
         * @private
         */
        _parseHideRequest: function(target){
            var attr=target.data('tooltip');
            var tooltip=$('[data-id="' + attr + '"]');
            this._hide(tooltip,target);
        },

        /**
         * parses element touchhover special event
         * @param event {Object}
         * @private
         */
        _parseEvent:function(event){
            var target = $(event.target);
            if(event.type==='hoverout'){
                this._parseHideRequest(target);
            }else{
                //show or create tooltip
                this._parseShowRequest(target)
            }
        },

        /**
         * private handler for public show method
         * @param selector {Object}
         * @private
         */
        _showToolTip:function(selector){
            var target=selector;
            if(typeof selector !=='object'){
                target=$(selector);
            }

            this._parseShowRequest(target);
        },

        /**
         * private handler for public hide method
         * @param selector {Object}
         * @private
         */
        _hideToolTip:function(selector){
            var target=selector;
            if(typeof selector !=='object'){
                target=$(selector);
            }

            this._parseHideRequest(target);
        },

        /**
         * widget events
         * document listener for the 'touchover' special event from .ui-tooltip elements
         * @private
         */
        _events: function(){
            var hover=this._data.hover;
            var self=this;
            var doc=this.element;
            this._event(doc,hover,'.ui-tooltip',function(event){
                self._parseEvent(event);
            });


        },

        __removeTooltips:function(elements){
            $.each(elements,function(i,obj){
                var attr=$(obj).data('tooltip-id');
                var tooltip=$('[data-tooltip="' + attr + '"]');
                tooltip.remove();
            });
        },

        _removeTooltips:function(removed){
            if(typeof removed==='undefined'){
                $('.data-tooltip').remove();
            }else{
                var elements=removed.find('.ui-tooltip');
                this.__removeTooltips(elements);
            }
        },

        _clear:function(){
            var tooltips=$(document).find('.data-tooltip');
            tooltips.remove();
        },


        _onDestroy:function(){
            $('.data-tooltip').remove();
        },


        /*==========================================
         PUBLIC METHODS
         *===========================================*/

        /**
         *  @public
         */
        show:function (selector) {
            this._showToolTip(selector);
        },

        /**
         *
         * @public
         */
        hide:function (selector) {
            this._hideToolTip(selector);
        },

        remove:function(removed){
            this._removeTooltips(removed);
        },

        clear:function(){
            this._clear();
        }

    });

    $(function () {
        $(document).tooltip();
    });

});