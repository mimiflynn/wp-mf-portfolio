<?php
/**
 * @package WordPress
 * @subpackage mimiflynn
 */
/*
 Template Name: Resume
 */

get_header();
?>

<div id="main" role="main" class="wrapper">
  <section id="contact">
    <?php get_template_part('section', 'contact'); ?>
    <?php if ( function_exists('dynamic_sidebar') && dynamic_sidebar('Site Footer') ) : else : ?>
    <?php endif; ?>
  </section>
</div>
</div>
<?php wp_footer(); ?>
</body>
</html>
