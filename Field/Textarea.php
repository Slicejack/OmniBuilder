<?php

namespace OmniBuilder\Field;

use OmniBuilder\Custom_Field;

class Textarea extends Custom_Field {

	/**
	 * @var string
	 */
	public $type = 'textarea';

	/**
	 * @{inheritDoc}
	 */
	public function render() {
		return '<script type="text/html" id="tmpl-ob-field-textarea">
			<label for="{{ data.name }}">{{ data.label }}</label>
			<textarea name="{{ data.name }}">{{ data.value }}</textarea>
		</script>';
	}

	/**
	 * {@inheritdoc}
	 */
	public function enqueue_scripts() {
		wp_enqueue_script( 'ob-field-textarea', OMNI_BUILDER_URI . '/Resources/js/Field/Textarea.js', array( 'ob-field' ), '0.1', true );
		parent::enqueue_scripts();
	}
	
}
