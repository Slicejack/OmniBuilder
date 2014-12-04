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
	 * Select Field model
	 * @class Field_Select
	 * @extends {Field}
	 */
	api.Field_Select = api.Field.extend( {
		/**
		 * Default options
		 * @memberOf Field_Select
		 * @type {Object}
		 * @extends {Field.prototype.defaults}
		 */
		defaults: _.extend( {}, api.Field.prototype.defaults, {
			'type': 'select',
			'choices': {}
		} ),
	} );

	/**
	 * Add Radio Field to OmniBuilder
	 */
	api.add( 'select', {
		model: api.Field_Select,
		view: api.Field_View
	} );

	/**
	 * Extend OmniBuilder API
	 */
	_.extend( exports.OB, api );

} ) ( wp, jQuery )