/*jslint nomen: true*/
/*global rJS */
(function (window, document, rJS) {
  "use strict";

  var gk = rJS(window);
  var gadget_path_list = {
        dygraph: "../viewer_dygraph/index.html"
  };
  
  return gk.declareMethod('addChart', function(options, chart_id) {
     var g = this;
     
     console.log(options.source_url);
     var data_source = options.source_url + "/" + chart_id;
    
     
     return this.declareGadget(gadget_path_list.dygraph)
      .push(function(gadget) {
         g.__element.appendChild(gadget.__element);
         return gadget.render(data_source);
      });
  })
  .declareMethod('render', function(options) {
     if (options.source_url === undefined) {
       throw "undefined source_url";
     }
      var div = document.createElement("div");
      var g = this;
      return g.addChart(options, "system_cpu_percent.csv")
      
        .push(function () {
          return g.addChart(options, "system_disk_memory_free__dev_sda1.csv");
        })
        .push(function () {
            return g.addChart(options, "system_disk_memory_free__dev_sda1.csv");
        })
        .push(function () {
          return g.addChart(options, "system_disk_memory_free__dev_sdb1.csv");
        })
        .push(function () {
            return g.addChart(options, "system_disk_memory_used__dev_sda1.csv");
        })
        .push(function () {
            return g.addChart(options, "system_disk_memory_used__dev_sdb1.csv");
        })
        .push(function () {
            return g.addChart(options, "system_loadavg.csv");
        })
        .push(function () {
            return g.addChart(options, "system_memory_free.csv");
        })
        .push(function () {
            return g.addChart(options, "system_memory_used.csv");
        })
        .push(function () {
            return g.addChart(options, "system_net_in_bytes.csv");
        })
        .push(function () {
            return g.addChart(options, "system_net_in_dropped.csv");
        })
        .push(function () {
            return  g.addChart(options, "system_net_in_errors.csv");
        })
        .push(function () {
            return g.addChart(options, "system_net_out_bytes.csv");
        })
        .push(function () {
            return g.addChart(options, "system_net_out_dropped.csv");
        })
        .push(function () {
            return g.addChart(options, "system_net_out_errors.csv");
        })
        .push(function () {
            return g.addChart(options, "system_loadavg.csv");
        });
     });
     
     
}(window, document,  rJS));