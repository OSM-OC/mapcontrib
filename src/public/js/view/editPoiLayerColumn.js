

define([

	'underscore',
	'backbone',
	'marionette',
	'bootstrap',
	'templates',
],
function (

	_,
	Backbone,
	Marionette,
	Bootstrap,
	templates
) {

	'use strict';

	return Marionette.ItemView.extend({

		template: JST['editPoiLayerColumn.html'],

		behaviors: {

			'l20n': {},
			'column': {},
		},

		ui: {

			'column': '#edit_poi_layer_column',

			'layerName': '#layer_name',
			'layerDescription': '#layer_description',
			'layerOverpassRequest': '#layer_overpass_request',
			'layerPopupContent': '#layer_popup_content',

			'marker': '.marker',
			'editMarkerButton': '.edit_marker_btn',
		},

		events: {

			'click @ui.editMarkerButton': 'onClickEditMarker',
			'submit': 'onSubmit',
			'reset': 'onReset',
		},

		templateHelpers: function () {

			return {

				'markerIcon': this._radio.reqres.request('poiLayerHtmlIcon', this.model),
			};
		},

		initialize: function () {

			var self = this;

			this._radio = Backbone.Wreqr.radio.channel('global');

			this._oldModel = this.model.clone();

			this.model.on('change', this.updateMarkerIcon, this);
		},

		open: function () {

			this.triggerMethod('open');
		},

		close: function () {

			this.triggerMethod('close');
		},

		updateMarkerIcon: function () {

			var html = this._radio.reqres.request('poiLayerHtmlIcon', this.model);

			this.ui.marker.replaceWith( html );

			this.bindUIElements();
		},

		onClickEditMarker: function () {

			this._radio.commands.execute( 'modal:showEditPoiMarker', this.model.get('_id') );
		},

		onSubmit: function (e) {

			e.preventDefault();

			var self = this,
			updateMarkers = false;

			this.model.set('name', this.ui.layerName.val());
			this.model.set('description', this.ui.layerDescription.val());
			this.model.set('overpassRequest', this.ui.layerOverpassRequest.val());
			this.model.set('popupContent', this.ui.layerPopupContent.val());

			if ( !this.model.get('_id') ) {

				this._radio.reqres.request('poiLayers').add( this.model );
			}

			if ( this._oldModel.get('markerColor') !== this.model.get('markerColor') ) {

				updateMarkers = true;
			}

			if ( this._oldModel.get('markerIcon') !== this.model.get('markerIcon') ) {

				updateMarkers = true;
			}

			if ( this._oldModel.get('markerShape') !== this.model.get('markerShape') ) {

				updateMarkers = true;
			}

			this.model.save({}, {

				'success': function () {

					if ( updateMarkers ) {

						self._radio.commands.execute('map:updatePoiLayerIcons', self.model);
					}

					self.close();
				},
				'error': function () {

					// FIXME
					console.error('nok');
				},
			});
		},

		onReset: function () {

			this.model.set( this._oldModel.toJSON() );

			this.ui.column.one('transitionend', this.render);

			this.close();
		},
	});
});
