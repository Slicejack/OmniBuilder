<?php

namespace OmniBuilder\Field;

use OmniBuilder\Custom_Field;

class WP_Editor extends Custom_Field {
	/**
	 * @var string
	 */
	public $type = 'wp_editor';

	/**
	 * @{inheritDoc}
	 */
	public function render() { ?>
		<script type="text/html" id="tmpl-ob-field-wp_editor">
			<label for="{{ data.name }}">{{ data.label }}</label>
			<div class="description">{{ data.description }}</div>
			<div class="ob-field__input">
				<?php
				wp_editor(
					'{{ data.value }}',
					'ob-field-wp_editor',
					array(
						'dfw' => false,
						'_content_editor_dfw' => false,
						'drag_drop_upload' => true,
						'tabfocus_elements' => 'insert-media-button,save-post',
						'editor_height' => 50,
						'tinymce' => array(
							'resize' => false,
							'wp_autoresize_on' => ( get_user_setting( 'editor_expand', 'on' ) === 'on' ),
							'add_unload_trigger' => false,
						),
					)
				);
				?>
			</div>
		</script>
	<?php
	}

	/**
	 * {@inheritdoc}
	 */
	public function enqueue_scripts() {
		wp_enqueue_script( 'ob-field-wp_editor', OMNI_BUILDER_URI . '/Resources/js/Field/WP_Editor.js', array( 'ob-field' ), '0.1', true );
		parent::enqueue_scripts();
	}

}

