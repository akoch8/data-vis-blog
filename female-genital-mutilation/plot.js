// Data source:
// The Humanitarian Data Exchange
// https://data.humdata.org/dataset/female-genital-mutilation-and-cutting-women-who-have-undergone-fgm-c
var data = {
	//country: overall prevalence, urban, rural, poorest, second, middle, fourth, richest
	'Benin': [9.2, 5.2, 13.1, 16.2, 13.5, 10.3, 6.6, 2.3],
	'Burkina Faso': [75.8, 68.7, 78.4, 77.3, 78.1, 77.8, 79.6, 68.5],
	'Cameroon': [1.4, 0.9, 2.1, 1.3, 4, 1, 0.9, 0.7],
	'Central African Republic': [24.2, 18.1, 28.7, 33.6, 31.2, 26, 17.2, 14.9],
	'Chad': [38.4, 40.1, 37.9, 46.1, 42, 37, 30.3, 37.3],
	'Ivory Coast': [38.2, 37.7, 38.8, null, null, null, null, null],
	'Djibouti': [93.1, 93.1, 95.5, null, null, null, null, null],
	'Egypt': [87.2, 77.4, 92.6, 94.4, 92.6, 92.2, 87.2, 69.8],
	'Eritrea': [83, 80, 85, 89.4, 85.6, 84.4, 83.3, 75.2],
	'Ethiopia': [65.2, 53.9, 68.4, 65, 69.3, 69, 68.6, 57.3],
	'Gambia': [74.9, 71.6, 79.1, 79.3, 77.6, 82.2, 73, 66.1],
	'Ghana': [3.8, 2.5, 5.3, 12.8, 4.1, 2.7, 1.4, 1.1],
	'Guinea': [96.9, 96.8, 97, null, null, null, null, null],
	'Guinea Bissau': [44.9, 39.8, 50.1, 17.9, 59.1, 65.4, 47.2, 36.1],
	'Iraq': [8.1, 9, 5.8, 9.8, 12.1, 9.6, 5.5, 4.2],
	'Kenya': [21, 13.8, 25.9, 39.8, 26, 17.8, 17.2, 12],
	'Liberia': [49.8, 40.8, 64.8, 69.5, 65.2, 56.8, 40.6, 29.1],
	'Mali': [82.7, 84.8, 82, 63.8, 84, 87.9, 88.8, 86.8],
	'Mauritania': [66.6, null, null, null, null, null, null, null],
	'Niger': [2, 1.2, 2.1, 1.7, 1.7, 2.4, 3, 1],
	'Nigeria': [24.8, 32.3, 19.3, 16.5, 20.3, 23.5, 30.6, 31],
	'Senegal': [24.2, 18.5, 29.5, null, null, null, null, null],
	'Sierra Leone': [89.6, 80.9, 94.3, 94.8, 94.5, 94.9, 90.3, 76.9],
	'Somalia': [97.9, 97.1, 98.4, 98.4, 99.1, 98.4, 97.5, 96.2],
	'Sudan': [86.6, 85.5, 87.2, 88, 81.7, 80.7, 90, 91.6],
	'Togo': [4.7, 3.4, 5.7, 8.2, 5.1, 5.2, 4.1, 2.3],
	'Uganda': [1.4, 1.4, 1.4, 2.2, 1.2, 1.2, 1, 1.5],
	'United Republic of Tanzania': [10, 5.3, 12.7, 18.6, 10.3, 11.7, 8.8, 4.4],
	'Yemen': [18.5, 17.1, 19.2, 26.5, 21, 13.3, 19.5, 14],
};

var calculateTextWidth = function(text, font) {
	// Given a string, font family and text size, calculate the width of the given string in
	// pixels. This function was adapted from https://stackoverflow.com/a/21015393
	var canvas = calculateTextWidth.canvas ? calculateTextWidth.canvas :
		document.createElement('canvas');
	var context = canvas.getContext('2d');
	context.font = font;
	var textWidth = Math.ceil(context.measureText(text).width);
	return textWidth;
};

var convertToGrayscale = function(x) {
	// Map a given value between 0 and 100 to an RGB grayscale color.
	var grayScale = d3.scaleLinear().domain([0, 100]).range(['#fefefe', '#747474']);
	return grayScale(x);
};

var convertToColorscale = function(x) {
	// Map a given value between 0 and 100 to an RGB color.
	var colorScale = d3.scaleLinear().domain([0, 100]).range(['#e4f1e1', '#0d585f']);
	return colorScale(x);
};

var drawMap = function(svgElement, path, featureCollection, colorScale, i) {
	// Draw the map of Africa and assign a fill color to each country based on the prevalence of
	// FGM in that country.
	svgElement.append('g')
		.attr('class', 'countries')
		.selectAll('path')
		.data(featureCollection.features)
		.enter()
		.append('path')
		.attr('d', path)
		.attr('data-index', i)
		.attr('fill', function(d) {
			var country = d.properties.admin;
			if (country in data) {
				var prevalence = data[country][i];
				if (prevalence) {
					return colorScale(prevalence);
				} else {
					return '#fff';
				}
			} else {
				return '#fff';
			}
		})
		.on('mouseover', function(d) {
			// When hovering over a country, show an annotation box with the country's name and, if
			// available, the prevalence of FGM in that country.
			var country = d.properties.admin;
			var coord = d3.select(this).node().getBBox();
			var textMargin = 10;
			var selectedCountry = this;
			var index = $(this).attr('data-index');
			var annotationText = country;
			if (country in data) {
				if (data[country][index]) {
					annotationText += ' (' + data[country][index] + '%)';
				} else {
					annotationText += ' (NA)';
				}
			}
			var annotationTextWidth = calculateTextWidth(annotationText, '14px arial') + 2 * textMargin;
			svgElement.append('rect')
				.attr('x', coord.x + coord.width / 2 - annotationTextWidth / 2)
				.attr('y', coord.y - 25)
				.attr('width', annotationTextWidth)
				.attr('height', 22)
				.attr('class', 'country-annotation annotation-' + country.replace(/\s+/g, '-'));
			svgElement.append('text')
				.attr('x', coord.x  + coord.width / 2 - annotationTextWidth / 2 + textMargin)
				.attr('y', coord.y - 20)
				.attr('alignment-baseline', 'hanging')
				.attr('class', 'country-annotation-name annotation-' + country.replace(/\s+/g, '-'))
				.attr('data-country', country)
				.text(annotationText);
			if (country in data) {
				svgElement.selectAll('path').transition().duration(200).style('fill', function(d) {
					var country = d.properties.admin;
					if (this !== selectedCountry) {
						if (country in data) {
							var prevalence = data[country][index];
							if (prevalence) {
								return convertToGrayscale(prevalence);
							} else {
								return '#fff';
							}
						} else {
							return '#fff';
						}
					}
				});
			}
		})
		.on('mouseout', function(d) {
			// Remove the annotation box.
			var selectedCountry = this;
			var country = d.properties.admin;
			var index = $(this).attr('data-index');
			$('.annotation-' + country.replace(/\s+/g, '-')).remove();
			svgElement.selectAll('path').transition().duration(200).style('fill', function(d) {
				var country = d.properties.admin;
				if (this !== selectedCountry) {
					if (country in data) {
						var prevalence = data[country][index];
						if (prevalence) {
							return convertToColorscale(prevalence);
						} else {
							return '#fff';
						}
					} else {
						return '#fff';
					}
				}
			});
		});
};

var updateMap = function(mapId, i, value, colorScale) {
	// In case an annotation box is open because the user is hovering over a country and the slider
	// is automatically looping through the values, we need to update the prevalence value in the
	// annotation box to the current value in the slider.
	if ($('.country-annotation').length) {
		var country = $('.country-annotation-name').attr('data-country');
		var annotationText = country;
		if (country in data) {
			var prevalence = data[country][i];
			if (prevalence) {
					annotationText += ' (' + prevalence + '%)';
			} else {
				annotationText += ' (NA)';
			}
		}
		d3.selectAll('.country-annotation-name')
			.text(annotationText);
	}

	// Update the map.
	d3.selectAll('#' + mapId + ' .map-title')
		.text(value);
	d3.selectAll('#' + mapId + ' path')
		.attr('data-index', i)
		.transition().duration(200)
		.style('fill', function(d) {
			var country = d.properties.admin;
			if (country in data) {
				var prevalence = data[country][i];
				if (prevalence) {
					return colorScale(prevalence);
				} else {
					return '#fff';
				}
			} else {
				return '#fff';
			}
		});
};

$(function() {
	var margin = {top: 50, right: 10, bottom: 10, left: 10};
	var w = $('.svg-container').width();
	var h = w;
	var colorScale = d3.scaleLinear().domain([0, 100]).range(['#e4f1e1', '#0d585f']);

	// Create cloropleths of the overall prevalence of FGM, the prevalence in urban versus rural
	// areas and the prevalence in relation to the wealth quintile.
	var svgOverall = d3.select('#overall-prevalence')
		.append('svg')
		.attr('width', w + margin.left + margin.right)
		.attr('height', h + margin.top);
	var svgResidence = d3.select('#residence-prevalence')
		.append('svg')
		.attr('width', w)
		.attr('height', h + margin.top);
	var svgWealth = d3.select('#wealth-prevalence')
		.append('svg')
		.attr('width', w)
		.attr('height', h + margin.top);
	d3.json('africa.json').then(function(africa) {
		var featureCollection = topojson.feature(africa, africa.objects.countries);
		var projection = d3.geoIdentity().fitExtent([[margin.left, margin.top], [w - margin.right, h + margin.top]], featureCollection);
		var path = d3.geoPath().projection(projection);
		drawMap(svgOverall, path, featureCollection, colorScale, 0);
		drawMap(svgResidence, path, featureCollection, colorScale, 1);
		drawMap(svgWealth, path, featureCollection, colorScale, 3);
	});
	svgOverall.append('text')
		.attr('x', w / 2)
		.attr('y', margin.top / 2)
		.attr('class', 'map-title')
		.text('overall prevalence');
	svgResidence.append('text')
		.attr('x', w / 2)
		.attr('y', margin.top / 2)
		.attr('class', 'map-title')
		.text('urban');
	svgWealth.append('text')
		.attr('x', w / 2)
		.attr('y', margin.top / 2)
		.attr('class', 'map-title')
		.text('poorest');

	// Adapt the cloropleth when a user changes the category using one of the range sliders.
	$('input[type=range]').on('input', function() {
		var rangeType = $(this).attr('id');
		var mapId = $(this).closest('.figure-container').find('.svg-container').attr('id');
		var rangeValue = parseInt($(this).val());
		var valueIndex;
		var rangeValues;
		if (rangeType === 'residence-slider') {
			rangeValues = ['urban', 'rural'];
			valueIndex = rangeValue + 1;
		} else if (rangeType === 'wealth-slider') {
			rangeValues = ['poorest', 'second', 'middle', 'fourth', 'richest'];
			valueIndex = rangeValue + 3;
		}
		updateMap(mapId, valueIndex, rangeValues[rangeValue], colorScale);
	});

	// Automatically loop through the different values of a range slider when a user clicks the
	// play/pause button next to it.
	$('.play-button').on('click', function() {
		var intervalId;
		var range = $(this).parent().find('input[type=range]');
		var maxValue = parseInt(range.attr('max'));
		console.log('maxValue = ' + maxValue);
		if ($(this).hasClass('playing')) {
			intervalId = $(this).data('intervalid');
			clearInterval(intervalId);
			$(this).removeClass('playing');
		} else {
			intervalId = setInterval(function() {
				var rangeValue = parseInt(range.val());
				var newValue = rangeValue < maxValue ? rangeValue + 1 : 0;
				range.val(newValue).trigger('input');
			}, 1000);
			$(this).data('intervalid', intervalId);
			$(this).addClass('playing');
		}
	});
});
