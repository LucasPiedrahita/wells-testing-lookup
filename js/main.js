let view;
require([
  "esri/WebMap",
  "esri/views/MapView",
  "esri/widgets/Search",
  "esri/tasks/Locator",
  "esri/widgets/Home",
  "esri/widgets/Locate",
  "esri/geometry/Extent",
  "esri/widgets/ScaleBar",
  "esri/tasks/support/Query",
  "esri/layers/FeatureLayer",
  "esri/geometry/Point",
  "esri/geometry/SpatialReference",
  "dojo/domReady!"
], function(WebMap, MapView, Search, Locator, Home, Locate, Extent, ScaleBar, Query, FeatureLayer, Point, SpatialReference) {
  // ADD WebMap Reference //
  const map = new WebMap({
    portalItem: {
              id: "3bf32248a48447d88911e0732b101b47"
    }
  });

  // ADD WebMap View //
  const defaultExtent = new Extent({
    xmin: -8794761.045373779,
    ymin: 4232693.700054966,
    xmax: -8710833.18831677,
    ymax: 4311882.461358301,
    spatialReference: {
      wkid: 102100
    }
  });
  view = new MapView({
    container: "viewDiv",
    map: map,
    extent: defaultExtent,
  });

  // ADD Search Widget //
  const searchWidget = new Search({
    view: view,
    sources: [{
      locator: new Locator({
        url: "https://maps.wakegov.com/arcgis/rest/services/Geoprocessing/Composite_Address_Locator/GeocodeServer/"
      }),
      name: "Wake County Addresses",
      autoNavigate: true,
      singleLineFieldName: "SingleLine",
      maxSuggestions: 3,
      popupEnabled: false,
      minSuggestCharacters: 4,
      maxResults: 1,
      zoomScale: 3000,
      placeholder: "Search your address"
    }],
    includeDefaultSources: false, //don't include Esri World geocoding service
  });
  view.ui.add(searchWidget, {
    position: "top-left",
    index: 0
  });

  // ADD Default Extent Button //
  const homeWidget = new Home({
    view: view
  });
  view.ui.add(homeWidget, {
    position: "top-left",
    index: 2
  });

  // ADD My Location Button //
  const locateWidget = new Locate({
    view: view,
  });
  view.ui.add(locateWidget, {
    position: "top-left",
    index: 3
  });

  // ADD Scale Bar //
  const scaleBarWidget = new ScaleBar({
    view: view,
  });
  view.ui.add(scaleBarWidget, {
    position: "bottom-left",
    index: 0
  });

  // ADD popup functionality on search //
  const testingLayer = new FeatureLayer({
    url: "https://services1.arcgis.com/a7CWfuGP5ZnLYE7I/ArcGIS/rest/services/WellTestingArea_20190607/FeatureServer/0"
  });

  searchWidget.on('select-result', function(evt){
    const query = testingLayer.createQuery()
    query.geometry = evt.result.feature.geometry;
    query.distance = 1;
    query.unit = "feet";
    query.spatialRelationship = "intersects";

    testingLayer.queryFeatures(query).then(function(results){
      const popupText = "<p style='font-size:18px; line-height:24px;'>" + results.features[0].attributes.TEXT + "</p>";
      view.popup.open({
        content: "" + popupText,
        location: evt.result.feature.geometry,
        actions: null
      });
    });
  });

  searchWidget.on('search-clear', (e) => {
    // close popups, remove address graphic, and go to default extent
    view.popup.close();
    view.graphics.removeAll();
    view.goTo(defaultExtent);
  });

});
