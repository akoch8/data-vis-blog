###
### Cobblestones in Brussels
###
### Inspired by the many beautiful prints of city road networks, I wanted to make
### one for Brussels myself. By chance, I found a dataset of all the cobblestone
### streets in Brussels, which I thought would spice up the map a little bit. And
### besides Brussels = Belgium = cycling = cobblestones!
###
### Alexander Koch
### 2020
###

library('osmdata')
library('tidyverse')
library('sf')
library('geojsonio')
library('rgdal')

# Delimit the area we're going to plot. The idea is to have the Brussels "pentagon"
# (the city center surrounded by the small ring road) roughly in the center of the
# poster.
boundingBox = matrix(c(4.3, 4.4, 50.8, 50.9), nrow=2, ncol=2, byrow=TRUE)
colnames(boundingBox) = c('min', 'max')
rownames(boundingBox) = c('x', 'y')

# Get a map with all the roads in Brussels from OpenStreetMap using an Overpass
# query.
streets = opq(boundingBox) %>%
		  add_osm_feature('highway') %>%
		  osmdata_sf()
allStreetsGeom = streets$osm_lines$geometry

# Load the cobblestone dataset. I downloaded these data from the Brussels Open Data
# Store: http://opendatastore.brussels/dataset/paved-roads
cobbles = geojson_read('cobblestonesBrussels.json', what='sp')

# Combine the OSM road map (sf object) with the cobblestone data (geojson sp object).
# There is probably an easier or more straight forward way to do this, but I could not
# figure it out. So instead, I'm basically looping through the geometries (i.e. roads)
# and drawing them using their coordinates and the base plot function.
pdf('cobblestones_brussels.pdf', width=11.69, height=16.53)
par(bg=NA, mar=c(2, 2, 2, 2))
plot(0, 0, type='n', xlim=boundingBox['x',], ylim=boundingBox['y',], xlab='', ylab='', bty='n', xaxt='n', yaxt='n')
for (i in 1:length(allStreetsGeom)) {
	lines(st_coordinates(allStreetsGeom[i]), lwd=0.5, col='#abacb0')
}
for (i in 1:length(cobbles)) {
	cblCoor = cobbles@polygons[[i]]@Polygons[[1]]@coords %>%
			  data.frame()
	colnames(cblCoor) = c('lon', 'lat')
	coordinates(cblCoor) = c('lon', 'lat')
	
	# A short interlude on coordinate systems
	# ---
	# When I first drew the cobblestone streets on top of the OSM road map, they did not
	# line up correctly, which is how I learned about coordinate systems. Apparently, OSM
	# uses the EPSG:4326 coordinate system (European Petroleum Survey Group), which is
	# easy enough to find online. Figuring out the coordinate system used for the
	# cobblestone streets was unfortunately not straightforward. A relatively frustrating
	# online search lead me to https://epsg.io/transform, an online coordinate system
	# transformation tool. The next step was basically manually trying out different
	# systems to see which one lined up with the OSM coordinates after being converted to
	# EPSG:4326. Luckily, I found out at some point that there are country-specific
	# coordinate systems, so I tried searching for Belgian coordinate systems first and
	# that ended up saving me a lot of time.
	proj4string(cblCoor) = CRS('+init=epsg:31370')
	cblCoorNew = spTransform(cblCoor, CRS('+init=epsg:4326'))
	lines(cblCoorNew@coords, lwd=1, col='#393e46')
}
dev.off()
