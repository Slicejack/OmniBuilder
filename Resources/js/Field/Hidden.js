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
	 * Hidden Field model
	 * @class Field_Hidden
	 * @extends {Field}
	 */
	api.Field_Hidden = api.Field.extend( {
		/**
		 * Default options
		 * @memberOf Field_Hidden
		 * @type {Object}
		 * @extends {Field.prototype.defaults}
		 */
		defaults: _.extend( {}, api.Field.prototype.defaults, {
			'type': 'hidden',
			'can_be_focused': false
		} ),
	} );

	/**
	 * Hidden Field view
	 * @class Field_Hidden_View
	 * @extends {Field}
	 */
	api.Field_Hidden_View = api.Field_View.extend( {
		className: 'ob-field-hidden'
	} );

	/**
	 * Add Hidden Field to OmniBuilder
	 */
	api.add( 'hidden', {
		model: api.Field_Hidden,
		view: api.Field_Hidden_View
	} );

	/**
	 * Extend OmniBuilder API
	 */
	_.extend( exports.OB, api );

} ) ( wp, jQuery )