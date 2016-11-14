import requests
import json

def get_direction(origin, destination, mode):
    google = "https://maps.googleapis.com/maps/api/directions/json?origin=" + origin + "&destination=" + destination + "&mode=" + mode + "&key=AIzaSyBkfF_5sItn0U4xoqFM4CSWezZwaHUJBa0 "
    r = requests.get(google)
    json_out = r.text
    output = json.loads(json_out)
    for r in output['routes']:
        print(r)

get_direction("41.881832,-87.623177", "41.891832,-87.65177", "bicycling")
