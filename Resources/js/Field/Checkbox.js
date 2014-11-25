window.wp = window.wp || {};

( function( exports, $ ) {

	var api = exports.OB || {};

	api.Field_Checkbox = api.Field.extend( {
		defaults: _.extend( {}, api.Field.prototype.defaults, {
			'type': 'checkbox'
		} ),
	} );

	api.add( 'checkbox', {
		model: api.Field_Checkbox,
		view: api.Field_View
	} );

	_.extend( exports.OB, api );

} ) ( wp, jQuery )