/**
 * WordPress global variable
 * @type {Object}
 */
window.wp = window.wp || {};

/**
 * @param  {Object} exports WordPress global object `wp`
 * @param  {Object} $       jQuery object `jQuery`
 */
( function( exports, $ ) {

	/**
	 * Load OmniBuilder API
	 * @module OB
	 * @type {Object}
	 */
	var api = exports.OB || {};

	/**
	 * Map Field model
	 * @class Field_Map
	 * @extends {Field}
	 */
	api.Field_Map = api.Field.extend( {
		/**
		 * Default options
		 * @memberOf Field_Map
		 * @type {Object}
		 * @extends {Field.prototype.defaults}
		 */
		defaults: _.extend( {}, api.Field.prototype.defaults, {
			'type': 'map',
			'mapbox_public_token': '',
		} ),
		helpers: {
			validateLat: function( lat ) {
				if ( _.isFinite( lat ) && lat >= -90 && lat <= 90 ) {
					return lat;
				}
				else {
					return 0;
				}
			},
			validateLng: function( lng ) {
				if ( _.isFinite( lng ) && lng >= -180 && lng <= 180 ) {
					return lng;
				}
				else {
					return 0;
				}
			}
		},
		initialize: function() {
			// Validate attributes before initialization.
			var default_value = this.get( 'default_value' );
			var value = this.get( 'value' );

			if ( _.isObject( default_value ) ) {
				default_value['lat'] = this.helpers.validateLat( default_value['lat'] );
				default_value['lng'] = this.helpers.validateLng( default_value['lng'] );
			} else {
				default_value = { lat: 0, lng: 0 };
			}

			this.set( 'default_value', default_value );

			if ( _.isObject( value ) ) {
				value['lat'] = this.helpers.validateLat( value['lat'] );
				value['lng'] = this.helpers.validateLng( value['lng'] );

				this.set( 'value', value );
			}

			api.Field.prototype.initialize.call( this );
		}
	} );

	/**
	 * Map Field view
	 * @class Field_Map_View
	 * @extends {Field_View}
	 */
	api.Field_Map_View = api.Field_View.extend( {
		/**
		 * Element class
		 * @memberOf Field_Map_View
		 * @type {String}
		 * @extends {Field_View.prototype.className}
		 */
		className: api.Field_View.prototype.className + ' ob-field-map',
		/**
		 * Map
		 * @memberOf Field_Map_View
		 * @type {Object}
		 */
		map: null,
		/**
		 * Marker
		 * @memberOf Field_Map_View
		 * @type {Object}
		 */
		marker: null,
		/**
		 * Element events
		 * @memberOf Field_Map_View
		 * @type {Object}
		 */
		events: {
			'change div:not(.ob-field) input.latitude': 'updateMarker',
			'change div:not(.ob-field) input.longitude': 'updateMarker'
		},
		initialize: function() {
			api.Field_View.prototype.initialize.call( this );

			this.on( 'appended', this.initMapbox );
		},
		parseData: function( data ) {
			data['subfields'] = [
				{
					name: data.name + '[lat]',
					label: 'Latitude',
					value: data.value['lat'],
					classes: 'latitude'
				},
				{
					name: data.name + '[lng]',
					label: 'Longitude',
					value: data.value['lng'],
					classes: 'longitude'
				}
			];

			return data;
		},
		setAccessToken: function() {
			var accessToken = this.model.get( 'mapbox_public_token' );
			if ( accessToken.length ) {
				L.mapbox.accessToken = accessToken;
				return true;
			}

			return false;
		},
		initMapbox: function() {
			if ( ! this.setAccessToken() ) {
				return;
			}

			var data = this.getData();

			this.map = L.mapbox.map( this.model.get( 'name' ), 'mapbox.streets', {
				center: [ data.value['lat'], data.value['lng'] ],
				zoom: 9
			} );
			this.marker = L.marker( [ data.value['lat'], data.value['lng'] ], {
				draggable: true
			} );

			this.listenTo( this.marker, 'dragend', this.markerDragEnd );

			this.marker.addTo( this.map );
		},
		markerDragEnd: function( event ) {
			var LatLng = event.target.getLatLng();
			this.updateLatLngInputs( LatLng.lat, LatLng.lng );
		},
		updateLatLngInputs: function( lat, lng ) {
			console.dir( this.model );
			$( '[name="' + this.model.get( 'name' ) + '[lat]"]', this.$el ).val( this.model.helpers.validateLat( lat ) );
			$( '[name="' + this.model.get( 'name' ) + '[lng]"]', this.$el ).val( this.model.helpers.validateLng( lng ) );
		},
		updateMarker: function() {
			console.log( 'update marker' );
			var lat = this.model.helpers.validateLat( $( '[name="' + this.model.get( 'name' ) + '[lat]"]', this.$el ).val() );
			var lng = this.model.helpers.validateLng( $( '[name="' + this.model.get( 'name' ) + '[lng]"]', this.$el ).val() );

			this.updateLatLngInputs( lat, lng ); // Update after validation
			this.marker.setLatLng( [ lat, lng ] );
		},
		get_value: function() {
			var lat = $( '[name="' + this.model.get( 'name' ) + '[lat]"]', this.$el ).val();
			var lng = $( '[name="' + this.model.get( 'name' ) + '[lng]"]', this.$el ).val();

			return {
				'lat': this.model.helpers.validateLat( lat ),
				'lng': this.model.helpers.validateLng( lng )
			};
		}
	} );

	/**
	 * Add Text Field to OmniBuilder
	 */
	api.add( 'map', {
		model: api.Field_Map,
		view: api.Field_Map_View
	} );

	/**
	 * Extend OmniBuilder API
	 */
	_.extend( exports.OB, api );

} ) ( wp, jQuery )
