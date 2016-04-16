<?php

namespace OmniBuilder;

class Custom_Meta_Box extends Custom_Form_Element {

	/**
	 * @var string
	 */
	private $title;

	/**
	 * @param string $id
	 * @param string $title
	 * @param array $fields
	 * @param Custom_Post_Type $parent
	 */
	public function __construct( $id, $title, array $children = array(), Custom_Post_Type $parent = null ) {
		$this->id = $id;
		$this->name = $id;
		$this->title = $title;
		$this->parent = $parent;
		$this->children = array();

		foreach ( $children as $child ) {
			if ( $child instanceof Custom_Field ) {
				$child->prepare( $this );
				$this->children[$child->get_id()] = $child;
			}
		}

		$this->subscribe();
	}

	/**
	 * @return void
	 */
	public function set_meta_box() {
		if ( true === $this->parent->show_on_current_screen() ) {
			add_meta_box( $this->id, $this->title, array( &$this, 'populate_meta_box' ), $this->parent->get_name(), 'normal' );
		}
	}

	/**
	 * @return void
	 */
	public function populate_meta_box() {
		?>
		<div class="ob-metabox-wrapper"></div>
		<div class="ob-metabox-templates">
			<script type="text/html" id="tmpl-ob-metabox">
				<div class="fields"></div>
			</script>

			<?php foreach ( $this->children as $child ) {
				if ( $child instanceof Custom_Field ) {
					$child->render();
				}
			} ?>

		</div>
		<?php
	}

	/**
	 * @param int $post_id
	 * @return void
	 */
	public function save_meta_box_data( $post_id ) {
		if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
			return null;
		}

		if( ! current_user_can( get_post_type_object( get_post_type( $post_id ) )->cap->edit_post, $post_id ) ) {
			return null;
		}

		$this->save( $post_id, $this->children );
	}

	/**
	 * @param int $post_id
	 * @param array $fields
	 */
	public function save( $post_id, $fields ) {
		foreach ( $fields as $field ) {
			$value = $field->get_posted_value();
			if ( $field->is_posted() ) {
				if ( is_array( $value ) && isset( $value['children'] ) ) {
					$this->save( $post_id, $value['children'] );
				} else {
					update_post_meta( $post_id, '_' . $field->get_name(), $value );
				}
			}
		}
	}

	/**
	 * @return array
	 */
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
	 * @return $this
	 */
	private function subscribe() {
		add_action( 'admin_enqueue_scripts', array( &$this, 'enqueue_scripts' ) );
		add_action( 'add_meta_boxes', array( &$this, 'set_meta_box' ) );
		add_action( 'save_post', array( &$this, 'save_meta_box_data' ) );

		return $this;
	}

	/**
	 * {@inheritdoc}
	 */
	public function set_json_data() {
		parent::set_json_data();
		$this->json_data['title'] = $this->title;
		$this->json_data['settings'] = $this->get_stored_value();

		return $this;
	}

	/**
	 * {@inheritdoc}
	 */
	public function enqueue_scripts() {
		wp_enqueue_script( 'ob-metabox', OMNI_BUILDER_URI . '/Resources/js/Metabox.js', array( 'ob' ), '0.1', true );
		parent::enqueue_scripts();
	}

}
