var RenderJs={
  
    bootstrap: function (root){
      // initial load application gadget
      RenderJs.load(root);
    },
    
    load: function (root) {
            // Load gadget layout by traversing DOM
            gadget_list = root.find("[gadget]");
            
            // Load chilren
            gadget_list.each(function(i,v){RenderJs.loadGadgetFromUrl($(this));});
    },

    loadGadgetFromUrl: function(gadget) {
            // Load gadget's SPECs from URL
            url = gadget.attr("gadget")
            //console.log(url);
            $.ajax({url:url,
                    success: function (data) {
                              RenderJs.parse (data);
                              gadget.append(data);
                              // a gadget may contain sub gadgets
                              RenderJs.load(gadget);
                              //console.log(url+ data);
                              gadget.find("a").each(
                                function(){
                                  $(this).click(
                                    function(){
                                      alert("disabled link, do action on *same* page"); return false;})}
                              )
                     
                  },
            });
            
    },
    
    // XXX: finish below
        
    parse: function (data){
             // XXX: Parse an HTML document and get out .js and .css
             // XXX: load .css
             // XXX: load .jss (see requirejs)
             //  $.ajax({url:"jquery-ui.js",
             //            type: "script"});

    },

    
    save: function () {
            // XXX: Save gadget layoyut by traversing DOM and using some kind of storage
            console.log("XXX: save"); 
    },
}

// init all when DOM is ready
$(document).ready(function() {
   RenderJs.bootstrap($("#application"));
 });
     
