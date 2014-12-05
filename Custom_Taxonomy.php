<?php

namespace OmniBuilder;

class Custom_Taxonomy {

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
	 * @var Custom_Post_Type
	 */
	private $post_type;

	/**
	 * @var array
	 */
	private $args;

	/**
	 * @param string $name
	 * @param Custom_Post_Type $post_type
	 * @param array $args
	 */
	public function __construct( $name, Custom_Post_Type $post_type, array $args = array() ) {
		$this->name = \Inflector::underscore( $name );
		$this->plural = \Inflector::titleize($this->name);
		$this->singular = \Inflector::singularize($this->plural);
		$this->post_type = $post_type;
		$this->args = $args;

		if ( ! isset( $this->args['labels'] ) ) {
			$this->args['labels'] = array(
				'name'              => __( $this->plural ),
				'singular_name'     => __( $this->singular ),
				'search_items'      => __( 'Search ' . $this->plural ),
				'all_items'         => __( 'All ' . $this->plural ),
				'parent_item'       => __( 'Parent ' . $this->singular ),
				'parent_item_colon' => __( 'Parent ' . $this->singular ),
				'edit_item'         => __( 'Edit ' . $this->singular ),
				'update_item'       => __( 'Update ' . $this->singular ),
				'add_new_item'      => __( 'Add New ' . $this->singular ),
				'new_item_name'     => __( 'New ' . $this->singular . ' Name' ),
				'menu_name'         => __( $this->plural )
			);
		}

		$this->subscribe();
	}

	/**
	 * @return void
	 */
	public function register_taxonomy() {
		register_taxonomy(
			$this->name,
			$this->post_type->get_name(),
			$this->args
		);
	}

	/**
	 * @return void
	 */
	protected function subscribe() {
		add_action( 'init', array( &$this, 'register_taxonomy' ) );
	}

}