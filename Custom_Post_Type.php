<?php

namespace OmniBuilder;

class Custom_Post_Type {

	/**
	 * @var string
	 */
	private $name;

	/**
	 * @var string
	 */
	private $singular;

	/**
	 * @var string
	 */
	private $plural;

	/**
	 * @var array
	 */
	public $json_data;

	/**
	 * @var bool
	 */
	public $show_on_current_screen;

	/**
	 * @param string $name
	 */
	public function __construct( $name, array $fields = array(), array $args = array(), $public = true ) {
		$this->name = \Inflector::underscore( \Inflector::singularize($name) );
		$this->singular = \Inflector::titleize($name);
		$this->plural = \Inflector::pluralize($this->singular);
		$this->json_data = array();
		$this->screen = null;
		$this->args = $args;

		foreach ( $fields as $field ) {
			if ( $field instanceof Custom_Meta_Box ) {
				$field->set_parent( $this );
				$this->json_data[ $field->get_id() ] = $field->get_json_data();
			}
		}

		if ( ! isset( $this->args['public'] ) ) {
			$this->args['public'] = $public;
		}

		if ( ! isset( $this->args['labels'] ) ) {
			$this->args['labels'] = array(
				'name'                 => __( $this->singular ),
				'singular_name'        => __( $this->singular ),
				'menu_name'            => __( $this->plural ),
				'name_admin_bar'       => __( $this->singular ),
				'add_new'              => __( 'Add New' ),
				'add_new_item'         => __( 'Add New ' . $this->singular ),
				'edit_item'            => __( 'Edit ' . $this->singular ),
				'view_item'            => __( 'View ' . $this->singular ),
				'all_items'            => __( 'All ' . $this->plural ),
				'search_items'         => __( 'Search ' . $this->plural ),
				'parent_item_colon'    => __( 'Parent ' . $this->plural . ':' ),
				'not_found'            => __( 'No ' . strtolower( $this->plural ) . ' found.' ),
				'not_found_in_trash'   => __( 'No ' . strtolower( $this->plural ) . ' found in trash.' )
			);
		}

		$this->subscribe();
	}

	/**
	 * @param string $name
	 * @param array $args
	 * @return $this
	 */
	public function add_taxonomy( $name, array $args = array() ) {
		new Custom_Taxonomy( $name, $this );

		return $this;
	}

	/**
	 * @param string $id
	 * @param string $title
	 * @param array $fields
	 * @return $this
	 */
	public function add_meta_box( $id, $title, array $fields = array() ) {
		new Custom_Meta_Box( $id, $title, $fields, $this );

		return $this;
	}

	/**
	 * @return string
	 */
	public function get_name() {
		return $this->name;
	}

	/**
	 * @return string
	 */
	public function get_singular() {
		return $this->singular;
	}

	/**
	 * @return string
	 */
	public function get_plural() {
		return $this->plural;
	}

	/**
	 * @return void
	 */
	public function localize() {
		if ( $this->show_on_current_screen() ) {
			wp_localize_script( 'ob', 'ob', $this->json_data );
		}
	}

	/**
	 * @return bool
	 */
	public function show_on_current_screen() {
		if ( $this->show_on_current_screen )
			return $this->show_on_current_screen;

		$current_screen = get_current_screen();

		if ( in_array( $current_screen->base, array( 'post' ) ) && $current_screen->post_type == $this->name ) {
			return $this->show_on_current_screen = true;
		}

		return $this->show_on_current_screen = false;
	}

	/**
	 * @return void
	 */
	public function register_post_type() {
		if ( ! post_type_exists( $this->name ) ) {
			register_post_type( $this->name, $this->args );
		}
	}

	/**
	 * @return void
	 */
	protected function subscribe() {
		add_action( 'init', array( &$this, 'register_post_type' ) );
		add_action( 'admin_enqueue_scripts', array( &$this, 'localize' ) );
	}

}
