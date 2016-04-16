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
	public function render() { ?>
		<script type="text/html" id="tmpl-ob-collection">
			<div class="ob-field__header">
				<div class="ob-field__header__titles">
					<# if ( data.label ) { #><h4 class="title">{{ data.label }}</h4><# } #>
					<# if ( data.description ) { #><div class="description">{{ data.description }}</div><# } #>
				</div>
				<div class="ob-field__header__actions">
					<div class="<# if ( data.blocks ) { #>choose<# } else { #>add<# } #> button">{{ data.button }}<# if ( data.blocks ) { #>
						<div class="blocks"><!--
						<# for ( var block in data.blocks ) { #>
							--><div class="block" data-block="{{ block }}">{{ data.blocks[ block ].label }}</div><!--
						<# } #>
						--></div>
					<# } #></div>
					<div class="numbers">
						<div class="size"></div><!--
						--><div class="limit"></div>
					</div>
				</div>
			</div>
			<div class="ob-field__content">
				<div class="messages">
					<div class="error-limit error"><?php esc_html_e( 'Limit is exceeded!', 'ob' ); ?></div>
				</div>
				<div class="fields"></div>
				<div class="messages">
					<div class="error-limit error"><?php esc_html_e( 'Limit is exceeded!', 'ob' ); ?></div>
				</div>
			</div>
			<div class="ob-field__footer">
				<div class="ob-field__footer__titles">
					<# if ( data.label ) { #><h4 class="title">{{ data.label }}</h4><# } #>
					<# if ( data.description ) { #><div class="description">{{ data.description }}</div><# } #>
				</div>
				<div class="ob-field__footer__actions">
					<div class="<# if ( data.blocks ) { #>choose<# } else { #>add<# } #> button">{{ data.button }}<# if ( data.blocks ) { #>
						<div class="blocks"><!--
						<# for ( var block in data.blocks ) { #>
							--><div class="block" data-block="{{ block }}">{{ data.blocks[ block ].label }}</div><!--
						<# } #>
						--></div>
					<# } #></div>
					<div class="numbers">
						<div class="size"></div><!--
						--><div class="limit"></div>
					</div>
				</div>
			</div>
		</script>
		<script type="text/html" id="tmpl-ob-collection-fieldset">
			<# var id = data.id + 1; #>
			<div>
				<table>
					<tr>
						<th class="id-wrapper drag-handler"><div class="id">{{ id }}</div></th>
						<td>
							<div class="fieldset-content">
								<# if ( data.label ) { #><h4 class="title">{{ data.label }}</h4><# } #>
								<div class="description">{{ data.description }}</div>
								<div class="fields"></div>
								<div class="remove button">Remove</div>
							</div>
						</td>
					</tr>
				</table>
			</div>
		</script>

		<?php foreach ( $this->children as $child ) {
			if ( $child instanceof Custom_Field ) {
				$child->render();
			}
		}
	}

	/**
	 * @{inheritDoc}
	 */
	public function set_json_data() {
		parent::set_json_data();

		if ( isset( $this->options['button'] ) && ! empty( $this->options['button'] ) ) {
			$this->json_data['button'] = $this->options['button'];
		}

		if ( isset( $this->options['limit'] ) && ! empty( $this->options['limit'] ) ) {
			$this->json_data['limit'] = $this->options['limit'];
		}
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

class Collection_Block extends Custom_Field {
	/**
	 * @todo stop this if Collection is not parent element
	 */

	/**
	 * @var string
	 */
	public $type = 'collection-block';

	/**
	 * {@inheritdoc}
	 */
	public function __construct( $id, array $options = array(), array $children = array() ) {
		parent::__construct( $id, $options, $children );

		$this->children = array_merge(
			array(
				'type' => new Hidden( 'type', array( 'default_value' => $id ) ),
			),
			$this->children
		);
	}

	/**
	 * {@inheritdoc}
	 */
	public function render() { ?>
		<script type="text/html" id="tmpl-ob-collection-block">
			<# var id = data.id + 1; #>
			<div>
				<table>
					<tr>
						<th class="id-wrapper drag-handler"><div class="id">{{ id }}</div></th>
						<td>
							<div class="fieldset-content">
								<# if ( data.label ) { #><h4 class="title">{{ data.label }}</h4><# } #>
								<div class="description">{{ data.description }}</div>
								<div class="fields"></div>
								<div class="remove button">Remove</div>
							</div>
						</td>
					</tr>
				</table>
			</div>
		</script>

		<?php foreach ( $this->children as $child ) {
			if ( $child instanceof Custom_Field ) {
				$child->render();
			}
		}
	}

	/**
	 * @{inheritDoc}
	 */
	public function set_json_data() {
		parent::set_json_data();

		if ( isset( $this->options['limit'] ) && ! empty( $this->options['limit'] ) )
			$this->json_data['limit'] = $this->options['limit'];
	}

}
