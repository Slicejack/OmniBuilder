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
			'rendered': false
		},
		/**
		 * Initialize Field model
		 * @memberOf Field
		 */
		initialize: function() {
			this.set( 'name', this.cid );
			this.set( 'setting', new api.Setting( { default_value: this.get( 'default_value' ), field: this } ) );
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
				api.FieldViewConstructor( {model: this } );

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
		}
	} );

	/**
	 * Default Field view
	 * @class Field_View
	 * @extends {Backbone.View}
	 */
	api.Field_View = Backbone.View.extend( {
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
		},
		/**
		 * Field render
		 * @memberOf Field_View
		 * @return {Field_View} `this`
		 */
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

			if ( rendered )
				this.trigger( 'render' );

			return this;
		},
		/**
		 * Returns fields element
		 * @memberOf Field_View
		 * @return {Element}
		 */
		getFieldsEl: function() {
			if ( this.$fields ) return this.$fields;

			var fields = $( '>.fields', this.$el );
			if ( ! fields.length ) {
				this.$el.append( '<div class="fields" />' );
				fields = $( '>.fields', this.$el );
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
			if ( parent && parent.view.getFieldsEl().find( this.$el ).length < 1 )
				parent.view.getFieldsEl().append( this.$el );

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
			$( '[name="' + prevValue + '"]', this.$el ).each( function() {
				$( this ).attr( 'name', $( this ).attr( 'name' ).replace( prevValue, value ) );
			} );
		}
	} );

	/**
	 * Extend OmniBuilder API
	 */
	_.extend( exports.OB, api );

} ) ( wp, jQuery )