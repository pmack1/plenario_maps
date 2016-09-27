import requests
import json
trees  = "http://plenar.io/v1/api/grid/?obs_date__ge=2014-01-01&obs_date__le=2014-12-31&dataset_name=311_service_requests_tree_trims"



r = requests.get(trees)
json_out = r.text
print(r.text)
with open('mygeojson', 'w') as f:
    f.write(r.text)
f.close()
# def web_call(url, xml):
#   r = requests.get(url)
#   rtext = r.text
#   web_reponse = bs4.BeautifulSoup(rtext,"xml")
#   return web_reponse
