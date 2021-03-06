/* 
 * Author: Mimi Flynn mimi at mimiflynn dot com
 *
 **/

/*jslint undef: true, sloppy: true, todo: true, vars: true, white: true */

( function($) {

    var MF = MF || {};

    MF.namespace = function(ns_string) {
      var parts = ns_string.split('.'), parent = MF, i;

      // strip redundant leading global
      if (parts[0] === "MF") {
        parts = parts.slice(1);
      }

      for ( i = 0; i < parts.length; i += 1) {
        // create a property if it doesn't exist
        if ( typeof parent[parts[i]] === "undefined") {
          parent[parts[i]] = {};
        }
        parent = parent[parts[i]];
      }
      return parent;
    };

    MF.namespace('MF.Content');

    MF.Content = ( function() {

        /**
         *  pulls JSON and outputs requested info inside
         *
         *  @method WpLoop
         *  @param url of JSON, container for output, query to pull from JSON, item to output, setEvents callback for events associated with output
         *  @return html into specified container with specified item
         **/
        var WpLoop = {

          insertContent : function(items, container, item, setEvents) {

            var index = 0;

            for (index in items) {

              // loop through items
              if (items.hasOwnProperty(index)) {

                var field = items[index][item];

                var output = '<div class="item"><div class="' + item + '">' + field + '</div></div>';

                // output items
                $(output).appendTo(container);

              }
            }

            //add events for above content here
            if (setEvents) {
              setEvents();
            }

          },

          onJsonReceived : function(query, container, item, setEvents) {

            var insertContent = this.insertContent;

            return function(data) {

              var items = data[query];

              insertContent(items, container, item, setEvents);

            };
          },

          init : function(url, container, query, item, setEvents) {

            this.container = container;
            this.url = url;

            $.getJSON(this.url, this.onJsonReceived(query, container, item, setEvents));

          }
        };

        /**
         *  pulls large images from JSON and replaces img scr with them
         *
         *  @method WpLoop
         *  @param url of JSON, container for output
         *  @return changes source of images
         **/
        var WpPostImgReplacement = {

          insertContent : function(items, container, after) {

            var domImages = [];

            //make array of existing image tags
            $(container).each(function(index) {

              domImages[index] = this;

              index += 1;

            });

            //reset index
            index = 0;

            for (index in items) {

              //swap out image source
              if (items.hasOwnProperty(index)) {
                var field = items[index].attachments[0].url;

                domImages[index].src = field;
              }
            }

            //add events for above content here
            $(container).removeClass('attachment-mobile-thumb').attr('width', '100%').attr('height', 'auto');

            if (after) {
              after();
            }

          },

          onJsonReceived : function(container, after) {

            var insertContent = this.insertContent;

            return function(data) {

              var items = data.posts;

              insertContent(items, container, after);

            };
          },

          init : function(url, container, after) {

            this.url = url;
            this.container = container;
            this.after = after;

            $.getJSON(this.url, this.onJsonReceived(container, after));

          }
        };

        return {

          WpPostImgReplacement : WpPostImgReplacement

        };

      }());

    MF.namespace('MF.Sitewide');

    MF.Sitewide = ( function() {

        var setScreenSize = function() {

        };

        var setTwitter = function(el) {

          $(el).tweet({
            join_text : "auto",
            username : "corinneIOZO",
            //avatar_size : 48,
            count : 4,
            auto_join_text_default : "",
            auto_join_text_ed : "",
            auto_join_text_ing : "",
            auto_join_text_reply : "",
            auto_join_text_url : "",
            loading_text : "loading tweets...",
            template : "{join} {text} {time}"
          });

        };

        var cycleThumbnails = function(idx, slide) {

          var imgName = $('img', slide).attr('src');
          return '<li><a href="#"><img src="' + imgName + '" /></a></li>';

        };

        var cyclePagerBuilder = function(el) {

          //  get ID of parent element to create unique pager ID
          var elementID = $(el).parent().attr('id');

          return "<div id='" + elementID + "-controller-bar' class='controller-bar'>[][][]</div><nav class='controller'><ul id='" + elementID + "-cycle-pager' class='cycle-pager'></ul></nav>";

        };

        var toggleController = function() {

          var controller = $('.controller');

          //  set controller hover activation
          $('.controller-bar').click(function() {
            controller.stop().fadeIn(1000);
            $(this).addClass('clicked').removeClass('controller-bar');
          });

          $('html').click(function() {
            controller.stop().fadeOut(1000);
            $('.clicked').addClass('controller-bar').removeClass('clicked');
          });

          $('.controller-bar, .controller').click(function(e) {
            e.stopPropagation();
          });

        };

        var setFeatureCycle = function(el) {

          $(el).each(function() {
            
            //  get ID of parent element to point cycle to right pager
            var elementID = $(this).parent().attr('id');
            var nextPrevious = '<div class="slideshow-nav"><a href="#" id="' + elementID + '-prev" class="prev">Back</a><a href="#" id="' + elementID + '-next" class="next">Next</a></div>';
            var prev = "#" + elementID + "-prev";
            var next = "#" + elementID + "-next";

            //  make it cycle
            //$(this).after(cyclePagerBuilder(this)).after(nextPrevious).cycle({
            $(this).after(nextPrevious).cycle({
              timeout : 0,
              fx : 'scrollHorz',
              //pagerAnchorBuilder : cycleThumbnails,
              prev : prev,
              next : next
            });

          });

          toggleController();

        };

        var init = function() {

          setTwitter('#mf-tweets');

        };

        return {

          setFeatureCycle : setFeatureCycle,
          init : init

        };

      }());

    MF.namespace('MF.Home');

    MF.Home = ( function() {

        // Import Dependencies
        var imgReplacement = MF.Content.WpPostImgReplacement, setFeatureCycle = MF.Sitewide.setFeatureCycle;

        // define urls for easy reference
        var url = {

          blog : php_data.site_url + '?json=get_recent_posts',
          recentProjects : php_data.site_url + '?json=get_recent_posts&post_type=project'

        };

        // define dom elements to house new content
        var dom = {

          blog : '',
          recentProjects : '#content',
          imgReplacement : '.wp-post-image'

        };

        // define extra markup
        var elements = {

          content : '<div id="content">'

        };

        // for after json load
        var showSlideshow = function(el) {

          $(el).fadeIn(1000);

        };

        //  position content area to make space for background photo
        var setHeaderSize = function() {

          var windowHeight = $(window).height();

          $('#content').css({
            'top' : windowHeight
          });

        };

        var velocity = function(el, header) {
          
          var wWidth = $(window).width(),
              spacing = $(header).height(),
              offset = $(el).offset();

          //  Create consistent velocity!
          //  Perfect velocity = 2550px per 3000milliseconds = .85 you know, since v = d/t

          var current = window.pageYOffset;
          //  get current position
          var movement = offset.top - spacing;
          //  set distance for movement from the top minus space for header
          var distance = current - movement;
          //  get distance from current position
          distance = Math.abs(distance);
          //  can't use negative numbers
          var speed = distance / 1.105;
          //  1.105 is the velocity!
          
          return {
            speed: speed,
            movement: movement
          }

        };

        //  animate scroll to section
        var sectionScroll = function(el, header) {
          
          var wWidth = $(window).width();

          //  run only in desktop mode
          if (wWidth >= 601) {
            
            var v = velocity(el, header);

            $('html, body').stop().animate({
              scrollTop : v.movement
            }, v.speed);

          }

        };

        var setHomeNav = function(el, header) {

          //  Start Home page navigation scroll
          $(el).on('click', 'a', function(e) {
            e.preventDefault();
            var target = $(this).html().toLowerCase();
            sectionScroll('.pane.' + target, header);
          });

          //  set h1 to scroll to top
          $('h1').on('click', 'a', function(e) {
            e.preventDefault();
            $('html, body').stop().animate({
              scrollTop : 0
            }, velocity('#branding'));
          });

        };

        var slideshow = '.slideshow';

        var init = function() {

          //  set display and events
          setHomeNav('#menu-site-nav', '#branding')
          setHeaderSize();
          $(window).resize(setHeaderSize);

          //  portfolio section
          setFeatureCycle(slideshow);
          $(slideshow).hide();
          //imgReplacement.init(url.recentProjects, dom.imgReplacement, showSlideshow(slideshow));
          showSlideshow(slideshow);

        };
        
        var mobile = function() {
          
          //  portfolio section
          setFeatureCycle(slideshow);
          
        };

        return {

          init : init,
          mobile :  mobile

        };

      }());

    MF.namespace('MF.initSite');

    MF.initSite = function() {
      
      //  Initialize site for Desktop
      if ($('html').hasClass('no-touch')) {

        MF.Sitewide.init();

        if ($('body').hasClass('home')) {
          
          MF.Home.init();
          
        }

      }
      
      if ($('html').hasClass('touch')) {
        
        MF.Sitewide.init();
        MF.Home.mobile();
        
      }

    };

    /* Document Ready? Do this!
     * ------------------------------------------------------------------------ */
    $(document).ready(function() {

      MF.initSite();

      $('html.js').fadeIn(1000);

    });

  }(jQuery));
