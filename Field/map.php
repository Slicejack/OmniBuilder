<?php
/**
 * Map field
 *
 * @package OmniBuilder
 */

namespace OmniBuilder\Field;

use OmniBuilder\Custom_Field;

/**
 * Map field class
 */
class Map extends Custom_Field {

	/**
	 * Field type
	 *
	 * @var string
	 */
	public $type = 'map';

	/**
	 * Allowed attributes
	 *
	 * @var array
	 */
	protected $allowed_attributes = array();

	/**
	 * Field template
	 *
	 * @return mixed
	 */
	public function render() {
?>
		<script type="text/html" id="tmpl-ob-field-map">
			<label for="{{ data.name }}">{{ data.label }}</label>
			<div class="description">{{ data.description }}</div>
			<# if ( ! data.mapbox_public_token.length ) { #>
			<div class="warning-message"><?php echo wp_kses( apply_filters( 'omnibuilder_mapbox_public_token_warning_message', 'Missing Mapbox Public Token' ), array( 'a' => array( 'href' => array() ) ) ); ?>
			<# } else { #>
				<div id="{{ data.name }}" style="width: 100%; min-height: 300px;"></div>
				<# if ( data.subfields.length > 0 ) { #>
				<div class="subfields">
				<#
					var i, l;
					for ( i = 0, l = data.subfields.length; i < l; i += 1 ) {
					#>
					<div class="{{ data.subfields[i].classes }}-wrapper">
						<label for="{{ data.subfields[i].name }}">{{ data.subfields[i].label }}</label>
						<input name="{{ data.subfields[i].name }}" id="{{ data.subfields[i].name }}" value="{{ data.subfields[i].value }}" class="{{ data.subfields[i].classes }}">
					</div>
					<#
					}
				#>
				</div>
				<# } #>
			<# } #>
		</script>
	<?php
	}

	/**
	 * Set json data
	 *
	 * @return Map
	 */
	public function set_json_data() {
		parent::set_json_data();

		if ( isset( $this->options['mapbox_public_token'] ) && ! empty( $this->options['mapbox_public_token'] ) ) {
			$this->json_data['mapbox_public_token'] = $this->options['mapbox_public_token'];
		}

		return $this;
	}

	/**
	 * Load scripts and styles
	 */
	public function enqueue_scripts() {
		wp_enqueue_script( 'ob-mapbox', 'https://api.mapbox.com/mapbox.js/v2.2.3/mapbox.js', array(), '', true );
		wp_enqueue_style( 'ob-metabox', 'https://api.mapbox.com/mapbox.js/v2.2.3/mapbox.css' );
		wp_enqueue_script( 'ob-field-map', OMNI_BUILDER_URI . '/Resources/js/Field/map.js', array( 'ob-field', 'ob-metabox' ), '0.1', true );
		parent::enqueue_scripts();
	}
}
