#download the 311 requests for tree trims from the beginning of the year until the present day and save it as a geojson file
import requests
import json
import datetime

year_begin = str(datetime.datetime.now().year) + "-01-01"
current_date = str(datetime.datetime.now().year) + "-" + str(datetime.datetime.now().month) + "-" + str(datetime.datetime.now().day)

# request is a call to the plenario api to retrieve
trees  = "http://plenar.io/v1/api/grid/?obs_date__ge=" + year_begin + "&obs_date__le=" + current_date + "&dataset_name=311_service_requests_tree_trims"

r = requests.get(trees)
json_out = r.text
print(r.text)
with open('mygeojson.json', 'w') as f:
    f.write(r.text)
f.close()
