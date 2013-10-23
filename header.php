<?php
/**
 * @package WordPress
 * @subpackage mimiflynn
 */
?>

<!DOCTYPE html>
<!--[if IE 6]>
<html id="ie6" <?php language_attributes(); ?> class="no-js">
<![endif]-->
<!--[if IE 7]>
<html id="ie7" <?php language_attributes(); ?> class="no-js">
<![endif]-->
<!--[if IE 8]>
<html id="ie8" <?php language_attributes(); ?> class="no-js">
<![endif]-->
<!--[if !(IE 6) | !(IE 7) | !(IE 8)  ]><!-->
<html <?php language_attributes(); ?> class="no-js">
<!--<![endif]-->
  <head>
    <meta charset="<?php bloginfo('charset'); ?>" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=3.0, user-scalable=yes" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
    <meta name="description" content="" />
    <title><?php
    /*
     * Print the <title> tag based on what is being viewed.
     */
    global $page, $paged;

    wp_title('|', true, 'right');

    // Add the blog name.
    bloginfo('name');

    // Add the blog description for the home/front page.
    $site_description = get_bloginfo('description', 'display');
    if ($site_description && (is_home() || is_front_page()))
      echo " | $site_description";
      ?></title>
    <link rel="image_src" href="<?php echo get_template_directory_uri(); ?>/images/logo.png" />
    <link rel="shortcut icon" type="image/x-png" href="<?php echo get_template_directory_uri(); ?>/images/favicon.png" />
    <link rel="profile" href="http://gmpg.org/xfn/11" />
    <link rel="pingback" href="<?php bloginfo('pingback_url'); ?>" />
    <!--[if lt IE 9]>
    <script src="<?php echo get_template_directory_uri(); ?>/js/html5.js" type="text/javascript"></script>
    <![endif]-->
    <?php
    if (is_singular() && get_option('thread_comments'))
      wp_enqueue_script('comment-reply');
    wp_head();
    ?>
  </head>

  <body <?php body_class(); ?>>
  <!-- Prompt IE 6 users to install Chrome Frame..
       chromium.org/developers/how-tos/chrome-frame-getting-started -->
  <!--[if lt IE 7]><p class=chromeframe>Your browser is <em>ancient!</em> <a href="http://browsehappy.com/">Upgrade to a different browser</a> or <a href="http://www.google.com/chromeframe/?redirect=true">install Google Chrome Frame</a> to experience this site.</p><![endif]-->
    <header id="branding" role="banner">
      <h1 id="site-title"><a href="<?php bloginfo('siteurl'); ?>" title="<?php echo esc_attr(get_bloginfo('name', 'display')); ?>" rel="home"><?php bloginfo('name');  ?> <?php bloginfo( 'description' ); ?></a></h1>
      <div class="menus">
        <nav class="main-menu"><?php wp_nav_menu(array('theme_location' => 'main-menu')); ?></nav>
      </div>
    </header>
    <div id="content">
    
