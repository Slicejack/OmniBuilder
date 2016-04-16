<?php

namespace OmniBuilder\Field;

use OmniBuilder\Custom_Field;
use OmniBuilder\Custom_Form_Element;

class Fieldset extends Custom_Field {

	/**
	 * @var string
	 */
	public $type = 'fieldset';

	/**
	 * @{inheritDoc}
	 */
	public function render() { ?>
		<script type="text/html" id="tmpl-ob-fieldset">
			<# if ( data.label ) { #><h4 class="title">{{ data.label }}</h4<# } #>
			<div class="description">{{ data.description }}</div>
			<div class="fields"></div>
		</script>

		<?php foreach ( $this->children as $child ) {
			if ( $child instanceof Custom_Field ) {
				$child->render();
			}
		}
	}

	/**
	 * {@inheritdoc}
	 */
	public function prepare( Custom_Form_Element $parent ) {
		$this->parent = $parent;
		$this->name = $this->get_name();
		$this->value = array();

		foreach ( $this->children as $child ) {
			$child->prepare( $this );
		}

		return $this;
	}

	public function get_posted_value() {
		return array(
			'children' => $this->children
		);
	}

	public function get_stored_value() {
		$value = array();

		foreach ( $this->children as $child ) {
			if ( $child instanceof Custom_Field ) {
				$value[ $child->get_id() ] = $child->get_stored_value();
			}
		}

		return $value;
	}

	/**
	 * {@inheritdoc}
	 */
	public function enqueue_scripts() {
		wp_enqueue_script( 'ob-fieldset', OMNI_BUILDER_URI . '/Resources/js/Field/Fieldset.js', array( 'ob-field' ), '0.1', true );
		parent::enqueue_scripts();
	}

}