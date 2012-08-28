

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

  module("GadgetIndex");
  test('GadgetIndex', function(){
               // re-init GadgetIndex
              $.each(RenderJs.GadgetIndex.getGadgetList(), function () {
                RenderJs.GadgetIndex.unregisterGadget(this);
              });
              
              $("#qunit-fixture").append('<div data-gadget="" id="new">XXXXXXXXXXXX</div>');
              RenderJs.bootstrap($("#qunit-fixture"));
              RenderJs.GadgetIndex.getRootGadget().getDom().one("ready", function (){
                RenderJs.update($("#qunit-fixture"));
              });
              equal(RenderJs.GadgetIndex.getGadgetList().length, 2);
              equal(true, RenderJs.GadgetIndex.isGadgetListLoaded());
              equal($("#qunit-fixture").attr("id"), RenderJs.GadgetIndex.getRootGadget().getDom().attr("id"));
              equal(RenderJs.GadgetIndex.getGadgetById("qunit-fixture"), RenderJs.GadgetIndex.getRootGadget());

              // unregister gadget all gadgets from this test not to mess with rest of tests
              RenderJs.GadgetIndex.unregisterGadget(RenderJs.GadgetIndex.getGadgetById("qunit-fixture"));
              equal(RenderJs.GadgetIndex.getGadgetList().length, 1);
              equal(RenderJs.GadgetIndex.getGadgetById("new"), RenderJs.GadgetIndex.getRootGadget());
              RenderJs.GadgetIndex.unregisterGadget(RenderJs.GadgetIndex.getGadgetById("new"));
              equal(RenderJs.GadgetIndex.getGadgetList().length, 0);
   });

   module("TabularGadget");
   test('addNewTabGadget', function(){
               RenderJs.TabbularGadget.addNewTabGadget("qunit-fixture", "test-gadget.html", "", "");
               equal($("#qunit-fixture").children(".gadget").length, 1);
               equal(RenderJs.GadgetIndex.getGadgetList().length, 1);
   });

};

