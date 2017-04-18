// ==UserScript==
// @name          Cordial Demo
// @namespace     demo_tm
// @require       http://code.jquery.com/jquery-2.1.1.min.js
// @run-at        document-end
// @version       1.00
// @description   Demo Cordial
// @include       *
// @updateURL     https://bkranson.github.io/crdl/demo_tm.user.js
// ==/UserScript==
(function(unsafe) {
  'use strict';
  $ = unsafe.jQuery;

  var contentEval = function contentEval(source, execute) {
    // Check for function input.
    if ('function' == typeof source && execute) {
      // Execute this function with no arguments, by adding parentheses.
      // One set around the function, required for valid syntax, and a
      // second empty set calls the surrounded function.
      source = '(' + source + ')();';
    }
    // Create a script node holding this  source code.
    var script = unsafe.document.createElement('script');
    script.setAttribute("type", "application/javascript");
    script.textContent = source;
    // Insert the script node into the page, so it will run
    document.body.appendChild(script);
  };

  var currentURL = unsafe.location.toString();

  var currentURLMatches = function currentURLMatches(listToMatch) {
    //console.log("Testing " + listToMatch);
    for (var i in listToMatch) {
      var pattern = listToMatch[i];
      var regex = new RegExp(pattern);
      if (currentURL.match(regex)) {
        return true;
      }
    }
  };

  var keepTrying = function keepTrying(func, callback, sleep, maxAttempts) {
    if (typeof(sleep) == 'undefined') {
      sleep = 100;
    }
    var totalAttempts = 0;
    var args = Array.prototype.slice.call(arguments, 2);
    var timer = setInterval(function() {
      if (func.apply(null, args)) {
        clearInterval(timer);
        // console.log('done trying: '+func);
        callback();
      } else {
        // console.log('tried: '+func);
        totalAttempts++;
        if (typeof maxAttempts !== 'undefined') {
          if (totalAttempts > maxAttempts) {
            clearInterval(timer);
            console.log('Reached maximum number of attepts.  Going to stop checking.');
          }
        }
      }
    }, sleep);
  };

  var when = function when(test, run, sleep, maxAttempts) {
    var args = Array.prototype.slice.call(arguments, 2);
    keepTrying(test, function() {
        run.apply(null, args);
      },
      sleep, maxAttempts);
  };

  var inIframe = function(){
      try {
          return unsafe.self !== unsafe.top;
      } catch (e) {
          return true;
      }
  };

  var cordial_ready = function(){
    if(typeof unsafe.cordial !== 'undefined'){
      return true;
    }else{
      return false;
    }
  };

  var add_cordial = function(account_key){
    var t = document.createElement('script');
    t.setAttribute("data-cordial-track-key", account_key);
    t.setAttribute("data-cordial-url", "track.cordial.io");
    t.setAttribute("data-auto-track", false);
    t.src = 'https://track.cordial.io/track.js';
    t.async = true;
    document.body.appendChild(t);
  };

  if($ && $.fn){
    $.fn.bindFirst = function(name, fn) {
      // bind as you normally would
      // don't want to miss out on any jQuery magic
      this.on(name, fn);
      // Thanks to a comment by @Martin, adding support for
      // namespaced events too.
      this.each(function() {
        var handlers = $._data(this, 'events')[name.split('.')[0]];
        // console.log(handlers);
        // take out the handler we just inserted from the end
        var handler = handlers.pop();
        // move it at the beginning
        handlers.splice(0, 0, handler);
      });
    };
  }

/* start Tealium Demo */
  if(currentURLMatches(['^https?:\/\/tealium\.com']) && !inIframe()){
      console.log('Started Cordial Tealium Demo');
      add_cordial('sandbox-bk');
      when(
      cordial_ready,
      function(){
        console.log('Cordial Identify');
        unsafe.cordial.identify('bkranson+201704170343@cordial.io');
      }
    );
  }

  if(currentURLMatches(['^https?:\/\/tealium\.com\/?$']) && !inIframe()){
      when(
      cordial_ready,
      function(){
        console.log('Cordial Track Homepage');
        unsafe.cordial.event('homepage', {"date_time": (new Date())+""});
      }
    );
  }

  if(currentURLMatches(['^https?:\/\/tealium\.com/tour\.html\/?$']) && !inIframe()){
      when(
      cordial_ready,
      function(){
        console.log('Cordial Track Product');
        unsafe.cordial.event('product', {"date_time": (new Date())+""});
      }
    );
  }
/* end Tealium Demo */
})(unsafeWindow);