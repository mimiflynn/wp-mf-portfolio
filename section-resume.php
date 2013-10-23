<?php
/**
 * @package WordPress
 * @subpackage mimiflynn
 */
?>
<?php
$resume_id = 52;
$resume_page = get_post($resume_id);
?>
<section class="pane resume">
  <h2><?php echo apply_filters('the_content', $resume_page->post_title); ?></h2>
  <article>
    <?php echo apply_filters('the_content', $resume_page->post_content); ?>
  </article>
  <aside>
    <?php if ( function_exists('dynamic_sidebar') && dynamic_sidebar('Resume Sidebar') ) : else : ?>
    <?php endif; ?>
  </aside>
</section>