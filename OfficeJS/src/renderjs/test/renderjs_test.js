function setupRenderJSTest(){
  /*
  * Main RenderJS test entry point
  */
  module("Cache");
  test('Cache', function(){
                cache_id = 'my_test';
                data = {'gg':1};
                RenderJs.Cache.set(cache_id, data);
                deepEqual(data, RenderJs.Cache.get(cache_id));
  });

 
//   module("TabularGadget");
//   test('addNewTabGadget', function(){
//               RenderJs.TabbularGadget.addNewTabGadget("qunit-fixture", "Person_view/Form_asRenderJSGadget", "ERP5Form.update", "Form_asJSON?form_id=Person_view");
//               equal($("#qunit-fixture").children(".gadget").length, 1);
//               equal(RenderJs.GadgetIndex.getGadgetList().length, 1);
// 
//   });

  module("GadgetIndex");
  test('GadgetIndex', function(){
               // re-init GadgetIndex
              $.each(RenderJs.GadgetIndex.getGadgetList(), function () {
                RenderJs.GadgetIndex.unregisterGadget(this);
              });
              
              $("#qunit-fixture").append('<div gadget="" id="new">XXXXXXXXXXXX</div>');
              RenderJs.bootstrap($("#qunit-fixture"));
              RenderJs.GadgetIndex.getRootGadget().getDom().one("ready", function (){
                RenderJs.update($("#qunit-fixture"));
              });
              equal(RenderJs.GadgetIndex.getGadgetList().length, 2);
              equal(true, RenderJs.GadgetIndex.isGadgetListLoaded());
              equal($("#qunit-fixture").attr("id"), RenderJs.GadgetIndex.getRootGadget().getDom().attr("id"));
              equal(RenderJs.GadgetIndex.getGadgetById("qunit-fixture"), RenderJs.GadgetIndex.getRootGadget());

              // unregister gadget
              RenderJs.GadgetIndex.unregisterGadget(RenderJs.GadgetIndex.getGadgetById("qunit-fixture"));
              equal(RenderJs.GadgetIndex.getGadgetList().length, 1);
              equal(RenderJs.GadgetIndex.getGadgetById("new"), RenderJs.GadgetIndex.getRootGadget());
              

   });

};

