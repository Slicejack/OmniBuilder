<?php
/**
 * Core Post type
 *
 * @package OmniBuilder
 */

namespace OmniBuilder;

use OmniBuilder\Custom_Post_Type;

/**
 * Core Post type class
 */
class Core_Post_Type extends Custom_Post_Type {
	/**
	 * Function that returns boolean
	 *
	 * @var function
	 */
	private $show_when;

	/**
	 * Constructor
	 *
	 * @param string   $name   Post type name.
	 * @param array    $fields Metaboxes.
	 * @param function $show_when Callable function.
	 */
	public function __construct( $name, array $fields = array(), $show_when = '__return_true' ) {
		$this->name = $name;
		$this->json_data = array();
		$this->screen = null;
		$this->show_when = is_callable( $show_when ) ? $show_when : '__return_true';

		foreach ( $fields as $field ) {
			if ( $field instanceof Custom_Meta_Box ) {
				$field->set_parent( $this );
				$this->json_data[ $field->get_id() ] = $field->get_json_data();
			}
		}

		$this->subscribe();
	}

	/**
	 * Get Post type name.
	 *
	 * @return string
	 */
	public function get_name() {
		return $this->name;
	}

	/**
	 * Get singular Post type name.
	 *
	 * @return string
	 */
	public function get_singular() {
		return $this->name;
	}

	/**
	 * Get plural Post type name.
	 *
	 * @return string
	 */
	public function get_plural() {
		return $this->name;
	}

	/**
	 * Show on current screen?
	 *
	 * @return bool
	 */
	public function show_on_current_screen() {
		if ( $this->show_on_current_screen ) {
			return $this->show_on_current_screen;
		}

		$current_screen = get_current_screen();

		if ( is_admin() && $this->name === $current_screen->post_type && true === call_user_func( $this->show_when, $this ) ) {
			return $this->show_on_current_screen = true;
		}

		return $this->show_on_current_screen = false;
	}

	/**
	 * Register post type
	 *
	 * @return void
	 */
	public function register_post_type() {
		return;
	}

	/**
	 * Subscribe to hooks
	 *
	 * @return void
	 */
	protected function subscribe() {
		add_action( 'admin_enqueue_scripts', array( &$this, 'localize' ) );
	}
}
