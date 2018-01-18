// ==UserScript==
// @name          Cordial Zendesk
// @namespace     crdl_zendesk
// @require       http://code.jquery.com/jquery-2.1.1.min.js
// @run-at        document-end
// @version       1.04
// @description   Cordial Zendesk
// @include       http*://cordial.zendesk.com/*
// @include       http*://support.cordial.com*
// @updateURL     https://bkranson.github.io/crdl/zendesk.user.js
// @grant   GM_getValue
// @grant   GM_setValue
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
    currentURL = unsafe.location.toString();
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

  var change_favicon = function(url) {
    var link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = url;
    document.getElementsByTagName('head')[0].appendChild(link);
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





  /*--- Note, gmMain () will fire under all these conditions:
      http://stackoverflow.com/questions/18989345/how-do-i-reload-a-greasemonkey-script-when-ajax-changes-the-url-without-reloadin
      1) The page initially loads or does an HTML reload (F5, etc.).
      2) The scheme, host, or port change.  These all cause the browser to
         load a fresh page.
      3) AJAX changes the URL (even if it does not trigger a new HTML load).
  */
  var fireOnHashChangesToo    = true;
  var pageURLCheckTimer       = setInterval (
      function () {
          if (   this.lastPathStr  !== location.pathname
              || this.lastQueryStr !== location.search
              || (fireOnHashChangesToo && this.lastHashStr !== location.hash)
          ) {
              this.lastPathStr  = location.pathname;
              this.lastQueryStr = location.search;
              this.lastHashStr  = location.hash;
              gmMain ();
          }
      }
      , 111
  );

  function gmMain () {
      if(currentURLMatches(['^https?:\/\/cordial\.zendesk\.com\/agent\/.*'])){
        change_favicon('https://cordialdev-solutions.s3.amazonaws.com/favicon/pink_circle_white_cloud.png');
        setTimeout(function(){change_favicon('https://cordialdev-solutions.s3.amazonaws.com/favicon/pink_circle_white_cloud.png');}, 500);
      }else if(currentURLMatches(['^https?:\/\/support\.cordial\.com\/hc\/en.us.*'])){
        change_favicon('https://cordialdev-solutions.s3.amazonaws.com/favicon/white_circle_teal_cloud.png');
      }
  }
})(unsafeWindow);