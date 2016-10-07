#download the 311 requests for potholes from the beginning of the year until the present day and save it as a geojson file. Filter so only completed potholes are counted
import requests
import json
import datetime
import ast

year_begin = str(datetime.datetime.now().year) + "-01-01"
current_date = str(datetime.datetime.now().year) + "-" + str(datetime.datetime.now().month) + "-" + str(datetime.datetime.now().day)

# call census api to get population data for every zip in illinois. List of lists with elements: population, state, zip
census = "http://api.census.gov/data/2010/sf1?get=P0010001&for=zip+code+tabulation+area:*&in=state:17"
r = requests.get(census)
population = r.text
population = ast.literal_eval(population)

# call the plenario api to get the relevant data per neighborhood
potholes  = "http://plenar.io/v1/api/shapes/boundaries_zip_codes/311_service_requests_pot_holes_reported?obs_date__ge=" + year_begin + "&obs_date__le=" + current_date + '&311_service_requests_pot_holes_reported__filter={"op":"eq", "col":"status", "val":"Completed"}'
r = requests.get(potholes)
json_out = r.text
output = json.loads(json_out)

# merge on matching zips
for z1 in output['features']:
	for z2 in population:
		if z1['properties']['zip'] == z2[2]:
			z1['properties']['population'] = int(z2[0])
			z1['properties']['pothole_per_1000_ppl'] = round(z1['properties']['count'] / (int(z2[0]) / 1000.0), 2) 



# save merged datasets to an output geojson file
json_string = json.dumps(output)
with open('potholes.json', 'w') as f:
	f.write(json_string)
f.close()


# find the range of the counts and determine appropriate quartiles
json = json.loads(json_string)
ouput_range = set([])
for i in json['features']:
	ouput_range.add(i['properties']['pothole_per_1000_ppl'])
top = max(ouput_range)
bottom = min(ouput_range)
q1 = (top - bottom) * (1/7)
q2 = (top - bottom) * (2/7)
q3 = (top - bottom) * (3/7)
q4 = (top - bottom) * (4/7)
q5 = (top - bottom) * (5/7)
q6 = (top - bottom) * (6/7)


with open('pothole_quantiles.txt', 'w') as f:
	f.write('q1:' + str(min(ouput_range))  + ' - ' + str(q1) + '\n')
	f.write('q2:' + str(q1) + '- ' + str(q2) +  '\n')
	f.write('q3:' + str(q2) + '- ' + str(q3) + '\n')
	f.write('q4:' + str(q3) + '- ' + str(q4) + '\n')
	f.write('q5:' + str(q4) + '- ' + str(q5) + '\n')
	f.write('q6:' + str(q5) + '- ' + str(q6) + '\n')
	f.write('q7:' + str(q6) + '- ' + str(max(ouput_range)) + '\n')
f.close()
