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
	 * Text Field model
	 * @class Field_Text
	 * @extends {Field}
	 */
	api.Field_Text = api.Field.extend( {
		/**
		 * Default options
		 * @memberOf Field_Text
		 * @type {Object}
		 * @extends {Field.prototype.defaults}
		 */
		defaults: _.extend( {}, api.Field.prototype.defaults, {
			'type': 'text'
		} ),
	} );

	/**
	 * Add Text Field to OmniBuilder
	 */
	api.add( 'text', {
		model: api.Field_Text,
		view: api.Field_View
	} );

	/**
	 * Extend OmniBuilder API
	 */
	_.extend( exports.OB, api );

} ) ( wp, jQuery )