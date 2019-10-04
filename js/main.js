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
], function(WebMap, MapView, Search, Locator, Home, Locate,
  Extent, ScaleBar, Query, FeatureLayer, Point, SpatialReference) {

  // ADD WebMap Reference //
  const map = new WebMap({
    portalItem: {
              id: "3bf32248a48447d88911e0732b101b47"
    }
  });

  const defaultExtent = new Extent({
    xmin: -8794761.045373779,
    ymin: 4232693.700054966,
    xmax: -8710833.18831677,
    ymax: 4311882.461358301,
    spatialReference: {
      wkid: 102100
    }
  });

  // ADD WebMap View //
  const view = new MapView({
    container: "viewDiv",
    map: map,
    extent: defaultExtent,
  });

  // ADD Default Extent Button //
  const homeWidget = new Home({
    view: view
  });
  view.ui.add(homeWidget, {
    position: "top-left",
    index: 1
  });
  homeWidget.on("go", homeWidgetClickEvent => {
    resetView();
  });

  // ADD Scale Bar //
  const scaleBarWidget = new ScaleBar({
    view: view,
  });
  view.ui.add(scaleBarWidget, {
    position: "bottom-left",
    index: 0
  });

  // ADD Search Widget and its popup functionality//
  const searchWidget = new Search({
    view: view,
    sources: [{
      locator: new Locator({
        url: "https://maps.wakegov.com/arcgis/rest/services/Geoprocessing/Composite_Address_Locator/GeocodeServer/"
      }),
      name: "Wake County Addresses",
      autoNavigate: true,
      singleLineFieldName: "SingleLine",
      minSuggestCharacters: 4,
      maxSuggestions: 3,
      maxResults: 1,
      popupEnabled: false,
      zoomScale: 3000,
      placeholder: "Search your address"
    }],
    includeDefaultSources: false, //don't include Esri World geocoding service
  });
  view.ui.add(searchWidget, {
    position: "top-left",
    index: 0
  });
  searchWidget.on("select-result", selectResultEvent => {
    openTestingLayerPopup(selectResultEvent.result.feature.geometry);
  });
  searchWidget.on("search-clear", (searchClearEvent) => {
    resetView();
  });

  // ADD My Location Button and its popup functionality//
  const locateWidget = new Locate({
    view: view,
  });
  view.ui.add(locateWidget, {
    position: "top-left",
    index: 3
  });
  locateWidget.on("locate", locateEvent => {
    const locateEventPoint = {
      type: "point",
      longitude: locateEvent.position.coords.longitude,
      latitude: locateEvent.position.coords.latitude
    };
    openTestingLayerPopup(locateEventPoint);
  });

  // function definitions //
  function openTestingLayerPopup(inputGeometry) {
    // Close existing popups, query wells testing feature layer,
    // and open resulting popup for a input point. Also add a watch
    // to the popup so that resetView() runs when the popup is closed
    view.popup.close();

    const testingLayer = new FeatureLayer({
      url: "https://services1.arcgis.com/a7CWfuGP5ZnLYE7I/ArcGIS/rest/services/WellTestingArea_20190607/FeatureServer/0"
    });
    const testingLayerQuery = testingLayer.createQuery()
    testingLayerQuery.geometry = inputGeometry;
    testingLayerQuery.distance = 1;
    testingLayerQuery.unit = "feet";
    testingLayerQuery.spatialRelationship = "intersects";

    testingLayer.queryFeatures(testingLayerQuery)
    .then(function(queryResults){
      const popupTextFromFeature = queryResults.features[0].attributes.TEXT;
      const popupText = "<p style='font-size:18px; line-height:24px;'>" + popupTextFromFeature + "</p>";
      view.popup.open({
        content: popupText,
        location: inputGeometry,
        actions: null
      });
    });
  };

  function resetView() {
    // close popups, remove graphics, and go to default extent
    view.popup.close();
    view.graphics.removeAll();
    view.goTo(defaultExtent);
  };
});
