
var mapboxAccessToken = 'pk.eyJ1IjoicG1hY2siLCJhIjoiY2l0cTJkN3N3MDA4ZTJvbnhoeG12MDM5ZyJ9.ISJHx3VHMvhQade2UQAIZg';
var map = L.map('map').setView([41.8781, -87.6298], 14);
// default radius is 500 meters
var userRadius = 500;

// iniitialze user features and update if checkbox status changes
var userFeatures = ['temperature', 'carbon', 'nitrogen'];
$('input[type=checkbox]').change(
    function(){
      userFeatures = new Array();
      if($("#featureTemp").is(':checked')){
        userFeatures.push('temperature');
      }
      if($("#featureCarbon").is(':checked')){
        userFeatures.push('carbon');
      }
      if($("#featureNitrogen").is(':checked')){
        userFeatures.push('nitrogen');
      }
    });


// initialize time
var userTime;
 $(function () {
      var dateNow = new Date();
        $('#datetimepicker1').datetimepicker({
          defaultDate:dateNow
        }
        );
    });

$("#datetimepicker1").on("dp.change", function(e) {
  userTime = $("#datetimepicker1").find("input").val();
  userTime = new Date(userTime);

      });


L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + mapboxAccessToken, {
    id: 'mapbox.light',
}).addTo(map);


function formatDate(date)
{
  // format date into UTC format
  return date.toISOString().slice(0,-1);
};

function makeMarker(node)
{
  // add marker object to map
  var marker = L.marker([node.coordinates[1], node.coordinates[0]]).addTo(map);
  marker.bindPopup('<b>' + node.name + '</b>' ).openPopup();
};

function addToTable(node_name, property_name, reading)
{
  // append results to table element
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
function createNodes(){
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
};

// initialize nodes
createNodes();

//add nodes as markers to map. Flip coordinates for leaflet marker object
for (var i = 0; i < nodes.length; i++) {
var node = nodes[i];
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

      //enable calculate if there is a route drawn and features and time are selected
      $('#calculate').removeAttr("disabled");



      $('#deleteRoute').removeAttr("disabled");
});

document.getElementById("deleteRoute").onclick = function () {
  drawnItems.clearLayers();
  $('#calculate').attr("disabled","disabled");
  $('#deleteRoute').attr("disabled","disabled");
 };

 document.getElementById("calculate").onclick = function () {
   if (userFeatures.length == 0){
     alert("At Least One Feature Must Selected")
   }
   else{

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
       node.intersects = false;
     }
     else{
       node.intersects = true;
     }


  };

  var end = userTime;
  // take date as of 10 minutes ago for start date query
  var diff = -60;
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
      var request_url =  "http://plenar.io/v1/api/sensor-networks/plenario_development/query?feature=" + feature_string + "&nodes=" + node_name_string + "&limit=100&start_datetime=" + start_string + "&end_datetime=" + end_string;
      console.log(request_url);
      $.ajax({
        type: 'GET',
        url: request_url,
        async: false,
        dataType: 'json',
        success: function (data) {
          var response = data.data;
          var i = response.length - 1
          var last = response[i]
          // console.log(last)
          var reading = last['results'][property_string]
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

};
