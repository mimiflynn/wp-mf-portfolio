<?php
/**
 * @package WordPress
 * @subpackage HTML5_Boilerplate
 */

get_header();
?>

<div id="main" role="main" class="wrapper">
  <?php if (have_posts()) : while ( have_posts() ) : the_post();
  ?>
  <?php get_template_part('content', 'single'); ?>
  <?php endwhile; else: ?>
  <h2>Not Found</h2>
  <p>
    Sorry, but you are looking for something that isn't here.
  </p>
  <?php get_search_form(); ?>
  <?php endif; ?>
</div>

<?php get_footer(); ?>

