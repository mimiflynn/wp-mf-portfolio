<?php
/**
 * Plugin Name: mf Twitter Widget  
 * Description: Twitter Widget that outputs mimiflynn's twitter feed. Creates a space to initialize jquery.tweet.js - See http://tweet.seaofclouds.com/ or https://github.com/seaofclouds/tweet for more info
 * Version: 0.1
 * Author: Mimi Flynn
 * Author URI: http://mimiflynn.com
 */


add_action( 'widgets_init', 'mf_twitter_widget' );


function mf_twitter_widget() {
	register_widget( 'mf_Twitter_Widget' );
}

class mf_Twitter_Widget extends WP_Widget {

	function mf_Twitter_Widget() {
		$widget_ops = array( 'classname' => 'mf-twitter', 'description' => __('Twitter Widget that outputs mimiflynn twitter feed ', 'mf') );
		
		$control_ops = array( 'width' => 300, 'height' => 350, 'id_base' => 'mf-twitter-widget' );
		
		$this->WP_Widget( 'mf-twitter-widget', __('mf Twitter', 'mf'), $widget_ops, $control_ops );
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
			printf( '<div class="subhead">' . __('%1$s', 'mf') . '</div>', $subhead );
      
    //  Create container for tweets
    echo '<div id="mf-tweets"></div>';
		
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
		$defaults = array( 'title' => __('Corinne\'s Twitter', 'mf'), 'subhead' => __('@corinneIozo', 'mf') );
		$instance = wp_parse_args( (array) $instance, $defaults ); ?>

		<p>
			<label for="<?php echo $this->get_field_id( 'title' ); ?>"><?php _e('Title:', 'mf'); ?></label>
			<input id="<?php echo $this->get_field_id( 'title' ); ?>" name="<?php echo $this->get_field_name( 'title' ); ?>" value="<?php echo $instance['title']; ?>" style="width:100%;" />
		</p>

		<p>
			<label for="<?php echo $this->get_field_id( 'subhead' ); ?>"><?php _e('Subhead:', 'mf'); ?></label>
			<input id="<?php echo $this->get_field_id( 'subhead' ); ?>" name="<?php echo $this->get_field_name( 'subhead' ); ?>" value="<?php echo $instance['subhead']; ?>" style="width:100%;" />
		</p>

	<?php
	}
}

?>