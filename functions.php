<?php

/*
 * Supported Features
 * -------------------------------------------------------------------------- */

add_theme_support( 'automatic-feed-links' );
add_theme_support( 'post-thumbnails' );
add_theme_support( 'custom-background' );



/*
 * Specify Image Sizes
 * -------------------------------------------------------------------------- */
add_image_size( 'desktop-thumb', 900, 550, false ); //430 pixels wide and 360 pixels high
add_image_size( 'mobile-thumb', 200, 200, true ); //200 pixels wide and 200 pixels high




/*
 * Include the theme's custom widgets
 * -------------------------------------------------------------------------- */
require_once dirname( __FILE__ ) . '/widgets/twitter-widget.php';
//require_once dirname( __FILE__ ) . '/widgets/sponsors-widget.php';
//require_once dirname( __FILE__ ) . '/widgets/ad-widget.php';




/*
 * Include the theme's custom colors
 * -------------------------------------------------------------------------- */

function mimiflynn_customize_register( $wp_customize ) {
  // All our sections, settings, and controls will be added here
  
  // Site Title
  $wp_customize->add_setting( 'title_text' , array(
    'default'     => '#333333',
    'transport'   => 'refresh',
    )
  );
  
  // Menu
  $wp_customize->add_setting( 'menu_color' , array(
    'default'     => '#333333',
    'transport'   => 'refresh',
    )
  );
  $wp_customize->add_setting( 'menu_text' , array(
    'default'     => '#FFFFFF',
    'transport'   => 'refresh',
    )
  );
  
  // Content
  $wp_customize->add_setting( 'content_color' , array(
    'default'     => '#efefef',
    'transport'   => 'refresh',
    )
  );
  
  // Slideshow Background
  $wp_customize->add_setting( 'slideshow_color' , array(
    'default'     => '#FFFFFF',
    'transport'   => 'refresh',
    )
  );
  
  // Sections
  $wp_customize->add_setting( 'section_color' , array(
    'default'     => '#DDDDDD',
    'transport'   => 'refresh',
    )
  );
  $wp_customize->add_setting( 'section_text' , array(
    'default'     => '#333333',
    'transport'   => 'refresh',
    )
  );
  
  // Footer
  $wp_customize->add_setting( 'footer_color' , array(
    'default'     => '#CCCCCC',
    'transport'   => 'refresh',
    )
  );
  $wp_customize->add_setting( 'footer_text' , array(
    'default'     => '#333333',
    'transport'   => 'refresh',
    )
  );
  
  // add custom color control to wp provided 'colors' section
  
  // Title
  $wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize,
    'mimiflynn_title_text', array(
      'label'        => __( 'Title Color', 'mimiflynn' ),
      'section'    => 'colors',
      'settings'   => 'title_text',
      )
    )
  );
  
  // Menu
  $wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize,
    'mimiflynn_menu_color', array(
      'label'        => __( 'Menu Color', 'mimiflynn' ),
      'section'    => 'colors',
      'settings'   => 'menu_color',
      )
    )
  );
  $wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize,
    'mimiflynn_menu_text', array(
      'label'        => __( 'Menu Text', 'mimiflynn' ),
      'section'    => 'colors',
      'settings'   => 'menu_text',
      )
    )
  );
  
  // Content
  $wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize,
    'mimiflynn_content_color', array(
      'label'        => __( 'Content Color', 'mimiflynn' ),
      'section'    => 'colors',
      'settings'   => 'content_color',
      )
    )
  );
  
  // Slideshow Background
  $wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize,
    'mimiflynn_slideshow_color', array(
      'label'        => __( 'Slideshow Background Color', 'mimiflynn' ),
      'section'    => 'colors',
      'settings'   => 'slideshow_color',
      )
    )
  );
  
  // Section
  $wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize,
    'mimiflynn_section_color', array(
      'label'        => __( 'Section Color', 'mimiflynn' ),
      'section'    => 'colors',
      'settings'   => 'section_color',
      )
    )
  );
  $wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize,
    'mimiflynn_section_text', array(
      'label'        => __( 'Section Text', 'mimiflynn' ),
      'section'    => 'colors',
      'settings'   => 'section_text',
      )
    )
  );
  
  // Footer
  $wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize,
    'mimiflynn_footer_color', array(
      'label'        => __( 'Footer Color', 'mimiflynn' ),
      'section'    => 'colors',
      'settings'   => 'footer_color',
      )
    )
  );
  $wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize,
    'mimiflynn_footer_text', array(
      'label'        => __( 'Footer Text', 'mimiflynn' ),
      'section'    => 'colors',
      'settings'   => 'footer_text',
      )
    )
  );
}
add_action( 'customize_register', 'mimiflynn_customize_register' );


// Add CSS overrides to header
function mimiflynn_customize_css() {
  ?>
  <style type="text/css">
    
    #branding h1 a{
      color: <?php echo get_theme_mod('title_text'); ?>;
    }
    #branding .menus {
      background: <?php echo get_theme_mod('menu_color'); ?>;
      color: <?php echo get_theme_mod('menu_text'); ?>;
    }
    
    #content,
    .no-touch .home #content {
      background: <?php echo get_theme_mod('content_color'); ?>;
      border-top: <?php echo get_theme_mod('menu_color'); ?> 3px solid;
    }
    
    section#contact,
    section.about,
    section.resume {
      background: <?php echo get_theme_mod('section_color');?>;
      color: <?php echo get_theme_mod('section_text');?>;
    }
    
    section#contact h2,
    section.about h2,
    section.resume h2 {
      border-bottom: <?php echo get_theme_mod('section_text');?> 3px solid;
    }
    
    section#contact aside,
    section.about aside,
    section.resume aside {
      border-left: <?php echo get_theme_mod('section_text');?> 1px solid;
    }
    
    .no-touch section.portfolio .project {
      background: <?php echo get_theme_mod('slideshow_color');?>;
    }
    
    #site-footer {
      background: <?php echo get_theme_mod('footer_color');?>;
      color: <?php echo get_theme_mod('footer_text');?>;
      border-top: <?php echo get_theme_mod('menu_color'); ?> 3px solid;
      border-bottom: <?php echo get_theme_mod('menu_color'); ?> 3px solid;
    }
    #site-footer a {
      color: <?php echo get_theme_mod('footer_text');?>; 
    }
    #site-footer .widgetContainer h3 {
      border-bottom: <?php echo get_theme_mod('footer_text');?> 2px solid;
    }
    
  </style>
  <?php
}
add_action( 'wp_head', 'mimiflynn_customize_css' );


/*
 * String utility 
 */

function nls2p( $str ) {
  return str_replace('<p></p>', '', '<p>'
  . preg_replace('#([\r\n]\s*?[\r\n]){2,}#', '</p>$0<p>', $str)
  . '</p>');
}

 

/*
 * Add JS
 * -------------------------------------------------------------------------- */
function mimiflynn_scripts_method() {
  $mimiflynn_modernizr = get_template_directory_uri() . '/js/libs/modernizr-2.5.3.min.js';
  wp_enqueue_script('mimiflynn_modernizr', $mimiflynn_modernizr);
  wp_enqueue_script('jquery', null, null, null, true);
  $mimiflynn_plugins = get_template_directory_uri() . '/js/plugins.js';
  wp_enqueue_script('mimiflynn_plugins', $mimiflynn_plugins, null, null, true);
  $mimiflynn_script = get_template_directory_uri() . '/js/script.js';
  wp_enqueue_script('mimiflynn_script', $mimiflynn_script, null, null, true);
  
  //make site url available to js
  $data = array('site_url' => __(site_url()));
  wp_localize_script('mimiflynn_script','php_data', $data);
}
add_action('wp_enqueue_scripts','mimiflynn_scripts_method');



/*
 * Add CSS
 * -------------------------------------------------------------------------- */
function mimiflynn_style_method() {
  $mimiflynn_style = get_template_directory_uri() . '/css/screen.css';
  wp_enqueue_style('mimiflynn_style', $mimiflynn_style);
}
add_action('wp_enqueue_scripts','mimiflynn_style_method');



/*
 * Menus
 * -------------------------------------------------------------------------- */

/* Menu locations */
function register_my_menus() {
	register_nav_menus(
		array(
      'main-menu' =>  'Main Menu',
      'social-media' => 'Social Media'
		)
	);
}
add_action( 'init', 'register_my_menus' );


/* create standard scroll menu */
$menu_name = 'Site Nav';

// Check if the menu exists
$menu_exists = wp_get_nav_menu_object( $menu_name );

// If it doesn't exist, let's create it.
if( !$menu_exists){
  $menu_id = wp_create_nav_menu($menu_name);

  // Set up default menu items
  wp_update_nav_menu_item($menu_id, 0, array(
    'menu-item-title' =>  __('Portfolio'),
    'menu-item-classes' => 'portfolio',
    'menu-item-url' => home_url( '/portfolio' ), 
    'menu-item-status' => 'publish'));

  wp_update_nav_menu_item($menu_id, 0, array(
    'menu-item-title' =>  __('Resume'),
    'menu-item-url' => home_url( '/resume' ), 
    'menu-item-status' => 'publish'));
  wp_update_nav_menu_item($menu_id, 0, array(
    'menu-item-title' =>  __('About'),
    'menu-item-url' => home_url( '/about' ), 
    'menu-item-status' => 'publish'));
  wp_update_nav_menu_item($menu_id, 0, array(
    'menu-item-title' =>  __('Contact'),
    'menu-item-url' => home_url( '/contact' ), 
    'menu-item-status' => 'publish'));
}


/* assign above menu to a menu location */
/*
$locations = get_theme_mod('nav_menu_locations');
$locations['main-menu'] = 'site-nav';
set_theme_mod('nav_menu_locations', $locations);
*/


/*
 * Sidebars
 * -------------------------------------------------------------------------- */
if ( function_exists('register_sidebar') ) {
	register_sidebar(array(
		'name' => 'Homepage Footer',
		'before_widget' => '<section id="%1$s" class="widgetContainer %2$s">',
		'after_widget' => '</section>',
		'before_title' => '<h3 class="widgetTitle">',
		'after_title' => '</h3>'
	));
  register_sidebar(array(
    'name' => 'Site Footer',
    'before_widget' => '<section id="%1$s" class="widgetContainer %2$s">',
    'after_widget' => '</section>',
    'before_title' => '<h3 class="widgetTitle">',
    'after_title' => '</h3>'
  ));
  register_sidebar(array(
    'name' => 'Resume Sidebar',
    'before_widget' => '<div id="%1$s" class="widgetContainer %2$s">',
    'after_widget' => '</div>',
    'before_title' => '<h3 class="widgetTitle">',
    'after_title' => '</h3>'
  ));
}



/*
 * Custom Post Types
 * -------------------------------------------------------------------------- */

/* Project Post Type */
function post_type_project() {
  $new_post_type = 'project';
  register_post_type( $new_post_type,array(
    'label' => ucfirst($new_post_type).'s',
    'public' => true,
    'show_ui' => true,
    'singular_label' => $new_post_type,
    'capability_type' => 'post',
    'heirarchical' => 'true',
    'supports' => array('title', 'editor', 'page-attributes', 'thumbnail')
    )
  );
  register_taxonomy( $new_post_type . '_tax', $new_post_type, array(
    'hierarchical' => true,
    'label' => ucfirst($new_post_type . ' Categories')
    )
  );
  register_taxonomy_for_object_type('post_tag', $new_post_type);
}
add_action('init', 'post_type_project');



/*
 * Filter to only show project post types on front page
 * -------------------------------------------------------------------------- */
function mimiflynn_get_projects( $query ) {

  if ( $query->is_home() && $query->is_main_query() ) {
    $query->set( 'post_type', array( 'project' ) );
  }
  
  return $query;
  
}
add_filter( 'pre_get_posts', 'mimiflynn_get_projects' );


/**
* Check for plugin dependencies
*
* @package    TGM-Plugin-Activation
* @subpackage Example
* @version    2.3.6
* @author     Thomas Griffin <thomas@thomasgriffinmedia.com>
* @author     Gary Jones <gamajo@gamajo.com>
* @copyright  Copyright (c) 2012, Thomas Griffin
* @license    http://opensource.org/licenses/gpl-2.0.php GPL v2 or later
* @link       https://github.com/thomasgriffin/TGM-Plugin-Activation
*/

/**
* Include the TGM_Plugin_Activation class.
*/
require_once dirname( __FILE__ ) . '/includes/class-tgm-plugin-activation.php';

add_action( 'tgmpa_register', 'mimiflynn_register_required_plugins' );
/**
* Register the required plugins for this theme.
*
* The variable passed to tgmpa_register_plugins() should be an array of plugin
* arrays.
*
* This function is hooked into tgmpa_init, which is fired within the
* TGM_Plugin_Activation class constructor.
*/
function mimiflynn_register_required_plugins() {

/**
* Array of plugin arrays. Required keys are name and slug.
* If the source is NOT from the .org repo, then source is also required.
*/
$plugins = array(

// This is an example of how to include a plugin pre-packaged with a theme
array(
'name'                => 'Dynamic Content Widget', // The plugin name
'slug'                => 'dynamic-content-widget', // The plugin slug (typically the folder name)
'required'            => true, // If false, the plugin is only 'recommended' instead of required
'version'             => '', // E.g. 1.0.0. If set, the active plugin must be this version or higher, otherwise a notice is presented
'force_activation'    => true, // If true, plugin is activated upon theme activation and cannot be deactivated until theme switch
'force_deactivation'  => false, // If true, plugin is deactivated upon theme switch, useful for theme-specific plugins
'external_url'        => '', // If set, overrides default API URL and points to an external URL
),
array(
'name'                => 'Admin Bar',
'slug'                => 'admin-bar',
'required'            => true,
),
array(
'name'                => 'JSON API',
'slug'                => 'json-api',
'required'            => true,
'force_activation'    => true,
),
array(
'name'                => 'WordPress Database Backup',
'slug'                => 'wp-db-backup',
'required'            => true,
),
array(
'name'                => 'Regenerate Thumbnails',
'slug'                => 'regenerate-thumbnails',
'required'            => false,
),

);

// Change this to your theme text domain, used for internationalising strings
$theme_text_domain = 'mimiflynn';

/**
* Array of configuration settings. Amend each line as needed.
* If you want the default strings to be available under your own theme domain,
* leave the strings uncommented.
* Some of the strings are added into a sprintf, so see the comments at the
* end of each line for what each argument will be.
*/
$config = array(
'domain'                                => $theme_text_domain,  // Text domain - likely want to be the same as your theme.
'default_path'                          => '',                  // Default absolute path to pre-packaged plugins
'parent_menu_slug'                      => 'themes.php',        // Default parent menu slug
'parent_url_slug'                       => 'themes.php',        // Default parent URL slug
'menu'                                  => 'install-required-plugins',  // Menu slug
'has_notices'                           => true,                // Show admin notices or not
'is_automatic'                          => false,             // Automatically activate plugins after installation or not
'message'                               => '',              // Message to output right before the plugins table
'strings'                               => array(
'page_title'                            => __( 'Install Required Plugins', $theme_text_domain ),
'menu_title'                            => __( 'Install Plugins', $theme_text_domain ),
'installing'                            => __( 'Installing Plugin: %s', $theme_text_domain ), // %1$s = plugin name
'oops'                                  => __( 'Something went wrong with the plugin API.', $theme_text_domain ),
'notice_can_install_required'           => _n_noop( 'This theme requires the following plugin: %1$s.', 'This theme requires the following plugins: %1$s.' ), // %1$s = plugin name(s)
'notice_can_install_recommended'        => _n_noop( 'This theme recommends the following plugin: %1$s.', 'This theme recommends the following plugins: %1$s.' ), // %1$s = plugin name(s)
'notice_cannot_install'                 => _n_noop( 'Sorry, but you do not have the correct permissions to install the %s plugin. Contact the administrator of this site for help on getting the plugin installed.', 'Sorry, but you do not have the correct permissions to install the %s plugins. Contact the administrator of this site for help on getting the plugins installed.' ), // %1$s = plugin name(s)
'notice_can_activate_required'          => _n_noop( 'The following required plugin is currently inactive: %1$s.', 'The following required plugins are currently inactive: %1$s.' ), // %1$s = plugin name(s)
'notice_can_activate_recommended'       => _n_noop( 'The following recommended plugin is currently inactive: %1$s.', 'The following recommended plugins are currently inactive: %1$s.' ), // %1$s = plugin name(s)
'notice_cannot_activate'                => _n_noop( 'Sorry, but you do not have the correct permissions to activate the %s plugin. Contact the administrator of this site for help on getting the plugin activated.', 'Sorry, but you do not have the correct permissions to activate the %s plugins. Contact the administrator of this site for help on getting the plugins activated.' ), // %1$s = plugin name(s)
'notice_ask_to_update'                  => _n_noop( 'The following plugin needs to be updated to its latest version to ensure maximum compatibility with this theme: %1$s.', 'The following plugins need to be updated to their latest version to ensure maximum compatibility with this theme: %1$s.' ), // %1$s = plugin name(s)
'notice_cannot_update'                  => _n_noop( 'Sorry, but you do not have the correct permissions to update the %s plugin. Contact the administrator of this site for help on getting the plugin updated.', 'Sorry, but you do not have the correct permissions to update the %s plugins. Contact the administrator of this site for help on getting the plugins updated.' ), // %1$s = plugin name(s)
'install_link'                          => _n_noop( 'Begin installing plugin', 'Begin installing plugins' ),
'activate_link'                         => _n_noop( 'Activate installed plugin', 'Activate installed plugins' ),
'return'                                => __( 'Return to Required Plugins Installer', $theme_text_domain ),
'plugin_activated'                      => __( 'Plugin activated successfully.', $theme_text_domain ),
'complete'                              => __( 'All plugins installed and activated successfully. %s', $theme_text_domain ), // %1$s = dashboard link
'nag_type'                              => 'updated' // Determines admin notice type - can only be 'updated' or 'error'
)
);

tgmpa( $plugins, $config );

}
?>
