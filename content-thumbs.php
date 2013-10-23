<?php
/**
 * @package WordPress
 * @subpackage mimiflynn
 */
?>
  <div class="img-wrapper">
    <?php
    if (has_post_thumbnail()) {

      $image_id = get_post_thumbnail_id();
      $image_url = wp_get_attachment_image_src($image_id, 'portfolio');
      $image_url = $image_url[0];
    ?>
      <a href="<?php the_permalink(); ?>">

      <?php the_post_thumbnail('mobile-thumb'); ?>
      </a>
    <?php } ?>
  </div>
