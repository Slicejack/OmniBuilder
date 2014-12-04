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
	 * Fieldset model
	 * @class Fieldset
	 * @extends {api.Field}
	 */
	api.Fieldset = api.Field.extend( {
		/**
		 * Default options
		 * @memberOf Fieldset
		 * @type {Object}
		 * @extends {Field.prototype.defaults}
		 */
		defaults: _.extend( {}, api.Field.prototype.defaults, {
			'fields': {},
			'type': 'fieldset'
		} ),
		/**
		 * Initialize Fieldset model
		 * @memberOf Fieldset
		 */
		initialize: function() {
			this.add_fields( this.get( 'fields' ) );
		},
		/**
		 * Add fields to Fieldset
		 * @memberOf Fieldset
		 * @param {Object} data Fields informations
		 * @return {Fieldset} `this`
		 */
		add_fields: function( data ) {
			this.set( 'fields', api.FieldConstructor( data, { parent: this } ) );

			return this;
		},
		/**
		 * Return Field with given key as Field ID. This function does not go deeper of first childs.
		 * @memberOf Fieldset
		 * @param  {String} key Field ID
		 * @return {Object|Boolean} Return false if Field with that Field ID does not exist.
		 */
		get_field: function( key ) {
			if ( this.get( 'fields' )[key] != null ) return this.get( 'fields' )[key];

			return false;
		},
		/**
		 * @memberOf Fieldset
		 * @inheritDoc
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
		 * @memberOf Fieldset
		 * @inheritDoc
		 */
		render: function() {
			if ( ! this.view ) {
				api.FieldViewConstructor( { model: this } );
				this.listenTo( this.view, 'render', this.render_fields );
			}

			this.trigger( 'render' );

			return this;
		},
		/**
		 * Render Fieldset fields
		 * @memberOf Fieldset
		 * @return {Fieldset} `this`
		 */
		render_fields: function() {
			var fields = this.get( 'fields' );
			for ( key in fields )
				fields[key].render();

			return this;
		},
		/**
		 * @memberOf Fieldset
		 * @inheritDoc
		 */
		generate_names: function() {
			api.Field.prototype.generate_names.apply( this );

			var fields = this.get( 'fields' );
			for ( key in fields )
				fields[key].generate_names();

			return this;
		}
	} );

	/**
	 * Fieldset view
	 * @class Fieldset_View
	 * @extends {Field_View}
	 */
	api.Fieldset_View = api.Field_View.extend( {
		/**
		 * @memberOf Fieldset_View
		 * @inheritDoc
		 */
		className: 'ob-fieldset',
		/**
		 * @memberOf Fieldset_View
		 * @inheritDoc
		 */
		template: wp.template( 'ob-fieldset' )
	} );

	/**
	 * Add Fieldset to OmniBuilder
	 */
	api.add( 'fieldset', {
		model: api.Fieldset,
		view: api.Fieldset_View
	} );

	/**
	 * Extend OmniBuilder API
	 */
	_.extend( exports.OB, api );

} ) ( wp, jQuery )