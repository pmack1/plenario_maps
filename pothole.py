import requests
import json
import datetime
import ast

# generate dynamic date times
year_begin = str(datetime.datetime.now().year) + "-01-01"
current_date = str(datetime.datetime.now().year) + "-" + str(datetime.datetime.now().month) + "-" + str(datetime.datetime.now().day)

# call census api to get population data for every zip in illinois. List of lists with elements: population, state, zip
census = "http://api.census.gov/data/2010/sf1?get=P0010001&for=zip+code+tabulation+area:*&in=state:17"
r = requests.get(census)
population = r.text
population = ast.literal_eval(population)

# call the plenario api to get the relevant data per zipcode
potholes  = "http://plenar.io/v1/api/shapes/boundaries_zip_codes/311_service_requests_pot_holes_reported?obs_date__ge=" + year_begin + "&obs_date__le=" + current_date + '&311_service_requests_pot_holes_reported__filter={"op":"eq", "col":"status", "val":"Completed"}'
r = requests.get(potholes)
json_out = r.text
output = json.loads(json_out)

# # combine counts on mulitple entry zip codes. Note some zip codes are noncontigious and thus listed twice as separate polygons.
# Their counts should be combined:
total = {}
features = []
observations = []
zips = []
[features.append(f) for f in output['features']]
[observations.append(f['properties']) for f in features]
[zips.append(obs['zip']) for obs in observations]

multiple = set([z for z in zips if zips.count(z) > 1])

for z in multiple:
    total[z] = 0

for dup in multiple:
    for obs in observations:
        if obs['zip'] == dup:
            total[dup] += obs['count']

# merge on matching zips
for  obs in observations:
    for p in population:
        if obs['zip'] == p[2]:
            obs['population'] = int(p[0])

            #replace zips with multiple zip code entries to have count from the total dictionary constructed above
            if obs['zip'] in multiple:
                obs['count'] = total[obs['zip']]
            obs['pothole_per_1000_ppl'] = round(obs['count'] / (int(p[0]) / 1000.0), 2)


# save merged datasets to an output geojson file
json_string = json.dumps(output)
with open('potholes.json', 'w') as f:
	f.write(json_string)
f.close()
