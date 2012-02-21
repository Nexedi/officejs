var ERP5={
    bootstrap: function (root){
      // load application gadget
      ERP5.load(root);
    },
    
    load: function (root) {
            // Load gadget layout by traversing DOM
            gadget_list = root.find("[gadget]");
            
            // Load siblings
            gadget_list.each(function(i,v){ERP5.loadGadgetFromUrl($(this));});
    },

    loadGadgetFromUrl: function(gadget) {
            // Load gadget's SPECs from URL
            url = gadget.attr("gadget")
            //console.log(url);
            $.ajax({url:url,
                    success: function (data) {
                              ERP5.parse (data);
                              gadget.append(data);
                              // a gadget may contain sub gadgets
                              ERP5.load(gadget);
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
    
    save: function () {
            // XXX: Save gadget layoyut by traversing DOM and using some kind of storage
            console.log("XXX: save"); 
    },
        
    parse: function (data){
             // XXX: Parse an HTML document and get out .js and .css
             // XXX: load .css
             // XXX: load .jss (see requirejs)
//               $.ajax({url:"jquery-ui.js",
//                       type: "script"});

    },
      

}
   

// init all when DOM is ready
$(document).ready(function() {
   ERP5.bootstrap($("#application"));
 });
     
