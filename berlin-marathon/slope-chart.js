$(function() {
	var textColor = '#808080',
		berlinBlue = '#0066b3',
		lightBlue = '#bdcede',
		focusColor = '#ff6473',
		focusColorLight = '#f5aeb5',
		annotationColor = '#999',
		annotationFontSize = '12px',
		axisLabelColor = '#5e5e5e',
		axisLabelFontSize = '14px';
	var margin = {top: 10, left: 100, bottom: 100, right: 0};
	var width = $('.line-chart').width() / 2.5 - margin.left - margin.right;
	width = width < 300 ? 300 : width;
	var height = width;
	var x = d3.scaleLinear().domain([0, 1]).range([0, width]);
	var y = d3.scaleLinear().domain([60 * 60, 65 * 60]).range([height, 0]);

	// Build the SVG element...
	var svg = d3.select('.slope-chart').append('svg')
		.attr('width', width + margin.left + margin.right)
		.attr('height', height + margin.bottom + margin.top)
		.attr('text-rendering', 'geometricPrecision')
		.attr('font-family', 'arial')
		.attr('font-size', '9px')
		.attr('fill', textColor)
	.append('g')
		.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

	// ...and add the data.
	d3.tsv('berlin_marathon_results_1999_2018.txt', function(data) {
		// Calculate the time in seconds for the first and second halves of the race.
		var firstHalf = data['21.1km'].split(':').map(function(x) {
			return + x;
		});
		firstHalfSeconds = 60 * 60 * firstHalf[0] + 60 * firstHalf[1] + firstHalf[2];
		var secondHalf = data.finish.split(':').map(function(x) {
			return +x;
		});
		secondHalfSeconds = 60 * 60 * secondHalf[0] + 60 * secondHalf[1] + secondHalf[2];
		secondHalfSeconds -= firstHalfSeconds;
		var runColor = lightBlue;
		if (data.wr === 'yes') {
			runColor = berlinBlue;
		}
		svg.append('line')
			.attr('x1', x(0.25))
			.attr('x2', x(0.75))
			.attr('y1', y(firstHalfSeconds))
			.attr('y2', y(secondHalfSeconds))
			.attr('stroke-width', 1)
			.attr('stroke-linecap', 'round')
			.attr('stroke-linejoin', 'round')
			.attr('class', 'line ' + data.year)
			.attr('stroke', runColor);
		svg.append('circle')
			.attr('cx', x(0.25))
			.attr('cy', y(firstHalfSeconds))
			.attr('r', 3)
			.attr('class', data.year)
			.attr('fill', 'none')
			.attr('stroke', runColor);
		svg.append('circle')
			.attr('cx', x(0.75))
			.attr('cy', y(secondHalfSeconds))
			.attr('r', 3)
			.attr('class', data.year)
			.attr('fill', 'none')
			.attr('stroke', runColor);
	});

	// Add the x and y axes, together with their labels.
	var xAxisTickValues = [0.25, 0.75];
	svg.append('g')
		.attr("transform", "translate(0," + height + ")")
		.attr('class', 'axis-no-line')
		.call(d3.axisBottom(x)
				.tickValues(xAxisTickValues)
				.tickFormat(function(d) {
					return d === 0.25 ? 'first half' : 'second half';
				}));
	var yAxisTickValues = [];
	for (var i = 0; i < 6; i++) {
		yAxisTickValues.push(60 * 60 + i * 60);
	}
	svg.append('g')
		.attr('class', 'axis')
		.call(d3.axisLeft(y)
				.tickValues(yAxisTickValues)
				.tickFormat(function(d) {
					var hours = Math.floor(d/3600);
					hours = '0' + hours;
					var secondsLeft = d - 3600;
					var minutes = Math.floor(secondsLeft / 60);
					minutes = '0' + minutes;
					var seconds = d % 60;
					if (seconds === 0) {
						seconds = '00';
					}
					return hours + ':' + minutes + ':' + seconds;
				}));
	svg.append('text')
		.attr('x', x(0.05))
		.attr('y', y(65 * 60))
		.attr('text-anchor', 'start')
		.attr('alignment-baseline', 'hanging')
		.attr('font-size', axisLabelFontSize)
		.attr('fill', axisLabelColor)
		.text('time (hours:min:sec)');
});
