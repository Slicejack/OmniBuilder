<?php

namespace OmniBuilder\Field;

use OmniBuilder\Custom_Field;

class Hidden extends Custom_Field {

	/**
	 * @var string
	 */
	public $type = 'hidden';

	/**
	 * @{inheritDoc}
	 */
	public function render() { ?>
		<script type="text/html" id="tmpl-ob-field-hidden">
			<input type="{{ data.type }}" name="{{ data.name }}" id="{{ data.name }}" value="{{ data.value }}"{{ data.attributes }} />
		</script>
	<?php
	}

	/**
	 * {@inheritdoc}
	 */
	public function enqueue_scripts() {
		wp_enqueue_script( 'ob-field-hidden', OMNI_BUILDER_URI . '/Resources/js/Field/Hidden.js', array( 'ob-field' ), '0.1', true );
		parent::enqueue_scripts();
	}

}
