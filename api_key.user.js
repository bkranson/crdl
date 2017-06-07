// ==UserScript==
// @name          Cordial API Key
// @namespace     crdl_api_key
// @require       http://code.jquery.com/jquery-2.1.1.min.js
// @run-at        document-end
// @version       1.03
// @description   Cordial API Key
// @include       https://admin.cordial.*
// @include       http*://api.cordial.*
// @updateURL     https://bkranson.github.io/crdl/api_key.user.js
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

  var api_keys = {};
  var local = GM_getValue('api_keys', '');
  var get_api_key_running = false;
  if(typeof local === 'string' && local !== 'undefined' && local.length > 2){
    api_keys = JSON.parse(local);
  }
  unsafe.api_keys = api_keys;

  /* start Get API Key */
    function get_new_api_key(){
      if(currentURLMatches(['^https:\/\/admin\.cordial\.(com|io)\/\#account\/apikeys\/grid\/1'])){
        var account = '';
        var api_key = '';
        if(get_api_key_running === false){
          when(
            function(){
              if($('.clipboard-input').is(':visible') === true){
                  get_api_key_running = false;
                  return true;
              }else{
                get_api_key_running = true;
                return false;
              }
            },
            function(){
              try{
                account = $('#head-nav span:contains("logged into")').text().split('logged into ')[1];
              }catch(e){}
              try{
                api_key = $('.clipboard-input').val();
              }catch(e){}
              if(account !== '' && api_key !== ''){
                api_keys[account] = api_key;
                unsafe.api_keys = api_keys;
                GM_setValue('api_keys', JSON.stringify(api_keys));
              }
            },
            100,
            1000
          );
        }
      }
    }
  /* end Get API Key */

  /* start Set API Key */
    var api_dropdown_visible = false;
    function display_new_api_dropdown(){
      if(currentURLMatches(['^https?:\/\/api\.cordial\.(com|io)\/docs\/v.*'])){
        if(api_dropdown_visible === false){
          api_dropdown_visible = true;
          var keys = Object.keys(api_keys);
          keys.sort();
          var select = '<select id="api_select">';
          select += '<option value="None">None</option>';
          for(var i=0; i<keys.length; i++){
            select += '<option value="'+api_keys[keys[i]]+'">'+keys[i]+'</option>';
          }
          select += '</select>';
          $(select).insertAfter('#auth_user');
        }
        $('#api_select').change(function(){
          if($('#api_select').val() !== 'None'){
            $('#input_user').val($('#api_select').val());
            $('#auth_user').click();
          }
        });
      }
    }
  /* end Set API Key */
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
      // console.log ('A new page has loaded.');
      get_new_api_key();
      display_new_api_dropdown();
  }
})(unsafeWindow);