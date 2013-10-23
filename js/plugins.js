// usage: log('inside coolFunc', this, arguments);
// paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
window.log = function f(){ log.history = log.history || []; log.history.push(arguments); if(this.console) { var args = arguments, newarr; try { args.callee = f.caller } catch(e) {}; newarr = [].slice.call(args); if (typeof console.log === 'object') log.apply.call(console.log, console, newarr); else console.log.apply(console, newarr);}};

// make it safe to use console.log always
(function(a){function b(){}for(var c="assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,time,timeEnd,trace,warn".split(","),d;!!(d=c.pop());){a[d]=a[d]||b;}})
(function(){try{console.log();return window.console;}catch(a){return (window.console={});}}());


// place any jQuery/helper plugins in here, instead of separate, slower script files.


/*!
 * jQuery Cycle Plugin (with Transition Definitions)
 * Examples and documentation at: http://jquery.malsup.com/cycle/
 * Copyright (c) 2007-2010 M. Alsup
 * Version: 2.9999.6 (11-SEP-2012)
 * Dual licensed under the MIT and GPL licenses.
 * http://jquery.malsup.com/license.html
 * Requires: jQuery v1.3.2 or later
 */
;(function($, undefined) {
"use strict";

var ver = '2.9999.6';

// if $.support is not defined (pre jQuery 1.3) add what I need
if ($.support === undefined) {
  $.support = {
    opacity: !($.browser.msie)
  };
}

function debug(s) {
  if ($.fn.cycle.debug)
    log(s);
}   
function log() {
  if (window.console && console.log)
    console.log('[cycle] ' + Array.prototype.join.call(arguments,' '));
}
$.expr[':'].paused = function(el) {
  return el.cyclePause;
};


// the options arg can be...
//   a number  - indicates an immediate transition should occur to the given slide index
//   a string  - 'pause', 'resume', 'toggle', 'next', 'prev', 'stop', 'destroy' or the name of a transition effect (ie, 'fade', 'zoom', etc)
//   an object - properties to control the slideshow
//
// the arg2 arg can be...
//   the name of an fx (only used in conjunction with a numeric value for 'options')
//   the value true (only used in first arg == 'resume') and indicates
//   that the resume should occur immediately (not wait for next timeout)

$.fn.cycle = function(options, arg2) {
  var o = { s: this.selector, c: this.context };

  // in 1.3+ we can fix mistakes with the ready state
  if (this.length === 0 && options != 'stop') {
    if (!$.isReady && o.s) {
      log('DOM not ready, queuing slideshow');
      $(function() {
        $(o.s,o.c).cycle(options,arg2);
      });
      return this;
    }
    // is your DOM ready?  http://docs.jquery.com/Tutorials:Introducing_$(document).ready()
    log('terminating; zero elements found by selector' + ($.isReady ? '' : ' (DOM not ready)'));
    return this;
  }

  // iterate the matched nodeset
  return this.each(function() {
    var opts = handleArguments(this, options, arg2);
    if (opts === false)
      return;

    opts.updateActivePagerLink = opts.updateActivePagerLink || $.fn.cycle.updateActivePagerLink;
    
    // stop existing slideshow for this container (if there is one)
    if (this.cycleTimeout)
      clearTimeout(this.cycleTimeout);
    this.cycleTimeout = this.cyclePause = 0;
    this.cycleStop = 0; // issue #108

    var $cont = $(this);
    var $slides = opts.slideExpr ? $(opts.slideExpr, this) : $cont.children();
    var els = $slides.get();

    if (els.length < 2) {
      log('terminating; too few slides: ' + els.length);
      return;
    }

    var opts2 = buildOptions($cont, $slides, els, opts, o);
    if (opts2 === false)
      return;

    var startTime = opts2.continuous ? 10 : getTimeout(els[opts2.currSlide], els[opts2.nextSlide], opts2, !opts2.backwards);

    // if it's an auto slideshow, kick it off
    if (startTime) {
      startTime += (opts2.delay || 0);
      if (startTime < 10)
        startTime = 10;
      debug('first timeout: ' + startTime);
      this.cycleTimeout = setTimeout(function(){go(els,opts2,0,!opts.backwards);}, startTime);
    }
  });
};

function triggerPause(cont, byHover, onPager) {
  var opts = $(cont).data('cycle.opts');
  var paused = !!cont.cyclePause;
  if (paused && opts.paused)
    opts.paused(cont, opts, byHover, onPager);
  else if (!paused && opts.resumed)
    opts.resumed(cont, opts, byHover, onPager);
}

// process the args that were passed to the plugin fn
function handleArguments(cont, options, arg2) {
  if (cont.cycleStop === undefined)
    cont.cycleStop = 0;
  if (options === undefined || options === null)
    options = {};
  if (options.constructor == String) {
    switch(options) {
    case 'destroy':
    case 'stop':
      var opts = $(cont).data('cycle.opts');
      if (!opts)
        return false;
      cont.cycleStop++; // callbacks look for change
      if (cont.cycleTimeout)
        clearTimeout(cont.cycleTimeout);
      cont.cycleTimeout = 0;
      if (opts.elements)
        $(opts.elements).stop();
      $(cont).removeData('cycle.opts');
      if (options == 'destroy')
        destroy(cont, opts);
      return false;
    case 'toggle':
      cont.cyclePause = (cont.cyclePause === 1) ? 0 : 1;
      checkInstantResume(cont.cyclePause, arg2, cont);
      triggerPause(cont);
      return false;
    case 'pause':
      cont.cyclePause = 1;
      triggerPause(cont);
      return false;
    case 'resume':
      cont.cyclePause = 0;
      checkInstantResume(false, arg2, cont);
      triggerPause(cont);
      return false;
    case 'prev':
    case 'next':
      opts = $(cont).data('cycle.opts');
      if (!opts) {
        log('options not found, "prev/next" ignored');
        return false;
      }
      $.fn.cycle[options](opts);
      return false;
    default:
      options = { fx: options };
    }
    return options;
  }
  else if (options.constructor == Number) {
    // go to the requested slide
    var num = options;
    options = $(cont).data('cycle.opts');
    if (!options) {
      log('options not found, can not advance slide');
      return false;
    }
    if (num < 0 || num >= options.elements.length) {
      log('invalid slide index: ' + num);
      return false;
    }
    options.nextSlide = num;
    if (cont.cycleTimeout) {
      clearTimeout(cont.cycleTimeout);
      cont.cycleTimeout = 0;
    }
    if (typeof arg2 == 'string')
      options.oneTimeFx = arg2;
    go(options.elements, options, 1, num >= options.currSlide);
    return false;
  }
  return options;
  
  function checkInstantResume(isPaused, arg2, cont) {
    if (!isPaused && arg2 === true) { // resume now!
      var options = $(cont).data('cycle.opts');
      if (!options) {
        log('options not found, can not resume');
        return false;
      }
      if (cont.cycleTimeout) {
        clearTimeout(cont.cycleTimeout);
        cont.cycleTimeout = 0;
      }
      go(options.elements, options, 1, !options.backwards);
    }
  }
}

function removeFilter(el, opts) {
  if (!$.support.opacity && opts.cleartype && el.style.filter) {
    try { el.style.removeAttribute('filter'); }
    catch(smother) {} // handle old opera versions
  }
}

// unbind event handlers
function destroy(cont, opts) {
  if (opts.next)
    $(opts.next).unbind(opts.prevNextEvent);
  if (opts.prev)
    $(opts.prev).unbind(opts.prevNextEvent);
  
  if (opts.pager || opts.pagerAnchorBuilder)
    $.each(opts.pagerAnchors || [], function() {
      this.unbind().remove();
    });
  opts.pagerAnchors = null;
  $(cont).unbind('mouseenter.cycle mouseleave.cycle');
  if (opts.destroy) // callback
    opts.destroy(opts);
}

// one-time initialization
function buildOptions($cont, $slides, els, options, o) {
  var startingSlideSpecified;
  // support metadata plugin (v1.0 and v2.0)
  var opts = $.extend({}, $.fn.cycle.defaults, options || {}, $.metadata ? $cont.metadata() : $.meta ? $cont.data() : {});
  var meta = $.isFunction($cont.data) ? $cont.data(opts.metaAttr) : null;
  if (meta)
    opts = $.extend(opts, meta);
  if (opts.autostop)
    opts.countdown = opts.autostopCount || els.length;

  var cont = $cont[0];
  $cont.data('cycle.opts', opts);
  opts.$cont = $cont;
  opts.stopCount = cont.cycleStop;
  opts.elements = els;
  opts.before = opts.before ? [opts.before] : [];
  opts.after = opts.after ? [opts.after] : [];

  // push some after callbacks
  if (!$.support.opacity && opts.cleartype)
    opts.after.push(function() { removeFilter(this, opts); });
  if (opts.continuous)
    opts.after.push(function() { go(els,opts,0,!opts.backwards); });

  saveOriginalOpts(opts);

  // clearType corrections
  if (!$.support.opacity && opts.cleartype && !opts.cleartypeNoBg)
    clearTypeFix($slides);

  // container requires non-static position so that slides can be position within
  if ($cont.css('position') == 'static')
    $cont.css('position', 'relative');
  if (opts.width)
    $cont.width(opts.width);
  if (opts.height && opts.height != 'auto')
    $cont.height(opts.height);

  if (opts.startingSlide !== undefined) {
    opts.startingSlide = parseInt(opts.startingSlide,10);
    if (opts.startingSlide >= els.length || opts.startSlide < 0)
      opts.startingSlide = 0; // catch bogus input
    else 
      startingSlideSpecified = true;
  }
  else if (opts.backwards)
    opts.startingSlide = els.length - 1;
  else
    opts.startingSlide = 0;

  // if random, mix up the slide array
  if (opts.random) {
    opts.randomMap = [];
    for (var i = 0; i < els.length; i++)
      opts.randomMap.push(i);
    opts.randomMap.sort(function(a,b) {return Math.random() - 0.5;});
    if (startingSlideSpecified) {
      // try to find the specified starting slide and if found set start slide index in the map accordingly
      for ( var cnt = 0; cnt < els.length; cnt++ ) {
        if ( opts.startingSlide == opts.randomMap[cnt] ) {
          opts.randomIndex = cnt;
        }
      }
    }
    else {
      opts.randomIndex = 1;
      opts.startingSlide = opts.randomMap[1];
    }
  }
  else if (opts.startingSlide >= els.length)
    opts.startingSlide = 0; // catch bogus input
  opts.currSlide = opts.startingSlide || 0;
  var first = opts.startingSlide;

  // set position and zIndex on all the slides
  $slides.css({position: 'absolute', top:0, left:0}).hide().each(function(i) {
    var z;
    if (opts.backwards)
      z = first ? i <= first ? els.length + (i-first) : first-i : els.length-i;
    else
      z = first ? i >= first ? els.length - (i-first) : first-i : els.length-i;
    $(this).css('z-index', z);
  });

  // make sure first slide is visible
  $(els[first]).css('opacity',1).show(); // opacity bit needed to handle restart use case
  removeFilter(els[first], opts);

  // stretch slides
  if (opts.fit) {
    if (!opts.aspect) {
          if (opts.width)
              $slides.width(opts.width);
          if (opts.height && opts.height != 'auto')
              $slides.height(opts.height);
    } else {
      $slides.each(function(){
        var $slide = $(this);
        var ratio = (opts.aspect === true) ? $slide.width()/$slide.height() : opts.aspect;
        if( opts.width && $slide.width() != opts.width ) {
          $slide.width( opts.width );
          $slide.height( opts.width / ratio );
        }

        if( opts.height && $slide.height() < opts.height ) {
          $slide.height( opts.height );
          $slide.width( opts.height * ratio );
        }
      });
    }
  }

  if (opts.center && ((!opts.fit) || opts.aspect)) {
    $slides.each(function(){
      var $slide = $(this);
      $slide.css({
        "margin-left": opts.width ?
          ((opts.width - $slide.width()) / 2) + "px" :
          0,
        "margin-top": opts.height ?
          ((opts.height - $slide.height()) / 2) + "px" :
          0
      });
    });
  }

  if (opts.center && !opts.fit && !opts.slideResize) {
    $slides.each(function(){
      var $slide = $(this);
      $slide.css({
        "margin-left": opts.width ? ((opts.width - $slide.width()) / 2) + "px" : 0,
        "margin-top": opts.height ? ((opts.height - $slide.height()) / 2) + "px" : 0
      });
    });
  }
    
  // stretch container
  var reshape = (opts.containerResize || opts.containerResizeHeight) && !$cont.innerHeight();
  if (reshape) { // do this only if container has no size http://tinyurl.com/da2oa9
    var maxw = 0, maxh = 0;
    for(var j=0; j < els.length; j++) {
      var $e = $(els[j]), e = $e[0], w = $e.outerWidth(), h = $e.outerHeight();
      if (!w) w = e.offsetWidth || e.width || $e.attr('width');
      if (!h) h = e.offsetHeight || e.height || $e.attr('height');
      maxw = w > maxw ? w : maxw;
      maxh = h > maxh ? h : maxh;
    }
    if (opts.containerResize && maxw > 0 && maxh > 0)
      $cont.css({width:maxw+'px',height:maxh+'px'});
    if (opts.containerResizeHeight && maxh > 0)
      $cont.css({height:maxh+'px'});
  }

  var pauseFlag = false;  // https://github.com/malsup/cycle/issues/44
  if (opts.pause)
    $cont.bind('mouseenter.cycle', function(){
      pauseFlag = true;
      this.cyclePause++;
      triggerPause(cont, true);
    }).bind('mouseleave.cycle', function(){
        if (pauseFlag)
          this.cyclePause--;
        triggerPause(cont, true);
    });

  if (supportMultiTransitions(opts) === false)
    return false;

  // apparently a lot of people use image slideshows without height/width attributes on the images.
  // Cycle 2.50+ requires the sizing info for every slide; this block tries to deal with that.
  var requeue = false;
  options.requeueAttempts = options.requeueAttempts || 0;
  $slides.each(function() {
    // try to get height/width of each slide
    var $el = $(this);
    this.cycleH = (opts.fit && opts.height) ? opts.height : ($el.height() || this.offsetHeight || this.height || $el.attr('height') || 0);
    this.cycleW = (opts.fit && opts.width) ? opts.width : ($el.width() || this.offsetWidth || this.width || $el.attr('width') || 0);

    if ( $el.is('img') ) {
      // sigh..  sniffing, hacking, shrugging...  this crappy hack tries to account for what browsers do when
      // an image is being downloaded and the markup did not include sizing info (height/width attributes);
      // there seems to be some "default" sizes used in this situation
      var loadingIE = ($.browser.msie  && this.cycleW == 28 && this.cycleH == 30 && !this.complete);
      var loadingFF = ($.browser.mozilla && this.cycleW == 34 && this.cycleH == 19 && !this.complete);
      var loadingOp = ($.browser.opera && ((this.cycleW == 42 && this.cycleH == 19) || (this.cycleW == 37 && this.cycleH == 17)) && !this.complete);
      var loadingOther = (this.cycleH === 0 && this.cycleW === 0 && !this.complete);
      // don't requeue for images that are still loading but have a valid size
      if (loadingIE || loadingFF || loadingOp || loadingOther) {
        if (o.s && opts.requeueOnImageNotLoaded && ++options.requeueAttempts < 100) { // track retry count so we don't loop forever
          log(options.requeueAttempts,' - img slide not loaded, requeuing slideshow: ', this.src, this.cycleW, this.cycleH);
          setTimeout(function() {$(o.s,o.c).cycle(options);}, opts.requeueTimeout);
          requeue = true;
          return false; // break each loop
        }
        else {
          log('could not determine size of image: '+this.src, this.cycleW, this.cycleH);
        }
      }
    }
    return true;
  });

  if (requeue)
    return false;

  opts.cssBefore = opts.cssBefore || {};
  opts.cssAfter = opts.cssAfter || {};
  opts.cssFirst = opts.cssFirst || {};
  opts.animIn = opts.animIn || {};
  opts.animOut = opts.animOut || {};

  $slides.not(':eq('+first+')').css(opts.cssBefore);
  $($slides[first]).css(opts.cssFirst);

  if (opts.timeout) {
    opts.timeout = parseInt(opts.timeout,10);
    // ensure that timeout and speed settings are sane
    if (opts.speed.constructor == String)
      opts.speed = $.fx.speeds[opts.speed] || parseInt(opts.speed,10);
    if (!opts.sync)
      opts.speed = opts.speed / 2;
    
    var buffer = opts.fx == 'none' ? 0 : opts.fx == 'shuffle' ? 500 : 250;
    while((opts.timeout - opts.speed) < buffer) // sanitize timeout
      opts.timeout += opts.speed;
  }
  if (opts.easing)
    opts.easeIn = opts.easeOut = opts.easing;
  if (!opts.speedIn)
    opts.speedIn = opts.speed;
  if (!opts.speedOut)
    opts.speedOut = opts.speed;

  opts.slideCount = els.length;
  opts.currSlide = opts.lastSlide = first;
  if (opts.random) {
    if (++opts.randomIndex == els.length)
      opts.randomIndex = 0;
    opts.nextSlide = opts.randomMap[opts.randomIndex];
  }
  else if (opts.backwards)
    opts.nextSlide = opts.startingSlide === 0 ? (els.length-1) : opts.startingSlide-1;
  else
    opts.nextSlide = opts.startingSlide >= (els.length-1) ? 0 : opts.startingSlide+1;

  // run transition init fn
  if (!opts.multiFx) {
    var init = $.fn.cycle.transitions[opts.fx];
    if ($.isFunction(init))
      init($cont, $slides, opts);
    else if (opts.fx != 'custom' && !opts.multiFx) {
      log('unknown transition: ' + opts.fx,'; slideshow terminating');
      return false;
    }
  }

  // fire artificial events
  var e0 = $slides[first];
  if (!opts.skipInitializationCallbacks) {
    if (opts.before.length)
      opts.before[0].apply(e0, [e0, e0, opts, true]);
    if (opts.after.length)
      opts.after[0].apply(e0, [e0, e0, opts, true]);
  }
  if (opts.next)
    $(opts.next).bind(opts.prevNextEvent,function(){return advance(opts,1);});
  if (opts.prev)
    $(opts.prev).bind(opts.prevNextEvent,function(){return advance(opts,0);});
  if (opts.pager || opts.pagerAnchorBuilder)
    buildPager(els,opts);

  exposeAddSlide(opts, els);

  return opts;
}

// save off original opts so we can restore after clearing state
function saveOriginalOpts(opts) {
  opts.original = { before: [], after: [] };
  opts.original.cssBefore = $.extend({}, opts.cssBefore);
  opts.original.cssAfter  = $.extend({}, opts.cssAfter);
  opts.original.animIn  = $.extend({}, opts.animIn);
  opts.original.animOut   = $.extend({}, opts.animOut);
  $.each(opts.before, function() { opts.original.before.push(this); });
  $.each(opts.after,  function() { opts.original.after.push(this); });
}

function supportMultiTransitions(opts) {
  var i, tx, txs = $.fn.cycle.transitions;
  // look for multiple effects
  if (opts.fx.indexOf(',') > 0) {
    opts.multiFx = true;
    opts.fxs = opts.fx.replace(/\s*/g,'').split(',');
    // discard any bogus effect names
    for (i=0; i < opts.fxs.length; i++) {
      var fx = opts.fxs[i];
      tx = txs[fx];
      if (!tx || !txs.hasOwnProperty(fx) || !$.isFunction(tx)) {
        log('discarding unknown transition: ',fx);
        opts.fxs.splice(i,1);
        i--;
      }
    }
    // if we have an empty list then we threw everything away!
    if (!opts.fxs.length) {
      log('No valid transitions named; slideshow terminating.');
      return false;
    }
  }
  else if (opts.fx == 'all') {  // auto-gen the list of transitions
    opts.multiFx = true;
    opts.fxs = [];
    for (var p in txs) {
      if (txs.hasOwnProperty(p)) {
        tx = txs[p];
        if (txs.hasOwnProperty(p) && $.isFunction(tx))
          opts.fxs.push(p);
      }
    }
  }
  if (opts.multiFx && opts.randomizeEffects) {
    // munge the fxs array to make effect selection random
    var r1 = Math.floor(Math.random() * 20) + 30;
    for (i = 0; i < r1; i++) {
      var r2 = Math.floor(Math.random() * opts.fxs.length);
      opts.fxs.push(opts.fxs.splice(r2,1)[0]);
    }
    debug('randomized fx sequence: ',opts.fxs);
  }
  return true;
}

// provide a mechanism for adding slides after the slideshow has started
function exposeAddSlide(opts, els) {
  opts.addSlide = function(newSlide, prepend) {
    var $s = $(newSlide), s = $s[0];
    if (!opts.autostopCount)
      opts.countdown++;
    els[prepend?'unshift':'push'](s);
    if (opts.els)
      opts.els[prepend?'unshift':'push'](s); // shuffle needs this
    opts.slideCount = els.length;

    // add the slide to the random map and resort
    if (opts.random) {
      opts.randomMap.push(opts.slideCount-1);
      opts.randomMap.sort(function(a,b) {return Math.random() - 0.5;});
    }

    $s.css('position','absolute');
    $s[prepend?'prependTo':'appendTo'](opts.$cont);

    if (prepend) {
      opts.currSlide++;
      opts.nextSlide++;
    }

    if (!$.support.opacity && opts.cleartype && !opts.cleartypeNoBg)
      clearTypeFix($s);

    if (opts.fit && opts.width)
      $s.width(opts.width);
    if (opts.fit && opts.height && opts.height != 'auto')
      $s.height(opts.height);
    s.cycleH = (opts.fit && opts.height) ? opts.height : $s.height();
    s.cycleW = (opts.fit && opts.width) ? opts.width : $s.width();

    $s.css(opts.cssBefore);

    if (opts.pager || opts.pagerAnchorBuilder)
      $.fn.cycle.createPagerAnchor(els.length-1, s, $(opts.pager), els, opts);

    if ($.isFunction(opts.onAddSlide))
      opts.onAddSlide($s);
    else
      $s.hide(); // default behavior
  };
}

// reset internal state; we do this on every pass in order to support multiple effects
$.fn.cycle.resetState = function(opts, fx) {
  fx = fx || opts.fx;
  opts.before = []; opts.after = [];
  opts.cssBefore = $.extend({}, opts.original.cssBefore);
  opts.cssAfter  = $.extend({}, opts.original.cssAfter);
  opts.animIn = $.extend({}, opts.original.animIn);
  opts.animOut   = $.extend({}, opts.original.animOut);
  opts.fxFn = null;
  $.each(opts.original.before, function() { opts.before.push(this); });
  $.each(opts.original.after,  function() { opts.after.push(this); });

  // re-init
  var init = $.fn.cycle.transitions[fx];
  if ($.isFunction(init))
    init(opts.$cont, $(opts.elements), opts);
};

// this is the main engine fn, it handles the timeouts, callbacks and slide index mgmt
function go(els, opts, manual, fwd) {
  var p = opts.$cont[0], curr = els[opts.currSlide], next = els[opts.nextSlide];

  // opts.busy is true if we're in the middle of an animation
  if (manual && opts.busy && opts.manualTrump) {
    // let manual transitions requests trump active ones
    debug('manualTrump in go(), stopping active transition');
    $(els).stop(true,true);
    opts.busy = 0;
    clearTimeout(p.cycleTimeout);
  }

  // don't begin another timeout-based transition if there is one active
  if (opts.busy) {
    debug('transition active, ignoring new tx request');
    return;
  }


  // stop cycling if we have an outstanding stop request
  if (p.cycleStop != opts.stopCount || p.cycleTimeout === 0 && !manual)
    return;

  // check to see if we should stop cycling based on autostop options
  if (!manual && !p.cyclePause && !opts.bounce &&
    ((opts.autostop && (--opts.countdown <= 0)) ||
    (opts.nowrap && !opts.random && opts.nextSlide < opts.currSlide))) {
    if (opts.end)
      opts.end(opts);
    return;
  }

  // if slideshow is paused, only transition on a manual trigger
  var changed = false;
  if ((manual || !p.cyclePause) && (opts.nextSlide != opts.currSlide)) {
    changed = true;
    var fx = opts.fx;
    // keep trying to get the slide size if we don't have it yet
    curr.cycleH = curr.cycleH || $(curr).height();
    curr.cycleW = curr.cycleW || $(curr).width();
    next.cycleH = next.cycleH || $(next).height();
    next.cycleW = next.cycleW || $(next).width();

    // support multiple transition types
    if (opts.multiFx) {
      if (fwd && (opts.lastFx === undefined || ++opts.lastFx >= opts.fxs.length))
        opts.lastFx = 0;
      else if (!fwd && (opts.lastFx === undefined || --opts.lastFx < 0))
        opts.lastFx = opts.fxs.length - 1;
      fx = opts.fxs[opts.lastFx];
    }

    // one-time fx overrides apply to:  $('div').cycle(3,'zoom');
    if (opts.oneTimeFx) {
      fx = opts.oneTimeFx;
      opts.oneTimeFx = null;
    }

    $.fn.cycle.resetState(opts, fx);

    // run the before callbacks
    if (opts.before.length)
      $.each(opts.before, function(i,o) {
        if (p.cycleStop != opts.stopCount) return;
        o.apply(next, [curr, next, opts, fwd]);
      });

    // stage the after callacks
    var after = function() {
      opts.busy = 0;
      $.each(opts.after, function(i,o) {
        if (p.cycleStop != opts.stopCount) return;
        o.apply(next, [curr, next, opts, fwd]);
      });
      if (!p.cycleStop) {
        // queue next transition
        queueNext();
      }
    };

    debug('tx firing('+fx+'); currSlide: ' + opts.currSlide + '; nextSlide: ' + opts.nextSlide);
    
    // get ready to perform the transition
    opts.busy = 1;
    if (opts.fxFn) // fx function provided?
      opts.fxFn(curr, next, opts, after, fwd, manual && opts.fastOnEvent);
    else if ($.isFunction($.fn.cycle[opts.fx])) // fx plugin ?
      $.fn.cycle[opts.fx](curr, next, opts, after, fwd, manual && opts.fastOnEvent);
    else
      $.fn.cycle.custom(curr, next, opts, after, fwd, manual && opts.fastOnEvent);
  }
  else {
    queueNext();
  }

  if (changed || opts.nextSlide == opts.currSlide) {
    // calculate the next slide
    var roll;
    opts.lastSlide = opts.currSlide;
    if (opts.random) {
      opts.currSlide = opts.nextSlide;
      if (++opts.randomIndex == els.length) {
        opts.randomIndex = 0;
        opts.randomMap.sort(function(a,b) {return Math.random() - 0.5;});
      }
      opts.nextSlide = opts.randomMap[opts.randomIndex];
      if (opts.nextSlide == opts.currSlide)
        opts.nextSlide = (opts.currSlide == opts.slideCount - 1) ? 0 : opts.currSlide + 1;
    }
    else if (opts.backwards) {
      roll = (opts.nextSlide - 1) < 0;
      if (roll && opts.bounce) {
        opts.backwards = !opts.backwards;
        opts.nextSlide = 1;
        opts.currSlide = 0;
      }
      else {
        opts.nextSlide = roll ? (els.length-1) : opts.nextSlide-1;
        opts.currSlide = roll ? 0 : opts.nextSlide+1;
      }
    }
    else { // sequence
      roll = (opts.nextSlide + 1) == els.length;
      if (roll && opts.bounce) {
        opts.backwards = !opts.backwards;
        opts.nextSlide = els.length-2;
        opts.currSlide = els.length-1;
      }
      else {
        opts.nextSlide = roll ? 0 : opts.nextSlide+1;
        opts.currSlide = roll ? els.length-1 : opts.nextSlide-1;
      }
    }
  }
  if (changed && opts.pager)
    opts.updateActivePagerLink(opts.pager, opts.currSlide, opts.activePagerClass);
  
  function queueNext() {
    // stage the next transition
    var ms = 0, timeout = opts.timeout;
    if (opts.timeout && !opts.continuous) {
      ms = getTimeout(els[opts.currSlide], els[opts.nextSlide], opts, fwd);
         if (opts.fx == 'shuffle')
            ms -= opts.speedOut;
      }
    else if (opts.continuous && p.cyclePause) // continuous shows work off an after callback, not this timer logic
      ms = 10;
    if (ms > 0)
      p.cycleTimeout = setTimeout(function(){ go(els, opts, 0, !opts.backwards); }, ms);
  }
}

// invoked after transition
$.fn.cycle.updateActivePagerLink = function(pager, currSlide, clsName) {
   $(pager).each(function() {
       $(this).children().removeClass(clsName).eq(currSlide).addClass(clsName);
   });
};

// calculate timeout value for current transition
function getTimeout(curr, next, opts, fwd) {
  if (opts.timeoutFn) {
    // call user provided calc fn
    var t = opts.timeoutFn.call(curr,curr,next,opts,fwd);
    while (opts.fx != 'none' && (t - opts.speed) < 250) // sanitize timeout
      t += opts.speed;
    debug('calculated timeout: ' + t + '; speed: ' + opts.speed);
    if (t !== false)
      return t;
  }
  return opts.timeout;
}

// expose next/prev function, caller must pass in state
$.fn.cycle.next = function(opts) { advance(opts,1); };
$.fn.cycle.prev = function(opts) { advance(opts,0);};

// advance slide forward or back
function advance(opts, moveForward) {
  var val = moveForward ? 1 : -1;
  var els = opts.elements;
  var p = opts.$cont[0], timeout = p.cycleTimeout;
  if (timeout) {
    clearTimeout(timeout);
    p.cycleTimeout = 0;
  }
  if (opts.random && val < 0) {
    // move back to the previously display slide
    opts.randomIndex--;
    if (--opts.randomIndex == -2)
      opts.randomIndex = els.length-2;
    else if (opts.randomIndex == -1)
      opts.randomIndex = els.length-1;
    opts.nextSlide = opts.randomMap[opts.randomIndex];
  }
  else if (opts.random) {
    opts.nextSlide = opts.randomMap[opts.randomIndex];
  }
  else {
    opts.nextSlide = opts.currSlide + val;
    if (opts.nextSlide < 0) {
      if (opts.nowrap) return false;
      opts.nextSlide = els.length - 1;
    }
    else if (opts.nextSlide >= els.length) {
      if (opts.nowrap) return false;
      opts.nextSlide = 0;
    }
  }

  var cb = opts.onPrevNextEvent || opts.prevNextClick; // prevNextClick is deprecated
  if ($.isFunction(cb))
    cb(val > 0, opts.nextSlide, els[opts.nextSlide]);
  go(els, opts, 1, moveForward);
  return false;
}

function buildPager(els, opts) {
  var $p = $(opts.pager);
  $.each(els, function(i,o) {
    $.fn.cycle.createPagerAnchor(i,o,$p,els,opts);
  });
  opts.updateActivePagerLink(opts.pager, opts.startingSlide, opts.activePagerClass);
}

$.fn.cycle.createPagerAnchor = function(i, el, $p, els, opts) {
  var a;
  if ($.isFunction(opts.pagerAnchorBuilder)) {
    a = opts.pagerAnchorBuilder(i,el);
    debug('pagerAnchorBuilder('+i+', el) returned: ' + a);
  }
  else
    a = '<a href="#">'+(i+1)+'</a>';
    
  if (!a)
    return;
  var $a = $(a);
  // don't reparent if anchor is in the dom
  if ($a.parents('body').length === 0) {
    var arr = [];
    if ($p.length > 1) {
      $p.each(function() {
        var $clone = $a.clone(true);
        $(this).append($clone);
        arr.push($clone[0]);
      });
      $a = $(arr);
    }
    else {
      $a.appendTo($p);
    }
  }

  opts.pagerAnchors =  opts.pagerAnchors || [];
  opts.pagerAnchors.push($a);
  
  var pagerFn = function(e) {
    e.preventDefault();
    opts.nextSlide = i;
    var p = opts.$cont[0], timeout = p.cycleTimeout;
    if (timeout) {
      clearTimeout(timeout);
      p.cycleTimeout = 0;
    }
    var cb = opts.onPagerEvent || opts.pagerClick; // pagerClick is deprecated
    if ($.isFunction(cb))
      cb(opts.nextSlide, els[opts.nextSlide]);
    go(els,opts,1,opts.currSlide < i); // trigger the trans
//    return false; // <== allow bubble
  };
  
  if ( /mouseenter|mouseover/i.test(opts.pagerEvent) ) {
    $a.hover(pagerFn, function(){/* no-op */} );
  }
  else {
    $a.bind(opts.pagerEvent, pagerFn);
  }
  
  if ( ! /^click/.test(opts.pagerEvent) && !opts.allowPagerClickBubble)
    $a.bind('click.cycle', function(){return false;}); // suppress click
  
  var cont = opts.$cont[0];
  var pauseFlag = false; // https://github.com/malsup/cycle/issues/44
  if (opts.pauseOnPagerHover) {
    $a.hover(
      function() { 
        pauseFlag = true;
        cont.cyclePause++; 
        triggerPause(cont,true,true);
      }, function() { 
        if (pauseFlag)
          cont.cyclePause--; 
        triggerPause(cont,true,true);
      } 
    );
  }
};

// helper fn to calculate the number of slides between the current and the next
$.fn.cycle.hopsFromLast = function(opts, fwd) {
  var hops, l = opts.lastSlide, c = opts.currSlide;
  if (fwd)
    hops = c > l ? c - l : opts.slideCount - l;
  else
    hops = c < l ? l - c : l + opts.slideCount - c;
  return hops;
};

// fix clearType problems in ie6 by setting an explicit bg color
// (otherwise text slides look horrible during a fade transition)
function clearTypeFix($slides) {
  debug('applying clearType background-color hack');
  function hex(s) {
    s = parseInt(s,10).toString(16);
    return s.length < 2 ? '0'+s : s;
  }
  function getBg(e) {
    for ( ; e && e.nodeName.toLowerCase() != 'html'; e = e.parentNode) {
      var v = $.css(e,'background-color');
      if (v && v.indexOf('rgb') >= 0 ) {
        var rgb = v.match(/\d+/g);
        return '#'+ hex(rgb[0]) + hex(rgb[1]) + hex(rgb[2]);
      }
      if (v && v != 'transparent')
        return v;
    }
    return '#ffffff';
  }
  $slides.each(function() { $(this).css('background-color', getBg(this)); });
}

// reset common props before the next transition
$.fn.cycle.commonReset = function(curr,next,opts,w,h,rev) {
  $(opts.elements).not(curr).hide();
  if (typeof opts.cssBefore.opacity == 'undefined')
    opts.cssBefore.opacity = 1;
  opts.cssBefore.display = 'block';
  if (opts.slideResize && w !== false && next.cycleW > 0)
    opts.cssBefore.width = next.cycleW;
  if (opts.slideResize && h !== false && next.cycleH > 0)
    opts.cssBefore.height = next.cycleH;
  opts.cssAfter = opts.cssAfter || {};
  opts.cssAfter.display = 'none';
  $(curr).css('zIndex',opts.slideCount + (rev === true ? 1 : 0));
  $(next).css('zIndex',opts.slideCount + (rev === true ? 0 : 1));
};

// the actual fn for effecting a transition
$.fn.cycle.custom = function(curr, next, opts, cb, fwd, speedOverride) {
  var $l = $(curr), $n = $(next);
  var speedIn = opts.speedIn, speedOut = opts.speedOut, easeIn = opts.easeIn, easeOut = opts.easeOut;
  $n.css(opts.cssBefore);
  if (speedOverride) {
    if (typeof speedOverride == 'number')
      speedIn = speedOut = speedOverride;
    else
      speedIn = speedOut = 1;
    easeIn = easeOut = null;
  }
  var fn = function() {
    $n.animate(opts.animIn, speedIn, easeIn, function() {
      cb();
    });
  };
  $l.animate(opts.animOut, speedOut, easeOut, function() {
    $l.css(opts.cssAfter);
    if (!opts.sync) 
      fn();
  });
  if (opts.sync) fn();
};

// transition definitions - only fade is defined here, transition pack defines the rest
$.fn.cycle.transitions = {
  fade: function($cont, $slides, opts) {
    $slides.not(':eq('+opts.currSlide+')').css('opacity',0);
    opts.before.push(function(curr,next,opts) {
      $.fn.cycle.commonReset(curr,next,opts);
      opts.cssBefore.opacity = 0;
    });
    opts.animIn    = { opacity: 1 };
    opts.animOut   = { opacity: 0 };
    opts.cssBefore = { top: 0, left: 0 };
  }
};

$.fn.cycle.ver = function() { return ver; };

// override these globally if you like (they are all optional)
$.fn.cycle.defaults = {
    activePagerClass: 'activeSlide', // class name used for the active pager link
    after:            null,     // transition callback (scope set to element that was shown):  function(currSlideElement, nextSlideElement, options, forwardFlag)
    allowPagerClickBubble: false, // allows or prevents click event on pager anchors from bubbling
    animIn:           null,     // properties that define how the slide animates in
    animOut:          null,     // properties that define how the slide animates out
    aspect:           false,    // preserve aspect ratio during fit resizing, cropping if necessary (must be used with fit option)
    autostop:         0,        // true to end slideshow after X transitions (where X == slide count)
    autostopCount:    0,        // number of transitions (optionally used with autostop to define X)
    backwards:        false,    // true to start slideshow at last slide and move backwards through the stack
    before:           null,     // transition callback (scope set to element to be shown):     function(currSlideElement, nextSlideElement, options, forwardFlag)
    center:           null,     // set to true to have cycle add top/left margin to each slide (use with width and height options)
    cleartype:        !$.support.opacity,  // true if clearType corrections should be applied (for IE)
    cleartypeNoBg:    false,    // set to true to disable extra cleartype fixing (leave false to force background color setting on slides)
    containerResize:  1,        // resize container to fit largest slide
    containerResizeHeight:  0,  // resize containers height to fit the largest slide but leave the width dynamic
    continuous:       0,        // true to start next transition immediately after current one completes
    cssAfter:         null,     // properties that defined the state of the slide after transitioning out
    cssBefore:        null,     // properties that define the initial state of the slide before transitioning in
    delay:            0,        // additional delay (in ms) for first transition (hint: can be negative)
    easeIn:           null,     // easing for "in" transition
    easeOut:          null,     // easing for "out" transition
    easing:           null,     // easing method for both in and out transitions
    end:              null,     // callback invoked when the slideshow terminates (use with autostop or nowrap options): function(options)
    fastOnEvent:      0,        // force fast transitions when triggered manually (via pager or prev/next); value == time in ms
    fit:              0,        // force slides to fit container
    fx:               'fade',   // name of transition effect (or comma separated names, ex: 'fade,scrollUp,shuffle')
    fxFn:             null,     // function used to control the transition: function(currSlideElement, nextSlideElement, options, afterCalback, forwardFlag)
    height:           'auto',   // container height (if the 'fit' option is true, the slides will be set to this height as well)
    manualTrump:      true,     // causes manual transition to stop an active transition instead of being ignored
    metaAttr:         'cycle',  // data- attribute that holds the option data for the slideshow
    next:             null,     // element, jQuery object, or jQuery selector string for the element to use as event trigger for next slide
    nowrap:           0,        // true to prevent slideshow from wrapping
    onPagerEvent:     null,     // callback fn for pager events: function(zeroBasedSlideIndex, slideElement)
    onPrevNextEvent:  null,     // callback fn for prev/next events: function(isNext, zeroBasedSlideIndex, slideElement)
    pager:            null,     // element, jQuery object, or jQuery selector string for the element to use as pager container
    pagerAnchorBuilder: null,   // callback fn for building anchor links:  function(index, DOMelement)
    pagerEvent:       'click.cycle', // name of event which drives the pager navigation
    pause:            0,        // true to enable "pause on hover"
    pauseOnPagerHover: 0,       // true to pause when hovering over pager link
    prev:             null,     // element, jQuery object, or jQuery selector string for the element to use as event trigger for previous slide
    prevNextEvent:    'click.cycle',// event which drives the manual transition to the previous or next slide
    random:           0,        // true for random, false for sequence (not applicable to shuffle fx)
    randomizeEffects: 1,        // valid when multiple effects are used; true to make the effect sequence random
    requeueOnImageNotLoaded: true, // requeue the slideshow if any image slides are not yet loaded
    requeueTimeout:   250,      // ms delay for requeue
    rev:              0,        // causes animations to transition in reverse (for effects that support it such as scrollHorz/scrollVert/shuffle)
    shuffle:          null,     // coords for shuffle animation, ex: { top:15, left: 200 }
    skipInitializationCallbacks: false, // set to true to disable the first before/after callback that occurs prior to any transition
    slideExpr:        null,     // expression for selecting slides (if something other than all children is required)
    slideResize:      1,        // force slide width/height to fixed size before every transition
    speed:            1000,     // speed of the transition (any valid fx speed value)
    speedIn:          null,     // speed of the 'in' transition
    speedOut:         null,     // speed of the 'out' transition
    startingSlide:    undefined,// zero-based index of the first slide to be displayed
    sync:             1,        // true if in/out transitions should occur simultaneously
    timeout:          4000,     // milliseconds between slide transitions (0 to disable auto advance)
    timeoutFn:        null,     // callback for determining per-slide timeout value:  function(currSlideElement, nextSlideElement, options, forwardFlag)
    updateActivePagerLink: null,// callback fn invoked to update the active pager link (adds/removes activePagerClass style)
    width:            null      // container width (if the 'fit' option is true, the slides will be set to this width as well)
};

})(jQuery);


/*!
 * jQuery Cycle Plugin Transition Definitions
 * This script is a plugin for the jQuery Cycle Plugin
 * Examples and documentation at: http://malsup.com/jquery/cycle/
 * Copyright (c) 2007-2010 M. Alsup
 * Version:  2.73
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 */
(function($) {
"use strict";

//
// These functions define slide initialization and properties for the named
// transitions. To save file size feel free to remove any of these that you
// don't need.
//
$.fn.cycle.transitions.none = function($cont, $slides, opts) {
  opts.fxFn = function(curr,next,opts,after){
    $(next).show();
    $(curr).hide();
    after();
  };
};

// not a cross-fade, fadeout only fades out the top slide
$.fn.cycle.transitions.fadeout = function($cont, $slides, opts) {
  $slides.not(':eq('+opts.currSlide+')').css({ display: 'block', 'opacity': 1 });
  opts.before.push(function(curr,next,opts,w,h,rev) {
    $(curr).css('zIndex',opts.slideCount + (rev !== true ? 1 : 0));
    $(next).css('zIndex',opts.slideCount + (rev !== true ? 0 : 1));
  });
  opts.animIn.opacity = 1;
  opts.animOut.opacity = 0;
  opts.cssBefore.opacity = 1;
  opts.cssBefore.display = 'block';
  opts.cssAfter.zIndex = 0;
};

// scrollUp/Down/Left/Right
$.fn.cycle.transitions.scrollUp = function($cont, $slides, opts) {
  $cont.css('overflow','hidden');
  opts.before.push($.fn.cycle.commonReset);
  var h = $cont.height();
  opts.cssBefore.top = h;
  opts.cssBefore.left = 0;
  opts.cssFirst.top = 0;
  opts.animIn.top = 0;
  opts.animOut.top = -h;
};
$.fn.cycle.transitions.scrollDown = function($cont, $slides, opts) {
  $cont.css('overflow','hidden');
  opts.before.push($.fn.cycle.commonReset);
  var h = $cont.height();
  opts.cssFirst.top = 0;
  opts.cssBefore.top = -h;
  opts.cssBefore.left = 0;
  opts.animIn.top = 0;
  opts.animOut.top = h;
};
$.fn.cycle.transitions.scrollLeft = function($cont, $slides, opts) {
  $cont.css('overflow','hidden');
  opts.before.push($.fn.cycle.commonReset);
  var w = $cont.width();
  opts.cssFirst.left = 0;
  opts.cssBefore.left = w;
  opts.cssBefore.top = 0;
  opts.animIn.left = 0;
  opts.animOut.left = 0-w;
};
$.fn.cycle.transitions.scrollRight = function($cont, $slides, opts) {
  $cont.css('overflow','hidden');
  opts.before.push($.fn.cycle.commonReset);
  var w = $cont.width();
  opts.cssFirst.left = 0;
  opts.cssBefore.left = -w;
  opts.cssBefore.top = 0;
  opts.animIn.left = 0;
  opts.animOut.left = w;
};
$.fn.cycle.transitions.scrollHorz = function($cont, $slides, opts) {
  $cont.css('overflow','hidden').width();
  opts.before.push(function(curr, next, opts, fwd) {
    if (opts.rev)
      fwd = !fwd;
    $.fn.cycle.commonReset(curr,next,opts);
    opts.cssBefore.left = fwd ? (next.cycleW-1) : (1-next.cycleW);
    opts.animOut.left = fwd ? -curr.cycleW : curr.cycleW;
  });
  opts.cssFirst.left = 0;
  opts.cssBefore.top = 0;
  opts.animIn.left = 0;
  opts.animOut.top = 0;
};
$.fn.cycle.transitions.scrollVert = function($cont, $slides, opts) {
  $cont.css('overflow','hidden');
  opts.before.push(function(curr, next, opts, fwd) {
    if (opts.rev)
      fwd = !fwd;
    $.fn.cycle.commonReset(curr,next,opts);
    opts.cssBefore.top = fwd ? (1-next.cycleH) : (next.cycleH-1);
    opts.animOut.top = fwd ? curr.cycleH : -curr.cycleH;
  });
  opts.cssFirst.top = 0;
  opts.cssBefore.left = 0;
  opts.animIn.top = 0;
  opts.animOut.left = 0;
};

// slideX/slideY
$.fn.cycle.transitions.slideX = function($cont, $slides, opts) {
  opts.before.push(function(curr, next, opts) {
    $(opts.elements).not(curr).hide();
    $.fn.cycle.commonReset(curr,next,opts,false,true);
    opts.animIn.width = next.cycleW;
  });
  opts.cssBefore.left = 0;
  opts.cssBefore.top = 0;
  opts.cssBefore.width = 0;
  opts.animIn.width = 'show';
  opts.animOut.width = 0;
};
$.fn.cycle.transitions.slideY = function($cont, $slides, opts) {
  opts.before.push(function(curr, next, opts) {
    $(opts.elements).not(curr).hide();
    $.fn.cycle.commonReset(curr,next,opts,true,false);
    opts.animIn.height = next.cycleH;
  });
  opts.cssBefore.left = 0;
  opts.cssBefore.top = 0;
  opts.cssBefore.height = 0;
  opts.animIn.height = 'show';
  opts.animOut.height = 0;
};

// shuffle
$.fn.cycle.transitions.shuffle = function($cont, $slides, opts) {
  var i, w = $cont.css('overflow', 'visible').width();
  $slides.css({left: 0, top: 0});
  opts.before.push(function(curr,next,opts) {
    $.fn.cycle.commonReset(curr,next,opts,true,true,true);
  });
  // only adjust speed once!
  if (!opts.speedAdjusted) {
    opts.speed = opts.speed / 2; // shuffle has 2 transitions
    opts.speedAdjusted = true;
  }
  opts.random = 0;
  opts.shuffle = opts.shuffle || {left:-w, top:15};
  opts.els = [];
  for (i=0; i < $slides.length; i++)
    opts.els.push($slides[i]);

  for (i=0; i < opts.currSlide; i++)
    opts.els.push(opts.els.shift());

  // custom transition fn (hat tip to Benjamin Sterling for this bit of sweetness!)
  opts.fxFn = function(curr, next, opts, cb, fwd) {
    if (opts.rev)
      fwd = !fwd;
    var $el = fwd ? $(curr) : $(next);
    $(next).css(opts.cssBefore);
    var count = opts.slideCount;
    $el.animate(opts.shuffle, opts.speedIn, opts.easeIn, function() {
      var hops = $.fn.cycle.hopsFromLast(opts, fwd);
      for (var k=0; k < hops; k++) {
        if (fwd)
          opts.els.push(opts.els.shift());
        else
          opts.els.unshift(opts.els.pop());
      }
      if (fwd) {
        for (var i=0, len=opts.els.length; i < len; i++)
          $(opts.els[i]).css('z-index', len-i+count);
      }
      else {
        var z = $(curr).css('z-index');
        $el.css('z-index', parseInt(z,10)+1+count);
      }
      $el.animate({left:0, top:0}, opts.speedOut, opts.easeOut, function() {
        $(fwd ? this : curr).hide();
        if (cb) cb();
      });
    });
  };
  $.extend(opts.cssBefore, { display: 'block', opacity: 1, top: 0, left: 0 });
};

// turnUp/Down/Left/Right
$.fn.cycle.transitions.turnUp = function($cont, $slides, opts) {
  opts.before.push(function(curr, next, opts) {
    $.fn.cycle.commonReset(curr,next,opts,true,false);
    opts.cssBefore.top = next.cycleH;
    opts.animIn.height = next.cycleH;
    opts.animOut.width = next.cycleW;
  });
  opts.cssFirst.top = 0;
  opts.cssBefore.left = 0;
  opts.cssBefore.height = 0;
  opts.animIn.top = 0;
  opts.animOut.height = 0;
};
$.fn.cycle.transitions.turnDown = function($cont, $slides, opts) {
  opts.before.push(function(curr, next, opts) {
    $.fn.cycle.commonReset(curr,next,opts,true,false);
    opts.animIn.height = next.cycleH;
    opts.animOut.top   = curr.cycleH;
  });
  opts.cssFirst.top = 0;
  opts.cssBefore.left = 0;
  opts.cssBefore.top = 0;
  opts.cssBefore.height = 0;
  opts.animOut.height = 0;
};
$.fn.cycle.transitions.turnLeft = function($cont, $slides, opts) {
  opts.before.push(function(curr, next, opts) {
    $.fn.cycle.commonReset(curr,next,opts,false,true);
    opts.cssBefore.left = next.cycleW;
    opts.animIn.width = next.cycleW;
  });
  opts.cssBefore.top = 0;
  opts.cssBefore.width = 0;
  opts.animIn.left = 0;
  opts.animOut.width = 0;
};
$.fn.cycle.transitions.turnRight = function($cont, $slides, opts) {
  opts.before.push(function(curr, next, opts) {
    $.fn.cycle.commonReset(curr,next,opts,false,true);
    opts.animIn.width = next.cycleW;
    opts.animOut.left = curr.cycleW;
  });
  $.extend(opts.cssBefore, { top: 0, left: 0, width: 0 });
  opts.animIn.left = 0;
  opts.animOut.width = 0;
};

// zoom
$.fn.cycle.transitions.zoom = function($cont, $slides, opts) {
  opts.before.push(function(curr, next, opts) {
    $.fn.cycle.commonReset(curr,next,opts,false,false,true);
    opts.cssBefore.top = next.cycleH/2;
    opts.cssBefore.left = next.cycleW/2;
    $.extend(opts.animIn, { top: 0, left: 0, width: next.cycleW, height: next.cycleH });
    $.extend(opts.animOut, { width: 0, height: 0, top: curr.cycleH/2, left: curr.cycleW/2 });
  });
  opts.cssFirst.top = 0;
  opts.cssFirst.left = 0;
  opts.cssBefore.width = 0;
  opts.cssBefore.height = 0;
};

// fadeZoom
$.fn.cycle.transitions.fadeZoom = function($cont, $slides, opts) {
  opts.before.push(function(curr, next, opts) {
    $.fn.cycle.commonReset(curr,next,opts,false,false);
    opts.cssBefore.left = next.cycleW/2;
    opts.cssBefore.top = next.cycleH/2;
    $.extend(opts.animIn, { top: 0, left: 0, width: next.cycleW, height: next.cycleH });
  });
  opts.cssBefore.width = 0;
  opts.cssBefore.height = 0;
  opts.animOut.opacity = 0;
};

// blindX
$.fn.cycle.transitions.blindX = function($cont, $slides, opts) {
  var w = $cont.css('overflow','hidden').width();
  opts.before.push(function(curr, next, opts) {
    $.fn.cycle.commonReset(curr,next,opts);
    opts.animIn.width = next.cycleW;
    opts.animOut.left   = curr.cycleW;
  });
  opts.cssBefore.left = w;
  opts.cssBefore.top = 0;
  opts.animIn.left = 0;
  opts.animOut.left = w;
};
// blindY
$.fn.cycle.transitions.blindY = function($cont, $slides, opts) {
  var h = $cont.css('overflow','hidden').height();
  opts.before.push(function(curr, next, opts) {
    $.fn.cycle.commonReset(curr,next,opts);
    opts.animIn.height = next.cycleH;
    opts.animOut.top   = curr.cycleH;
  });
  opts.cssBefore.top = h;
  opts.cssBefore.left = 0;
  opts.animIn.top = 0;
  opts.animOut.top = h;
};
// blindZ
$.fn.cycle.transitions.blindZ = function($cont, $slides, opts) {
  var h = $cont.css('overflow','hidden').height();
  var w = $cont.width();
  opts.before.push(function(curr, next, opts) {
    $.fn.cycle.commonReset(curr,next,opts);
    opts.animIn.height = next.cycleH;
    opts.animOut.top   = curr.cycleH;
  });
  opts.cssBefore.top = h;
  opts.cssBefore.left = w;
  opts.animIn.top = 0;
  opts.animIn.left = 0;
  opts.animOut.top = h;
  opts.animOut.left = w;
};

// growX - grow horizontally from centered 0 width
$.fn.cycle.transitions.growX = function($cont, $slides, opts) {
  opts.before.push(function(curr, next, opts) {
    $.fn.cycle.commonReset(curr,next,opts,false,true);
    opts.cssBefore.left = this.cycleW/2;
    opts.animIn.left = 0;
    opts.animIn.width = this.cycleW;
    opts.animOut.left = 0;
  });
  opts.cssBefore.top = 0;
  opts.cssBefore.width = 0;
};
// growY - grow vertically from centered 0 height
$.fn.cycle.transitions.growY = function($cont, $slides, opts) {
  opts.before.push(function(curr, next, opts) {
    $.fn.cycle.commonReset(curr,next,opts,true,false);
    opts.cssBefore.top = this.cycleH/2;
    opts.animIn.top = 0;
    opts.animIn.height = this.cycleH;
    opts.animOut.top = 0;
  });
  opts.cssBefore.height = 0;
  opts.cssBefore.left = 0;
};

// curtainX - squeeze in both edges horizontally
$.fn.cycle.transitions.curtainX = function($cont, $slides, opts) {
  opts.before.push(function(curr, next, opts) {
    $.fn.cycle.commonReset(curr,next,opts,false,true,true);
    opts.cssBefore.left = next.cycleW/2;
    opts.animIn.left = 0;
    opts.animIn.width = this.cycleW;
    opts.animOut.left = curr.cycleW/2;
    opts.animOut.width = 0;
  });
  opts.cssBefore.top = 0;
  opts.cssBefore.width = 0;
};
// curtainY - squeeze in both edges vertically
$.fn.cycle.transitions.curtainY = function($cont, $slides, opts) {
  opts.before.push(function(curr, next, opts) {
    $.fn.cycle.commonReset(curr,next,opts,true,false,true);
    opts.cssBefore.top = next.cycleH/2;
    opts.animIn.top = 0;
    opts.animIn.height = next.cycleH;
    opts.animOut.top = curr.cycleH/2;
    opts.animOut.height = 0;
  });
  opts.cssBefore.height = 0;
  opts.cssBefore.left = 0;
};

// cover - curr slide covered by next slide
$.fn.cycle.transitions.cover = function($cont, $slides, opts) {
  var d = opts.direction || 'left';
  var w = $cont.css('overflow','hidden').width();
  var h = $cont.height();
  opts.before.push(function(curr, next, opts) {
    $.fn.cycle.commonReset(curr,next,opts);
    if (d == 'right')
      opts.cssBefore.left = -w;
    else if (d == 'up')
      opts.cssBefore.top = h;
    else if (d == 'down')
      opts.cssBefore.top = -h;
    else
      opts.cssBefore.left = w;
  });
  opts.animIn.left = 0;
  opts.animIn.top = 0;
  opts.cssBefore.top = 0;
  opts.cssBefore.left = 0;
};

// uncover - curr slide moves off next slide
$.fn.cycle.transitions.uncover = function($cont, $slides, opts) {
  var d = opts.direction || 'left';
  var w = $cont.css('overflow','hidden').width();
  var h = $cont.height();
  opts.before.push(function(curr, next, opts) {
    $.fn.cycle.commonReset(curr,next,opts,true,true,true);
    if (d == 'right')
      opts.animOut.left = w;
    else if (d == 'up')
      opts.animOut.top = -h;
    else if (d == 'down')
      opts.animOut.top = h;
    else
      opts.animOut.left = -w;
  });
  opts.animIn.left = 0;
  opts.animIn.top = 0;
  opts.cssBefore.top = 0;
  opts.cssBefore.left = 0;
};

// toss - move top slide and fade away
$.fn.cycle.transitions.toss = function($cont, $slides, opts) {
  var w = $cont.css('overflow','visible').width();
  var h = $cont.height();
  opts.before.push(function(curr, next, opts) {
    $.fn.cycle.commonReset(curr,next,opts,true,true,true);
    // provide default toss settings if animOut not provided
    if (!opts.animOut.left && !opts.animOut.top)
      $.extend(opts.animOut, { left: w*2, top: -h/2, opacity: 0 });
    else
      opts.animOut.opacity = 0;
  });
  opts.cssBefore.left = 0;
  opts.cssBefore.top = 0;
  opts.animIn.left = 0;
};

// wipe - clip animation
$.fn.cycle.transitions.wipe = function($cont, $slides, opts) {
  var w = $cont.css('overflow','hidden').width();
  var h = $cont.height();
  opts.cssBefore = opts.cssBefore || {};
  var clip;
  if (opts.clip) {
    if (/l2r/.test(opts.clip))
      clip = 'rect(0px 0px '+h+'px 0px)';
    else if (/r2l/.test(opts.clip))
      clip = 'rect(0px '+w+'px '+h+'px '+w+'px)';
    else if (/t2b/.test(opts.clip))
      clip = 'rect(0px '+w+'px 0px 0px)';
    else if (/b2t/.test(opts.clip))
      clip = 'rect('+h+'px '+w+'px '+h+'px 0px)';
    else if (/zoom/.test(opts.clip)) {
      var top = parseInt(h/2,10);
      var left = parseInt(w/2,10);
      clip = 'rect('+top+'px '+left+'px '+top+'px '+left+'px)';
    }
  }

  opts.cssBefore.clip = opts.cssBefore.clip || clip || 'rect(0px 0px 0px 0px)';

  var d = opts.cssBefore.clip.match(/(\d+)/g);
  var t = parseInt(d[0],10), r = parseInt(d[1],10), b = parseInt(d[2],10), l = parseInt(d[3],10);

  opts.before.push(function(curr, next, opts) {
    if (curr == next) return;
    var $curr = $(curr), $next = $(next);
    $.fn.cycle.commonReset(curr,next,opts,true,true,false);
    opts.cssAfter.display = 'block';

    var step = 1, count = parseInt((opts.speedIn / 13),10) - 1;
    (function f() {
      var tt = t ? t - parseInt(step * (t/count),10) : 0;
      var ll = l ? l - parseInt(step * (l/count),10) : 0;
      var bb = b < h ? b + parseInt(step * ((h-b)/count || 1),10) : h;
      var rr = r < w ? r + parseInt(step * ((w-r)/count || 1),10) : w;
      $next.css({ clip: 'rect('+tt+'px '+rr+'px '+bb+'px '+ll+'px)' });
      (step++ <= count) ? setTimeout(f, 13) : $curr.css('display', 'none');
    })();
  });
  $.extend(opts.cssBefore, { display: 'block', opacity: 1, top: 0, left: 0 });
  opts.animIn    = { left: 0 };
  opts.animOut   = { left: 0 };
};

})(jQuery);






/*
 * jQuery Easing v1.3 - http://gsgd.co.uk/sandbox/jquery/easing/
 *
 * Uses the built in easing capabilities added In jQuery 1.1
 * to offer multiple easing options
 *
 * TERMS OF USE - jQuery Easing
 * 
 * Open source under the BSD License. 
 * 
 * Copyright Â© 2008 George McGinley Smith
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification, 
 * are permitted provided that the following conditions are met:
 * 
 * Redistributions of source code must retain the above copyright notice, this list of 
 * conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list 
 * of conditions and the following disclaimer in the documentation and/or other materials 
 * provided with the distribution.
 * 
 * Neither the name of the author nor the names of contributors may be used to endorse 
 * or promote products derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY 
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 *  COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 *  GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED 
 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
 * OF THE POSSIBILITY OF SUCH DAMAGE. 
 *
*/

// t: current time, b: begInnIng value, c: change In value, d: duration
jQuery.easing['jswing'] = jQuery.easing['swing'];

jQuery.extend( jQuery.easing,
{
  def: 'easeOutQuad',
  swing: function (x, t, b, c, d) {
    //alert(jQuery.easing.default);
    return jQuery.easing[jQuery.easing.def](x, t, b, c, d);
  },
  easeInQuad: function (x, t, b, c, d) {
    return c*(t/=d)*t + b;
  },
  easeOutQuad: function (x, t, b, c, d) {
    return -c *(t/=d)*(t-2) + b;
  },
  easeInOutQuad: function (x, t, b, c, d) {
    if ((t/=d/2) < 1) return c/2*t*t + b;
    return -c/2 * ((--t)*(t-2) - 1) + b;
  },
  easeInCubic: function (x, t, b, c, d) {
    return c*(t/=d)*t*t + b;
  },
  easeOutCubic: function (x, t, b, c, d) {
    return c*((t=t/d-1)*t*t + 1) + b;
  },
  easeInOutCubic: function (x, t, b, c, d) {
    if ((t/=d/2) < 1) return c/2*t*t*t + b;
    return c/2*((t-=2)*t*t + 2) + b;
  },
  easeInQuart: function (x, t, b, c, d) {
    return c*(t/=d)*t*t*t + b;
  },
  easeOutQuart: function (x, t, b, c, d) {
    return -c * ((t=t/d-1)*t*t*t - 1) + b;
  },
  easeInOutQuart: function (x, t, b, c, d) {
    if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
    return -c/2 * ((t-=2)*t*t*t - 2) + b;
  },
  easeInQuint: function (x, t, b, c, d) {
    return c*(t/=d)*t*t*t*t + b;
  },
  easeOutQuint: function (x, t, b, c, d) {
    return c*((t=t/d-1)*t*t*t*t + 1) + b;
  },
  easeInOutQuint: function (x, t, b, c, d) {
    if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
    return c/2*((t-=2)*t*t*t*t + 2) + b;
  },
  easeInSine: function (x, t, b, c, d) {
    return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
  },
  easeOutSine: function (x, t, b, c, d) {
    return c * Math.sin(t/d * (Math.PI/2)) + b;
  },
  easeInOutSine: function (x, t, b, c, d) {
    return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
  },
  easeInExpo: function (x, t, b, c, d) {
    return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
  },
  easeOutExpo: function (x, t, b, c, d) {
    return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
  },
  easeInOutExpo: function (x, t, b, c, d) {
    if (t==0) return b;
    if (t==d) return b+c;
    if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
    return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
  },
  easeInCirc: function (x, t, b, c, d) {
    return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
  },
  easeOutCirc: function (x, t, b, c, d) {
    return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
  },
  easeInOutCirc: function (x, t, b, c, d) {
    if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
    return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
  },
  easeInElastic: function (x, t, b, c, d) {
    var s=1.70158;var p=0;var a=c;
    if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
    if (a < Math.abs(c)) { a=c; var s=p/4; }
    else var s = p/(2*Math.PI) * Math.asin (c/a);
    return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
  },
  easeOutElastic: function (x, t, b, c, d) {
    var s=1.70158;var p=0;var a=c;
    if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
    if (a < Math.abs(c)) { a=c; var s=p/4; }
    else var s = p/(2*Math.PI) * Math.asin (c/a);
    return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
  },
  easeInOutElastic: function (x, t, b, c, d) {
    var s=1.70158;var p=0;var a=c;
    if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
    if (a < Math.abs(c)) { a=c; var s=p/4; }
    else var s = p/(2*Math.PI) * Math.asin (c/a);
    if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
    return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
  },
  easeInBack: function (x, t, b, c, d, s) {
    if (s == undefined) s = 1.70158;
    return c*(t/=d)*t*((s+1)*t - s) + b;
  },
  easeOutBack: function (x, t, b, c, d, s) {
    if (s == undefined) s = 1.70158;
    return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
  },
  easeInOutBack: function (x, t, b, c, d, s) {
    if (s == undefined) s = 1.70158; 
    if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
    return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
  },
  easeInBounce: function (x, t, b, c, d) {
    return c - jQuery.easing.easeOutBounce (x, d-t, 0, c, d) + b;
  },
  easeOutBounce: function (x, t, b, c, d) {
    if ((t/=d) < (1/2.75)) {
      return c*(7.5625*t*t) + b;
    } else if (t < (2/2.75)) {
      return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
    } else if (t < (2.5/2.75)) {
      return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
    } else {
      return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
    }
  },
  easeInOutBounce: function (x, t, b, c, d) {
    if (t < d/2) return jQuery.easing.easeInBounce (x, t*2, 0, c, d) * .5 + b;
    return jQuery.easing.easeOutBounce (x, t*2-d, 0, c, d) * .5 + c*.5 + b;
  }
});

/*
 *
 * TERMS OF USE - EASING EQUATIONS
 * 
 * Open source under the BSD License. 
 * 
 * Copyright Â© 2001 Robert Penner
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification, 
 * are permitted provided that the following conditions are met:
 * 
 * Redistributions of source code must retain the above copyright notice, this list of 
 * conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list 
 * of conditions and the following disclaimer in the documentation and/or other materials 
 * provided with the distribution.
 * 
 * Neither the name of the author nor the names of contributors may be used to endorse 
 * or promote products derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY 
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 *  COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 *  GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED 
 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
 * OF THE POSSIBILITY OF SUCH DAMAGE. 
 *
 */









// jquery.tweet.js - See http://tweet.seaofclouds.com/ or https://github.com/seaofclouds/tweet for more info
// Copyright (c) 2008-2012 Todd Matthews & Steve Purcell
(function (factory) {
  if (typeof define === 'function' && define.amd)
    define(['jquery'], factory); // AMD support for RequireJS etc.
  else
    factory(jQuery);
}(function ($) {
  $.fn.tweet = function(o){
    var s = $.extend({
      username: null,                           // [string or array] required unless using the 'query' option; one or more twitter screen names (use 'list' option for multiple names, where possible)
      list: null,                               // [string]   optional name of list belonging to username
      favorites: false,                         // [boolean]  display the user's favorites instead of his tweets
      query: null,                              // [string]   optional search query (see also: http://search.twitter.com/operators)
      avatar_size: null,                        // [integer]  height and width of avatar if displayed (48px max)
      count: 3,                                 // [integer]  how many tweets to display?
      fetch: null,                              // [integer]  how many tweets to fetch via the API (set this higher than 'count' if using the 'filter' option)
      page: 1,                                  // [integer]  which page of results to fetch (if count != fetch, you'll get unexpected results)
      retweets: true,                           // [boolean]  whether to fetch (official) retweets (not supported in all display modes)
      intro_text: null,                         // [string]   do you want text BEFORE your your tweets?
      outro_text: null,                         // [string]   do you want text AFTER your tweets?
      join_text:  null,                         // [string]   optional text in between date and tweet, try setting to "auto"
      auto_join_text_default: " I said, ",      // [string]   auto text for non verb: "I said" bullocks
      auto_join_text_ed: " I ",                 // [string]   auto text for past tense: "I" surfed
      auto_join_text_ing: " I am ",             // [string]   auto tense for present tense: "I was" surfing
      auto_join_text_reply: " I replied to ",   // [string]   auto tense for replies: "I replied to" @someone "with"
      auto_join_text_url: " I was looking at ", // [string]   auto tense for urls: "I was looking at" http:...
      loading_text: null,                       // [string]   optional loading text, displayed while tweets load
      refresh_interval: null,                   // [integer]  optional number of seconds after which to reload tweets
      twitter_url: "twitter.com",               // [string]   custom twitter url, if any (apigee, etc.)
      twitter_api_url: "api.twitter.com",       // [string]   custom twitter api url, if any (apigee, etc.)
      twitter_search_url: "search.twitter.com", // [string]   custom twitter search url, if any (apigee, etc.)
      template: "{avatar}{time}{join} {text}",  // [string or function] template used to construct each tweet <li> - see code for available vars
      comparator: function(tweet1, tweet2) {    // [function] comparator used to sort tweets (see Array.sort)
        return tweet2["tweet_time"] - tweet1["tweet_time"];
      },
      filter: function(tweet) {                 // [function] whether or not to include a particular tweet (be sure to also set 'fetch')
        return true;
      }
      // You can attach callbacks to the following events using jQuery's standard .bind() mechanism:
      //   "loaded" -- triggered when tweets have been fetched and rendered
    }, o);

    // See http://daringfireball.net/2010/07/improved_regex_for_matching_urls
    var url_regexp = /\b((?:https?:\/\/|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/gi;

    // Expand values inside simple string templates with {placeholders}
    function t(template, info) {
      if (typeof template === "string") {
        var result = template;
        for(var key in info) {
          var val = info[key];
          result = result.split('{'+key+'}').join(val === null ? '' : val);
        }
        return result;
      } else return template(info);
    }
    // Export the t function for use when passing a function as the 'template' option
    $.extend({tweet: {t: t}});

    function replacer (regex, replacement) {
      return function() {
        var returning = [];
        this.each(function() {
          returning.push(this.replace(regex, replacement));
        });
        return $(returning);
      };
    }

    function escapeHTML(s) {
      return s.replace(/</g,"&lt;").replace(/>/g,"^&gt;");
    }

    $.fn.extend({
      linkUser: replacer(/(^|[\W])@(\w+)/gi, "$1<span class=\"at\">@</span><a href=\"http://"+s.twitter_url+"/$2\">$2</a>"),
      // Support various latin1 (\u00**) and arabic (\u06**) alphanumeric chars
      linkHash: replacer(/(?:^| )[\#]+([\w\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u00ff\u0600-\u06ff]+)/gi,
                         ' <a href="http://'+s.twitter_search_url+'/search?q=&tag=$1&lang=all'+
                         ((s.username && s.username.length == 1 && !s.list) ? '&from='+s.username.join("%2BOR%2B") : '')+
                         '" class="tweet_hashtag">#$1</a>'),
      makeHeart: replacer(/(&lt;)+[3]/gi, "<tt class='heart'>&#x2665;</tt>")
    });

    function linkURLs(text, entities) {
      return text.replace(url_regexp, function(match) {
        var url = (/^[a-z]+:/i).test(match) ? match : "http://"+match;
        var text = match;
        for(var i = 0; i < entities.length; ++i) {
          var entity = entities[i];
          if (entity.url == url && entity.expanded_url) {
            url = entity.expanded_url;
            text = entity.display_url;
            break;
          }
        }
        return "<a href=\""+escapeHTML(url)+"\">"+escapeHTML(text)+"</a>";
      });
    }

    function parse_date(date_str) {
      // The non-search twitter APIs return inconsistently-formatted dates, which Date.parse
      // cannot handle in IE. We therefore perform the following transformation:
      // "Wed Apr 29 08:53:31 +0000 2009" => "Wed, Apr 29 2009 08:53:31 +0000"
      return Date.parse(date_str.replace(/^([a-z]{3})( [a-z]{3} \d\d?)(.*)( \d{4})$/i, '$1,$2$4$3'));
    }

    function extract_relative_time(date) {
      var toInt = function(val) { return parseInt(val, 10); };
      var relative_to = new Date();
      var delta = toInt((relative_to.getTime() - date) / 1000);
      if (delta < 1) delta = 0;
      return {
        days:    toInt(delta / 86400),
        hours:   toInt(delta / 3600),
        minutes: toInt(delta / 60),
        seconds: toInt(delta)
      };
    }

    function format_relative_time(time_ago) {
      if ( time_ago.days > 2 )     return 'about ' + time_ago.days + ' days ago';
      if ( time_ago.hours > 24 )   return 'about a day ago';
      if ( time_ago.hours > 2 )    return 'about ' + time_ago.hours + ' hours ago';
      if ( time_ago.minutes > 45 ) return 'about an hour ago';
      if ( time_ago.minutes > 2 )  return 'about ' + time_ago.minutes + ' minutes ago';
      if ( time_ago.seconds > 1 )  return 'about ' + time_ago.seconds + ' seconds ago';
      return 'just now';
    }

    function build_auto_join_text(text) {
      if (text.match(/^(@([A-Za-z0-9-_]+)) .*/i)) {
        return s.auto_join_text_reply;
      } else if (text.match(url_regexp)) {
        return s.auto_join_text_url;
      } else if (text.match(/^((\w+ed)|just) .*/im)) {
        return s.auto_join_text_ed;
      } else if (text.match(/^(\w*ing) .*/i)) {
        return s.auto_join_text_ing;
      } else {
        return s.auto_join_text_default;
      }
    }

    function build_api_url() {
      var proto = ('https:' == document.location.protocol ? 'https:' : 'http:');
      var count = (s.fetch === null) ? s.count : s.fetch;
      var common_params = '&include_entities=1&callback=?';
      if (s.list) {
        return proto+"//"+s.twitter_api_url+"/1/"+s.username[0]+"/lists/"+s.list+"/statuses.json?page="+s.page+"&per_page="+count+common_params;
      } else if (s.favorites) {
        return proto+"//"+s.twitter_api_url+"/1/favorites.json?screen_name="+s.username[0]+"&page="+s.page+"&count="+count+common_params;
      } else if (s.query === null && s.username.length == 1) {
        return proto+'//'+s.twitter_api_url+'/1/statuses/user_timeline.json?screen_name='+s.username[0]+'&count='+count+(s.retweets ? '&include_rts=1' : '')+'&page='+s.page+common_params;
      } else {
        var query = (s.query || 'from:'+s.username.join(' OR from:'));
        return proto+'//'+s.twitter_search_url+'/search.json?&q='+encodeURIComponent(query)+'&rpp='+count+'&page='+s.page+common_params;
      }
    }

    function extract_avatar_url(item, secure) {
      if (secure) {
        return ('user' in item) ?
          item.user.profile_image_url_https :
          extract_avatar_url(item, false).
            replace(/^http:\/\/[a-z0-9]{1,3}\.twimg\.com\//, "https://s3.amazonaws.com/twitter_production/");
      } else {
        return item.profile_image_url || item.user.profile_image_url;
      }
    }

    // Convert twitter API objects into data available for
    // constructing each tweet <li> using a template
    function extract_template_data(item){
      var o = {};
      o.item = item;
      o.source = item.source;
      o.screen_name = item.from_user || item.user.screen_name;
      // The actual user name is not returned by all Twitter APIs, so please do not
      // file an issue if it is empty:
      o.name = item.from_user_name || item.user.name;
      o.retweet = typeof(item.retweeted_status) != 'undefined';

      o.tweet_time = parse_date(item.created_at);
      o.join_text = s.join_text == "auto" ? build_auto_join_text(item.text) : s.join_text;
      o.tweet_id = item.id_str;
      o.twitter_base = "http://"+s.twitter_url+"/";
      o.user_url = o.twitter_base+o.screen_name;
      o.tweet_url = o.user_url+"/status/"+o.tweet_id;
      o.reply_url = o.twitter_base+"intent/tweet?in_reply_to="+o.tweet_id;
      o.retweet_url = o.twitter_base+"intent/retweet?tweet_id="+o.tweet_id;
      o.favorite_url = o.twitter_base+"intent/favorite?tweet_id="+o.tweet_id;
      o.retweeted_screen_name = o.retweet && item.retweeted_status.user.screen_name;
      o.tweet_relative_time = format_relative_time(extract_relative_time(o.tweet_time));
      o.entities = item.entities ? (item.entities.urls || []).concat(item.entities.media || []) : [];
      o.tweet_raw_text = o.retweet ? ('RT @'+o.retweeted_screen_name+' '+item.retweeted_status.text) : item.text; // avoid '...' in long retweets
      o.tweet_text = $([linkURLs(o.tweet_raw_text, o.entities)]).linkUser().linkHash()[0];
      o.retweeted_tweet_text = $([linkURLs(item.text, o.entities)]).linkUser().linkHash()[0];
      o.tweet_text_fancy = $([o.tweet_text]).makeHeart()[0];

      o.avatar_size = s.avatar_size;
      o.avatar_url = extract_avatar_url(o.retweet ? item.retweeted_status : item, (document.location.protocol === 'https:'));
      o.avatar_screen_name = o.retweet ? o.retweeted_screen_name : o.screen_name;
      o.avatar_profile_url = o.twitter_base+o.avatar_screen_name;

      // Default spans, and pre-formatted blocks for common layouts
      o.user = t('<a class="tweet_user" href="{user_url}">{screen_name}</a>', o);
      o.join = s.join_text ? t('<span class="tweet_join">{join_text}</span>', o) : '';
      o.avatar = o.avatar_size ?
        t('<a class="tweet_avatar" href="{avatar_profile_url}"><img src="{avatar_url}" height="{avatar_size}" width="{avatar_size}" alt="{avatar_screen_name}\'s avatar" title="{avatar_screen_name}\'s avatar" border="0"/></a>', o) : '';
      o.time = t('<span class="tweet_time"><a href="{tweet_url}" title="view tweet on twitter">{tweet_relative_time}</a></span>', o);
      o.text = t('<span class="tweet_text">{tweet_text_fancy}</span>', o);
      o.retweeted_text = t('<span class="tweet_text">{retweeted_tweet_text}</span>', o);
      o.reply_action = t('<a class="tweet_action tweet_reply" href="{reply_url}">reply</a>', o);
      o.retweet_action = t('<a class="tweet_action tweet_retweet" href="{retweet_url}">retweet</a>', o);
      o.favorite_action = t('<a class="tweet_action tweet_favorite" href="{favorite_url}">favorite</a>', o);
      return o;
    }

    function render_tweets(widget, tweets) {
      var list = $('<ul class="tweet_list">');
      list.append($.map(tweets, function(o) { return "<li>" + t(s.template, o) + "</li>"; }).join('')).
        children('li:first').addClass('tweet_first').end().
        children('li:odd').addClass('tweet_even').end().
        children('li:even').addClass('tweet_odd');

      $(widget).empty().append(list);
      if (s.intro_text) list.before('<p class="tweet_intro">'+s.intro_text+'</p>');
      if (s.outro_text) list.after('<p class="tweet_outro">'+s.outro_text+'</p>');

      $(widget).trigger("loaded").trigger((tweets.length === 0 ? "empty" : "full"));
      if (s.refresh_interval) {
        window.setTimeout(function() { $(widget).trigger("tweet:load"); }, 1000 * s.refresh_interval);
      }
    }

    function load(widget) {
      var loading = $('<p class="loading">'+s.loading_text+'</p>');
      if (s.loading_text) $(widget).not(":has(.tweet_list)").empty().append(loading);
      $.getJSON(build_api_url(), function(data){
        var tweets = $.map(data.results || data, extract_template_data);
        tweets = $.grep(tweets, s.filter).sort(s.comparator).slice(0, s.count);
        $(widget).trigger("tweet:retrieved", [tweets]);
      });
    }

    return this.each(function(i, widget){
      if(s.username && typeof(s.username) == "string"){
        s.username = [s.username];
      }

      $(widget).unbind("tweet:render").unbind("tweet:retrieved").unbind("tweet:load").
        bind({
          "tweet:load": function() { load(widget); },
          "tweet:retrieved": function(ev, tweets) {
            $(widget).trigger("tweet:render", [tweets])
          },
          "tweet:render": function(ev, tweets) {
            render_tweets($(widget), tweets);
          }
        }).trigger("tweet:load");
    });
  };
}));
















