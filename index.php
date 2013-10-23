<?php
/**
 * @package WordPress
 * @subpackage mimiflynn
 */

get_header();
?>

<div id="main" role="main" class="wrapper">
  <?php get_template_part('section', 'portfolio'); ?>
  <?php get_template_part('section', 'thumbs'); ?>
  <?php get_template_part('section', 'resume'); ?>
  <?php get_template_part('section', 'about'); ?>
</div>
  <footer id="site-footer">
    <div class="wrapper">
      <?php get_template_part('section', 'contact'); ?>
      <?php if ( function_exists('dynamic_sidebar') && dynamic_sidebar('Homepage Footer') ) : else : ?>
      <?php endif; ?>
      <?php wp_footer(); ?>
    </div>    
  </footer>
</div>
</body>
</html>