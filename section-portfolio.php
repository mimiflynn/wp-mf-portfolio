<?php
/**
 * @package WordPress
 * @subpackage mimiflynn
 */
?>
<section class="pane portfolio">
  <div class="slideshow">
    <?php if (have_posts()) : while ( have_posts() ) : the_post(); ?>
      
      <?php get_template_part('content', 'portfolio'); ?>

    <?php endwhile; ?>
    <?php else: ?>
      <h2>Not Found</h2>
      <p>
        Sorry, but you are looking for something that isn't here.
      </p>
      <?php get_search_form(); ?>
    <?php endif; ?>
  </div>
</section>