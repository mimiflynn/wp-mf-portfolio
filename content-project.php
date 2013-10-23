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
			<?php echo nls2p(get_post_meta( $id, 'project_description', true )); ?>
		</div><!-- .entry-summary -->
  </article><!-- #post-<?php the_ID(); ?> -->
