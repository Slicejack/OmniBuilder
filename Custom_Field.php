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
	 * @var array
	 */
	protected $allowed_attributes = array();

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
		$this->set_options( $options );

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
		$this->validate_options();

		return $this;
	}

	/**
	 * Validate options
	 * @return $this
	 */
	private function validate_options() {
		if ( ! is_array( $this->options ) )
			$this->options = array();
		elseif ( isset( $this->options['attributes'] ) ) {
			if ( ! is_array( $this->options['attributes'] ) )
				$this->options['attributes'] = array();
			else {
				foreach ( $this->options['attributes'] as $attribute => $value ) {
					if ( ! in_array( strtolower( $attribute ), $this->allowed_attributes ) && substr( strtolower( $attribute ), 0, 5 ) != 'data-' ) continue;
					$this->options['attributes'][$attribute] = esc_attr( $value );
				}
			}
		}

		return $this;
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
	 * @return boolean
	 */
	public function is_posted() {
		return ( isset( $_POST[ '_' . $this->get_name() ] ) ) ? true : false;
	}

	/**
	 * @return string|null
	 */
	public function get_posted_value() {
		return $this->is_posted() ? (string) $_POST[ '_' . $this->get_name() ] : null;
	}

	/**
	 * @{inheritDoc}
	 */
	public function set_json_data() {
		parent::set_json_data();

		$this->json_data['type'] = $this->type;

		if ( isset( $this->options['label'] ) && ! empty( $this->options['label'] ) )
			$this->json_data['label'] = $this->options['label'];

		if ( isset( $this->options['description'] ) && ! empty( $this->options['description'] ) )
			$this->json_data['description'] = $this->options['description'];

		if ( isset( $this->options['default_value'] ) && ! empty( $this->options['default_value'] ) )
			$this->json_data['default_value'] = $this->options['default_value'];

		if ( isset( $this->options['attributes'] ) && ! empty( $this->options['attributes'] ) )
			$this->json_data['attributes'] = $this->options['attributes'];

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
