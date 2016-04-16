/**
 * WordPress global object
 * @module  wp
 * @type {Object}
 */
window.wp = window.wp || {};
/**
 * Omnibuilder data object
 * @type {Object}
 */
window.ob = window.ob || {};

/**
 * @param  {Object} exports WordPress global object `wp`
 * @param  {Object} data    Omnibuilder data object `ob`
 * @param  {Object} $       jQuery object `jQuery`
 */
( function( exports, data, $ ) {

	/**
	 * Check if WordPress template exists
	 * @function hasTemplate
	 * @param  {String} id Template ID
	 * @return {Boolean}
	 */
	exports.hasTemplate = _.memoize(function( id ) {
		return $( '#tmpl-' + id ).length ? true : false;
	});

	/**
	 * OmniBuilder API
	 * @module OB
	 * @type {Object}
	 */
	var api = {};

	api.toRender = [];
	api.callbacks = [];

	var renderIterationIndex = 0;
	var renderIterationLength = 0;
	api.renderIterationMaxLength = 50;
	api.toRenderLength = function() {
		var length = api.toRender.length;
		return length < api.renderIterationMaxLength ? length : api.renderIterationMaxLength;
	};

	api.renderTick = function() {
		if ( 0 === ( renderIterationLength = api.toRenderLength() ) ) {
			window.requestAnimationFrame( api.renderTick );
			return;
		}
		for ( renderIterationIndex = 0, renderIterationLength = api.toRenderLength(); renderIterationIndex < renderIterationLength; renderIterationIndex += 1 ) {
			api.toRender[renderIterationIndex].call();
			api.toRender[renderIterationIndex] = null;
		}

		api.toRender = _.filter( api.toRender, function( func ) { return null !== func; } );

		window.requestAnimationFrame( api.renderTick );
		return;
	};

	api.render = function( func ) {
		if ( 'function' === typeof func ) {
			api.toRender.push( func );
		}
	};

	/**
	 * Create Fields from given data
	 * @private
	 * @function FieldConstructor
	 * @param {Object} data    Fields informations (id, label, default_value, ...)
	 * @param {Object} options Currently you can only define fields parent object
	 * @return {Object} fields Created fields
	 */
	api.FieldConstructor = function( data, options ) {
		var options = options || {};
		var data = data || {};
		var parent = options.parent || false;
		var fields = {};

		for ( key in data ) {
			data[key].id = key;
			if ( parent ) data[key].parent = parent;

			var constructor = api.FieldConstructor.types[ data[key].type ] || api.Field;
			fields[key] = new constructor( data[key] );
		}

		return fields;
	};

	/**
	 * All Field models
	 * @private
	 * @type {Object}
	 */
	api.FieldConstructor.types = {};


	/**
	 * Create and add Field view object to his model object
	 * @private
	 * @function FieldViewConstructor
	 * @param {Object} data Options param of Field view object
	 * @return {Void}
	 */
	api.FieldViewConstructor = function( data ) {
		var data = data || {};
		var model = data.model || false;

		if ( !model ) return;

		var constructor = api.FieldViewConstructor.types[ model.get( 'type' ) ] || api.Field_View;
		model.view = new constructor( data );
	};

	/**
	 * All Field views
	 * @private
	 * @type {Object}
	 */
	api.FieldViewConstructor.types = {};

	/**
	 * Add your Field model and view object to OmniBuilder
	 * @function add
	 * @param {String} type    Field type
	 * @param {Object} options Define your model and view
	 * @return {Boolean}
	 * @example api.add( 'myfield', { model: api.MyField, view: api.MyFieldView } )
	 */
	api.add = function( type, options ) {
		var type = type || false;
		var options = options || {};
		var data;

		if ( !type ) return false;

		if ( options.model ) {
			data = {};
			data[type] = options.model;

			_.extend( api.FieldConstructor.types, data );
		}

		if ( options.view ) {
			data = {};
			data[type] = options.view;

			_.extend( api.FieldViewConstructor.types, data );
		}

		return true;
	}

	/**
	 * OmniBuilder model
	 * @private
	 * @class OmniBuilder
	 * @extends {Backbone.Model}
	 */
	api.OmniBuilder = Backbone.Model.extend( {
		/**
		 * Default options
		 * @private
		 * @memberOf OmniBuilder
		 * @type {Object}
		 */
		defaults: {
			'metaboxes': {},
			'rendered': false
		},
		/**
		 * Constructor
		 * @private
		 * @memberOf OmniBuilder
		 * @param  {Object} attrs   Metabox informations
		 * @param  {Object} options
		 * @return {OmniBuilder} `this`
		 */
		constructor: function( attrs, options ) {
			var attrs = attrs || {};

			Backbone.Model.apply( this, [ {}, options ] );
			this.add_metaboxes( attrs );
			this.render();

			return this;
		},
		/**
		 * Here we listen to some events
		 * @private
		 * @memberOf OmniBuilder
		 */
		initialize: function() {
			this.listenTo( api.postForm, 'generate_names', this.generate_names );
		},
		/**
		 * Create metaboxes from given data
		 * @private
		 * @memberOf OmniBuilder
		 * @param {Object} data Metaboxes informations
		 * @return {OmniBuilder} `this`
		 */
		add_metaboxes: function( data ) {
			for ( key in data ) {
				this.add_metabox( key, data[key] );
			}

			return this;
		},
		/**
		 * Create metabox
		 * @private
		 * @memberOf OmniBuilder
		 * @requires Metabox
		 * @param {String} key  Metabox ID
		 * @param {Object} data Metabox informations
		 * @return {OmniBuilder} `this`
		 */
		add_metabox: function( key, data ) {
			var metaboxes = this.get( 'metaboxes' );

			if ( typeof data.isValid !== 'function' ) {
				data.id = key;
				data = new api.Metabox( data );
			}

			if ( data.isValid() )
				metaboxes[ key ] = data;

			this.set( 'metaboxes', metaboxes );

			return this;
		},
		/**
		 * Render each metabox
		 * @private
		 * @memberOf OmniBuilder
		 * @return {OmniBuilder} `this`
		 */
		render: function() {
			var metaboxes = this.get( 'metaboxes' );
			for ( key in metaboxes )
				metaboxes[key].render();
			this.set( 'rendered', true );

			return this;
		},
		/**
		 * Call generate_names function on each metabox
		 * @private
		 * @memberOf OmniBuilder
		 * @return {OmniBuilder} `this`
		 */
		generate_names: function() {
			var metaboxes = this.get( 'metaboxes' );
			for ( key in metaboxes )
				metaboxes[key].generate_names( key );

			return this;
		}
	} );

	/**
	 * Empty object
	 * @type {Object}
	 */
	api.postForm = {};

	/**
	 * WordPress post form view
	 * @private
	 * @class postForm_View
	 * @extends {Backbone.View}
	 */
	api.postForm_View = Backbone.View.extend( {
		/**
		 * Form ID
		 * @private
		 * @memberOf postForm_View
		 * @type {String}
		 */
		el: '#post',
		/**
		 * Listen to events
		 * @private
		 * @memberOf postForm_View
		 * @type {Object}
		 */
		events: {
			'submit': 'submit'
		},
		/**
		 * Trigger generate_names event on form submit event
		 * @private
		 * @memberOf postForm_View
		 */
		submit: function( event ) {
			this.trigger( 'generate_names' );
		}
	} );

	$( document ).ready( function() {
		api.postForm = new api.postForm_View();

		if ( data ) {
			window.ob_test = new api.OmniBuilder( _.extend( {}, data ) );
		}

		window.requestAnimationFrame( api.renderTick );
	} );

	/**
	 * Export api to wp.OB
	 */
	exports.OB = api;

} ) ( wp, ob, jQuery )