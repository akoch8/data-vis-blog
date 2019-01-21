// Data source:
// The Humanitarian Data Exchange
// https://data.humdata.org/dataset/female-genital-mutilation-and-cutting-women-who-have-undergone-fgm-c
var data = {
	//country: overall prevalence, rural, urban, poorest, second, middle, fourth, richest
	'Benin': [9.2, 13.1, 5.2, 16.2, 13.5, 10.3, 6.6, 2.3],
	'Burkina Faso': [75.8, 78.4, 68.7, 77.3, 78.1, 77.8, 79.6, 68.5],
	'Cameroon': [1.4, 2.1, 0.9, 1.3, 4, 1, 0.9, 0.7],
	'Central African Republic': [24.2, 28.7, 18.1, 33.6, 31.2, 26, 17.2, 14.9],
	'Chad': [38.4, 37.9, 40.1, 46.1, 42, 37, 30.3, 37.3],
	'Ivory Coast': [38.2, 38.8, 37.7, null, null, null, null, null],
	'Djibouti': [93.1, 95.5, 93.1, null, null, null, null, null],
	'Egypt': [87.2, 92.6, 77.4, 94.4, 92.6, 92.2, 87.2, 69.8],
	'Eritrea': [83, 85, 80, 89.4, 85.6, 84.4, 83.3, 75.2],
	'Ethiopia': [65.2, 68.4, 53.9, 65, 69.3, 69, 68.6, 57.3],
	'Gambia': [74.9, 79.1, 71.6, 79.3, 77.6, 82.2, 73, 66.1],
	'Ghana': [3.8, 5.3, 2.5, 12.8, 4.1, 2.7, 1.4, 1.1],
	'Guinea': [96.9, 97, 96.8, null, null, null, null, null],
	'Guinea Bissau': [44.9, 50.1, 39.8, 17.9, 59.1, 65.4, 47.2, 36.1],
	//'Iraq': [8.1, 5.8, 9, 9.8, 12.1, 9.6, 5.5, 4.2],
	'Kenya': [21, 25.9, 13.8, 39.8, 26, 17.8, 17.2, 12],
	'Liberia': [49.8, 64.8, 40.8, 69.5, 65.2, 56.8, 40.6, 29.1],
	'Mali': [82.7, 82, 84.8, 63.8, 84, 87.9, 88.8, 86.8],
	'Mauritania': [66.6, null, null, null, null, null, null, null],
	'Niger': [2, 2.1, 1.2, 1.7, 1.7, 2.4, 3, 1],
	'Nigeria': [24.8, 19.3, 32.3, 16.5, 20.3, 23.5, 30.6, 31],
	'Senegal': [24.2, 29.5, 18.5, null, null, null, null, null],
	'Sierra Leone': [89.6, 94.3, 80.9, 94.8, 94.5, 94.9, 90.3, 76.9],
	'Somalia': [97.9, 98.4, 97.1, 98.4, 99.1, 98.4, 97.5, 96.2],
	'Sudan': [86.6, 87.2, 85.5, 88, 81.7, 80.7, 90, 91.6],
	'Togo': [4.7, 5.7, 3.4, 8.2, 5.1, 5.2, 4.1, 2.3],
	'Uganda': [1.4, 1.4, 1.4, 2.2, 1.2, 1.2, 1, 1.5],
	'United Republic of Tanzania': [10, 12.7, 5.3, 18.6, 10.3, 11.7, 8.8, 4.4]
	//'Yemen': [18.5, 19.2, 17.1, 26.5, 21, 13.3, 19.5, 14],
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
	var colorScale = d3.scaleLinear().domain([0, 100]).range(['#e4f1e1', '#033f45']);
	return colorScale(x);
};

var drawMap = function(svgElement, margin, path, featureCollection, colorScale, i) {
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
			var category = $(this).closest('.svg-container').attr('id');
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
				d3.selectAll('#' + category + '-lineplot .lineplot path')
					.transition()
					.duration(200)
					.style('stroke', function() {
						var countryLine = d3.select(this).attr('data-country');
						if (countryLine !== country) {
							var prevalence = data[countryLine][index];
							if (prevalence) {
								return convertToGrayscale(prevalence);
							} else {
								return '#fff';
							}
						} else {
							return '#ffcd60';
						}
					});
			}
		})
		.on('mouseout', function(d) {
			// Remove the annotation box.
			var selectedCountry = this;
			var country = d.properties.admin;
			var index = $(this).attr('data-index');
			var category = $(this).closest('.svg-container').attr('id');
			$('.annotation-' + country.replace(/\s+/g, '-')).remove();
			svgElement.selectAll('path').transition().duration(200).style('fill', function(pathData) {
				var pathCountry = pathData.properties.admin;
				if (pathCountry !== country) {
					if (pathCountry in data) {
						var prevalence = data[pathCountry][index];
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

			// Recolor all the lines in the line plot.
			d3.selectAll('#' + category + '-lineplot .lineplot path')
					.transition()
					.duration(200)
					.style('stroke', function() {
						var countryLine = d3.select(this).attr('data-country');
						var prevalence = data[countryLine][index];
						if (prevalence) {
							return convertToColorscale(prevalence);
						} else {
							return '#fff';
						}
					});
		});

	// Add a legend.
	var legendHeight = Math.round(svgElement.attr('height') / 5);
	svgElement.append('rect')
		.attr('class', 'legend')
		.attr('x', 60)
		.attr('y', svgElement.attr('height') - 200)
		.attr('width', 10)
		.attr('height', legendHeight);
	for (var k = 0; k < 6; k++) {
		svgElement.append('text')
			.attr('class', 'legend-text')
			.attr('x', 75)
			.attr('y', svgElement.attr('height') - 200 + legendHeight - (legendHeight / 5) * k)
			.text((k * 20) + '%');
	}
};

var drawLineplot = function(svgElement, colorScale, index, stopIndex, xDomain, xAxisTicks, xAxisLabels) {
	var margin = {top: 10, right: 90, bottom: 40, left: 30};
	var width = svgElement.attr('width');
	var height = svgElement.attr('height');
	var x = d3.scaleLinear().domain(xDomain).range([0, width - margin.left - margin.right]);
	var y = d3.scaleLinear().domain([0, 100]).range([height - margin.top - margin.bottom, 0]);
	var line = d3.line()
		.defined(function(d, i) {
			return d !== null;
		})
		.x(function(d, i) { return x(i); })
		.y(function(d, i) { return y(d); });
	var g = svgElement.append('g')
				.attr('class', 'lineplot')
				.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
	$.each(data, function(country, data) {
		var plotData = data.slice(index, stopIndex);
		g.append('path')
			.data([plotData])
			.attr('fill', 'none')
			.attr('stroke-width', function(d) {
				if (d[0] < d[d.length - 1]) {
					return 3;
				} else {
					return 1;
				}
			})
			.attr('stroke', function() {
				return colorScale(data[0]);
			})
			.attr('d', line)
			.attr('data-country', country)
			.on('mouseover', function() {
				console.log($(this).attr('data-country'));
			});
		g.append('text')
			.data([plotData])
			.attr('x', width - margin.right - margin.left + 5)
			.attr('y', function(d) {
				return y(d[d.length - 1]);
			})
			.attr('class', 'country-label')
			.attr('opacity', function(d) {
				if (d[0] < d[d.length - 1]) {
					return 1;
				} else {
					return 0;
				}
			})
			.text(country);
	});
	svgElement.append('g')
		.attr('transform', 'translate(' + margin.left + ',' + (height - margin.bottom) + ')')
		.attr('class', 'axis x-axis')
		.call(d3.axisBottom(x)
			.tickValues(xAxisTicks)
			.tickFormat(function(d) {
				return xAxisLabels[d];
			}))
		.selectAll('text')
			.attr('transform', 'translate(10, 0) rotate(45)')
			.style('text-anchor', 'start');
	svgElement.append('g')
		.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
		.attr('class', 'axis y-axis')
		.call(d3.axisLeft(y));
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
	//var colorScale = d3.scaleLinear().domain([0, 100]).range(['#e4f1e1', '#0d585f']);
	var colorScale = d3.scaleLinear().domain([0, 100]).range(['#e4f1e1', '#033f45']);

	// Create cloropleths of the overall prevalence of FGM, the prevalence in urban versus rural
	// areas and the prevalence in relation to the wealth quintile.
	var svgOverall = d3.select('#overall-prevalence')
		.append('svg')
		.attr('width', w + margin.left + margin.right)
		.attr('height', h + margin.top)
		.attr('text-rendering', 'geometricPrecision')
		.attr('font-family', 'arial');
	var svgResidence = d3.select('#residence-prevalence')
		.insert('svg', ':first-child')
		.attr('width', w)
		.attr('height', h + margin.top)
		.attr('text-rendering', 'geometricPrecision')
		.attr('font-family', 'arial');
	var svgWealth = d3.select('#wealth-prevalence')
		.insert('svg', ':first-child')
		.attr('width', w)
		.attr('height', h + margin.top)
		.attr('text-rendering', 'geometricPrecision')
		.attr('font-family', 'arial');
	var svgResidenceLineplot = d3.select('#residence-prevalence-lineplot')
		.append('svg')
		.attr('width', $('.svg-explanation').width())
		.attr('height', $('.svg-explanation').width())
		.attr('text-rendering', 'geometricPrecision')
		.attr('font-family', 'arial');
	var svgWealthLineplot = d3.select('#wealth-prevalence-lineplot')
		.append('svg')
		.attr('width', $('.svg-explanation').width())
		.attr('height', $('.svg-explanation').width())
		.attr('text-rendering', 'geometricPrecision')
		.attr('font-family', 'arial');

	// Create the gradient that will be used for the figure legends.
	var definitions = svgOverall.append('defs');
	var gradient = definitions.append('linearGradient')
		.attr('id', 'svgGradient')
		.attr('x1', '0%')
		.attr('y1', '0%')
		.attr('x2', '0%')
		.attr('y2', '100%');
	gradient.append('stop')
		.attr('class', 'start')
		.attr('offset', '0%')
		.attr('stop-color', '#033f45')
		.attr('stop-opacity', 1);
	gradient.append('stop')
		.attr('class', 'end')
		.attr('offset', '100%')
		.attr('stop-color', '#e4f1e1')
		.attr('stop-opacity', 1);

	d3.json('africa.json').then(function(africa) {
		var featureCollection = topojson.feature(africa, africa.objects.countries);
		var projection = d3.geoIdentity().fitExtent([[margin.left, margin.top], [w - margin.right, h + margin.top]], featureCollection);
		var path = d3.geoPath().projection(projection);
		drawMap(svgOverall, margin, path, featureCollection, colorScale, 0);
		drawMap(svgResidence, margin, path, featureCollection, colorScale, 1);
		drawMap(svgWealth, margin, path, featureCollection, colorScale, 3);
		drawLineplot(svgResidenceLineplot, colorScale, 1, 3,
			[0, 1],
			[0, 1],
			['urban', 'rural']);
		drawLineplot(svgWealthLineplot, colorScale, 3, 8,
			[0, 4],
			[0, 1, 2, 3, 4],
			['poorest', 'second', 'middle', 'fourth', 'richest']);
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
	var intervalId;
	$('.play-button').on('click', function() {
		var range = $(this).parent().find('input[type=range]');
		var maxValue = parseInt(range.attr('max'));
		if ($(this).hasClass('playing')) {
			clearInterval(intervalId);
			$(this).removeClass('playing');
		} else {
			intervalId = setInterval(function() {
				var rangeValue = parseInt(range.val());
				var newValue = rangeValue < maxValue ? rangeValue + 1 : 0;
				range.val(newValue).trigger('input');
			}, 1000);
			$(this).addClass('playing');
		}
	});
});
