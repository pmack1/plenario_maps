

var mapboxAccessToken = 'pk.eyJ1IjoicG1hY2siLCJhIjoiY2l0cTJkN3N3MDA4ZTJvbnhoeG12MDM5ZyJ9.ISJHx3VHMvhQade2UQAIZg';
var map = L.map('map').setView([41.8781, -87.6298], 14);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + mapboxAccessToken, {
    id: 'mapbox.light',
}).addTo(map);



var marker = L.marker([41.881832, -87.623177]).addTo(map);
var marker2 = L.marker([41.891832, -87.65177]).addTo(map);

var circle = L.circle([41.881832, -87.623177], {
  color: 'green',
  fillColor: '#7fcdbb',
  fillOpacity: 0.5,
  radius: 500
}).addTo(map);

 var circle2 = L.circle([41.891832, -87.65177], {
  color: 'green',
  fillColor: '#7fcdbb',
  fillOpacity: 0.5,
  radius: 500
}).addTo(map);

var circle_geojson = circle.toGeoJSON()

marker.bindPopup("<b>Sensor 1!</b><br> Place Holder for Sensor Data.")
marker2.bindPopup("<b>Sensor 2!</b><br> Place Holder for Sensor Data.")


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
         drawnItems.addLayer(route);
         console.log(route);
         var intersection = turf.intersect(route.toGeoJSON(), circle_geojson);
         return(intersection);
     });



// ded = "igu~Frr{uO\\n@`@x@JTDLBJBLBLBJ@L@L@P?RFjEB`E@dA?D@l@AR?hC@hDDrG?B@nA@z@?@?FDpG?hD@jA?JIf@Aj@KtCW~EEz@?BABGbAGx@MnAG^ETEXId@Mr@e@fCKn@Il@SfAG`@I\\Gj@A\\?d@@^D^FZJ\\N\\JTNTTTRJVJXHRBR?RCPCLETKRMPONSNYL]Ja@Fa@B]@[Ce@Ae@Ao@Ac@A_@Aa@?[@[D_@D_@D[HYHWJU";
// var encoded = "u`s~Fz|xuOPDe@NS?@z@?xAY?aC@sAD{A@aCTO@I@Ab@@rA?hA?|@?dDBzZ?zGeC@}EBqBDW@@~DAlF@fCBXEBKF{CxCoBfB_@TYLYDe@Da@AU?qCC{HJeDF}C?\\n@l@nAHXLt@J~FDlG@tJNhZ@vAIf@Aj@KtCW~EE~@IfAUhC]tBiAxGm@rDAbAF~@Rx@Zr@d@j@j@Vl@Lf@C^Ih@Y`@c@\\w@RcADy@I_DCaA@w@J_ANu@Tm@"

// var polyline = L.Polyline.fromEncoded(encoded).addTo(map);