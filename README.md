#  Using Plenario to Make Maps

This code was used to create a [blogpost tutorial](https://medium.com/plenario-dev/creating-maps-with-plenario-93de7155dd05#.7szjimrz8) on plenario API's. 

## Potholes Filled Year to Date in Chicago
This map uses the Plenario API as the primary data source and supplements this information with data from the Census API

Pothole Data was pulled as of 10/07/2016 to reflect Potholes filled since the beginning of the year. Population Data is from the 2010 Census.

The Javascript library Leaflet is used to visualize the map. The map is based on a tutorial from [Leaflet](http://leafletjs.com/examples/choropleth/)

Colors for the map were selected with the help of [Color Brewer](http://colorbrewer2.org/#type=sequential&scheme=Blues&n=6)

## Using the Plenario API

Several features of Plenario were used to create this map.

The [Plenario Spatial Aggregation API](http://docs.plenar.io/#get-v1-api-shapes-lt-polygon_dataset_name-gt-lt-point_dataset_name-gt) was used to get the total number of 311 requests for potholes by zip code.

The [Time Filtering API](http://docs.plenar.io/#time-filtering) was used to filter all requests to be within the date range of the start of the current year to the present date

The [Attribute Filtering API](http://docs.plenar.io/#attribute-filtering) was used to filter for only potholes requests that had been completed.

