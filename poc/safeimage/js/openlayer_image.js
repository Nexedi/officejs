var zoomify_width = 29566;
var zoomify_height = 14321;
var zoomify_url = "image/hs-2007-16-a-full_jpg/";

var map, zoomify;

function loadOpenLayerZoomedImage(){
  console.log('iniside init of custom', zoomify_url)
  /* First we initialize the zoomify pyramid (to get number of tiers) */
  var zoomify = new OpenLayers.Layer.Zoomify( "Zoomify", zoomify_url, 
  new OpenLayers.Size( zoomify_width, zoomify_height ) );

  /* Map with raster coordinates (pixels) from Zoomify image */
  var options = {
      maxExtent: new OpenLayers.Bounds(0, 0, zoomify_width, zoomify_height),
      maxResolution: Math.pow(2, zoomify.numberOfTiers-1 ),
      numZoomLevels: zoomify.numberOfTiers,
      units: 'pixels'
  };

  map = new OpenLayers.Map("map", options);
  map.addLayer(zoomify);

    map.setBaseLayer(zoomify);
  map.zoomToMaxExtent();
};

console.log('foo');