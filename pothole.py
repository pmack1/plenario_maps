#download the 311 requests for potholes from the beginning of the year until the present day and save it as a geojson file. Filter so only completed potholes are counted
import requests
import json
import datetime

year_begin = str(datetime.datetime.now().year) + "-01-01"
current_date = str(datetime.datetime.now().year) + "-" + str(datetime.datetime.now().month) + "-" + str(datetime.datetime.now().day)

# call the plenario api to get the relevant data per neighborhood
potholes  = "http://plenar.io/v1/api/shapes/boundaries_neighborhoods/311_service_requests_pot_holes_reported?obs_date__ge=" + year_begin + "&obs_date__le=" + current_date + '&311_service_requests_pot_holes_reported__filter={"op":"eq", "col":"status", "val":"Completed"}'
r = requests.get(potholes)
json_out = r.text

#save response to an output json file
with open('pothole.json', 'w') as f:
    f.write(json_out)
f.close()

# find the range of the counts and determine appropriate quartiles
json = json.loads(json_out)
ouput_range = set([])
for i in json['features']:
	ouput_range.add(i['properties']['count'])
top = max(ouput_range)
bottom = min(ouput_range)
q1 = round((top - bottom) * (1/7),0)
q2 = round((top - bottom) * (2/7),0)
q3 = round((top - bottom) * (3/7),0)
q4 = round((top - bottom) * (4/7),0)
q5 = round((top - bottom) * (5/7),0)
q6 = round((top - bottom) * (6/7),0)


with open('pothole_quantiles.txt', 'w') as f:
	f.write('q1:' + '1 - ' + str(q1) + '\n')
	f.write('q2:' + str(q1) + '- ' + str(q2) +  '\n')
	f.write('q3:' + str(q2) + '- ' + str(q3) + '\n')
	f.write('q4:' + str(q3) + '- ' + str(q4) + '\n')
	f.write('q5:' + str(q4) + '- ' + str(q5) + '\n')
	f.write('q6:' + str(q5) + '- ' + str(q6) + '\n')
	f.write('q7:' + str(q6) + '- ' + str(max(ouput_range)) + '\n')








f.close()
