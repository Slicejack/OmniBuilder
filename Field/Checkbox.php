<?php

namespace OmniBuilder\Field;

use OmniBuilder\Custom_Field;

class Checkbox extends Custom_Field {

	/**
	 * @var string
	 */
	public $type = 'checkbox';

	/**
	 * @var array
	 */
	protected $allowed_attributes = array( 'disabled' );

	/**
	 * @{inheritDoc}
	 */
	public function render() { ?>
		<script type="text/html" id="tmpl-ob-field-checkbox">
			<label for="{{ data.name }}">{{ data.label }}</label>
			<div class="description">{{ data.description }}</div>
			<input type="hidden" name="{{ data.name }}" value="0" />
			<div class="ob-field__input">
				<input type="{{ data.type }}" name="{{ data.name }}" id="{{ data.name }}" value="1"<# if ( data.value == "1" ) {#> checked="checked"<#}#>{{ data.attributes }} />
			</div>
		</script>
	<?php
	}

	/**
	 * {@inheritdoc}
	 */
	public function enqueue_scripts() {
		wp_enqueue_script( 'ob-field-checkbox', OMNI_BUILDER_URI . '/Resources/js/Field/Checkbox.js', array( 'ob-field' ), '0.1', true );
		parent::enqueue_scripts();
	}
}
