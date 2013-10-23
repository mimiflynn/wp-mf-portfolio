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
  <section class="resume">
  <?php if (have_posts()) : while ( have_posts() ) : the_post();
  ?>
  <header class="entry-header">
      <h2 class="entry-title"><?php the_title(); ?></h2>
    </header><!-- .entry-header -->
  <?php get_template_part('content', 'resume'); ?>
  <?php endwhile; else: ?>
  <h2>Not Found</h2>
  <p>
    Sorry, but you are looking for something that isn't here.
  </p>
  <?php get_search_form(); ?>
  <?php endif; ?>
  <aside>
    <?php if ( function_exists('dynamic_sidebar') && dynamic_sidebar('Resume Sidebar') ) : else : ?>
    <?php endif; ?>
  </aside>
  </section>
</div>

<?php get_footer(); ?>

