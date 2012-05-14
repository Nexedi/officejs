/**
 * NEXEDI
 */
(function($) {
  var routes = {
    "/service" : "displayForm",
    "/service/:id" : "displayData",
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
      // Initialize slapos in this context
      var $this = $(this);
      // Bind to urlChange event
      return this.each(function(){
        $.subscribe("urlChange", function(e, d){
          router.call($this, e, d);
        });
        $.subscribe("auth", function(e, d){
          $(this).form("authenticate", d);
        });
      });
    },

    authenticate: function(data) {
      for (var d in data) {
        if (data.hasOwnProperty(d)) {
        }
      }
    },

    displayData: function(id){
      console.log('displayData, id', id);
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

    displayForm: function() {
      console.log('form.displayForm');
      $(this).form('render', 'form.new.instance');
      var data = {};
      $(this).find("form").submit(function(){
        $(this).find('input').serializeArray().map(function(elem){
          data[elem["name"]] = elem["value"];
        });
        $(this).form('displayAsking', data);
        return false;
      });
    },

    displayAsking: function(data){
      var request = {
        software_type: "type_provided_by_the_software",
        slave: false,
        status: "started",
        parameter: {
        Custom1: "one string",
        Custom2: "one float",
        Custom3: ["abc", "def"],
        },
        sla: {
        computer_id: "COMP-0",
        }
      };
      var redirect = function(){
        $(this).form('render', 'auth', {
          'host':'t139:12002/erp5/web_site_module/hosting/request-access-token',
          'client_id': 'client',
          'redirect':escape(window.location.href)
        })
      };
      var statusCode = {
        401: redirect
      };
      $.extend(request, data);
      $(this).html("<p>Requesting a new instance "+request["title"]+" ...</p>")
        .slapos('newInstance', request, function(data){
          $(this).html(data);},
          statusCode
        );
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
