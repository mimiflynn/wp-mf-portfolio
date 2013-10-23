<?php
/**
 * @package WordPress
 * @subpackage mimiflynn
 */
?>
<?php
$about_id = 50;
$about_page = get_post($about_id);
?>
<section class="pane about">
  <h2><?php echo apply_filters('the_content', $about_page->post_title); ?></h2>
  <?php echo apply_filters('the_content', $about_page->post_content); ?>
</section>