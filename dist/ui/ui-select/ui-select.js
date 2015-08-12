Elliptical(function () {
    $.element('ui.select','ui-select', {

        _initElement: function () {
            var val = this.options.value;
            if (val && val !== undefined) {
                this._setValue(val);
            }
        },

        _events: function () {
            var self = this;
            this._event(this.element, 'change', 'select', function (event) {
                var target = $(event.currentTarget);
                var val = target.val();
                var input = self.element.find('input');
                input.val(val);
                self._resetSemanticState();
                self._onChange(target, val);
            });
        },

        _setValue: function (val) {
            var select = this.element.find('select');
            select.val(val);

        },

        _onChange: function (target, val) {
            var id = (this.options.dataId === undefined) ? target.attr('id') : this.options.dataId;
            var name = (this.options.name === undefined) ? target.attr('name') : this.options.name;
            var data = {
                value: val,
                id: id,
                name: name
            };
            this.element.trigger('ui.select.change', data);
        },

        _onDisabled: function (element) {
            element.find('select').attr('disabled', true);
        },

        _onReadOnly: function (element) {
            element.find('select').attr('readonly', true);
        }

    });
});