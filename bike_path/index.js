

var mapboxAccessToken = 'pk.eyJ1IjoicG1hY2siLCJhIjoiY2l0cTJkN3N3MDA4ZTJvbnhoeG12MDM5ZyJ9.ISJHx3VHMvhQade2UQAIZg';
var map = L.map('map').setView([41.8781, -87.6298], 14);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + mapboxAccessToken, {
    id: 'mapbox.light',
}).addTo(map);

// load node information from plenario
var nodes = new Array();

function node(name,coordinates,sensors)
{
   this.name=name;
   this.coordinates=coordinates;
   this.sensors=sensors;
};

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







// var node_query = $.get("http://plenar.io/v1/api/sensor-networks/plenario_development/nodes/", function(data, status) {
//   return data;
//         });
//











var marker = L.marker([41.881832, -87.623177]).addTo(map);

var center1 = {
  "type": "Feature",
  "properties": {
    "marker-color": "#0f0"
  },
  "geometry": {
    "type": "Point",
    "coordinates": [-87.623177, 41.881832]
  }
};

var steps = 10;
var units = 'meters';


var userRadius = 500;
var sensor1 = turf.circle(center1, userRadius, steps, units);

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
      sensor1 = turf.circle(center1, userRadius, steps, units);
    }
  });

  $( "#amount" ).val( $( "#slider" ).slider( "value" ) );
} );




marker.bindPopup("<b>Sensor 1!</b><br> Place Holder for Sensor Data.")

var drawnItems = new L.FeatureGroup();
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
         edit: {
             featureGroup: drawnItems
         }
     });
     map.addControl(drawControl);

     var route = map.on('draw:created', function (e) {
         var type = e.layerType,
             route = e.layer;
         var route_geojson = route.toGeoJSON()
         var small_polygon_route = turf.buffer(route_geojson, 0.001, 'kilometers')
         var leaflet_route = L.geoJson(small_polygon_route)
         drawnItems.addLayer(leaflet_route)
         var intersection = turf.intersect(small_polygon_route, sensor1);
         return(intersection);
     });
