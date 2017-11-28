// ==UserScript==
// @name          Cordial API Key
// @namespace     crdl_api_key
// @require       http://code.jquery.com/jquery-2.1.1.min.js
// @run-at        document-end
// @version       1.07
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

  var api_keys = {};
  var local = GM_getValue('api_keys', '');
  var get_api_key_running = false;
  var ran_set_interval = false;
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
          $('#input_user').prop('type', 'password').css('width', '500px');
          var check_box = '<input id="show_key" type="checkbox">';
          $(check_box).insertAfter('#auth_user');
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
        $('#show_key').change(function(){
          if($('#show_key').is(':checked')){
            $('#input_user').prop('type', 'text').css('width', '500px');
          }else{
            $('#input_user').prop('type', 'password').css('width', '500px');
          }
        });
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
  function is_super_admin(){
    return ($('li.profile_menu span:contains("Super Admin Panel")').length == 1);
  }
    function super_admin(){
        $('<li class="button dropdown" data-class="jobs-notification"><a id="download_csv" href="#" ><i class="fa fa-arrow-down"></i></a></li>').insertBefore($($('li[data-class=jobs-notification]')[0]));
        $('#download_csv').click(function(){
            $.getJSON('https://admin.cordial.io/api/accountusers?sort_by=lastLogin&sort_dir=DESC&per_page=10000&page=1', function(data){
                var exportToCsv = function (filename, rows) {
                    var processRow = function (row) {
                        var finalVal = '';
                        for (var j = 0; j < row.length; j++) {
                            var innerValue = row[j] === null ? '' : row[j].toString();
                            if (row[j] instanceof Date) {
                                innerValue = row[j].toLocaleString();
                            };
                            var result = innerValue.replace(/"/g, '""');
                            if (result.search(/("|,|\n)/g) >= 0)
                                result = '"' + result + '"';
                            if (j > 0)
                                finalVal += ',';
                            finalVal += result;
                        }
                        return finalVal + '\n';
                    };

                    var csvFile = '';
                    for (var i = 0; i < rows.length; i++) {
                        csvFile += processRow(rows[i]);
                    }
                    var csv_temp_array = csvFile.split('\n');
                    csvFile = csv_temp_array.shift() + '\n';
                    csv_temp_array.reverse();
                    var trash_blank_row = csv_temp_array.shift();
                    csvFile = csvFile + csv_temp_array.join('\n');
                    var blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
                    if (navigator.msSaveBlob) { // IE 10+
                        navigator.msSaveBlob(blob, filename);
                    } else {
                        var link = document.createElement("a");
                        if (link.download !== undefined) { // feature detection
                            // Browsers that support HTML5 download attribute
                            var url = URL.createObjectURL(blob);
                            link.setAttribute("href", url);
                            link.setAttribute("download", filename);
                            link.style.visibility = 'hidden';
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                        }
                    }
                };
                unsafe.csv = [];
                unsafe.csv.push(['lastLogin','email','userName','domain','accountNamess','accountNumbers','userID','userAccountsID']);
                unsafe.row_counter = 0;
                alert('wait about 20 seconds');
                for(var i=0, l=data.records.length; i<l; i++){
                  var row = data.records[i];
                  row.domain = (row.email.split('@')[1] || '');
                  var account_names_str = '';
                  var account_numbers_str = '';
                  if( row.lastLogin != null && (row.lastLogin || '').indexOf('20' > -1) && (row.domain || '').indexOf('cordial') == -1){ /* year is 20xx and domain does not include cordial */
                    (function(row, i, l, unsafe){
                      jQuery.getJSON('https://admin.cordial.io/api/users/'+row.userID+'/accounts?page=1&sort_by=accountName&sort_dir=ASC', function(data){
                        unsafe.row_counter++;
                        var accountNames = [];
                        var accountNumbers = [];
                        for(var j=0,l_j=data.records.length; j<l_j; j++){
                          var account_row = data.records[j];
                          accountNames.push(account_row.accountName);
                          account_names_str = accountNames.join('|');
                          accountNumbers.push(account_row.accountID);
                          account_numbers_str = accountNumbers.join('|');
                        }
                        csv.push([row.lastLogin, row.email, row.userName, row.domain, account_names_str, account_numbers_str, row.userID, row.userAccountsID]);
                        if(unsafe.row_counter == l){
                          setTimeout(function(){
                            var now = new Date();
                            var now_str = now.toISOString().replace('.', '_').replace(':', '_').replace('-', '_');
                            exportToCsv('contacts'+now_str+'.csv', unsafe.csv);
                          }, 750);
                        }
                      });
                    }(row, i, l, unsafe));
                  }else{
                    unsafe.row_counter++;
                  }
                }
            });
        });
    };

  function gmMain () {
      // console.log ('A new page has loaded.');
      get_new_api_key();
      display_new_api_dropdown();
      if(currentURLMatches(['^https?:\/\/api\.cordial\.(com|io)\/docs\/v.*'])){
        //setTimeout(function(){change_favicon('https://cordialdev-solutions.s3.amazonaws.com/favicon/white_pinkCloud.jpg');}, 500);
        //setTimeout(function(){change_favicon('https://cordialdev-solutions.s3.amazonaws.com/favicon/white_pinkCloud.jpg');}, 750);
        setTimeout(function(){change_favicon('https://cordialdev-solutions.s3.amazonaws.com/favicon/white_circle_teal_cloud.png');}, 500);
        setTimeout(function(){change_favicon('https://cordialdev-solutions.s3.amazonaws.com/favicon/white_circle_teal_cloud.png');}, 750);
      }else if(currentURLMatches(['^https:\/\/admin\.cordial\.(com|io).*'])){
        //change_favicon('https://cordialdev-solutions.s3.amazonaws.com/favicon/pink_whiteCloud.jpg');
        change_favicon('https://cordialdev-solutions.s3.amazonaws.com/favicon/teal_circle_white_cloud.png');
        if(ran_set_interval == false){
          if(is_super_admin() == true){
            super_admin();
          }
          ran_set_interval = true;
          setInterval(function(){
            if(jQuery('button:contains("Continue working")').length > 0){
                console.info("click continue working at: " + (new Date()).toISOString());
                jQuery('button:contains("Continue working")').click();
            }
          }, 240000);
        }
      }
  }

})(unsafeWindow);