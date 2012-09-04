/*
 * RenderJs tests
 */
counter = 0;

function cleanUp () {
  /*
   * Clean up namespace between tests
   */
  // re-init GadgetIndex
  $.each(RenderJs.GadgetIndex.getGadgetList(), function () {
    RenderJs.GadgetIndex.unregisterGadget(this);
  });
}

function setupRenderJSTest(){
  /*
  * Main RenderJS test entry point
  */
  module("Cache");
  test('Cache', function () {
    cache_id = 'my_test';
    data = {'gg':1};
    RenderJs.Cache.set(cache_id, data);
    deepEqual(data, RenderJs.Cache.get(cache_id));
  });

  module("GadgetIndex");
  test('GadgetIndex', function () {
    cleanUp();
    $("#qunit-fixture").append('<div data-gadget="" id="new">X</div>');
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

  module("addGadget");
  test('addGadget', function () {
    cleanUp();
    RenderJs.addGadget("qunit-fixture", "loading/test-gadget.html", "", "");
    equal($("#qunit-fixture").children(".gadget").length, 1);
    equal(RenderJs.GadgetIndex.getGadgetList().length, 1);
   });

  module("GadgetInitialization");
  test('GadgetInitialization', function () {
    cleanUp();
    $("#qunit-fixture").append('<div data-gadget="" id="new-init" data-gadget-property="{&quot;name&quot;: &quot;Ivan&quot;, &quot;age&quot;: 33}">X</div>');
    RenderJs.bootstrap($("#qunit-fixture"));
    RenderJs.GadgetIndex.getRootGadget().getDom().one("ready", function (){
      RenderJs.update($("#qunit-fixture"));
    });

    // test that gadget get a proper initialization from data-gadget-property
    equal('Ivan', RenderJs.GadgetIndex.getGadgetById("new-init").name);
    equal(33, RenderJs.GadgetIndex.getGadgetById("new-init").age);
  });

  module("InteractionGadget");
  test('InteractionGadget', function () {
    cleanUp();
    RenderJs.addGadget("qunit-fixture", "interactions/index.html", "", "");
    stop();
    
    // we need to wait for all gadgets loading ...
    window.setTimeout(function () {
      RenderJs.InteractionGadget.bind($("#main-interactor"));
      start();
      equal(0, counter);
      // A.inc will call B.inc, both will increase counter by 1
      RenderJs.GadgetIndex.getGadgetById("A").inc();
      equal(2, counter);
      // fire pure HTML event on A and test it calls respective B method
      $('#A').trigger('htmlEvent1');
      equal(3, counter); 
    }, 500);
   });
};

