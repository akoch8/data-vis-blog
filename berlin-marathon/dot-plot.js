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
	var y = d3.scaleLinear().domain([-4 * 60, 4 * 60]).range([height, 0]);

	// Build the SVG element...
	var svg = d3.select('.dot-plot').append('svg')
		.attr('width', width + margin.left + margin.right)
		.attr('height', height + margin.bottom + margin.top)
		.attr('text-rendering', 'geometricPrecision')
		.attr('font-family', 'arial')
		.attr('font-size', '9px')
		.attr('fill', textColor)
	.append('g')
		.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

	// ...add a line at 0...
	svg.append('line')
		.attr('x1', x(0))
		.attr('x2', x(1))
		.attr('y1', y(0))
		.attr('y2', y(0))
		.attr('stroke-width', 0.5)
		.attr('stroke-linecap', 'round')
		.attr('stroke-linejoin', 'round')
		.attr('stroke-dasharray', '4,3')
		.attr('stroke', '#bbb');

	// ...and add the data.
	var noWr = [],
		wr = [];
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
		var differenceSeconds = secondHalfSeconds - firstHalfSeconds;
		var runColor = lightBlue;
		var xPosition = 0.25;
		if (data.wr === 'yes') {
			runColor = berlinBlue;
			xPosition = 0.75;
			wr.push(differenceSeconds);
		} else {
			noWr.push(differenceSeconds);
		}
		svg.append('circle')
			.attr('cx', x(xPosition))
			.attr('cy', y(differenceSeconds))
			.attr('r', 3)
			.attr('class', data.year)
			.attr('fill', 'none')
			.attr('stroke', runColor);
	});

	// Calculate the mean differences and draw a horizontal line at both means. We'll put this
	// inside a setTimeout, because we have to wait for the data drawing to be finished before we
	// can caculate the mean differences.
	setTimeout(function() {
		noWrMean = mean(noWr);
		wrMean = mean(wr);
		svg.append('line')
			.attr('x1', x(0.1))
			.attr('x2', x(0.4))
			.attr('y1', y(noWrMean))
			.attr('y2', y(noWrMean))
			.attr('stroke-width', 1)
			.attr('stroke-linecap', 'round')
			.attr('stroke-linejoin', 'round')
			.attr('stroke', lightBlue);
		svg.append('line')
			.attr('x1', x(0.6))
			.attr('x2', x(0.9))
			.attr('y1', y(wrMean))
			.attr('y2', y(wrMean))
			.attr('stroke-width', 1)
			.attr('stroke-linecap', 'round')
			.attr('stroke-linejoin', 'round')
			.attr('stroke', berlinBlue);
		pValue = Math.round(tTest(noWr, wr) * 10000) / 10000;
		svg.append('text')
			.attr('x', x(0.5))
			.attr('y', y(60))
			.attr('text-anchor', 'middle')
			.attr('alignment-baseline', 'middle')
			.attr('font-size', annotationFontSize)
			.attr('fill', annotationColor)
			.text('p = ' + pValue);
	}, 300);

	// Add the x and y axes, together with their labels.
	var xAxisTickValues = [0.25, 0.75];
	svg.append('g')
		.attr("transform", "translate(0," + height + ")")
		.attr('class', 'axis-no-line')
		.call(d3.axisBottom(x)
				.tickValues(xAxisTickValues)
				.tickFormat(function(d) {
					return d === 0.25 ? 'non-WR run' : 'WR run';
				}));
	var yAxisTickValues = [];
	for (var i = -4; i < 5; i++) {
		yAxisTickValues.push(i * 60);
	}
	svg.append('g')
		.attr('class', 'axis')
		.call(d3.axisLeft(y)
				.tickValues(yAxisTickValues)
				.tickFormat(function(d) {
					var sign = d < 0 ? '-' : d === 0 ? '' : '+';
					d = Math.abs(d);
					var minutes = Math.floor(d / 60);
					minutes = '0' + minutes;
					var seconds = d % 60;
					if (seconds === 0) {
						seconds = '00';
					}
					return sign + minutes + ':' + seconds;
				}));
	svg.append('text')
		.attr('x', x(0.05))
		.attr('y', y(4 * 60))
		.attr('text-anchor', 'start')
		.attr('alignment-baseline', 'hanging')
		.attr('font-size', axisLabelFontSize)
		.attr('fill', axisLabelColor)
		.text('split difference (min:sec)');
});
