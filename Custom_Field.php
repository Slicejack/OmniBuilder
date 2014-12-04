<?php

namespace OmniBuilder;

abstract class Custom_Field extends Custom_Form_Element {

	/**
	 * @var array
	 */
	protected $options;

	/**
	 * @var mixed
	 */
	protected $value;

	/**
	 * @var string
	 */
	public $type = 'default';

	/**
	 * @param string $id
	 * @param array $options
	 * @param array $children
	 */
	public function __construct( $id, array $options = array(), array $children = array() ) {
		$this->id = $id;
		$this->parent = null;
		$this->children = array();
		$this->name = null;
		$this->value = null;
		$this->options = $options;

		foreach ( $children as $child ) {
			$this->children[ $child->get_id() ] = $child;
		}
	}

	/**
	 * @return mixed
	 */
	abstract public function render();

	/**
	 * @param Custom_Form_Element $parent
	 * @return $this
	 */
	public function prepare( Custom_Form_Element $parent ) {
		$this->parent = $parent;
		$this->name = $this->get_name();
		$this->value = $this->get_stored_value();

		foreach ( $this->children as $child ) {
			$child->prepare( $this );
		}

		return $this;
	}

	/**
	 * @return mixed
	 */
	public function get_value() {
		return $value;
	}

	/**
	 * @param mixed $value
	 * @return $this
	 */
	public function set_value( $value ) {
		$this->value = $value;

		return $this;
	}

	/**
	 * @return array
	 */
	public function get_options() {
		return $this->options;
	}

	/**
	 * @param array
	 * @return $this
	 */
	public function set_options( array $options ) {
		$this->options = $options;

		return $this;
	}

	/**
	 * @return string
	 */
	public function get_field_attributes() {
		$attributes = ' ';
		$attributes .= 'name="' . $this->get_name_attribute() . '" ';

		if ( isset( $this->options['attributes'] ) ) {
			foreach ( $this->options['attributes'] as $attribute => $value ) {
				$attributes .= $attribute . '="' . $value . '" ';
			}
		}

		return $attributes;
	}

	/**
	 * @return array|null
	 */
	public function get_stored_value() {
		$action = ( isset( $_GET['action'] ) )? $_GET['action'] : null ;
		$post_id = ( isset( $_GET['post'] ) )? $_GET['post'] : null ;
		$is_editing = ( strstr($_SERVER['REQUEST_URI'], 'wp-admin/post.php') && $action == 'edit' && $post_id );

		if ( $is_editing && get_post( $post_id ) ) {
			$post = get_post( sanitize_text_field( $post_id ) );
			return get_post_meta( $post_id, '_' . $this->get_name(), true );
		}

		return null;
	}

	/**
	 * @return string|null
	 */
	public function get_posted_value() {
		return ( isset( $_POST[ '_' . $this->get_name() ] ) )? (string) $_POST[ '_' . $this->get_name() ] : null ;
	}

	/**
	 * @{inheritDoc}
	 */
	public function set_json_data() {
		parent::set_json_data();

		$this->json_data['type'] = $this->type;

		if ( ! empty( $this->options['label'] ) )
			$this->json_data['label'] = $this->options['label'];

		if ( ! empty( $this->options['description'] ) )
			$this->json_data['description'] = $this->options['description'];

		if ( ! empty( $this->options['default_value'] ) )
			$this->json_data['default_value'] = $this->options['default_value'];

		return $this;
	}

	/**
	 * @{inheritDoc}
	 */
	public function enqueue_scripts() {
		wp_enqueue_script( 'ob-field', OMNI_BUILDER_URI . '/Resources/js/Field.js', array( 'ob-metabox' ), '0.1', true );
		parent::enqueue_scripts();
	}

}
