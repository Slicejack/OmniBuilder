<?php

namespace OmniBuilder\Field;

use OmniBuilder\Custom_Field;

class Collection extends Custom_Field {

	/**
	 * @var string
	 */
	public $type = 'collection';

	/**
	 * {@inheritdoc}
	 */
	public function render() {
		$output = '<script type="text/html" id="tmpl-ob-collection">
			<# if ( data.label ) { #><h4 class="title">{{ data.label }}</h4<# } #>
			<div class="description">{{ data.description }}</div>
			<div class="messages"></div>
			<div class="add button">Add</div>
			<div class="fields"></div>
			<div class="add button">Add</div>
		</script>
		<script type="text/html" id="tmpl-ob-collection-fieldset">
			<# if ( data.label ) { #><h4 class="title">{{ data.label }}</h4<# } #>
			<div class="description">{{ data.description }}</div>
			<div class="fields"></div>
			<div class="remove button">Remove</div>
		</script>';

		foreach ( $this->children as $child ) {
			if ( $child instanceof Custom_Field ) {
				$output .= $child->render();
			}
		}

		return $output;
	}

	/**
	 * {@inheritdoc}
	 */
	public function get_name_attribute() {
		if ( $this->name_attribute ) {
			return $this->name_attribute;
		}

		return $this->name_attribute = $this->parent->get_name_attribute() . '[' . $this->id . '][_item_]';
	}

	/**
	 * {@inheritdoc}
	 */
	public function get_posted_value() {
		return isset($_POST['_' . $this->parent->get_name() . '_' . $this->id ]) ? $_POST['_' . $this->parent->get_name() . '_' . $this->id] : null;
	}

	/**
	 * {@inheritdoc}
	 */
	public function enqueue_scripts() {
		wp_enqueue_script( 'ob-collection', OMNI_BUILDER_URI . '/Resources/js/Field/Collection.js', array( 'ob-field' ), '0.1', true );
		parent::enqueue_scripts();
	}
	
}
