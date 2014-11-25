window.wp = window.wp || {};

( function( exports, $ ) {

	var api = exports.OB || {};

	api.Setting = Backbone.Model.extend( {
		defaults: {
			'default_value': '',
			'value': null,
			'field': null
		},
		initialize: function() {
			if ( this.get( 'value' ) == null )
				this.set( 'value', this.get( 'default_value' ) );

			this.on( 'change:value', this.changeValue );
		},
		changeValue: function( model, current, options ) {
			if ( current == undefined || current == null ) {
				this.set( 'value', this.get( 'default_value' ), { silent: true } );
			}
		}
	} );

	api.Field = Backbone.Model.extend( {
		defaults: {
			'id': '',
			'label': '',
			'name': '',
			'description': '',
			'default_value': '',
			'collection_child': null,
			'rendered': false
		},
		initialize: function() {
			this.set( 'name', this.cid );
			this.set( 'setting', new api.Setting( { default_value: this.get( 'default_value' ), field: this } ) );
		},
		set_settings: function( data ) {
			this.get( 'setting' ).set( 'value', data );

			return this;
		},
		render: function() {
			if ( ! this.view )
				api.FieldViewConstructor( {model: this } );

			this.trigger( 'render' );

			return this;
		},
		generate_names: function() {
			var
				id = this.get( 'id' ),
				parent = this.get( 'parent' );
			var name = '';

			if ( parent )
				name += parent.get( 'name' );

			if ( ( id + '' ).length )
				name += '_' + id;

			this.set( 'name', name );
		}
	} );

	api.Field_View = Backbone.View.extend( {
		className: 'ob-field',
		template: function( data ) {
			console.log( 'ob-field-' + this.model.get( 'type' ) );
			var id = wp.hasTemplate( 'ob-field-' + this.model.get( 'type' ) ) ? 'ob-field-' + this.model.get( 'type' ) : 'ob-field';
			return wp.template( id )( data );
		},
		initialize: function() {
			this.listenTo( this.model, 'render', this.render );
			this.listenTo( this.model, 'change:name', this.updateName );
		},
		render: function() {
			var data = {},
				rendered = false;
			_.extend( data, this.model.attributes );
			if ( this.model.has( 'setting' ) )
				_.extend( data, this.model.get( 'setting' ).attributes );

			if ( this.model.get( 'rendered' ) !== true ) {
				this.$el.html( this.template( data ) );
				this.model.set( 'rendered', true );
				rendered = true;
			}

			this.appendToParent();

			if ( rendered ) {
				this.trigger( 'render' );
			}

			return this;
		},
		getFieldsEl: function() {
			if ( this.$fields ) return this.$fields;

			var fields = $( '>.fields', this.$el );
			if ( ! fields.length ) {
				this.$el.append( '<div class="fields" />');
				fields = $( '>.fields', this.$el );
			}

			this.$fields = fields;

			return this.$fields;
		},
		appendToParent: function() {
			var parent = this.model.get( 'parent' );
			if ( parent && parent.view.getFieldsEl().find( this.$el ).length < 1 ) {
				parent.view.getFieldsEl().append( this.$el );
			}
		},
		updateName: function( model, value, options ) {
			var prevValue = model.previous( 'name' );
			$( '[name="' + prevValue + '"]', this.$el ).each( function() {
				$( this ).attr( 'name', $( this ).attr( 'name' ).replace( prevValue, value ) );
			} );
		}
	} );

	_.extend( exports.OB, api );

} ) ( wp, jQuery )