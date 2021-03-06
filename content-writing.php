<?php
/**
 * @package WordPress
 * @subpackage mimiflynn
 */
?>
<article id="portfolio-<?php the_ID(); ?>" <?php post_class(); ?>>
  <div class="img-wrapper">
	 <a href="<?php the_permalink(); ?>" title="<?php printf(esc_attr__('Permalink to %s', 'mimiflynn'), the_title_attribute('echo=0')); ?>" rel="bookmark">
	<?php
  if (has_post_thumbnail()) {
    // landing-thumb defined in functions.php
    the_post_thumbnail('desktop-thumb');
  }
  ?>
    </a>
  </div>
  <h3 class="entry-title"><a href="<?php the_permalink(); ?>" title="<?php printf(esc_attr__('Permalink to %s', 'mimiflynn'), the_title_attribute('echo=0')); ?>" rel="bookmark"><?php the_title(); ?></a></h3>
</article><!-- #post-<?php the_ID(); ?> -->
