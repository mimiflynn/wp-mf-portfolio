<?php
/**
 * @package WordPress
 * @subpackage mimiflynn
 */
?>
 <article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
		<header class="entry-header">
			<?php if ( is_sticky() ) : ?>
				<hgroup>
					<h3 class="entry-title"><a href="<?php the_permalink(); ?>" title="<?php printf( esc_attr__( 'Permalink to %s', 'mimiflynn' ), the_title_attribute( 'echo=0' ) ); ?>" rel="bookmark"><?php the_title(); ?></a></h3>
					<h3 class="entry-format"><?php _e( 'Featured', 'mimiflynn' ); ?></h3>
				</hgroup>
			<?php else : ?>
			<h3 class="entry-title"><a href="<?php the_permalink(); ?>" title="<?php printf( esc_attr__( 'Permalink to %s', 'mimiflynn' ), the_title_attribute( 'echo=0' ) ); ?>" rel="bookmark"><?php the_title(); ?></a></h3>
			<?php endif; ?>
		</header><!-- .entry-header -->
		<div class="entry-summary">
			<?php the_content(); ?>
		</div><!-- .entry-summary -->
  </article><!-- #post-<?php the_ID(); ?> -->
