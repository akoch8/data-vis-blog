$(function() {
	var textColor = '#808080',
		berlinBlue = '#0066b3',
		lightBlue = '#bdcede',
		focusColor = '#ff6473',
		focusColorLight = '#f5aeb5',
		annotationColor = '#999',
		annotationFontSize = '12px',
		axisLabelColor = '#5e5e5e',
		axisLabelFontSize = '14px',
		km = [5, 10, 15, 20, 25, 30, 35, 40, 42.195];
	var margin = {top: 20, left: 100, bottom: 100, right: 20};
	var width = $('.line-chart').width() - margin.left - margin.right;
	width = width > 900 ? 900 : width < 500 ? 500 : width;
	var height = width * 0.5;
	var x = d3.scaleLinear().domain([0, 45]).range([0, width]);
	var y = d3.scaleLinear().domain([13 * 60 + 30, 17 * 60 + 30]).range([height, 0]);
	var valueline = d3.line()
		.defined(function(d) {
			return d.split !== null;
		})
		.x(function(d) { return x(d.km); })
		.y(function(d) { return y(d.split); });

	// Build the SVG element...
	var svg = d3.select('.line-chart').append('svg')
		.attr('width', width + margin.left + margin.right)
		.attr('height', height + margin.bottom + margin.top)
		.attr('text-rendering', 'geometricPrecision')
		.attr('font-family', 'arial')
		.attr('font-size', '9px')
		.attr('fill', textColor)
	.append('g')
		.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

	// ...and add the data.
	var years = [];
	d3.tsv('berlin_marathon_results_1999_2018.txt', function(data) {
		if (+data.year >= years[years.length]) {
			years.push(+data.year);
		} else {
			years.unshift(+data.year);
		}

		// Add the run to the information section above the figure.
		var run = '<div class="run"><div class="year">' + data.year +
			'</div><div class="runner">' + data.runner +
			' <span class="nationality">&ndash; ' + data.nationality + '</span></div>';
		if (data.wr === 'yes') {
			run += '<div class="time wr">' + data.finish + ' <strong>WR</strong></div>';
		} else {
			run += '<div class="time no-wr">' + data.finish + '</div>';
		}
		run += '</div>';
		$('.info').append(run);

		// In order to plot the data, we need to extract and process the variables that we
		// are interested in (distance and split).
		var splits = [],
			time = [],
			plotData = [];
		$.each(km, function(i, v) {
			var kmTime, timeSeconds;
			if (v <= 40) {
				if (data[v + 'km'] === 'NA') {
					kmTime = null;
				} else {
					kmTime = data[v + 'km'].split(':');
				}
			} else if (v > 40) {
				kmTime = data.finish.split(':');
			}
			if (kmTime !== null) {
				kmTime = kmTime.map(function(x) {
					return +x;
				});
				if (kmTime.length == 2) {
					timeSeconds = kmTime[0] * 60 + kmTime[1];
				} else if (kmTime.length > 2) {
					timeSeconds = kmTime[0] * 60 * 60 + kmTime[1] * 60 + kmTime[2];
				}
			} else {
				timeSeconds = null;
			}
			time.push(timeSeconds);
			if (splits.length === 0) {
				splits.push(timeSeconds);
				plotData.push({km: v, split: timeSeconds});
			} else if (splits.length < km.length - 1) {
				var prevSplit = time[time.length - 2];
				if (prevSplit !== null && timeSeconds !== null) {
					splits.push(timeSeconds - prevSplit);
					plotData.push({km: v, split: timeSeconds - prevSplit});
				} else {
					splits.push(null);
					plotData.push({km: v, split: null});
				}
			} else {
				// Extrapolate the pace for the last 2.195 km to a pace over 5 km.
				var pace = Math.round((timeSeconds - time[time.length - 2]) / 2.195 * 5);
				splits.push(pace);
				plotData.push({km: +v, split: +pace});
			}
		});
		var strokeColor = lightBlue;
		if (data.wr === 'yes') {
			strokeColor = berlinBlue;
		}
		svg.append('path')
			.data([plotData])
			.attr('fill', 'none')
			.attr('class', 'line ' + data.year)
			.attr('stroke-width', 1)
			.attr('stroke-linecap', 'round')
			.attr('stroke-linejoin', 'round')
			.attr('stroke', strokeColor)
			.attr('d', valueline);
	});

	// Add the x and y axes, together with their labels.
	svg.append('g')
		.attr("transform", "translate(0," + height + ")")
		.attr('class', 'axis')
		.call(d3.axisBottom(x));
	var yAxisTickValues = [];
	for (var i = 0; i < 9; i++) {
		yAxisTickValues.push(13 * 60 + 30 + i * 30);
	}
	svg.append('g')
		.attr('class', 'axis')
		.call(d3.axisLeft(y)
				.tickValues(yAxisTickValues)
				.tickFormat(function(d) {
					var minutes = Math.floor(d / 60);
					var seconds = d % 60;
					if (seconds === 0) {
						seconds = '00';
					}
					return minutes + ':' + seconds;
				}));
	svg.append('text')
		.attr('x', x(22.5))
		.attr('y', height + margin.bottom / 2)
		.attr('text-anchor', 'middle')
		.attr('alignment-baseline', 'middle')
		.attr('font-size', axisLabelFontSize)
		.attr('fill', axisLabelColor)
		.text('Distance (km)');
	svg.append('text')
		.attr('x', x(0.5))
		.attr('y', y(17 * 60 + 30))
		.attr('text-anchor', 'start')
		.attr('alignment-baseline', 'hanging')
		.attr('font-size', axisLabelFontSize)
		.attr('fill', axisLabelColor)
		.text('5km pace (min:sec)');

	// Add some explanations to the figure.
	var annotationText = ['The lines only start at the 5km mark, because that is',
		'where the first split time was measured.'];
	$.each(annotationText, function(i, v) {
		svg.append('text')
			.attr('x', x(5))
			.attr('y', y(14 * 60 - i * 8))
			.attr('text-anchor', 'start')
			.attr('alignment-baseline', 'middle')
			.attr('font-size', annotationFontSize)
			.attr('fill', annotationColor)
			.text(v);
	});
	annotationText = ['While some of the non-world record runs do show how the runner',
		'slowed down at the end, most runs are actually quite evenly paced.',
		'World record runners didn\'t just finish fast, they also started fast.'];
	$.each(annotationText, function(i, v) {
		svg.append('text')
			.attr('x', x(39))
			.attr('y', y(16 * 60 + 30 - i * 8))
			.attr('text-anchor', 'end')
			.attr('alignment-baseline', 'middle')
			.attr('font-size', annotationFontSize)
			.attr('fill', annotationColor)
			.text(v);
	});

	// Highlight a particular run's graph when hovering over or clicking on the run info.
	$(document).on({
		mouseover: function() {
			var year = $(this).find('.year').text(),
				path = $('.' + year),
				strokeColor;
			if (!path.hasClass('selected')) {
				strokeColor = focusColorLight;
				if ($(this).find('.time').hasClass('wr')) {
					strokeColor = focusColor;
				}
				$('.' + year).css({'stroke': strokeColor, 'stroke-width': '2px'});
			}
		},
		mouseout: function() {
			var year = $(this).find('.year').text(),
				path = $('.' + year),
				strokeColor;
			if (!path.hasClass('selected')) {
				strokeColor = lightBlue;
				if ($(this).find('.time').hasClass('wr')) {
					strokeColor = berlinBlue;
				}
				$('.' + year).css({'stroke': strokeColor, 'stroke-width': '1px'});
			}
		},
		click: function() {
			var year = $(this).find('.year').text(),
				svgElements = $('.' + year),
				strokeColor;
			if ($(this).hasClass('selected')) {
				$(this).removeClass('selected');
				svgElements.removeClass('selected');
				strokeColor = lightBlue;
				if ($(this).find('.time').hasClass('wr')) {
					strokeColor = berlinBlue;
				}
				svgElements.css({'stroke': strokeColor, 'stroke-width': '1px'});
				$.each(svgElements, function() {
					if ($(this)[0].localName === 'circle') {
						$(this).css({'fill': 'none'});
					}	
				});
			} else {
				$('svg .selected').each(function() {
					strokeColor = lightBlue;
					if ($(this).find('.time').hasClass('wr')) {
						strokeColor = berlinBlue;
					}
					$(this).css({'stroke': strokeColor, 'stroke-width': '1px'});
					if ($(this)[0].localName === 'circle') {
						$(this).css({'fill': 'none'});
					}
				}).removeClass('selected');
				$('.info').find('.selected').removeClass('selected');
				strokeColor = focusColorLight;
				if ($(this).find('.time').hasClass('wr')) {
					strokeColor = focusColor;
				}
				svgElements.css({'stroke': strokeColor, 'stroke-width': '2px'});
				$.each(svgElements, function() {
					if ($(this)[0].localName === 'circle') {
						$(this).css({'fill': strokeColor});
					}	
				});
				svgElements.addClass('selected');
				$(this).addClass('selected');
			}
		}
	}, '.run');

	// Animate the figure by redrawing the paths year by year.
	$('.animation-button').on('click', function() {
		if (!$(this).hasClass('inactive')) {
			$(this).addClass('inactive');
			$('.line-chart').find('.line').css({'opacity': 0});
			(function delayedLoop(i) {
				setTimeout(function() {
					$('.' + years[i]).css({'opacity': 1});
					$('.animation-year').text(years[i]);
					if (i < years.length) {
						i++;
						delayedLoop(i);
					} else {
						$('.animation-button').removeClass('inactive');
						$('.animation-year').text('');
					}
				}, 400);
			})(0);
		}
	});
});
