library(eurostat)
library(rworldmap)
library(rworldxtra)

# Load and explore the Eurostat unemployment rate data.
data = data.frame(get_eurostat('tgs00010'), stringsAsFactors=F)
# Select the most recent data for both men and women.
data = data[data$time == '2017-01-01' & data$sex == 'T',]
dim(data)
head(data)
summary(data$values)

# Load the map data, transform the projection and select the NUTS2 regions.
mapData = get_eurostat_geospatial(resolution=20)
mapData = spTransform(mapData, CRS('+proj=wintri'))
mapData = mapData[mapData$STAT_LEVL_ == 2,]

# Map the unemployment rate values to a color gradient.
mapCol = colorRampPalette(c('#e4eddb', '#1a3c40'))(30)
valueCol = vector()
naCol = '#fffffe'
for (i in 1:nrow(mapData)) {
	nutsID = as.character(mapData$NUTS_ID[i])
	# Check if the region (NUTS) ID is used in the unemployment data. If it is, we can
	# map it to a color. If it isn't we'll assign that region the "missing value" color.
	if (nutsID %in% data$geo) {
		value = data[data$geo == nutsID,]$values
		if (!is.na(value)) {
			valueIndex = floor(value)
			valueCol[i] = mapCol[valueIndex]
		} else {
			valueCol[i] = naCol
		}
	} else {
		valueCol[i] = naCol
	}
}

# Draw the map.
png('unemployment.png', width=10, height=10, units='in', res=500)
par(oma=c(0,0,0,0), mar=c(0,0,0,0))
plot(mapData, col=valueCol, border=NA, bg='#fffffe', xlim=c(-1800000, 3900000), ylim=c(4500000, 7000000))
worldMap = getMap(resolution='high')
worldMap = spTransform(worldMap, CRS('+proj=wintri'))
plot(worldMap, add=T, border='#2c2c2c', lwd=0.25)
# Add a legend to the plot. The x and y values are the result of (a lot of) trial and
# error.
rect(-550000, 3050000, 2750000, 3700000, col='#fffffe', border='#2c2c2c', lwd=0.25)
for (i in 1:length(mapCol)) {
	rect(-500000 + i*100000, 3300000, -500000 + (i+1)*100000, 3400000, col=mapCol[i], border=NA)
}
text(-400000, 3550000, 'Unemployment rate', adj=c(0, 0.5), col='#2c2c2c', cex=1.2)
text(-400000, 3200000, '0%', adj=c(0.5,0.5))
text(600000, 3200000, '10%', adj=c(0.5,0.5))
text(1600000, 3200000, '20%', adj=c(0.5,0.5))
text(2600000, 3200000, '30%', adj=c(0.5,0.5))
dev.off()
