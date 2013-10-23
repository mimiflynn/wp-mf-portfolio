<?php
/**
 * @package WordPress
 * @subpackage mimiflynn
 */
?>
  <article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
		<div class="entry-summary">
			<?php the_content(); ?>
		</div><!-- .entry-summary -->
  </article><!-- #post-<?php the_ID(); ?> -->
