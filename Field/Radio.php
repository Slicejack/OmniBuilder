<?php

namespace OmniBuilder\Field;

use OmniBuilder\Custom_Field;

class Radio extends Custom_Field {

	/**
	 * @var string
	 */
	public $type = 'radio';

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
		return '<script type="text/html" id="tmpl-ob-field-radio">
			<label for="{{ data.name }}">{{ data.label }}</label>
			<# for ( choice in data.choices ) { #>
			<input type="radio" name="{{ data.name }}" id="{{ data.name }}_{{ choice }}" value="{{ choice }}"<# if ( data.value && data.value == choice ) { #> checked="checked"<# } #> />
			<label for="{{ data.name }}_{{ choice }}">{{ data.choices[choice] }}</label>
			<# } #>
		</script>';
	}

	/**
	 * {@inheritdoc}
	 */
	public function enqueue_scripts() {
		wp_enqueue_script( 'ob-field-radio', OMNI_BUILDER_URI . '/Resources/js/Field/Radio.js', array( 'ob-field' ), '0.1', true );
		parent::enqueue_scripts();
	}

}
