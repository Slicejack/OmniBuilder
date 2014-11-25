<?php

namespace OmniBuilder\Field;

use OmniBuilder\Custom_Field;

class Checkbox extends Custom_Field {

	/**
	 * @var string
	 */
	public $type = 'checkbox';

	/**
	 * @{inheritDoc}
	 */
	public function render() {
		return '<script type="text/html" id="tmpl-ob-field-checkbox">
			<label for="{{ data.name }}">{{ data.label }}</label>
			<input type="{{ data.type }}" name="{{ data.name }}" id="{{ data.name }}" value="1"<# if ( data.value == "1" ) {#> checked="checked"<#}#> />
		</script>';
	}

	/**
	 * {@inheritdoc}
	 */
	public function enqueue_scripts() {
		wp_enqueue_script( 'ob-field-checkbox', OMNI_BUILDER_URI . '/Resources/js/Field/Checkbox.js', array( 'ob-field' ), '0.1', true );
		parent::enqueue_scripts();
	}
	
}
