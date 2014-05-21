/*globals window, document, $, html_beautify, FileReader,  */
/*jslint unparam: true */
$(function (window, $, html_beautify, rJS) {
  "use strict";

  var presentation = null,
    slideForm,
    newSlideButton = $('#add-slide'),
    formPanel = $('#form-panel');

  formPanel.panel({ beforeclose: function () {
    newSlideButton.show("fade");
    slideForm.bindToAdd();
  }});

  function openForm() {
    formPanel.panel("open");
    newSlideButton.hide("fade");
  }

  function closeForm() {
    formPanel.panel("close");
  }

  function animate(selector, animation) {
    var $selector = $(selector);
    $selector.off("animationend webkitAnimationEnd");
    $selector.on("animationend webkitAnimationEnd", function () {
      $selector.removeClass("animated " + animation);
    });
    $selector.addClass("animated " + animation);
  }

  function Slide(params) {
    var that = this;
    this.html = document.importNode(this.htmlTemplate, true);
    this.update(params);
    $(this.editBtn()).click(function () {
      if (slideForm.currentSlide !== that) {
        slideForm.bindToEdit(that);
        openForm();
      }
    });
    $(this.deleteBtn()).click(function () {
      presentation.deleteSlide(that);
    });
  }

  function readSlide(domElement) {
    var $el = $(domElement),
      title = $el.find('h1').first().text(),
      type = $el.attr('class'),
      img,
      content = "";

    if (type === 'screenshot' || type === 'illustration') {
      img = $el.find('img').first().attr('src');
    }

    $el.contents().filter(function () {
      return $(this).is(':not(img, h1, details)') || this.nodeType === 3;
    }).each(function () {
      content += this.outerHTML || this.textContent;
    });

    return new Slide({
      title: title,
      type: type,
      content: content,
      image: img
    });
  }

  Slide.prototype = {

    dataTemplate: document.querySelector('template#slide-data').content.firstElementChild,
    htmlTemplate: document.querySelector('template#slide-html').content.firstElementChild,

    editBtn: function () {return this.html.querySelector("button.edit"); },
    deleteBtn: function () {return this.html.querySelector("button.delete"); },
    htmlContent: function () {return this.html.querySelector(".content"); },
    htmlImage: function () {return this.html.querySelector("img"); },
    htmlTitle: function () {return this.html.querySelector("h1"); },

    data: function () {
      var res = document.importNode(this.dataTemplate, true), img;
      res.className = this.type;
      res.querySelector('h1').textContent = this.title;
      $(res).append(this.content);
      if (this.type === "screenshot" || this.type === "illustration") {
        img = document.createElement('img');
        img.src = this.image;
        res.appendChild(img);
      }
      return res;
    },

    update: function (params) {
      $.extend(this, params);
      this.htmlTitle().textContent = this.title;
      this.htmlContent().innerHTML = this.content;
      if (this.type === "screenshot" || this.type === "illustration") {
        this.htmlImage().src = this.image;
      } else {
        this.htmlImage().src = "";
      }
    }
  };

  function SlideForm() {
    var that = this;
    this.elt = document.querySelector("#slide-form");
    this.bindToAdd();
    $(this.elt).find("#cancel").click(closeForm);
    $(this.elt).find('input[type="radio"]').click(function () {
      that.updateFieldVisibility(true);
    });
    $("#image-url").on("change", function () {
      that.updatePreview(that.attrImageURL());
    });
  }

  SlideForm.prototype = {

    attrTextInput: function (inputElt, content) {
      if (content !== undefined) {
        inputElt.value = content;
      } else {
        return inputElt.value;
      }
    },

    attrTitle: function (content) {
      return this.attrTextInput(this.elt.querySelector('#title'), content);
    },

    attrContent: function (content) {
      return this.attrTextInput(this.elt.querySelector('#content'), content);
    },

    attrDetails: function (content) {
      return this.attrTextInput(this.elt.querySelector('#details'), content);
    },

    attrType: function (type) {
      var radios = $(this.elt).find('input[type="radio"]');
      if (type !== undefined) {
        radios.prop('checked', false);
        if (type === "") {type = "basic"; }
        radios.filter("#" + type + "-type").prop('checked', true);
        radios.checkboxradio('refresh');
        this.updateFieldVisibility();
      } else {
        return radios.filter(':checked').val();
      }
    },

    attrImageURL: function (content) {
      return this.attrTextInput(this.elt.querySelector('#image-url'), content);
    },

    updatePreview: function (content) {
      var preview = this.elt.querySelector('#image-preview');
      if (content) {
        $(preview).show();
        preview.src = content;
      } else {
        $(preview).hide();
      }
    },

    attrAll: function (slide) {
      if (slide !== undefined) {
        this.attrTitle(slide.title);
        this.attrType(slide.type);
        this.attrContent(slide.content);
        this.attrDetails(slide.details);
        this.attrImageURL(slide.image);
        this.updatePreview(slide.image);
      } else {
        return {
          title: this.attrTitle(),
          type: this.attrType(),
          content: this.attrContent(),
          details: this.attrDetails(),
          image: this.attrImageURL()
        };
      }
    },

    updateFieldVisibility: function (withEffect) {
      var type = this.attrType(),
        $imageField = $(this.elt).find('#image-field'),
        $imageInputURL = $(this.elt).find('input#image-url');
      if (type === "screenshot" || type === "illustration") {
        if (withEffect) {
          $imageField.show("blind", {direction: "up"});
        } else {
          $imageField.show();
        }
        $imageInputURL.attr('required', true);
      } else {
        if (withEffect) {
          $imageField.hide("blind", {direction: "up"});
        } else {
          $imageField.hide();
        }
        $imageInputURL.attr('required', false);
      }
    },

    setSubmitLabel: function (label) {
      var submit = $(this.elt).find("#submit");
      submit.prop("value", label).button('refresh');
    },

    reset: function () {
      this.attrAll({title: "", type: "basic", content: "", details: "", image: ""});
      this.currentSlide = null;
      $(this.elt).off("submit");
    },

    bindToEdit: function (slide) {
      var that = this;
      this.reset();
      animate(this.elt, "fadeIn");
      that.currentSlide = slide;
      this.attrAll(slide);
      $(this.elt).submit(function (e) {
        slide.update(that.attrAll());
        animate(slide.html, "bounce");
        e.preventDefault();
        that.bindToAdd();
      });
      this.setSubmitLabel("Save");
    },

    bindToAdd: function () {
      var that = this;
      this.reset();
      $(this.elt).submit(function (e) {
        presentation.addSlide(new Slide(that.attrAll()));
        that.bindToAdd();
        e.preventDefault();
      });
      this.setSubmitLabel("Add");
    }
  };

  function Presentation(DOMElement) {
    this.html = DOMElement;
    slideForm = new SlideForm();
    this.slides = [];
    $("#add-slide").click(openForm);
    $(this.html).sortable({
      update: function (event, ui) {
        presentation.updateOrder(ui.item);
      }
    });
  }

  Presentation.prototype = {

    addSlide: function (slide) {
      this.slides.push(slide);
      this.html.appendChild(slide.html);
      animate(slide.html, "pulse");
      return slide;
    },

    deleteSlide: function (slide) {
      if (slideForm.currentSlide === slide) {
        slideForm.bindToAdd();
      }
      var index = this.slides.indexOf(slide);
      this.slides.splice(index,  1);
      animate(slide.html, 'rollOut');
      $(slide.html).on("animationend webkitAnimationEnd", function () {
        slide.html.remove();
      });
      return index;
    },

    updateOrder: function (DOMElement) {
      var newIndex = $(this.html.children).index(DOMElement),
        oldIndex,
        i,
        tmp;
      for (i = 0; i < this.slides.length; i++) {
        if (this.slides[i].html === DOMElement[0]) {
          oldIndex = i;
          break;
        }
      }
      tmp = this.slides.splice(oldIndex, 1)[0];
      this.slides.splice(newIndex, 0, tmp);
    },

    getContent: function () {
      var i, container = document.createElement('div');
      for (i = 0; i < this.slides.length; i++) {
        container.appendChild(this.slides[i].data());
      }
      return html_beautify(container.innerHTML);
    },

    setContent: function (content) {
      var i, sections, container = document.createElement('div');
      container.innerHTML = content;
      sections = container.children;
      for (i = 0; i < sections.length; i++) {
        this.addSlide(readSlide(sections[i]));
      }
    }
  };

  $.fn.extend({
    presentation: function () {
      presentation = new Presentation(this[0]);
      window.prez = presentation;
      return presentation;
    }
  });

  rJS(window)
  
    .declareMethod('setContent', function (content) {
      rJS(this).editor.setContent(content);
    })
  
    .declareMethod('getContent', function () {
      return rJS(this).editor.getContent();
    })
  
    .ready(function (g) {
      g.editor = $('#slide-list').presentation();
    });
  
}(window, $, html_beautify, rJS));
