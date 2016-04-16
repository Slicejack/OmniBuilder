<?php

namespace OmniBuilder\Field;

use OmniBuilder\Custom_Field;

class Textarea extends Custom_Field {

	/**
	 * @var string
	 */
	public $type = 'textarea';

	/**
	 * @var array
	 */
	protected $allowed_attributes = array( 'autocapitalize', 'autocomplete', 'cols', 'disabled', 'maxlength', 'minlength', 'placeholder', 'readonly', 'rows', 'selectionDirection', 'selectionEnd', 'selectionStart', 'spellcheck', 'wrap' );

	/**
	 * @{inheritDoc}
	 */
	public function render() { ?>
		<script type="text/html" id="tmpl-ob-field-textarea">
			<label for="{{ data.name }}">{{ data.label }}</label>
			<div class="description">{{ data.description }}</div>
			<div class="ob-field__input">
				<textarea name="{{ data.name }}"{{ data.attributes }}>{{ data.value }}</textarea>
			</div>
		</script>
	<?php
	}

	/**
	 * {@inheritdoc}
	 */
	public function enqueue_scripts() {
		wp_enqueue_script( 'ob-field-textarea', OMNI_BUILDER_URI . '/Resources/js/Field/Textarea.js', array( 'ob-field' ), '0.1', true );
		parent::enqueue_scripts();
	}

}
