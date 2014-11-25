<?php

namespace OmniBuilder;

class Custom_Form_Element {
	
	/**
	 * @var string
	 */
	protected $id;

	/**
	 * @var mixed
	 */
	protected $parent;

	/**
	 * @var array
	 */
	protected $children;

	/**
	 * @var string
	 */
	protected $name;

	/**
	 * @var string
	 */
	protected $name_attribute;

	/**
	 * @var array
	 */
	protected $json_data;

	/**
	 * @return string
	 */
	public function get_id() {
		return $this->id;
	}

	/**
	 * @return Custom_Form_Element|Custom_Post_Type
	 */
	public function get_parent() {
		return $this->parent;
	}

	/**
	 * @param Custom_Form_Element|Custom_Post_Type
	 * @return $this
	 */
	public function set_parent( $parent ) {
		$this->parent = $parent;

		return $this;
	}

	/**
	 * @return array
	 */
	public function get_children() {
		return $this->children;
	}

	/**
	 * @param array $children
	 * @return $this
	 */
	public function set_children( array $children ) {
		$this->children = $children;

		return $this;
	}

	/**
	 * @return string
	 */
	public function get_name() {
		if ( null !== $this->name ) {
			return $this->name;
		}

		if ( $this->parent instanceof Custom_Post_Type ) {
			return $this->name = '_' . $this->id;
		}

		return $this->name = $this->parent->get_name() . '_' . $this->id;
	}

	/**
	 * @param string $name
	 * @return $this
	 */
	public function set_name( $name ) {
		$this->name = $name;

		return $this;
	}

	/**
	 * @return string
	 */
	public function get_name_attribute() {
		if ( null !== $this->name_attribute ) {
			return $this->name_attribute;
		}

		if ( $this->parent instanceof Custom_Post_Type ) {
			return $this->name_attribute = '_' . $this->id;
		}

		return $this->name_attribute = $this->parent->get_name_attribute() . '_' . $this->id;
	}

	/**
	 * @param string $name_attribute
	 * @return $this
	 */
	public function set_name_attribute( $name_attribute ) {
		$this->name_attribute = $name_attribute;

		return $this;
	}

	/**
	 * @return string
	 */
	public function get_json_data() {
		if ( ! $this->json_data ) {
			$this->set_json_data();
		}

		return $this->json_data;
	}

	/**
	 * @return $this
	 */
	public function set_json_data() {
		$this->json_data = array();
		$this->json_data['id'] = $this->get_id();

		$children = $this->get_children();
		if ( ! empty( $children ) ) {
			$fields = array();
			foreach ( $children as $child ) {
				if ( $child instanceof Custom_Field ) {
					$fields[$child->get_id()] = $child->get_json_data();
				}
			}
			$this->json_data['fields'] = $fields;
		}

		return $this;
	}

	/**
	 * @return void
	 */
	public function enqueue_scripts() {
		if ( $this->parent->show_on_current_screen() ) {
			$children = $this->get_children();
			if ( ! empty( $children ) ) {
				foreach ( $children as $child ) {
					if ( $child instanceof Custom_Field ) {
						$child->enqueue_scripts();
					}
				}
			}
		}
	}

	/**
	 * @return bool
	 */
	public function show_on_current_screen() {
		if ( $this->parent ) {
			return $this->parent->show_on_current_screen();
		}

		return false;
	}
	
}
