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
	 * Metabox model
	 * @class Metabox
	 * @extends {Backbone.Model}
	 */
	api.Metabox = Backbone.Model.extend( {
		/**
		 * Default options
		 * @memberOf Metabox
		 * @type {Object}
		 */
		defaults: {
			'title': '',
			'description': '',
			'fields': {},
			'settings': {},
			'rendered': false
		},
		/**
		 * Initialize Metabox
		 * @memberOf Metabox
		 */
		initialize: function() {
			this.add_fields( this.get( 'fields' ) );
			this.set_settings( this.get( 'settings' ) );
		},
		/**
		 * Add fields to Metabox
		 * @memberOf Metabox
		 * @param {Object} data Fields informations
		 * @return {Metabox} `this`
		 */
		add_fields: function( data ) {
			this.set( 'fields', api.FieldConstructor( data, { parent: this } ) );

			return this;
		},
		/**
		 * Return Field with given key as Field ID. This function does not go deeper of first childs.
		 * @memberOf Metabox
		 * @param  {String} key Field ID
		 * @return {Object|Boolean} Return false if Field with that Field ID does not exist.
		 */
		get_field: function( key ) {
			if ( this.get( 'fields' )[key] != null ) return this.get( 'fields' )[key];

			return false;
		},
		/**
		 * Set settings to fields
		 * @memberOf Metabox
		 * @param {Object} data Settings informations
		 * @return {Metabox} `this`
		 */
		set_settings: function( data ) {
			for ( key in data ) {
				var field = this.get_field( key )
				if ( field != false )
					field.set_settings( data[key] );
			}

			return this;
		},
		/**
		 * Render Metabox
		 * @memberOf Metabox
		 * @return {Metabox} `this`
		 */
		render: function() {
			this.view = new api.Metabox_View( { model: this, el: $( '#' + this.id + ' .ob-metabox-wrapper' ) } );
			this.listenTo( this.view, 'render', this.render_fields );

			this.trigger( 'render' );

			return this;
		},
		/**
		 * Render Fields
		 * @memberOf Metabox
		 * @return {Metabox} `this`
		 */
		render_fields: function() {
			var fields = this.get( 'fields' );
			for ( key in fields )
				fields[key].render();

			return this;
		},
		/**
		 * Generate names on each field
		 * @memberOf Metabox
		 * @param  {String} key Metabox ID
		 * @return {Metabox} `this`
		 */
		generate_names: function( key ) {
			this.set( 'name', '_' + key );

			var fields = this.get( 'fields' );
			for ( key in fields )
				fields[key].generate_names();

			return this;
		}
	} );

	/**
	 * Metabox view
	 * @class Metabox_View
	 * @extends {Backbone.View}
	 */
	api.Metabox_View = Backbone.View.extend( {
		/**
		 * DOM Element class attribute
		 * @memberOf Metabox_View
		 * @type {String}
		 */
		className: 'ob-metabox',
		/**
		 * Metabox template
		 * @memberOf Metabox_View
		 * @type {Object}
		 */
		template: wp.template( 'ob-metabox' ),
		/**
		 * Listen to some model events
		 * @memberOf Metabox_View
		 */
		initialize: function() {
			this.listenTo( this.model, 'render', this.render );
		},
		/**
		 * Metabox render
		 * @memberOf Metabox_View
		 * @return {Metabox_View} `this`
		 */
		render: function() {
			this.$el.html( this.template( { description: this.model.get( 'description' ) } ) );
			this.model.set( 'rendered', true );
			this.trigger( 'render' );

			return this;
		},
		/**
		 * Returns fields element
		 * @memberOf Metabox_View
		 * @return {Element}
		 */
		getFieldsEl: function() {
			if ( this.$fields ) return this.$fields;

			var fields = $( '.fields', this.$el );
			if ( ! fields.length ) {
				this.$el.append( '<div class="fields" />' );
				fields = $( '.fields', this.$el );
			}

			this.$fields = fields;

			return this.$fields;
		}
	} );

	/**
	 * Extend OmniBuilder API
	 */
	_.extend( exports.OB, api );

} ) ( wp, jQuery )