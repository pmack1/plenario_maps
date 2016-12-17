
var mapboxAccessToken = 'pk.eyJ1IjoicG1hY2siLCJhIjoiY2l0cTJkN3N3MDA4ZTJvbnhoeG12MDM5ZyJ9.ISJHx3VHMvhQade2UQAIZg';
var map = L.map('map').setView([41.8781, -87.6298], 14);
// default radius is 500 meters
var userRadius = 500;


L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + mapboxAccessToken, {
    id: 'mapbox.light',
}).addTo(map);

function formatDate(date)
{
  return date.getUTCFullYear().toString() + "-" + date.getUTCMonth().toString() + "-" + date.getUTCDate().toString() + "T" + date.getUTCHours().toString() + ":" + date.getUTCMinutes().toString();
};

function makeMarker(node)
{
  var marker = L.marker([node.coordinates[1], node.coordinates[0]]).addTo(map);
  marker.bindPopup('<b>' + node.name + '</b>' ).openPopup();
};

function addToTable(node_name, property_name, reading)
{
  // add to table test

  var table = document.getElementById("results")
  var NewRow = document.createElement("tr")
  var NewCol1 = document.createElement("td")
  var NewCol2 = document.createElement("td")
  var NewCol3 = document.createElement("td")
  var Text1 = document.createTextNode(node_name)
  var Text2 = document.createTextNode(property_name)
  var Text3 = document.createTextNode(reading)

  table.appendChild(NewRow);
  NewRow.appendChild(NewCol1);
  NewRow.appendChild(NewCol2);
  NewRow.appendChild(NewCol3);
  NewCol1.appendChild(Text1);
  NewCol2.appendChild(Text2);
  NewCol3.appendChild(Text3);
};



// load node information from plenario
var nodes = new Array();
$.ajax({
  type: 'GET',
  url: "http://plenar.io/v1/api/sensor-networks/plenario_development/nodes/",
  async: false,
  dataType: 'json',
  success: function (data) {
    var json_data = data.data;
    for (var i = 0; i < json_data.length; i++) {
    var node = json_data[i];
    var each = {name:node.properties.id, coordinates:node.geometry.coordinates, sensors:node.properties.sensors};
    nodes.push(each);
}
  }
});

for (var i = 0; i <nodes.length; i++){
  node = nodes[i];
  for (var j = 0; j < node.sensors.length; j++){
    sensor_string = node.sensors[j].toString()
    if (!(i == 1 & j==1)) {

    url_string = "http://plenar.io/v1/api/sensor-networks/plenario_development/sensors/" + sensor_string
    $.ajax({
      type: 'GET',
      url: url_string,
      async: false,
      dataType: 'json',
      success: function (data) {
        var response = data.data;
        for (k = 0; k < response.length; k++){
          sensor = response[k];
          featureProperties = sensor.properties;
          nodes[i].featureProperties = featureProperties;
        };
      }
    });
  };

  };

};



//add nodes as markers to map. Flip coordinates for leaflet marker object
for (var i = 0; i < nodes.length; i++) {
var node = nodes[i];
// var marker = L.marker([node.coordinates[1], node.coordinates[0]]).addTo(map);
// marker.bindPopup('<b>' + node.name + '</b>' ).openPopup();
makeMarker(node);

};


// Create slider to allow users to dynamically adjust buffer of node
$( function() {
  $( "#slider" ).slider({
    orientation: "vertical",
    range: "min",
    min: 100,
    max: 1000,
    value: 500,
    slide: function( event, ui ) {
      $( "#amount" ).val( ui.value );
      userRadius = Number($( "#amount" ).val());
    }
  });
  $( "#amount" ).val( $( "#slider" ).slider( "value" ) );
} );


// add draw interface for route
var drawnItems = new L.LayerGroup();
L.drawLocal.draw.toolbar.buttons.polyline = 'Draw your route!';

     map.addLayer(drawnItems);
     var drawControl = new L.Control.Draw({
         position: 'topright',
         draw: {
          circle: false,
          rectangle: false,
          marker: false,
          polygon: false,
          polyline: {
           shapeOptions: {
            color: 'steelblue'
           },
          },
         },
     });
     map.addControl(drawControl);

    var route_geojson;
    map.on("draw:created", function (e) {
      if (drawnItems.getLayers().length > 0){
        drawnItems.clearLayers();

        };

      var type = e.layerType,
         route = e.layer;

      drawnItems.addLayer(route);
      route_geojson = route.toGeoJSON();
      $('#calculate').removeAttr("disabled");
      $('#deleteRoute').removeAttr("disabled");
});

document.getElementById("deleteRoute").onclick = function () {
  drawnItems.clearLayers();
  $('#calculate').attr("disabled","disabled");
  $('#deleteRoute').attr("disabled","disabled");
 };

 document.getElementById("calculate").onclick = function () {
    var results = document.getElementById("results");
    results.innerHTML = '';



   var small_polygon_route = turf.buffer(route_geojson, 0.001, 'kilometers');
   for (var i = 0; i < nodes.length; i++) {
     var node = nodes[i];
     var coordinates = node.coordinates;
     var node_center = {
       "type": "Feature",
       "properties": {
         "marker-color": "#0f0"
       },
       "geometry": {
         "type": "Point",
         "coordinates": coordinates
       }
     };

     var steps = 10;
     var units = 'meters';

     var node_circle = turf.circle(node_center, userRadius, steps, units);


     var intersection = turf.intersect(small_polygon_route, node_circle);
     if (intersection == null){
      //  console.log(node.name)
      //  console.log("no intersect")
       node.intersects = false;
     }
     else{
      //  console.log(node.name)
      //  console.log("intersection")
       node.intersects = true;
     }


  };

  var end = new Date()
  // take date as of 10 minutes ago for start date query
  var diff = -10;
  var start = new Date(end.getTime() + diff*60000);

  var start_string = formatDate(start);
  var end_string = formatDate(end);
  var intersect_count = 0;
  for (var i = 0; i < nodes.length; i++) {
    var node = nodes[i]
    if (node.intersects == true){
      intersect_count++;

    var node_name_string = nodes[i].name.toString()
    for (var j = 0; j < nodes[i].featureProperties.length; j++){
      var featureProperties_string = nodes[i].featureProperties[j].toString()
      var feature_string = featureProperties_string.split(".")[0];
      var property_string = featureProperties_string.split(".")[1];
      var request_url =  "http://plenar.io/v1/api/sensor-networks/plenario_development/query?feature=" + feature_string + "&nodes=" + node_name_string + "&limit=3&start_datetime=" + start_string + "&end_datetime=" + end_string;

      $.ajax({
        type: 'GET',
        url: request_url,
        async: false,
        dataType: 'json',
        success: function (data) {
          var response = data.data;
          var i = response.length - 1
          var last = response[i]
          var reading = last['results'][property_string]
          console.log(node_name_string)
          console.log(property_string)
          console.log(reading)
          addToTable(node_name_string, property_string, reading);

        }
      });
    };
  };

  };
  if (intersect_count == 0){
    alert("Your Route did not come within the distance threshold of any nodes. Try increasing the distance threshold or entering a new route.")
  }

};
