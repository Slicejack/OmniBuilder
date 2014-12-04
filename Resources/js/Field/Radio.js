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
	 * Radio Field model
	 * @class Field_Radio
	 * @extends {Field}
	 */
	api.Field_Radio = api.Field.extend( {
		/**
		 * Default options
		 * @memberOf Field_Radio
		 * @type {Object}
		 * @extends {Field.prototype.defaults}
		 */
		defaults: _.extend( {}, api.Field.prototype.defaults, {
			'type': 'radio',
			'choices': {}
		} ),
	} );

	/**
	 * Add Radio Field to OmniBuilder
	 */
	api.add( 'radio', {
		model: api.Field_Radio,
		view: api.Field_View
	} );

	/**
	 * Extend OmniBuilder API
	 */
	_.extend( exports.OB, api );

} ) ( wp, jQuery )