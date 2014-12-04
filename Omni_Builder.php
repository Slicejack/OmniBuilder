<?php

if ( !defined('OMNI_BUILDER_URI') && is_admin() ) {
	die("OMNI_BUILDER_URI is undefined");
}

include 'Inflector.php';
include 'Custom_Form_Element.php';
include 'Custom_Field.php';
include 'Custom_Post_Type.php';
include 'Custom_Meta_Box.php';

include 'Field/Collection.php';
include 'Field/Fieldset.php';
include 'Field/Text.php';
include 'Field/Textarea.php';
include 'Field/Checkbox.php';
include 'Field/Radio.php';
include 'Field/Select.php';

function load_custom_wp_admin_style() {
	wp_enqueue_style( 'ob', OMNI_BUILDER_URI . '/Resources/css/ob.css', array(), '0.1', 'all' );
	wp_enqueue_script( 'ob', OMNI_BUILDER_URI . '/Resources/js/ob.js', array( 'wp-util', 'backbone' ), '0.1', true );
}
add_action( 'admin_enqueue_scripts', 'load_custom_wp_admin_style' );
