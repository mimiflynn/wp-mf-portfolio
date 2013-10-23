<?php
/**
 * @package WordPress
 * @subpackage mimiflynn
 */
?>
  <article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
		<header class="entry-header">
			<h2 class="entry-title"><?php the_title(); ?></h2>
		</header><!-- .entry-header -->
		<div class="entry-summary">
			<?php the_content(); ?>
		</div><!-- .entry-summary -->
  </article><!-- #post-<?php the_ID(); ?> -->
