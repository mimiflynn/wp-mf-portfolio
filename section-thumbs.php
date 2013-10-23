<?php
/**
 * @package WordPress
 * @subpackage mimiflynn
 */
?>
<section class="pane thumbs">
  <div class="thumbs">
    
    <?php $taxonomy = 'project_tax'; ?>
    
    <?php $post_type = 'project'; ?>
    
    <?php $categories = get_categories( array ('type' => $post_type, 'taxonomy' => $taxonomy, 'orderby' => 'count', 'order' => 'desc' ) ); ?>
 
    <?php foreach ($categories as $category) : ?>
   
      <?php $thumbs = new WP_Query(array('post_type' => $post_type, 'posts_per_page' => -1, 'tax_query' => array( array ( 'taxonomy' => $taxonomy, 'terms' => $category) ) ) ); ?>
      
      <div class="category">
      
        <h3><?php echo $category->name; ?></h3>
  
        <?php if ( have_posts() ): ?>
  
            <?php while ( $thumbs->have_posts() ) : $thumbs->the_post(); ?>
    
              <?php get_template_part('content', 'thumbs'); ?>
     
            <?php endwhile; ?> 
     
        <?php endif; ?>
      
      </div>
           
    <?php endforeach; ?>
    
  </div>
</section>