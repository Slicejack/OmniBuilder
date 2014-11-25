window.wp = window.wp || {};

( function( exports, $ ) {

	var api = exports.OB || {};

	api.Field_Text = api.Field.extend( {
		defaults: _.extend( {}, api.Field.prototype.defaults, {
			'type': 'text'
		} ),
	} );

	api.add( 'text', {
		model: api.Field_Text,
		view: api.Field_View
	} );

	_.extend( exports.OB, api );

} ) ( wp, jQuery )