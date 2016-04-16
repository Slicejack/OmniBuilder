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
	 * Image Field model
	 * @class Field_Image
	 * @extends {Field}
	 */
	api.Field_Image = api.Field.extend( {
		/**
		 * Default options
		 * @memberOf Field_Image
		 * @type {Object}
		 * @extends {Field.prototype.defaults}
		 */
		defaults: _.extend( {}, api.Field.prototype.defaults, {
			'type': 'image',
			'attachment': null
		} ),
		initialize: function() {
			api.Field.prototype.initialize.apply( this );

			this.listenTo( this.get( 'setting' ), 'change:value', this.updateAttachment );
		},
		updateAttachment: function( model, value ) {
			if ( _.isFinite( value ) ) {
				this.set( 'attachment', new wp.media.model.Attachment( { id: value } ) );
				this.get( 'attachment' ).fetch().done( this.reRender.bind( this ) ).fail( function() {
					this.set( 'attachment', null );
					this.reRender();
				}.bind( this ) );
			}
			else {
				this.set( 'attachment', null );
				this.reRender();
			}
		},
		reRender: function() {
			if ( ! this.view ) return;

			this.set( 'rendered', false );
			this.render();
		}
	} );

	/**
	 * Image Field view
	 * @class Field_Image_View
	 * @extends {Field_View}
	 */
	api.Field_Image_View = api.Field_View.extend( {
		/**
		 * Element class
		 * @memberOf Field_Image_View
		 * @type {String}
		 * @extends {Field_View.prototype.className}
		 */
		className: api.Field_View.prototype.className + ' ob-field-image',
		/**
		 * WordPress media frame
		 * @memberOf Field_Image_View
		 * @type {Object|null}
		 */
		frame: null,
		/**
		 * Element events
		 * @memberOf Field_Image_View
		 * @type {Object}
		 */
		events: {
			'click div:not(.ob-field) .button': 'openMedia',
			'click div:not(.ob-field) .ob-field-image-remove': 'removeImage'
		},
		/**
		 * Open WordPress media frame
		 * @param  {Event} event
		 * @memberOf Field_Image_View
		 */
		openMedia: function( event ) {
			event.preventDefault();

			if ( this.frame == null ) {

				var l10n = _wpMediaViewsL10n;
				this.frame = wp.media( {
					button: {
						text: l10n.select,
						close: false
					},
					states: [
						new wp.media.controller.Library( {
							title: l10n.chooseImage,
							library: wp.media.query( {
								type: 'image'
							} ),
							multiple: false,
							date: false,
							priority: 20
						} )
					]
				} );

				this.frame.on( 'open', this.onOpen, this );
				this.frame.on( 'select', this.onSelect, this );
			}

			this.frame.open();
		},
		/**
		 * Update attachment object after WordPress media frame is opened
		 * @memberOf Field_Image_View
		 */
		onOpen: function() {
			var value = this.get_value();
			if ( ! _.isFinite( value ) ) return;

			if ( this.model.get( 'attachment' ) == null || this.model.get( 'attachment' ).get( 'id' ) != value ) {
				this.model.set( 'attachment', new wp.media.model.Attachment( { id: value } ) );
				this.model.get( 'attachment' ).fetch().done( this.addToSelection.bind( this ) );
			}

			this.addToSelection();
		},
		/**
		 * Update setting value on select
		 * @memberOf Field_Image_View
		 */
		onSelect: function() {
			var attachment = this.frame.state().get( 'selection' ).first();
			this.model.get( 'setting' ).set( 'value', attachment.get( 'id' ) );

			this.frame.close();
		},
		/**
		 * Add attachment object to wp media frame selection
		 * @memberOf Field_Image_View
		 */
		addToSelection: function() {
			if ( this.model.get( 'attachment' ) == null ) return;

			var selection = this.frame.state().get( 'selection' );
			selection.add( [ this.model.get( 'attachment' ) ] );
		},
		/**
		 * Handle click on remove button
		 * @param  {Event} event
		 * @memberOf Field_Image_View
		 */
		removeImage: function( event ) {
			event.preventDefault();

			this.model.get( 'setting' ).set( 'value', '' );
		},
		/**
		 * Get input element value
		 * @memberOf Field_Image_View
		 * @return {String}
		 */
		get_value: function() {
			return $( 'input[name="' + this.model.get( 'name' ) + '"]', this.$el ).val();
		},
		/**
		 * Set input element value
		 * @memberOf Field_Image_View
		 * @return {Field_Image_View}
		 */
		set_value: function( selection ) {
			$( 'input[name="' + this.model.get( 'name' ) + '"]', this.$el ).val( selection.get( 'id' ) );

			return this;
		}
	} );

	/**
	 * Add Text Field to OmniBuilder
	 */
	api.add( 'image', {
		model: api.Field_Image,
		view: api.Field_Image_View
	} );

	/**
	 * Extend OmniBuilder API
	 */
	_.extend( exports.OB, api );

} ) ( wp, jQuery )

