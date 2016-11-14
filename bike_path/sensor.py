import requests
import json

meta = "http://plenar.io/v1/api/sensor-networks/"
meta2 = "http://plenar.io/v1/api/sensor-networks/plenario_development/"
meta3 = "http://plenar.io/v1/api/sensor-networks/plenario_development/nodes/node_dev_1"
meta4 = "http://plenar.io/v1/api/sensor-networks/plenario_development/nodes/"
# meta3 = "http://plenar.io/v1/api/sensor-networks/plenario_development/sensors/tmp112"

google = "https://maps.googleapis.com/maps/api/directions/json?origin=41.881832,-87.623177&destination=41.891832,-87.65177&mode=bicycling&key=AIzaSyBkfF_5sItn0U4xoqFM4CSWezZwaHUJBa0 "

r = requests.get(google)
json_out = r.text
output = json.loads(json_out)
print(output)

# for i in output['routes']:
#     print(i)
