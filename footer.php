<?php
/**
 * @package WordPress
 * @subpackage mimiflynn
 */
?>

  </div>
  <footer id="site-footer">
    <div class="wrapper">
      <?php get_template_part('section', 'contact'); ?>
      <?php if ( function_exists('dynamic_sidebar') && dynamic_sidebar('Site Footer') ) : else : ?>
      <?php endif; ?>
      <?php wp_footer(); ?>
    </div>    
  </footer>
</body>
</html>
