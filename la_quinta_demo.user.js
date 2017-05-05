// ==UserScript==
// @name          La Qunita Demo
// @namespace     la_quinta
// @description   Trying to demo events and identify on lq.com
// @require       http://code.jquery.com/jquery-2.1.1.min.js
// @run-at        document-end
// @version       1.00
// @include       http*://*.lq.*
// @updateURL     https://bkranson.github.io/crdl/la_quinta_demo.user.js

// ==/UserScript==
(function(unsafe) {
  'use strict';
  $ = unsafe.jQuery || jQuery || function(){};
  var inIframe = function(){
      try {
          return unsafe.self !== unsafe.top;
      } catch (e) {
          return true;
      }
  };
  var validateEmail = function(email){
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  if(!inIframe()){
    unsafe.cordial_onload = function(){
      console.log('Cordial JavaScript Loaded');
      //cordial.identify();
      //cordial.event("browse", {"url":document.URL});
      $('#btnSignIn').on('mousedown', function(){
        var email = $('#returnsid').val();
        if(validateEmail(email)){
          console.log(email);
          cordial.identify(email);
          cordial.contact({
            "channels.email.address": email
          });
          cordial.event('email_add', {"email": email});
        }
      });
    };

    var track = unsafe.document.createElement('script');
    track.setAttribute("data-cordial-track-key", "lqdemo2");
    track.setAttribute("data-cordial-url", "track.cordial.io");
    track.setAttribute("data-auto-track", false);
    track.src = 'https://track.cordial.io/track.js';
    track.async = true;
    track.onload = cordial_onload;
    unsafe.document.body.appendChild(track);
  }
})(unsafeWindow);