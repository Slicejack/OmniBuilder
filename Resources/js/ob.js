window.wp = window.wp || {};
window.ob = window.ob || {};

( function( exports, data, $ ) {

	var api = {};

	exports.hasTemplate = _.memoize(function( id ) {
		return $( '#tmpl-' + id ).length ? true : false;
	});

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

	api.FieldConstructor.types = {};

	api.FieldViewConstructor = function( data ) {
		var data = data || {};
		var model = data.model || false;

		if ( !model ) return;

		console.log( model.get( 'type' ) );

		var constructor = api.FieldViewConstructor.types[ model.get( 'type' ) ] || api.Field_View;
		model.view = new constructor( data );
	};

	api.FieldViewConstructor.types = {};

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

	api.OB = Backbone.Model.extend( {
		defaults: {
			'metaboxes': {},
			'rendered': false
		},
		constructor: function( attrs, options ) {
			var attrs = attrs || {};

			Backbone.Model.apply( this, [ {}, options ] );
			this.add_metaboxes( attrs );
			this.render();
		},
		initialize: function() {
			this.listenTo( api.postForm, 'generate_names', this.generate_names );
		},
		add_metaboxes: function( data ) {
			for ( key in data ) {
				this.add_metabox( key, data[key] );
			}

			return this;
		},
		add_metabox: function( key, data ) {
			var metaboxes = this.get( 'metaboxes' );

			if ( typeof data.isValid !== 'function' ) {
				data.id = key;
				data = new api.Metabox( data );
			}

			if ( data.isValid() ) {
				metaboxes[ key ] = data;
			}

			this.set( 'metaboxes', metaboxes );

			return this;
		},
		render: function() {
			var metaboxes = this.get( 'metaboxes' );
			for ( key in metaboxes ) {
				metaboxes[key].render();
			}
			this.set( 'rendered', true );
		},
		generate_names: function() {
			var metaboxes = this.get( 'metaboxes' );
			for ( key in metaboxes ) {
				metaboxes[key].generate_names( key );
			}
		}
	} );

	api.postForm;

	api.postForm_View = Backbone.View.extend( {
		el: '#post',
		events: {
			'submit': 'submit'
		},
		submit: function() {
			this.trigger( 'generate_names' );
		}
	} );

	$( document ).ready( function() {
		api.postForm = new api.postForm_View();

		if ( data ) {
			window.ob_data = _.extend( {}, data );
			window.ob = new api.OB( _.extend( {}, data ) );
		}

	} );

	exports.OB = api;

} ) ( wp, ob, jQuery )