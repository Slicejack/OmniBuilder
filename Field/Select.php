<?php

namespace OmniBuilder\Field;

use OmniBuilder\Custom_Field;

class Select extends Custom_Field {

	/**
	 * @var string
	 */
	public $type = 'select';

	/**
	 * @{inheritDoc}
	 */
	public function set_json_data() {
		parent::set_json_data();
		if ( is_array( $this->options['choices'] ) && ! empty( $this->options['choices'] ) )
			$this->json_data['choices'] = $this->options['choices'];

		return $this;
	}

	/**
	 * @{inheritDoc}
	 */
	public function render() {
		return '<script type="text/html" id="tmpl-ob-field-select">
			<label for="{{ data.name }}">{{ data.label }}</label>
			<select name="{{ data.name }}">
			<# for ( choice in data.choices ) { #>
				<option value="{{ choice }}"<# if ( data.value && data.value == choice ) { #> selected="selected"<# } #>>{{ data.choices[choice] }}</option>
			<# } #>
			</select>
		</script>';
	}

	/**
	 * {@inheritdoc}
	 */
	public function enqueue_scripts() {
		wp_enqueue_script( 'ob-field-select', OMNI_BUILDER_URI . '/Resources/js/Field/Select.js', array( 'ob-field' ), '0.1', true );
		parent::enqueue_scripts();
	}

}
