<?php

namespace OmniBuilder\Field;

use OmniBuilder\Custom_Field;

class Text extends Custom_Field {

	/**
	 * @var string
	 */
	public $type = 'text';

	/**
	 * @{inheritDoc}
	 */
	public function render() {
		return '<script type="text/html" id="tmpl-ob-field-text">
			<label for="{{ data.name }}">{{ data.label }}</label>
			<input type="{{ data.type }}" name="{{ data.name }}" id="{{ data.name }}" value="{{ data.value }}" />
		</script>';
	}

	/**
	 * {@inheritdoc}
	 */
	public function enqueue_scripts() {
		wp_enqueue_script( 'ob-field-text', OMNI_BUILDER_URI . '/Resources/js/Field/Text.js', array( 'ob-field' ), '0.1', true );
		parent::enqueue_scripts();
	}
	
}
