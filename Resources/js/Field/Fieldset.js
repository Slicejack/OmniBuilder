window.wp = window.wp || {};

( function( exports, $ ) {

	var api = exports.OB || {};

	api.Fieldset = api.Field.extend( {
		defaults: _.extend( {}, api.Field.prototype.defaults, {
			'fields': {},
			'type': 'fieldset'
		} ),
		initialize: function() {
			this.add_fields( this.get( 'fields' ) );
		},
		add_fields: function( data ) {
			this.set( 'fields', api.FieldConstructor( data, { parent: this } ) );

			return this;
		},
		get_field: function( key ) {
			if ( this.get( 'fields')[key] != null ) return this.get( 'fields' )[key];

			return false;
		},
		set_settings: function( data ) {
			for ( key in data ) {
				var field = this.get_field( key )
				if ( field != false ) {
					field.set_settings( data[key] );
				}
			}
		},
		render: function() {
			if ( ! this.view ) {
				api.FieldViewConstructor( { model: this } );
				this.listenTo( this.view, 'render', this.render_fields );
			}

			this.trigger( 'render' );

			return this;
		},
		render_fields: function() {
			var fields = this.get( 'fields' );
			for ( key in fields ) {
				fields[key].render();
			}
		},
		generate_names: function() {
			api.Field.prototype.generate_names.apply( this );

			var fields = this.get( 'fields' );
			for ( key in fields ) {
				fields[key].generate_names();
			}
		}
	} );

	api.Fieldset_View = api.Field_View.extend( {
		className: 'ob-fieldset',
		template: wp.template( 'ob-fieldset' )
	} );

	_.extend( api.FieldConstructor.types, {
		'fieldset': api.Fieldset
	} );

	_.extend( api.FieldViewConstructor.types, {
		'fieldset': api.Fieldset_View
	} );

	api.add( 'fieldset', {
		model: api.Fieldset,
		view: api.Fieldset_View
	} );

	_.extend( exports.OB, api );

} ) ( wp, jQuery )