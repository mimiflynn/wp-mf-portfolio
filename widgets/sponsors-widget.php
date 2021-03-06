<?php
/**
 * Plugin Name: ADC Sponsors Widget  
 * Description: Outputs 6 featured sponsors to be places on any landing page.
 * Version: 0.1
 * Author: Mimi Flynn
 * Author URI: http://four32c.com
 */


add_action( 'widgets_init', 'adc_sponsors_widget' );


function adc_sponsors_widget() {
	register_widget( 'ADC_Sponsors_Widget' );
}

class ADC_Sponsors_Widget extends WP_Widget {

	function ADC_Sponsors_Widget() {
		$widget_ops = array( 'classname' => 'adc-sponsors', 'description' => __('Sponsors widget that outputs featured sponsors', 'adc') );
		
		$control_ops = array( 'width' => 300, 'height' => 350, 'id_base' => 'adc-sponsors-widget' );
		
		$this->WP_Widget( 'adc-sponsors-widget', __('ADC Sponsors', 'adc'), $widget_ops, $control_ops );
	}
	
	function widget( $args, $instance ) {
		extract( $args );

		//Our variables from the widget settings.
		$title = apply_filters('widget_title', $instance['title'] );
		$subhead = $instance['subhead'];

		echo $before_widget;

		// Display the widget title 
		if ( $title )
			echo $before_title . $title . $after_title;

		// Output Subhead
		if ( $subhead )
			printf( '<div class="subhead">' . __('%1$s.', 'adc') . '</div>', $subhead );
		
		echo $after_widget;
	}

	//Update the widget 
	 
	function update( $new_instance, $old_instance ) {
		$instance = $old_instance;

		//Strip tags from title and name to remove HTML 
		$instance['title'] = strip_tags( $new_instance['title'] );
		$instance['subhead'] = strip_tags( $new_instance['subhead'] );

		return $instance;
	}

	
	function form( $instance ) {

		//Set up some default widget settings.
		$defaults = array( 'title' => __('ADC Tweets', 'adc'), 'subhead' => __('@ADCGlobal', 'adc') );
		$instance = wp_parse_args( (array) $instance, $defaults ); ?>

		<p>
			<label for="<?php echo $this->get_field_id( 'title' ); ?>"><?php _e('Title:', 'adc'); ?></label>
			<input id="<?php echo $this->get_field_id( 'title' ); ?>" name="<?php echo $this->get_field_name( 'title' ); ?>" value="<?php echo $instance['title']; ?>" style="width:100%;" />
		</p>

		<p>
			<label for="<?php echo $this->get_field_id( 'subhead' ); ?>"><?php _e('Subhead:', 'adc'); ?></label>
			<input id="<?php echo $this->get_field_id( 'subhead' ); ?>" name="<?php echo $this->get_field_name( 'subhead' ); ?>" value="<?php echo $instance['subhead']; ?>" style="width:100%;" />
		</p>

	<?php
	}
}

?>