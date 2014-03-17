/*jslint indent: 2 */
/*global window, jQuery, rJS*/
"use strict";

(function (window, $, rJS) {

  function initToolbarBootstrapBindings() {
    var fonts = [
      'Serif', 'Sans', 'Arial', 'Arial Black', 'Courier', 'Courier New', 'Comic Sans MS', 'Helvetica',
      'Impact', 'Lucida Grande', 'Lucida Sans', 'Tahoma', 'Times', 'Times New Roman', 'Verdana'
    ], fontTarget = $('[title=Font]').siblings('.dropdown-menu');

    $.each(fonts, function (idx, fontName) {
      /*jslint unparam: true */
      fontTarget.append($('<li><a data-edit="fontName ' + fontName + '" style="font-family:\'' + fontName + '\'">' + fontName + '</a></li>'));
    });

    $('.dropdown-menu input').
      click(function () {
        return false;
      }).
      change(function () {
        $(this).parent('.dropdown-menu').siblings('.dropdown-toggle').dropdown('toggle');
      }).
      keydown('esc', function () {
        this.value = '';
        $(this).change();
      });

    $('[data-role=magic-overlay]').each(function () {
      var overlay = $(this), target = $(overlay.data('target'));
      overlay.css('opacity', 0).css('position', 'absolute').offset(target.offset()).width(target.outerWidth()).height(target.outerHeight());
    });
  }

  function showErrorAlert(reason, detail) {
    var msg = '';
    if (reason === 'unsupported-file-type') {
      msg = "Unsupported format " + detail;
    } else {
      console.log("error uploading file", reason, detail);
    }
    $('<div class="alert"> <button type="button" class="close" data-dismiss="alert">&times;</button>' +
      '<strong>File upload error</strong> ' + msg + ' </div>').prependTo('#alerts');
  }

  function init() {
    this.editor = $('#editor');
    initToolbarBootstrapBindings();
    this.editor.wysiwyg({
      fileUploadError: showErrorAlert
    });
  }

  rJS(window).
    declareMethod('getContent', function () {
      return rJS(this).editor.html();
    })
    .declareMethod('setContent', function (content) {
      //console.log('setcontent:' + content);
      rJS(this).editor.html(content);
    })
    .declareMethod('clearContent', function () {
      rJS(this).editor.html('');
    })
    .ready(function (g) {
      init.apply(g);
    });

}(window, jQuery, rJS));
