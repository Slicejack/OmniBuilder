window.wp = window.wp || {};

( function( exports, $ ) {

	var api = exports.OB || {};

	api.Collection_Setting =  Backbone.Collection.extend( {
		field: null,
		constructor: function( attrs, models, options ) {
			this.field = attrs.field;
			Backbone.Collection.apply( this, [ models, options ] );
			return this;
		},
		initialize: function() {
			this.on( 'remove reset reindex', this.reIndex );
			this.on( 'add', this.renderNew );
		},
		comparator: function( model ) {
			return model.get( 'id' );
		},
		add: function( models, options ) {
			if ( this.field.get( 'limit' ) >= 0 ) {
				if ( this.size() >= this.field.get( 'limit' ) ) {
					console.warn( 'Limit is exceeded! ' );
					return false;
				}
			}

      if ( options && options.move == true ) {
      	return Backbone.Collection.prototype.add.apply( this, [ models, options ] );
      }

			var data = {
				id: this.size(),
				fields: this.field.get( 'fields' ),
				parent: this.field,
				type: 'collection-fieldset'
			};
			options = models;
			models = new api.Collection_Fieldset( data );
			return this.set( models, _.extend( { merge: false }, options, { add: true, remove: false } ) );
		},
		reIndex: function() {
			var self = this;
			this.forEach( function( model ) {
				model.set( 'id', self.indexOf( model ) );
			} );
		},
		renderNew: function( model ) {
			model.render();
		}
	} );

	api.Collection = api.Field.extend( {
		defaults: _.extend( {}, api.Field.prototype.defaults, {
			'fields': '',
			'limit': -1,
			'dragging': false,
			'type': 'collection'
		} ),
		initialize: function() {
			this.set( 'setting', new api.Collection_Setting( { field: this } ) );
		},
		set_settings: function( data ) {
			var data = _.isArray( data ) ? data : [];
			for ( var i = 0; i < data.length; i++ ) {
				this.get( 'setting' ).add( { silent: true } ).set_settings( data[i] );
			}
		},
		render: function() {
			if ( ! this.view ) {
				api.FieldViewConstructor( { model: this } );
				this.listenTo( this.view, 'render', this.render_fields );
			}

			this.trigger( 'render' );

			return this;
		},
		render_fields: function() {
			this.get( 'setting' ).forEach( function( fieldset ) {
				fieldset.render();
			} );
		},
		move: function( model, index ) {
			var setting = this.get( 'setting' );
			var oldindex = setting.indexOf( model );
			if ( oldindex > -1 ) {
				setting.remove( model, { silent: true } );
				setting.add( model, { at: index, silent: true, move: true } );
				setting.trigger( 'reindex' );
				this.trigger( 'rerender' );
			}
		},
		generate_names: function() {
			api.Field.prototype.generate_names.apply( this );

			if ( this.get( 'setting').size() > 0 ) {
				this.get( 'setting' ).forEach( function( fieldset ) {
					fieldset.generate_names();
				} );
			}
			else {
				this.trigger( 'addEmptyField' );
			}
		}
	} );

	api.Collection_View = api.Field_View.extend( {
		className: 'ob-collection',
		template: wp.template( 'ob-collection' ),
		events: {
			'click >.add': 'add'
		},
		initialize: function() {
			api.Field_View.prototype.initialize.apply( this );

			this.listenTo( this.model, 'change:dragging', this.dragging );
			this.listenTo( this.model, 'rerender', this.rerender );
			this.listenTo( this.model, 'addEmptyField', this.addEmptyField );
		},
		add: function() {
			this.model.get( 'setting' ).add();
		},
		rerender: function() {
			$( '>div', this.getFieldsEl() ).detach();
			this.trigger( 'render' );

			return this;
		},
		dragging: function() {
			var dragging = this.model.get( 'dragging' );
			if ( dragging === false )
				this.$el.removeClass( 'dragging' );
			else
				this.$el.addClass( 'dragging' );
		},
		addEmptyField: function() {
			var emptyField = $( '<input type="hidden" value="0" name="' + this.model.get( 'name' ) + '" />' );
			this.$el.append( emptyField );
		}
	} );

	api.Collection_Fieldset = api.Field.extend( {
		defaults: _.extend( {}, api.Field.prototype.defaults, {
			'fields': {},
			'type': 'collection-fieldset'
		} ),
		initialize: function() {
			this.add_fields( this.get( 'fields' ) );
		},
		add_fields: function( data ) {
			this.set( 'fields', api.FieldConstructor( data, { parent: this } ) );

			return this;
		},
		get_field: function( key ) {
			if ( this.get( 'fields')[key] != null ) return this.get( 'fields' )[key];

			return false;
		},
		set_settings: function( data ) {
			for ( key in data ) {
				var field = this.get_field( key )
				if ( field != false ) {
					field.set_settings( data[key] );
				}
			}
		},
		render: function() {
			if ( ! this.view ) {
				api.FieldViewConstructor( { model: this } );
				this.listenTo( this.view, 'render', this.render_fields );
				this.listenTo( this.view, 'remove', this.remove );
			}

			this.trigger( 'render' );

			return this;
		},
		render_fields: function() {
			var fields = this.get( 'fields' );
			for ( key in fields ) {
				fields[key].render();
			}
		},
		remove: function() {
			this.get( 'parent' ).get( 'setting' ).remove( this );
		},
		generate_names: function() {
			api.Field.prototype.generate_names.apply( this );

			var fields = this.get( 'fields' );
			for ( key in fields ) {
				fields[key].generate_names();
			}
		}
	} );

	api.Collection_Fieldset_View = api.Field_View.extend( {
		className: 'ob-collection-fieldset',
		attributes: {
			'draggable': true
		},
		events: {
			'dragstart': 'dragstart',
			'dragenter': 'dragenter',
			'dragleave': 'dragleave',
			'dragend': 'dragend',
			'dragover': 'dragover',
			'drop': 'drop',
			'click >.remove': 'remove'
		},
		template: wp.template( 'ob-collection-fieldset' ),
		dragstart: function( event ) {
			event.stopPropagation();
			var model = this.model;
			var setting = model.get( 'parent' ).get( 'setting' );
			this.model.get( 'parent' ).set( 'dragging', setting.indexOf( model ) );
		},
		dragenter: function( event ) {
			if ( this.model.get( 'parent' ).get( 'dragging' ) !== false ) {
				this.$el.addClass( 'over' );
			}
		},
		dragleave: function( event ) {
			if ( this.model.get( 'parent' ).get( 'dragging' ) !== false ) {
				this.$el.removeClass( 'over' );
			}
		},
		dragend: function( event ) {
			event.stopPropagation();
			var parent = this.model.get( 'parent' );
			parent.set( 'dragging', false );
		},
		dragover: function( event ) {
			event.preventDefault();
		},
		drop: function ( event ) {
			event.stopPropagation();
			var parent = this.model.get( 'parent' );
			var setting = parent.get( 'setting' );
			this.$el.removeClass( 'over' );

			parent.move( setting.at( parent.get( 'dragging' ) ), setting.indexOf( this.model ) );
			parent.set( 'dragging', false );
		},
		remove: function() {
			this.$el.detach();
			this.trigger( 'remove' );
		}
	} );

	_.extend( api.Field.prototype, {
		is_collection_child: function() {
			var collection_child = this.get( 'collection_child' );
			if ( collection_child === true || collection_child === false ) return collection_child;

			if ( this.get( 'parent' ).get( 'collection_child' ) == true || this.get( 'parent' ) instanceof api.Collection ) {
				this.set( 'collection_child', true, { silent: true } );

				return true;
			}

			return false;
		},
		generate_names: function() {
			var
				id = this.get( 'id' ),
				is_collection_child = this.is_collection_child(),
				parent = this.get( 'parent' );
			var name = '';

			if ( parent )
				name += parent.get( 'name' );

			if ( ( id + '' ).length ) {
				if ( is_collection_child )
					name += '[';
				else
					name += '_';

				name += id;

				if ( is_collection_child )
					name += ']';
			}

			this.set( 'name', name );
		}
	} );

	api.add( 'collection', {
		model: api.Collection,
		view: api.Collection_View
	} );

	api.add( 'collection-fieldset', {
		model: api.Collection_Fieldset,
		view: api.Collection_Fieldset_View
	} );

	_.extend( exports.OB, api );

} ) ( wp, jQuery )