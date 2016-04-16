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
	 * Collection Setting model
	 * @class Collection_Setting
	 * @extends {Backbone.Collection}
	 */
	api.Collection_Setting =  Backbone.Collection.extend( {
		/**
		 * Field object
		 * @memberOf Collection_Setting
		 * @type {Object|null}
		 */
		field: null,
		/**
		 * Collection Setting constructor
		 * @memberOf Collection_Setting
		 * @param  {Object} attrs   Currently uses only field
		 * @param  {Array} models
		 * @param  {Object} options
		 * @return {Collection_Setting} `this`
		 */
		constructor: function( attrs, models, options ) {
			this.field = attrs.field;
			Backbone.Collection.apply( this, [ models, options ] );

			return this;
		},
		/**
		 * Initialize Collection Setting
		 * @memberOf Collection_Setting
		 */
		initialize: function() {
			this.on( 'remove reset reindex', this.reIndex );
			this.on( 'add', this.renderNew );
		},
		/**
		 * Sort Collection Fieldsets by ID
		 * @memberOf Collection_Setting
		 * @param  {Object} model  Fieldset
		 */
		comparator: function( model ) {
			return model.get( 'id' );
		},
		/**
		 * Add a Collection Fieldset, or list of Fieldsets to the set.
		 * @memberOf Collection_Setting
		 * @param {Array|Object} models  Collection Fieldsets
		 * @param {Object} options
		 * @return {Boolean|Collection_Fieldset|Array} Returns false if limit is
		 * exceeded otherwise returns the added (or merged) Collection Fieldset
		 * (or Collection Fieldsets).
		 */
		add: function( models, options ) {
			if ( this.field.get( 'limit' ) >= 0 ) {
				if ( this.size() >= this.field.get( 'limit' ) ) {
					return false;
				}
			}

      if ( options && options.move == true )
      	return Backbone.Collection.prototype.add.apply( this, [ models, options ] );

      var model_type = this.field.get( 'model-type' );

			var data = {
				id: this.size(),
				fields: ( model_type == 'collection-block' ? this.field.get( 'fields' )[ this.field.get( 'blocks' )[ models.block ].index ].fields : this.field.get( 'fields' ) ),
				parent: this.field,
				type: model_type
			};
			if ( model_type == 'collection-block' )
				_.reject( models, function( value, key ) {
					return key == 'block';
				} );

			options = models;

			if ( model_type == 'collection-block' ) {
				models = new api.Collection_Block( data );
			}
			else
				models = new api.Collection_Fieldset( data );

			return this.set( models, _.extend( { merge: false }, options, { add: true, remove: false } ) );
		},
		/**
		 * Reset Collection Fieldsets IDs
		 * @memberOf Collection_Setting
		 * @return {Collection_Setting} `this`
		 */
		reIndex: function() {
			this.forEach( function( model ) {
				if ( model.get( 'id' ) !== this.indexOf( model ) )
					model.set( 'id', this.indexOf( model ) );
			}.bind( this ) );

			return this;
		},
		/**
		 * Render model
		 * @memberOf Collection_Setting
		 * @param  {Object} model
		 * @return {Collection_Setting} `this`
		 */
		renderNew: function( model ) {
			model.render();

			return this;
		}
	} );

	/**
	 * Collection model
	 * @class Collection
	 * @extends {Field}
	 */
	api.Collection = api.Field.extend( {
		/**
		 * Default options
		 * @memberOf Collection
		 * @type {Object}
		 * @extends {Field.prototype.defaults}
		 */
		defaults: _.extend( {}, api.Field.prototype.defaults, {
			'fields': '',
			'limit': -1,
			'dragging': false,
			'blocks': {},
			'button': 'Add',
			'model-type': 'collection-fieldset',
			'type': 'collection'
		} ),
		/**
		 * Initialize Collection model
		 * @memberOf Collection
		 */
		initialize: function() {
			var fields = this.get( 'fields' );
			if ( _.size( fields ) > 0 ) {
				var _blocks = _.filter( fields, function( field ) {
					return field.type == 'collection-block';
				} );

				if ( _.size( _blocks ) > 0 ) {
					var blocks = {};
					_.each( _blocks, function( field, index ) {
						if ( field.type == 'collection-block' ) {
							blocks[ field.id ] = {
								index: index,
								label: field.label
							};
						}
					} );

					this.set( 'fields', _blocks );
					this.set( 'blocks', blocks );

					if ( this.get( 'button' ) === this.defaults['button'] ) {
						this.set( 'button', 'Choose' );
					}

					this.set( 'model-type', 'collection-block' );
				}
			}
			this.set( 'setting', new api.Collection_Setting( { field: this } ) );
		},
		/**
		 * @memberOf Collection
		 * @inheritDoc
		 */
		set_settings: function( data ) {
			var data = _.isArray( data ) ? data : [];
			for ( var i = 0; i < data.length; i++ ) {
				if ( _.size( this.get( 'blocks' ) ) > 0 && data[i].type )
					this.get( 'setting' ).add( { block: data[i].type, silent: true } ).set_settings( data[i] );
				else
					this.get( 'setting' ).add( { silent: true } ).set_settings( data[i] );
			}

			return this;
		},
		/**
		 * @memberOf Collection
		 * @inheritDoc
		 */
		render: function() {
			if ( ! this.view ) {
				api.FieldViewConstructor( { model: this } );
				this.listenTo( this.view, 'render', this.render_fields );
			}

			this.trigger( 'render' );

			return this;
		},
		/**
		 * Render Collection Fieldsets
		 * @memberOf Collection
		 * @return {Collection} `this`
		 */
		render_fields: function() {
			this.get( 'setting' ).forEach( function( fieldset ) {
				fieldset.render();
			} );

			return this;
		},
		/**
		 * Move Collection Fieldset to new index
		 * @memberOf Collection
		 * @param  {Object} model Collection Fieldset
		 * @param  {Number} index New index
		 */
		move: function( model, index ) {
			var setting = this.get( 'setting' );
			var oldindex = setting.indexOf( model );
			if ( oldindex > -1 ) {
				setting.remove( model, { silent: true } );
				setting.add( model, { at: index, silent: true, move: true } );
				setting.trigger( 'reindex' );
				model.trigger( 'move', index );
			}
		},
		/**
		 * Generate Collection Fieldsets names
		 * @memberOf Collection
		 * @return {Collection} `this`
		 */
		generate_names: function() {
			api.Field.prototype.generate_names.apply( this );

			if ( this.get( 'setting' ).size() > 0 ) {
				this.get( 'setting' ).forEach( function( fieldset ) {
					fieldset.generate_names();
				} );
			}
			else
				this.trigger( 'addEmptyField' );

			return this;
		},
		/**
		 * Size of collection
		 * @return {Number}
		 */
		size: function() {
			return this.get( 'setting' ).size();
		}
	} );

	/**
	 * Collection view
	 * @class Collection_View
	 * @extends {Field_View}
	 */
	api.Collection_View = api.Field_View.extend( {
		/**
		 * @memberOf Collection_View
		 * @inheritDoc
		 */
		className: 'ob-field ob-collection',
		/**
		 * @memberOf Collection_View
		 * @inheritDoc
		 */
		template: wp.template( 'ob-collection' ),
		/**
		 * Listen to events
		 * @memberOf Collection_View
		 * @type {Object}
		 */
		events: {
			'click div:not(.ob-field) .add': 'add',
			'click div:not(.ob-field) .choose': 'toggleBlocks',
			'click div:not(.ob-field) .choose .blocks [data-block]': 'addBlock'
		},
		/**
		 * @memberOf Collection_View
		 * @inheritDoc
		 */
		initialize: function() {
			api.Field_View.prototype.initialize.apply( this );

			this.listenTo( this.model, 'change:dragging', this.dragging );
			this.listenTo( this.model, 'addEmptyField', this.addEmptyField );
			this.listenTo( this.model.get( 'setting' ), 'remove', this.checkErrors );
			this.listenTo( this.model.get( 'setting' ), 'add remove reset', this.updateSize );
			this.on( 'render', this.updateSize );
		},
		/**
		 * @memberOf Collection_View
		 * @inheritDoc
		 */
		parseData: function( data ) {
			if ( _.size( data.blocks ) < 1 )
				data.blocks = null;

			return data;
		},
		/**
		 * Add new Collection Fieldset
		 * @memberOf Collection_View
		 * @return {Collection_View} `this`
		 */
		add: function() {
			var added = this.model.get( 'setting' ).add();

			if ( added == false ) {
				console.warn( 'Limit is exceeded!' );
				this.showError( 'limit' );

				return this;
			}

			if ( _.isArray( added ) ) {
				added = _.first( added );
			}

			if ( added instanceof api.Collection_Fieldset ) {
				added.trigger( 'focus' );
			}

			return this;
		},
		toggleBlocks: function( event ) {
			if ( event ) {
				var $blocks;
				if ( $( event.target ).closest( '.ob-field__footer__actions' ).length ) {
					$blocks = $( 'div:not(.ob-field) .ob-field__footer__actions .choose .blocks', this.$el );
				} else {
					$blocks = $( 'div:not(.ob-field) .ob-field__header__actions .choose .blocks', this.$el );
				}

				if ( 'block' === $blocks.css( 'display' ) ) {
					$blocks.css( 'display', 'none' );
				} else {
					$blocks.css( 'display', 'block' );
				}
			} else {
				var $blocks = $( 'div:not(.ob-field) .choose .blocks', this.$el );
				var is_showed = false;
				$blocks.each( function() {
					if ( 'block' === this.css( 'display' ) ) {
						is_showed = true;
					}
				} );

				if ( is_showed ) {
					this.hideBlocks();
				} else {
					this.showBlocks();
				}
			}

			return this;
		},
		showBlocks: function( event ) {
			if ( event ) {
				if ( $( event.target ).closest( '.ob-field__footer__actions' ).length ) {
					$( 'div:not(.ob-field) .ob-field__footer__actions .choose .blocks', this.$el ).css( 'display', 'block' );
				} else {
					$( 'div:not(.ob-field) .ob-field__header__actions .choose .blocks', this.$el ).css( 'display', 'block' );
				}
			} else {
				$( 'div:not(.ob-field) .choose .blocks', this.$el ).css( 'display', 'block' );
			}
		},
		hideBlocks: function( event ) {
			if ( event ) {
				event.stopPropagation();
			}
			$( 'div:not(.ob-field) .choose .blocks', this.$el ).css( 'display', 'none' );
		},
		addBlock: function( event ) {
			event.stopPropagation();
			var added = this.model.get( 'setting' ).add( { block: $( event.target ).data( 'block' ) } );

			this.hideBlocks();

			if ( added == false ) {
				console.warn( 'Limit is exceeded!' );
				this.showError( 'limit' );

				return this;
			}

			if ( _.isArray( added ) ) {
				added = _.first( added );
			}

			if ( added instanceof api.Collection_Block ) {
				added.trigger( 'focus' );
			}

			return this;
		},
		/**
		 * Update collection size info
		 * @return {Collection_View} `this`
		 */
		updateSize: function() {
			var limit = this.model.get( 'limit' );

			if ( ! _.isFinite( limit ) || limit < 0 ) return this;

			var size = this.model.size();

			$( '> .numbers', this.$el ).css( 'display', 'block' );
			$( '> .numbers .size', this.$el ).text( size );
			$( '> .numbers .limit', this.$el ).text( limit );

			return this;
		},
		showError: function( error ) {
			$( '> .messages .error-' + error, this.$el ).css( 'display', 'block' );

			return this;
		},
		hideError: function( error ) {
			$( '> .messages .error-' + error, this.$el ).css( 'display', 'none' );

			return this;
		},
		checkErrors: function() {
			var limit = this.model.get( 'limit' );
			if ( _.isFinite( limit ) && limit >= 0 ) {
				var size = this.model.size();

				if ( size <= limit )
					this.hideError( 'limit' );
			}
		},
		/**
		 * Remove or add dragging class
		 * @memberOf Collection_View
		 */
		dragging: function() {
			var dragging = this.model.get( 'dragging' );
			if ( dragging === false )
				this.$el.removeClass( 'dragging' );
			else
				this.$el.addClass( 'dragging' );
		},
		/**
		 * Add empty field to Collection
		 * @memberOf Collection_View
		 * @return {Collection_View} `this`
		 */
		addEmptyField: function() {
			var emptyField = $( '<input type="hidden" value="0" name="' + this.model.get( 'name' ) + '" />' );
			this.$el.append( emptyField );

			return this;
		}
	} );

	/**
	 * Collection Fieldset model
	 * @class Collection_Fieldset
	 * @extends {Field}
	 */
	api.Collection_Fieldset = api.Field.extend( {
		/**
		 * Default options
		 * @memberOf Collection_Fieldset
		 * @type {Object}
		 * @extends {Field.prototype.defaults}
		 */
		defaults: _.extend( {}, api.Field.prototype.defaults, {
			'fields': {},
			'type': 'collection-fieldset',
			'dragAllowed': false
		} ),
		/**
		 * Initialize Collection Fieldset model
		 * @memberOf Collection_Fieldset
		 */
		initialize: function() {
			this.add_fields( this.get( 'fields' ) );
			this.on( 'move', this.move );
			this.on( 'focus', this.focus );
		},
		/**
		 * Add fields to Collection Fieldset
		 * @memberOf Collection_Fieldset
		 * @param {Object} data Fields informations
		 * @return {Collection_Fieldset} `this`
		 */
		add_fields: function( data ) {
			this.set( 'fields', api.FieldConstructor( data, { parent: this } ) );

			return this;
		},
		/**
		 * Return Field with given key as Field ID. This function does not go deeper of first childs.
		 * @memberOf Collection_Fieldset
		 * @param  {String} key Field ID
		 * @return {Object|Boolean} Return false if Field with that Field ID does not exist.
		 */
		get_field: function( key ) {
			if ( this.get( 'fields' )[key] != null ) return this.get( 'fields' )[key];

			return false;
		},
		/**
		 * @memberOf Collection_Fieldset
		 * @inheritDoc
		 */
		set_settings: function( data ) {
			for ( key in data ) {
				var field = this.get_field( key )
				if ( field != false )
					field.set_settings( data[key] );
			}

			return this;
		},
		/**
		 * Collect values of child fields
		 * @memberOf Collection_Fieldset
		 */
		collect_values: function() {
			var fields = this.get( 'fields' );
			for ( key in fields ) {
				fields[key].collect_values();
			}

			return this;
		},
		/**
		 * @memberOf Collection_Fieldset
		 * @inheritDoc
		 */
		render: function() {
			if ( ! this.view ) {
				api.FieldViewConstructor( { model: this } );
				this.listenTo( this.view, 'render', this.render_fields );
				this.listenTo( this.view, 'remove', this.remove );
			}

			this.trigger( 'render' );

			return this;
		},
		/**
		 * Render Collection Fieldsets fields
		 * @memberOf Collection_Fieldset
		 * @return {Collection_Fieldset} `this`
		 */
		render_fields: function() {
			var fields = this.get( 'fields' );
			for ( key in fields )
				fields[key].render();

			return this;
		},
		/**
		 * Remove this Collection Fieldset from parent Collection
		 * @memberOf Collection_Fieldset
		 * @return {Boolean}
		 */
		remove: function() {
			if ( this.get( 'parent' ) && this.get( 'parent' ).get( 'setting' ) ) {
				this.get( 'parent' ).get( 'setting' ).remove( this );

				return true;
			}

			return false;
		},
		/**
		 * @memberOf Collection_Fieldset
		 * @inheritDoc
		 */
		generate_names: function() {
			api.Field.prototype.generate_names.apply( this );

			var fields = this.get( 'fields' );
			for ( key in fields )
				fields[key].generate_names();

			return true;
		},
		move: function( index ) {
			if ( ( this.collection.size() - 1 ) == index )
				this.view.moveToEnd();
			else
				this.view.moveBefore( this.collection.get( index + 1 ).view.$el );

			return this;
		},
		focus: function() {
			var fields = this.get( 'fields' );
			for ( key in fields ) {
				if ( true === fields[key].get( 'can_be_focused' ) ) {
					fields[key].trigger( 'focus' );
					break;
				}
			}

			return this;
		}
	} );

	/**
	 * Collection Fieldset view
	 * @class Collection_Fieldset_View
	 * @extends {Field_View}
	 */
	api.Collection_Fieldset_View = api.Field_View.extend( {
		/**
		 * @memberOf Collection_Fieldset_View
		 * @inheritDoc
		 */
		className: 'ob-field ob-collection-fieldset',
		/**
		 * DOM Element attributes
		 * @memberOf Collection_Fieldset_View
		 * @type {Object}
		 */
		attributes: {
			'draggable': true
		},
		/**
		 * Listen to events
		 * @memberOf Collection_Fieldset_View
		 * @type {Object}
		 */
		events: {
			'dragstart': 'dragstart',
			'dragenter': 'dragenter',
			'dragleave': 'dragleave',
			'dragend': 'dragend',
			'dragover': 'dragover',
			'drop': 'drop',
			'mouseenter div:not(.ob-field) .drag-handler': 'allowDrag',
			'mouseleave div:not(.ob-field) .drag-handler': 'disallowDrag',
			'click div:not(.ob-field) .remove': 'remove'
		},
		/**
		 * @memberOf Collection_Fieldset_View
		 * @inheritDoc
		 */
		template: wp.template( 'ob-collection-fieldset' ),
		/**
		 * @inheritDoc
		 */
		initialize: function() {
			api.Field_View.prototype.initialize.apply( this );

			this.listenTo( this.model, 'change:id', this.updateId );
		},
		/**
		 * Replace old id with new id
		 * @memberOf Field_View
		 * @param  {Object} model   This model
		 * @param  {String} value   New value
		 * @param  {Object} options
		 */
		updateId: function( model, value, options ) {
			var id = parseInt( value ) + 1;
			$( 'div:not(.ob-field) .drag-handler .id', this.$el ).text( id );
		},
		allowDrag: function() {
			this.model.set( 'dragAllowed', true );

			return this;
		},
		disallowDrag: function() {
			this.model.set( 'dragAllowed', false );

			return this;
		},
		/**
		 * on dragstart event
		 * @memberOf Collection_Fieldset_View
		 * @param  {Event} event
		 */
		dragstart: function( event ) {
			if ( this.model.get( 'dragAllowed' ) !== true ) {
				event.preventDefault();
				return false;
			}

			event.originalEvent.dataTransfer.setData( 'text/plain', 'anything' );
			event.stopPropagation();

			var model = this.model;
			var parent = model.get( 'parent' );

			parent.set( 'dragging', parent.get( 'setting' ).indexOf( model ) );
		},
		/**
		 * on dragenter event
		 * @memberOf Collection_Fieldset_View
		 * @param  {Event} event
		 */
		dragenter: function( event ) {
			if ( this.model.get( 'parent' ).get( 'dragging' ) !== false )
				this.$el.addClass( 'over' );
		},
		/**
		 * on dragleave event
		 * @memberOf Collection_Fieldset_View
		 * @param  {Event} event
		 */
		dragleave: function( event ) {
			if ( this.model.get( 'parent' ).get( 'dragging' ) !== false )
				this.$el.removeClass( 'over' );
		},
		/**
		 * on dragend event
		 * @memberOf Collection_Fieldset_View
		 * @param  {Event} event
		 */
		dragend: function( event ) {
			event.stopPropagation();

			this.model.get( 'parent' ).set( 'dragging', false );
		},
		/**
		 * on dragover event
		 * @memberOf Collection_Fieldset_View
		 * @param  {Event} event
		 */
		dragover: function( event ) {
			event.preventDefault();
		},
		/**
		 * on drop event
		 * @memberOf Collection_Fieldset_View
		 * @param  {Event} event
		 */
		drop: function ( event ) {
			event.preventDefault();
			event.stopPropagation();
			var parent = this.model.get( 'parent' );
			var setting = parent.get( 'setting' );
			this.$el.removeClass( 'over' );

			parent.move( setting.at( parent.get( 'dragging' ) ), setting.indexOf( this.model ) );
			parent.set( 'dragging', false );
		},
		/**
		 * Detach this Collection Fieldset DOM Element
		 * @memberOf Collection_Fieldset_View
		 * @return {Collection_Fieldset_View} `this`
		 */
		remove: function() {
			this.$el.detach();
			this.trigger( 'remove' );

			return this;
		},
		moveToEnd: function() {
			this.model.trigger( 'before_move' );

			this.$el.appendTo( this.model.get( 'parent' ).view.getFieldsEl() );

			this.model.trigger( 'after_move' );

			return this;
		},
		moveBefore: function( el ) {
			this.model.trigger( 'before_move' );

			this.$el.insertBefore( el );

			this.model.trigger( 'after_move' );

			return this;
		}
	} );

	/**
	 * Collection Block model
	 * @class Collection_Block
	 * @extends {Collection_Fieldset}
	 */
	api.Collection_Block = api.Collection_Fieldset.extend( {

	} );

	/**
	 * Collection Block view
	 * @class Collection_Block_View
	 * @extends {Collection_Fieldset_View}
	 */
	api.Collection_Block_View = api.Collection_Fieldset_View.extend( {
		/**
		 * @memberOf Collection_Fieldset_View
		 * @inheritDoc
		 */
		className: 'ob-field ob-collection-block',

		/**
		 * @memberOf Collection_Fieldset_View
		 * @inheritDoc
		 */
		template: wp.template( 'ob-collection-block' )

	} );

	/**
	 * Extend Field prototype with new defaults, 'is_collection_child' method and change generate_names method
	 */
	_.extend( api.Field.prototype, {
		/**
		 * Extend default options
		 * @type {Object}
		 */
		defaults: _.extend( api.Field.prototype.defaults, {
			'collection_child': null
		} ),
		events: {
			'initialize': 'is_collection_child'
		},
		/**
		 * Returns true if Field is inside Collection
		 * @memberOf Field
		 * @return {Boolean}
		 */
		is_collection_child: function() {
			var collection_child = this.get( 'collection_child' );
			if ( collection_child === true || collection_child === false ) return collection_child;

			if ( this.get( 'parent' ).get( 'collection_child' ) == true || this.get( 'parent' ) instanceof api.Collection || this.get( 'parent' ) instanceof api.Collection_Fieldset ) {
				this.set( 'collection_child', true, { silent: true } );

				return true;
			}

			return false;
		},
		/**
		 * Generate Field name
		 * @memberOf Field
		 * @return {Field} `this`
		 */
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

			return this;
		}
	} );

	/**
	 * Add Collection to OmniBuilder
	 */
	api.add( 'collection', {
		model: api.Collection,
		view: api.Collection_View
	} );

	/**
	 * Add Collection Fieldset to OmniBuilder
	 */
	api.add( 'collection-fieldset', {
		model: api.Collection_Fieldset,
		view: api.Collection_Fieldset_View
	} );

	/**
	 * Add Collection Block to OmniBuilder
	 */
	api.add( 'collection-block', {
		model: api.Collection_Block,
		view: api.Collection_Block_View
	} );

	/**
	 * Extend OmniBuilder API
	 */
	_.extend( exports.OB, api );

} ) ( wp, jQuery )