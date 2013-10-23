/** Drag-Panel plugin.  Developed on jquery 1.7.1 **/

/* HELPFUL MAYBE
 *
 * The plugin assumes the "pulltab" and "pane" elements have the same dimensions, are positioned absolutely and are
 * located in the positions the designer wants them to be.  When the pulltab is dragged by the user, its postion is
 * modified horizontally in tandem with the mouse cursor movement, and when it comes to rest again, it's either gonna be
 * in the same place or aligned with the opposite side of the pane. Currently only horizontal pulling is supported.
 *
 * SAMPLE HTML

<div id="wrap"> <!-- Any parent element that contains all of the control elements dragify cares about ("pulltab" and "pane") can be selected by jquery -->

    <div class="pulltab" style="background-color: blue"> <!-- the pulltab.  aligned with the left side of the pane by default TODO: default alignment options -->
        PULL ME
    </div>

  	<div class="pane" style="background-color: red; z-index: 60"> <!-- first pane. should have position: absolute -->
      this is a wrapper
      <div class="inner"> <!-- inner content pane.  this is actually what corresponds to the "alternate" version of the second pane -->
          <br/>
          <br/>
          <br/>
          <br/>
          this is content?  this could be content
      </div>
  	</div>

  	<div class="pane" style="background-color: green; z-index: 50"> <!-- second pane.  should have same (absolute) location and dimensions as the first panel -->
      this is a wrapper on the bottom pane
      <div class="inner">
          <br/>
          <br/>
          <br/>
          <br/>
          this is content?  yep this is content
      </div>
  	</div>

</div>

<script type="text/javascript">
$(document).ready(function() {
    $('#wrap').dragify();
});
</script>

*/
(function($) {
    var UT = {
        containerKey: 'container',
        stateKey: 'pull-state',
        stateLeft: 'left',
        stateRight: 'right',

        getPanes: function(container) {
            return container.find('.' + $.fn.dragify.defaults.paneCss);
        },

        getTab: function(container, defaults) {
            var tabCss = defaults? defaults.tabCss : $.fn.dragify.defaults.tabCss;
            return container.find('.' + tabCss);
        },

        getFirstPane: function(container) {
            var panes = UT.getPanes(container);
            if(panes && panes.length > 0) {
                return $(panes[0]);
            } else {
                return null;
            }
        },

        getSecondPane: function(container) {
            var panes = UT.getPanes(container);
            if(panes && panes.length > 1) {
                return $(panes[1]);
            } else {
                return null;
            }
        },

        getContent: function(parent) {
            return parent.find('.' + $.fn.dragify.defaults.contentCss);
        },

        getSnapTo: function(ui, dest) {
            var helper = ui.helper? ui.helper : ui;  // if called during a drag, ui will be the drag events' ui object, otherwise it'll be the "helper" itself (the pulltab)
            var split = ui.helper? ui.position.left : helper.position().left;

            var container = helper.data(UT.containerKey);
            var second = UT.getSecondPane(container);

            var forced = dest? true : false;

            // if a destination state wasn't provided, determine by toggling current state
            if(!forced) {
                var state = helper.data(UT.stateKey);
                if(state == UT.stateLeft) {
                    dest = UT.stateRight;
                } else if(state == UT.stateRight) {
                    dest = UT.stateLeft;
                }
            }

            var snapTo = 0;
            if(dest == UT.stateRight) {
                snapTo = 0;
                // if the threshold is crossed, snap to the right.  otherwise, snap to the left
                if(split > $.fn.dragify.defaults.snapThreshold || forced) {
                    snapTo = second.width();
                }
            }
            if(dest == UT.stateLeft) {
                snapTo = second.width();
                // if the threshold is crossed, snap to the left.  otherwise, snap to the right
                if(split < second.width() - $.fn.dragify.defaults.snapThreshold || forced) {
                    snapTo = 0;
                }
            }
            return snapTo;
        },

        /**
         * Ensures that the draggable object doesn't exceed certain bounds.
         **/
        enforceBounds: function(ui) {
            // grab the container from the draggable pulltab.
            var container = ui.helper.data(UT.containerKey);
            var second = UT.getSecondPane(container);   // grabbing second pane cuz it's fixed
            
            ui.position.top = ui.helper.offset().top; // hold horizontal
            // enforce left side bounds
            if(ui.position.left < second.offset().left) {
                ui.position.left = second.offset().left;
            }
            // enforce right side bounds
            if(ui.position.left > second.width()) {
                ui.position.left = second.width();
            }
        },

        updateDivider: function(x, container, animate) {
            var first = UT.getFirstPane(container);
            var second = UT.getSecondPane(container);

            // either animate the transition or jump straight there
            if(animate) {
                // when animating, we set the same end result values as when jumping straight there, but we also assign the following handler
                // to the jquery UI's hook for each animation step (since we're animating multiple dependent-but-DOMly-unrelated elements in a custom way).
                // Specifically, the pane and the pane's inner content offsets will be frame-by-frame dependent on the pulltab animation.
                var tab = UT.getTab(container);
                tab.animate({
                    left: x + 'px'
                }, {
                    step: function(now, fx) {
                        // what oh I'm so clever
                        UT.updateDivider(now, container);
                    },
                    duration: 250
                });
            } else {
                // reposition the wrapper pane
                first.css({
                    left: x + 'px'
                })
                .width(second.width()-x);
                // reposition the content frame to account for wrapper frame change.  The idea is that the content
                // should appear to stay stationary
                var content = UT.getContent(first);
                content.css({
                    left: -(second.width() - first.width()) + 'px'
                });
                // the pulltab didn't have to be repositioned because either the animation api handled that,
                // or the drag api handled that, one presumes.  OR DO THEY
            }
        },

        // Returns true if the given container has already been initialized, false otherwise
        initialized: function(container, defaults) {
            var tab = UT.getTab(container, defaults);
            return tab && tab.data(UT.containerKey);
        },

        initPanes: function(container) {
            // wireup the pulltab
            var tab = UT.getTab(container);
            if(tab && !UT.initialized(container)) {     // if the tab is defined and hasn't been initialized yet, do init
                tab.data(UT.containerKey, container);
                tab.data(UT.stateKey, UT.stateLeft);

                tab.draggable({
                    start: UT.startDrag,
                    drag: UT.dragging,
                    stop: UT.stopDrag
                });
            }
        },

        startDrag: function(evt, ui) {
        },

        dragging: function(evt, ui) {
            // enforce bounds
            UT.enforceBounds(ui);

            // determine the current split line and adjust first pane and content accordingly
            var split = ui.position.left;
            var container = ui.helper.data(UT.containerKey);
            UT.updateDivider(split, container);
        },

        stopDrag: function(evt, ui) {
            // if snapping is enabled
            if($.fn.dragify.defaults.snap) {
                UT.doSnap(ui);
                //added by mimi flynn to create styles for dragged tab
                if ($(this).hasClass('dragged')) {
                  $(this).removeClass('dragged');
                } else {
                  $(this).addClass('dragged');
                }
            }
        },

        doSnap: function(ui, dest) {
            var helper = ui.helper? ui.helper : ui;  // if called during a drag, ui will be the drag events' ui object, otherwise it'll be the "helper" itself (the pulltab)
            var container = helper.data(UT.containerKey);

            // decide where to snap to
            var snapTo = UT.getSnapTo(ui, dest);
            UT.updateDivider(snapTo, container, true);

            // toggle the pull state if indeed we snapped
            var state = helper.data(UT.stateKey);
            if(state == UT.stateLeft && snapTo > 0) {
                helper.data(UT.stateKey, UT.stateRight);
            } else if(state == UT.stateRight && snapTo == 0) {
                helper.data(UT.stateKey, UT.stateLeft);
            }
        }
        
    };

    $.fn.extend({
        /**
         *  The main entry point for the plugin.  Takes the first two "panes" and a "tab" and wires up a drag-slider animated control.
         **/
        dragify: function(snapTo, options) {
            // dragify() is designed to handle one jQuery element at a time. TODO: canonical way to handle this? jquery stack considerations?
            if(this.length > 1) {
                this.each(function() {
                    $(this).dragify(snapTo, options);
                });
                return this;
            }

            if($.isPlainObject(snapTo)) {
                options = snapTo;
                snapTo = null;
            }

            var defaults = {
                snap: true, // whether when the user lets go of the thingy, it snaps back to one side or the other
                snapThreshold: 100,  // in pixels
                currentCss: 'current', // the css class that represents the current pane
                paneCss: 'pane', // the css class that represents the a pane
                contentCss: 'inner', // the css class that represents the content of the top pane
                tabCss: 'pulltab' // the css class that represents the "tab" the user grabs to drag the pane
            };

            // don't reinitialize/redefine the defaults if the given element has already been initialized
            var firstTime = !UT.initialized(this, defaults);
            if(firstTime) {
                $.fn.dragify.defaults = defaults;
                options = $.extend($.fn.dragify.defaults, options);

                UT.initPanes(this);
            }

            // if snapTo is defined, then do that snap dog
            if(!firstTime || snapTo) {
                UT.doSnap(UT.getTab(this), snapTo);
            }

            return this;
        }
    });
})(jQuery);
