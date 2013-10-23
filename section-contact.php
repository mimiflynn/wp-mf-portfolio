<?php
/**
 * @package WordPress
 * @subpackage mimiflynn
 */
?>
<?php
$contact_id = 51;
$contact_page = get_post($contact_id);
?>
<section class="pane contact">
  <h2><?php echo apply_filters('the_content', $contact_page->post_title); ?></h2>
  <?php echo apply_filters('the_content', $contact_page->post_content); ?>
</section>