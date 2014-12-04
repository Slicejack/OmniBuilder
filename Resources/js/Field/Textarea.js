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
	 * Textarea Field model
	 * @class Field_Textarea
	 * @extends {Field}
	 */
	api.Field_Textarea = api.Field.extend( {
		/**
		 * Default options
		 * @memberOf Field_Textarea
		 * @type {Object}
		 * @extends {Field.prototype.defaults}
		 */
		defaults: _.extend( {}, api.Field.prototype.defaults, {
			'type': 'textarea'
		} ),
	} );

	/**
	 * Add Textarea Field to OmniBuilder
	 */
	api.add( 'textarea', {
		model: api.Field_Textarea,
		view: api.Field_View
	} );

	/**
	 * Extend OmniBuilder API
	 */
	_.extend( exports.OB, api );

} ) ( wp, jQuery )