window.wp = window.wp || {};

( function( exports, $ ) {

	var api = exports.OB || {};

	api.Metabox = Backbone.Model.extend( {
		defaults: {
			'title': '',
			'description': '',
			'fields': {},
			'settings': {},
			'rendered': false
		},
		initialize: function() {
			this.add_fields( this.get( 'fields') );
			this.set_settings( this.get( 'settings' ) );
		},
		add_fields: function( data ) {
			this.set( 'fields', api.FieldConstructor( data, { parent: this } ) );

			return this;
		},
		get_field: function( key ) {
			if ( this.get( 'fields')[key] != null ) return this.get( 'fields')[key];

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
			this.view = new api.Metabox_View( { model: this, el: $( '#' + this.id + ' .ob-metabox-wrapper' ) } );
			this.listenTo( this.view, 'render', this.render_fields );

			this.trigger( 'render' );

			return this;
		},
		render_fields: function() {
			var fields = this.get( 'fields' );
			for ( key in fields ) {
				fields[key].render();
			}
		},
		generate_names: function( key ) {
			this.set( 'name', '_' + key );

			var fields = this.get( 'fields' );
			for ( key in fields ) {
				fields[key].generate_names();
			}
		}
	} );

	api.Metabox_View = Backbone.View.extend( {
		className: 'ob-metabox',
		template: wp.template( 'ob-metabox' ),
		initialize: function() {
			this.listenTo( this.model, 'render', this.render );
		},
		render: function() {
			this.$el.html( this.template( { description: this.model.get( 'description' ) } ) );
			this.model.set( 'rendered', true );
			this.trigger( 'render' );

			return this;
		},
		getFieldsEl: function() {
			if ( this.$fields ) return this.$fields;

			var fields = $( '.fields', this.$el );
			if ( ! fields.length ) {
				this.$el.append( '<div class="fields" />');
				fields = $( '.fields', this.$el );
			}

			this.$fields = fields;

			return this.$fields;
		}
	} );

	_.extend( exports.OB, api );

} ) ( wp, jQuery )