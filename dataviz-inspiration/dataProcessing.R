###
### Data processing and exploration for the "data visualization inspiration" project.
###
### Alexander Koch
### 2019
###

library('data.table')
library('twitteR')
library('networkD3')

networkData = fread('dataVizInspiration.txt', data.table=FALSE, encoding='UTF-8')

# What is the gender distribution in the people and their inspirations?
personGender = unique(networkData[,c('person', 'person_gender')])
personGender = table(personGender$person_gender)
personGender = personGender / sum(personGender) * 100
inspGender = unique(networkData[,c('inspiration', 'inspiration_gender')])
inspGender = table(inspGender$inspiration_gender)
inspGender = inspGender / sum(inspGender) * 100
barplot(cbind(personGender, inspGender), col=c('#8624F5', '#1FC3AA'), border='#ffffff')

# What are people's affiliations?
table(unique(networkData[,c('person', 'person_type')])$person_type)
table(unique(networkData[,c('inspiration', 'inspiration_type')])$inspiration_type)

# One part of the online visualization will be a graph, depicting who was inspired by
# whom. Before we can convert the network data we have to JSON, they need to be stored
# in a nested list:
# network = list
# ---> nodes = list of all people
#   ---> node = list of id and group
# ---> links = list of all connection
#   ---> link = list of source and target
# First, get all the unique people so we know how long our nodes list needs
# to be.
uniquePersons = unique(c(networkData$person, networkData$inspiration))
uniquePersons = data.frame(cbind(1:length(uniquePersons), uniquePersons), stringsAsFactors=FALSE)
colnames(uniquePersons) = c('id', 'name')
uniquePersons$id = as.numeric(uniquePersons$id)

# Next, set up the nested list and then loop through the people and connections
# to fill it.
networkDataList = list(
	nodes=vector(mode='list', length=nrow(uniquePersons)),
	links=vector(mode='list', length=nrow(networkData))
)
for (i in 1:nrow(uniquePersons)) {
	name = uniquePersons$name[i]
	inspirationCount = nrow(networkData[which(networkData$inspiration == name),])
	if (name %in% networkData$person) {
		group = networkData[which(networkData$person == name),]$person_type[1]
		twitter = networkData[which(networkData$person == name),]$person_twitter[1]
	} else {
		group = networkData[which(networkData$inspiration == name),]$inspiration_type[1]
		twitter = networkData[which(networkData$inspiration == name),]$inspiration_twitter[1]
	}
	networkDataList$nodes[[i]] =  list(id=i, name=name, group=group, twitter=twitter, inspiration_count=inspirationCount)
}
for (i in 1:nrow(networkData)) {
	sourceId = uniquePersons[uniquePersons$name == networkData$person[i],]$id
	targetId = uniquePersons[uniquePersons$name == networkData$inspiration[i],]$id
	networkDataList$links[[i]] = list(source=sourceId, target=targetId)
}
networkJson = jsonlite::toJSON(networkDataList, auto_unbox=TRUE)
cat(networkJson, file='inspirationNetwork.json')

# How are the inspiration counts distributed?
inspirationCount = table(networkData$inspiration)
inspirationCount = inspirationCount[order(inspirationCount, decreasing=TRUE)]
inspirationCountTable = cbind(seq_len(length(inspirationCount)), names(inspirationCount), inspirationCount)
colnames(inspirationCountTable) = c('rank', 'name', 'count')
write.table(inspirationCountTable, 'inspirationCount.txt', sep='\t', quote=F, row.names=F, col.names=T)

# Are there "circular" inspirations, i.e. people that inspired each other?
both = unique(networkData$person[networkData$person %in% networkData$inspiration])
for (i in 1:length(both)) {
	p = both[i]
	insp = networkData[which(networkData$person == p),]$inspiration
	insp = insp[insp %in% networkData$person]
	if (length(insp) > 0) {
		for (j in 1:length(insp)) {
			inspInsp = networkData[which(networkData$person == insp[j]),]$inspiration
			if (p %in% inspInsp) {
				message('FOUND ONE!')
				message(paste0(p, ' -> ', insp[j], ' -> ', p))
			}
		}
	}
}
# Answer: no.

# Who inspires the inspirations?
luminaries = unique(networkData$inspiration[networkData$inspiration %in% networkData$person])
luminariesInspiration = networkData[networkData$person %in% luminaries,]
luminaryCount = table(luminariesInspiration$inspiration)
luminaryCount = luminaryCount[order(luminaryCount, decreasing=TRUE)]
luminaryCountTable = cbind(seq_len(length(luminaryCount)), names(luminaryCount), luminaryCount)
colnames(luminaryCountTable) = c('rank', 'name', 'count')
write.table(luminaryCountTable, 'luminaryCount.txt', sep='\t', quote=F, row.names=F, col.names=T)

# Compare the ranks of the inspirations and luminaries.
inspRanks = unique(inspirationCount)
names(inspRanks) = 1:length(inspRanks)
lumRanks = unique(luminaryCount)
names(lumRanks) = 1:length(lumRanks)
plotData = cbind(names(inspirationCount), matrix(nrow=length(inspirationCount), ncol=2))
colnames(plotData) = c('name', 'inspRank', 'lumRank')
plotData = as.data.frame(plotData, stringsAsFactors=FALSE)
plotData$inspRank = as.numeric(plotData$inspRank)
plotData$lumRank = as.numeric(plotData$lumRank)
for (i in 1:nrow(plotData)) {
	name = plotData$name[i]
	plotData$inspRank[i] = as.numeric(names(inspRanks[inspRanks == inspirationCount[name]]))
	if (name %in% luminaryCountTable$name) {
		plotData$lumRank[i] = as.numeric(names(lumRanks[lumRanks == luminaryCount[name]]))
	} else {
		plotData$lumRank[i] = 0
	}
}
plot(plotData$inspRank, plotData$lumRank, bty='n', pch=19, col='#ff000033')
