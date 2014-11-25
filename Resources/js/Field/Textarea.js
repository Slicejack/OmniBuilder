window.wp = window.wp || {};

( function( exports, $ ) {

	var api = exports.OB || {};

	api.Field_Textarea = api.Field.extend( {
		defaults: _.extend( {}, api.Field.prototype.defaults, {
			'type': 'textarea'
		} ),
	} );

	api.add( 'text', {
		model: api.Field_Textarea,
		view: api.Field_View
	} );

	_.extend( exports.OB, api );

} ) ( wp, jQuery )