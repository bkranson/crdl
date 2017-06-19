// ==UserScript==
// @name          Cordial Assembla
// @namespace     crdl_assembla
// @require       http://code.jquery.com/jquery-2.1.1.min.js
// @run-at        document-end
// @version       1.00
// @description   Cordial Assembla
// @include       https://app.assembla.com*
// @updateURL     https://bkranson.github.io/crdl/assembla.user.js
// @grant   GM_getValue
// @grant   GM_setValue
// ==/UserScript==
(function(unsafe) {
  'use strict';
  $ = unsafe.jQuery;
  if(!$('#open_ticket').is(':visible')){
    $('<input type="text" id="open_ticket" style="margin-top:5px;"></input>').insertAfter(jQuery('#tickets-settings').closest('li'));
    $('#open_ticket').live("keypress", function(e) {
      if (e.keyCode == 13) {
        document.location = "https://app.assembla.com/spaces/cordial/tickets/realtime_cardwall?ticket=" + $('#open_ticket').val();
        return false; // prevent the button click from happening
      }
    });
  }
})(unsafeWindow);