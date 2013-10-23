<?php
/**
 * @package WordPress
 * @subpackage mimiflynn
 */

get_header();
?>

<section id="main" role="main" class="wrapper">
  <?php if (have_posts()) : while ( have_posts() ) : the_post();
  ?>
  <?php get_template_part('content', 'page'); ?>
  <?php endwhile; else: ?>
  <h2>Not Found</h2>
  <p>
    Sorry, but you are looking for something that isn't here.
  </p>
  <?php get_search_form(); ?>
  <?php endif; ?>
</section>

<?php get_footer(); ?>

