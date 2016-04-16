/**
 * WordPress global object
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
	 * Setting model handles value changing
	 * @class Setting
	 * @extends {Backbone.Model}
	 */
	api.Setting = Backbone.Model.extend( {
		/**
		 * Default options
		 * @memberOf Setting
		 * @type {Object}
		 */
		defaults: {
			'default_value': '',
			'value': null,
			'field': null
		},
		/**
		 * Initialize Setting model
		 * @memberOf Setting
		 */
		initialize: function() {
			// If value has not been setted then set a default_value
			if ( this.get( 'value' ) == null )
				this.set( 'value', this.get( 'default_value' ) );

			this.on( 'change:value', this.changeValue );
		},
		changeValue: function( model, current, options ) {
			if ( current == undefined || current == null )
				this.set( 'value', this.get( 'default_value' ), { silent: true } );
		}
	} );

	/**
	 * Default Field model
	 * @class Field
	 * @extends {Backbone.Model}
	 */
	api.Field = Backbone.Model.extend( {
		/**
		 * Default options
		 * @memberOf Field
		 * @type {Object}
		 */
		defaults: {
			'id': '',
			'label': '',
			'name': '',
			'description': '',
			'default_value': '',
			'attributes': {},
			'rendered': false,
			'can_be_focused': true
		},
		/**
		 * Initialize Field model
		 * @memberOf Field
		 */
		initialize: function() {
			this.set( 'name', this.cid );
			this.set( 'setting', new api.Setting( { default_value: this.get( 'default_value' ), field: this } ) );
			this.on( 'focus', this.focus );
		},
		/**
		 * Set setting value
		 * @memberOf Field
		 * @param {String|Array|Object} data Field value
		 * @return {Field} `this`
		 */
		set_settings: function( data ) {
			this.get( 'setting' ).set( 'value', data );

			return this;
		},
		/**
		 * Render Field View
		 * @memberOf Field
		 * @return {Field} `this`
		 */
		render: function() {
			if ( ! this.view )
				api.FieldViewConstructor( { model: this } );

			this.trigger( 'render' );

			return this;
		},
		/**
		 * Generate Field name
		 * @memberOf Field
		 * @return {Field} `this`
		 */
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

			return this;
		},
		/**
		 * Collect values
		 * @memberOf Field
		 * @return {Field} `this`
		 */
		collect_values: function() {
			var value = this.view.get_value();
			this.get( 'setting' ).set( 'value', value );
		},
		focus: function() {
			if ( ! this.view ) {
				this.once( 'render', this.focus );
				return;
			}
			this.view.trigger( 'focus' );
		}
	} );

	/**
	 * Default Field view
	 * @class Field_View
	 * @extends {Backbone.View}
	 */
	api.Field_View = Backbone.View.extend( {
		appended: false,
		/**
		 * DOM Element class attribute
		 * @memberOf Field_View
		 * @type {String}
		 */
		className: 'ob-field',
		/**
		 * Find Field template and generate DOM Element
		 * @memberOf Field_View
		 * @param  {Object} data Field template data
		 * @return {Element}
		 */
		template: function( data ) {
			var id = wp.hasTemplate( 'ob-field-' + this.model.get( 'type' ) ) ? 'ob-field-' + this.model.get( 'type' ) : 'ob-field';
			return wp.template( id )( data );
		},
		/**
		 * Listen to some model events
		 * @memberOf Field_View
		 */
		initialize: function() {
			this.listenTo( this.model, 'render', this.render );
			this.listenTo( this.model, 'change:name', this.updateName );
			this.on( 'appended', function() {
				this.appended = true;
			} );
			this.on( 'focus', this.focus );

			this.trigger( 'initialize' );
		},
		/**
		 * Field render
		 * @memberOf Field_View
		 * @return {Field_View} `this`
		 */
		attributesToString: function( data ) {
			var attrs = data || {};

			if ( _.size( attrs ) < 1 ) return '';

			var attributes = '';
			for ( attr in attrs ) {
				attributes += ' ' + attr.toLowerCase() + '=' + attrs[ attr ] + '';
			}

			return attributes;
		},
		/**
		 * Parse data
		 * @param  {Object} data
		 * @return {Object} data
		 */
		parseData: function( data ) {
			return data;
		},
		getData: function() {
			var data = {};
			_.extend( data, this.model.attributes );
			if ( this.model.has( 'setting' ) )
				_.extend( data, this.model.get( 'setting' ).attributes );

			data.attributes = this.attributesToString( data.attributes );

			return this.parseData( data );
		},
		render: function() {
			if ( ! this.appended ) {
				var rendered = false;

				if ( this.model.get( 'rendered' ) !== true ) {
					var data = this.getData();

					this.$el.html( this.template( data ) );
					this.model.set( 'rendered', true );
					rendered = true;
				}

				this.appendToParent();

				if ( rendered ) {
					this.trigger( 'render' );
				}
			} else {
				api.render( function() {
					var data = this.getData();

					this.$el.html( this.template( data ) );
					this.model.set( 'rendered', true );
					this.trigger( 'render' );
				}.bind( this) );
			}

			return this;
		},
		/**
		 * Returns fields element
		 * @memberOf Field_View
		 * @return {Element}
		 */
		getFieldsEl: function() {
			if ( this.$fields ) return this.$fields;

			var fields = $( $( '.fields', this.$el )[0] );
			if ( ! fields.length ) {
				this.$el.append( '<div class="fields" />' );
				fields = $( $( '.fields', this.$el )[0] );
			}

			this.$fields = fields;

			return this.$fields;
		},
		/**
		 * Append view element to parent element
		 * @memberOf Field_View
		 * @return {Field_View} `this`
		 */
		appendToParent: function() {
			var parent = this.model.get( 'parent' );
			if ( parent && parent.view && false === parent.view.appended && parent.view.getFieldsEl().find( this.$el ).length < 1 ) {
				parent.view.getFieldsEl().append( this.$el );
				this.listenTo( parent.view, 'appended', function() {
					this.trigger( 'appended' );
				} );
			} else {
				api.render( function() {
					var parent = this.model.get( 'parent' );
					if ( parent && parent.view.getFieldsEl().find( this.$el ).length < 1 ) {
						parent.view.getFieldsEl().append( this.$el );

						api.render( function() {
							this.trigger( 'appended' );
						}.bind( this ) );
					}
				}.bind( this ) );
			}

			return this;
		},
		/**
		 * Replace old name with new name
		 * @memberOf Field_View
		 * @param  {Object} model   This model
		 * @param  {String} value   New value
		 * @param  {Object} options
		 */
		updateName: function( model, value, options ) {
			var prevValue = model.previous( 'name' );
			$( '[name^="' + prevValue + '"]', this.$el ).each( function() {
				var $self = $( this );
				var name = $self.attr( 'name' );
				var id = $self.attr( 'id' );

				var new_attrs = {};

				if ( name !== undefined && name.length )
					new_attrs[ 'name' ] = name.replace( prevValue, value );

				if ( id !== undefined && id.length )
					new_attrs[ 'id' ] = id.replace( prevValue, value );

				$self.attr( new_attrs );
			} );
		},
		/**
		 * Gets value of live DOM input element
		 * @return {string|object|null} Returns null if there is not input elements, string if there is one input element and object if there is two or more input elements.
		 */
		get_value: function() {
			var input_els = $( 'input, textarea, select', this.$el );

			if ( input_els.length < 1 )
				return null;

			if ( input_els == 1 )
				return input_els.val();

			var value = {};
			var el;
			for ( var i = 0, l = input_els.length; i < l; i++ ) {
				el = input_els.eq( i );
				value[ el.attr( 'id' ) ] = el.val();
			}

			return value;
		},
		focus: function() {
			if ( this.appended ) {
				$( 'input, textarea, select', this.$el ).first().focus();
			} else {
				this.once( 'appended', function() {
					$( 'input, textarea, select', this.$el ).first().focus();
				} );
			}
		}
	} );

	/**
	 * Extend OmniBuilder API
	 */
	_.extend( exports.OB, api );

} ) ( wp, jQuery )