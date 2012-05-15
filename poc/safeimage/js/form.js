/**
 * NEXEDI
 */
(function($) {
  var routes = {
    "/image/:id" : "displayData",
    "image/:id" : "displayData",
  }

  var router = function(e, d){
    var $this = $(this);
    $.each(routes, function(pattern, callback){
      pattern = pattern.replace(/:\w+/g, '([^\/]+)');
      var regex = new RegExp('^' + pattern + '$');
      var result = regex.exec(d);
      if (result) {
        result.shift();
        methods[callback].apply($this, result);
      }
    });
  }

  var methods = {
    init: function() {
      // Initialize in this context
      var $this = $(this);
      // Bind to urlChange event
      return this.each(function(){
        $.subscribe("urlChange", function(e, d){
          router.call($this, e, d);
        });
      });
    },

    displayData: function(id){
      if (map !== undefined){
        map.destroy();
      }
      zoomify_url = "image/" + id + "/";
      //XXX look at the xml definition inside image folder
      if (id == 'hs-2007-16-a-full_jpg') {
        zoomify_width = 29566;
        zoomify_height = 14321;
      } else {
        zoomify_width = 1277;
        zoomify_height = 754;
      }
      $(this).form('render', 'image', {'image_id': id});
      $(loadOpenLayerZoomedImage);
    },

    render: function(template, data){
      $(this).html(ich[template](data, true));
    }
  };

  $.fn.form = function(method){
    if ( methods[method] ) {
      return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof method === 'object' || ! method ) {
      return methods.init.apply( this, arguments );
    } else {
      $.error( 'Method ' +  method + ' does not exist on jQuery.form' );
    }
  };
})(jQuery);

$("#main").form();