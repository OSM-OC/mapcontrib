
import $ from 'jquery';
import Wreqr from 'backbone.wreqr';
import Marionette from 'backbone.marionette';
import template from '../../templates/newPoiPlacementContextual.ejs';
import MapUi from '../ui/map';


export default Marionette.ItemView.extend({
    template: template,

    behaviors: {
        'l20n': {},
        'contextual': {
            'destroyOnClose': true,
            'appendToBody': true,
        },
    },

    ui: {
        'nextBtn': '.next_btn',
        'cancelBtn': '.cancel_btn',
        'contextual': '.contextual',
    },

    events: {
        'click @ui.cancelBtn': 'onClickCancel',
        'click @ui.nextBtn': 'onClickNext',
    },

    initialize: function (options) {
        this._radio = Wreqr.radio.channel('global');
        this._map = this._radio.reqres.request('map');

        return this.render();
    },

    open: function () {
        this.triggerMethod('open');
        return this;
    },

    close: function () {
        this.triggerMethod('close');
        return this;
    },

    onOpen: function () {
        MapUi.showContributionCross();
    },

    onBeforeClose: function () {
        MapUi.hideContributionCross();
    },

    onClickCancel: function () {
        this.close();
    },

    onClickNext: function () {
        const center = this._map.getCenter();

        if ( this.collection.models.length === 0 ) {
            this._radio.commands.execute('column:showContribForm', { center });
        }
        else {
            this._radio.commands.execute('column:showContribColumn', { center });
        }

        this.close();
    },
});