<?php

namespace OmniBuilder\Field;

use OmniBuilder\Custom_Field;

class Text extends Custom_Field {

	/**
	 * @var string
	 */
	public $type = 'text';

	/**
	 * @var array
	 */
	protected $allowed_attributes = array( 'autocapitalize', 'autocomplete', 'autocorrect', 'disabled', 'inputmode', 'list', 'maxlength', 'minlength', 'placeholder', 'readonly', 'selectionDirection', 'size', 'spellcheck' );

	/**
	 * @{inheritDoc}
	 */
	public function render() { ?>
		<script type="text/html" id="tmpl-ob-field-text">
			<label for="{{ data.name }}">{{ data.label }}</label>
			<div class="description">{{ data.description }}</div>
			<div class="ob-field__input">
				<input type="{{ data.type }}" name="{{ data.name }}" id="{{ data.name }}" value="{{ data.value }}"{{ data.attributes }} />
			</div>
		</script>
	<?php
	}

	/**
	 * {@inheritdoc}
	 */
	public function enqueue_scripts() {
		wp_enqueue_script( 'ob-field-text', OMNI_BUILDER_URI . '/Resources/js/Field/Text.js', array( 'ob-field' ), '0.1', true );
		parent::enqueue_scripts();
	}

}
