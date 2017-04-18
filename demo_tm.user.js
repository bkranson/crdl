// ==UserScript==
// @name          Cordial Demo
// @namespace     demo_tm
// @require       http://code.jquery.com/jquery-2.1.1.min.js
// @run-at        document-end
// @version       1.00
// @description   Demo Cordial
// @include       *
// @updateURL     
// ==/UserScript==
console.log('Started Cordial Demo');

(function(unsafe) {
  'use strict';
  unsafe.sdfwa = unsafe.sdfwa || {};
  var s = unsafe.sdfwa;
  s.tmp = {};
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

  var arrayUnique = function arrayUnique(a) {
      return a.reduce(function(p, c) {
          if (p.indexOf(c) < 0) p.push(c);
          return p;
      }, []);
  };
  
  var getDate = function(){
    var a = new Date();
    var b = ('0000'+a.getFullYear()).slice(-4);
    b += "-";
    b += ('00'+(a.getMonth()+1)).slice(-2);
    b += "-";
    b += ('00'+a.getDate()).slice(-2);
    return b;
  }
})(unsafeWindow);