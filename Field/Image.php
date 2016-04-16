<?php

namespace OmniBuilder\Field;

use OmniBuilder\Custom_Field;

class Image extends Custom_Field {

	/**
	 * @var string
	 */
	public $type = 'image';

	/**
	 * @var array
	 */
	protected $allowed_attributes = array();

	/**
	 * @{inheritDoc}
	 */
	public function render() { ?>
		<script type="text/html" id="tmpl-ob-field-image">
			<label for="{{ data.name }}">{{ data.label }}</label>
			<div class="description">{{ data.description }}</div>
			<input type="hidden" name="{{ data.name }}" value="{{ data.value }}"{{ data.attributes }} />
			<#
				if ( data.attachment != null && data.attachment.get( 'sizes' ) != undefined ) {
					var thumbnail = data.attachment.get( 'sizes' ).thumbnail;
					if ( data.preview_size && data.attachment.get( 'sizes' )[ data.preview_size ] ) {
						thumbnail = data.attachment.get( 'sizes' )[ data.preview_size ];
					}
			#>
			<div class="preview">
				<div class="image">
					<img src="{{ thumbnail.url }}" width="{{ thumbnail.width }}" height="{{ thumbnail.height }}" />
				</div>
				<div class="ob-field-image-remove media-modal-icon"><?php _e( 'Remove', 'ob' ); ?></div>
			</div>
			<# } else { #>
			<div class="buttons">
				<input type="button" class="button" id="{{ data.name }}" value="<?php esc_attr_e( 'Select image', 'ob' ); ?>" />
			</div>
			<# } #>
		</script>
	<?php
	}

	/**
	 * @{inheritDoc}
	 */
	public function set_json_data() {
		parent::set_json_data();

		if ( isset( $this->options['preview_size'] ) && ! empty( $this->options['preview_size'] ) ) {
			$this->json_data['preview_size'] = $this->options['preview_size'];
		}
	}

	/**
	 * {@inheritdoc}
	 */
	public function enqueue_scripts() {
		wp_enqueue_style( 'thickbox' );
		wp_enqueue_script( 'ob-field-image', OMNI_BUILDER_URI . '/Resources/js/Field/Image.js', array( 'ob-field', 'media-upload', 'thickbox' ), '0.1', true );
		parent::enqueue_scripts();
	}

}
