import requests
import json
import datetime
import ast

# generate dynamic date times
year_begin = str(datetime.datetime.now().year) + "-01-01"
current_date = str(datetime.datetime.now().year) + "-" + str(datetime.datetime.now().month) + "-" + str(datetime.datetime.now().day)

# call census api to get population data for every zip in illinois. List of lists with elements: population, state, zip
census = "http://api.census.gov/data/2010/sf1?get=P0010001&for=tract:*&in=state:17"
r = requests.get(census)
census = r.text
census = ast.literal_eval(census)
fieldnames = census.pop(0)

# call the plenario api to get the relevant data per zipcode
potholes  = "http://plenar.io/v1/api/shapes/boundaries_census_tracts_2010/311_service_requests_pot_holes_reported?obs_date__ge=" + year_begin + "&obs_date__le=" + current_date + '&311_service_requests_pot_holes_reported__filter={"op":"eq", "col":"status", "val":"Completed"}'
r = requests.get(potholes)
json_out = r.text
output = json.loads(json_out)

# merge on matching zips
for z1 in output['features']:
    for z2 in census:
        population = int(z2[0])
        tract = z2[3]
        county = z2[2]
        #cook county code is 031
        if county == "031":
            if z1['properties']['tractce10'] == tract:
                z1['properties']['population'] = int(z2[0])
                if z1['properties']['population'] >  0:
                    z1['properties']['pothole_per_1000_ppl'] = round(z1['properties']['count'] / (population / 1000.0), 2)
                else:
                    #this will correspond to an undefined value in the map
                    z1['properties']['pothole_per_1000_ppl'] = 'undefined'

# save merged datasets to an output geojson file
json_string = json.dumps(output)
with open('potholes.json', 'w') as f:
    f.write(json_string)
f.close()
