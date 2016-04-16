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
	 * WP Editor Field model
	 * @class Field_WP_Editor
	 * @extends {Field}
	 */
	api.Field_WP_Editor = api.Field.extend( {
		/**
		 * Default options
		 * @memberOf Field_WP_Editor
		 * @type {Object}
		 * @extends {Field.prototype.defaults}
		 */
		defaults: _.extend( {}, api.Field.prototype.defaults, {
			'type': 'wp_editor'
		} ),
		initialize: function() {
			api.Field.prototype.initialize.call( this );

			var parent = this.get( 'parent' );

			while( parent && parent.is_collection_child && parent.is_collection_child() ) {
				if ( _.indexOf( [ 'collection-fieldset', 'collection-block' ], parent.get( 'type' ) ) >= 0 ) {
					this.listenTo( parent, 'before_move', this.collect_values );
					this.listenTo( parent, 'after_move', this.update_value );
				}

				parent = parent.get( 'parent' );
			}
		},
		update_value: function() {
			this.view.trigger( 'update_value' );
		}
	} );

	/**
	 * WP Editor Field view
	 * @class Field_WP_Editor_View
	 * @extends {Field_View}
	 */
	api.Field_WP_Editor_View = api.Field_View.extend( {
		initialize: function() {
			api.Field_View.prototype.initialize.call( this );

			this.on( 'appended', this.initEditor );
			this.on( 'update_value', this.update_value );
		},
		initEditor: function() {
			api.render( this._initEditor.bind( this ) );
		},
		_initEditor: function() {
			var name = this.model.get( 'name' );
			var $wrap = $( '.wp-editor-wrap', this.$el ).attr( 'id', 'wp-' + name + '-wrap' );
			var $tools = $( '.wp-editor-tools', $wrap ).attr( 'id', 'wp-' + name + '-editor-tools' );
			var $media_buttons = $( '.wp-media-buttons', $tools ).attr( 'id', 'wp-' + name + '-media-buttons' );
			$( '[data-editor]', $wrap ).attr( 'data-editor', name );
			$( '[data-wp-editor-id]', $wrap ).attr( 'data-wp-editor-id', name );
			var $switch_html = $( '.switch-html', $tools ).attr( 'id', name + '-html' );
			var $switch_tmce = $( '.switch-tmce', $tools ).attr( 'id', name + '-tmce' );
			var $editor_container = $( '.wp-editor-container', $wrap ).attr( 'id', 'wp-' + name + '-editor-container' );
			var $quicktags_toolbar = $( '.quicktags-toolbar', $wrap ).attr( 'id', 'qt_' + name + '_toolbar' );
			var $textarea = $( '[name="ob-field-wp_editor"]', $editor_container ).attr( {
				'name': name,
				'id': name
			} );
			var mode = $wrap.hasClass( 'tmce-active' ) ? 'tmce' : 'html';

			if ( typeof tinymce !== 'undefined' ) {
				var mceInit;

				mceInit = tinymce.extend( {}, tinyMCEPreInit.mceInit[ 'ob-field-wp_editor' ] );
				mceInit.body_class = mceInit.body_class.replace( 'ob-field-wp_editor', name );
				mceInit.selector = '#' + name;

				tinyMCEPreInit.mceInit[ name ] = mceInit;

				if ( mode === 'tmce' ) {
					try {
						tinymce.init( mceInit );
					} catch ( e ) {}
				}
			}

			if ( typeof quicktags !== 'undefined' ) {
				var qtInit;
				if ( tinyMCEPreInit.qtInit[ name ] == undefined ) {
					qtInit = $.extend( {}, tinyMCEPreInit.qtInit[ 'ob-field-wp_editor' ] );
					qtInit.id = name;
					tinyMCEPreInit.qtInit[ name ] = qtInit;

					try {
						quicktags( qtInit );
						QTags._buttonsInit();

						if ( ! window.wpActiveEditor ) {
							window.wpActiveEditor = name;
						}
					} catch( e ) {};
				}
				else qtInit = tinyMCEPreInit.qtInit[ name ];
			}

			$( $wrap ).on( 'click.wp-editor', function() {
				if ( this.id ) {
					window.wpActiveEditor = this.id.slice( 3, -5 );
				}
			} );

			if ( tinymce.get( name ) !== null ) {
				switchEditors.go( name, mode );
			}
		},
		get_value: function() {
			var name = this.model.get( 'name' );

			var value;

			if ( $( '#wp-' + name + '-wrap', this.$el ).hasClass( 'tmce-active' ) )
				value = tinymce.get( name ).getContent();
			else
				value = $( '#' + name, this.$el ).val();

			return value;
		},
		update_value: function() {
			api.render( function() {
				var name = this.model.get( 'name' );
				var value = this.model.get( 'setting' ).get( 'value' );

				if ( $( '#wp-' + name + '-wrap', this.$el ).hasClass( 'tmce-active' ) ) {
					if ( tinymce.get( name ) ) {
						tinymce.get( name ).remove();
					}

					this._initEditor();

					if ( tinymce.get( name ) ) {
						tinymce.get( name ).setContent( value );
					}
				}
				else {
					$( '#' + name, this.$el ).val( value );
				}
			}.bind( this ) );
		}
	} );

	/**
	 * Add WP Editor Field to OmniBuilder
	 */
	api.add( 'wp_editor', {
		model: api.Field_WP_Editor,
		view: api.Field_WP_Editor_View
	} );

	/**
	 * Extend OmniBuilder API
	 */
	_.extend( exports.OB, api );

} ) ( wp, jQuery )