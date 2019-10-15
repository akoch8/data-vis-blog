function measureLength(text) {
	var ruler = $('#ruler');
	ruler.text(text);
	return ruler.outerWidth();
}

// Inspiration count barplot
d3.tsv('inspirationCount.txt', function(error, data) {
	if (error) throw error;
	
	var margin = {top: 20, left: 200, bottom: 100, right: 50};
	var width = $(window).height() - margin.left - margin.right;
	var barHeight = 8;
	var barSep = 8;
	var height = (barHeight + 2 * barSep) * data.length - margin.top - margin.bottom;
	var svg = d3.select('.inspiration-count')
		.append('svg')
		.attr('width', width + margin.left + margin.right)
		.attr('height', height + margin.top + margin.bottom)
		.append('g')
		.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
	var x = d3.scaleLinear()
		.domain([0, 21])
		.range([0, width]);
	var y = d3.scaleLinear()
		.domain([0, data.length])
		.range([0, height]);
	var color = d3.scaleLinear()
		.domain([0, 21])
		.range(['#d1eeea', '#2a5674']);
	svg.selectAll('bar')
		.data(data)
		.enter()
		.append('rect')
			.attr('x', x(0))
			.attr('y', function(d) { return y(+d.rank); })
			.attr('width', function(d) { return x(+d.count); })
			.attr('height', barHeight)
			.attr('fill', function(d) { return color(+d.count); });
	
	// Add the names.
	svg.selectAll('bar')
		.data(data)
		.enter()
		.append('text')
			.attr('x', -10)
			.attr('y', function(d) { return y(+d.rank) + barHeight / 2; })
			.attr('class', 'barplot-name')
			.text(function(d) {
				var name = d.name;
				if (name.length > 23) {
					name = name.substr(0, 23) + '...';
				}
				if (+d.rank === 1) {
					name = name + ' 🥇';
				}
				if (+d.rank === 2) {
					name = name + ' 🥈';
				}
				if (+d.rank === 3) {
					name = name + ' 🥉';
				}
				return name;
			})
			.on('click', function(d) {
				twitterURL = 'https://twitter.com/' + d.twitter.replace('@', '');
				if (twitterURL) window.open(twitterURL);
			});
	
	// Add the count values.
	svg.selectAll('bar')
		.data(data)
		.enter()
		.append('text')
			.attr('x', function(d) { return x(+d.count) + 10; })
			.attr('y', function(d) { return y(+d.rank) + barHeight / 2; })
			.attr('text-anchor', 'start')
			.attr('alignment-baseline', 'middle')
			.attr('fill', '#3f3f3f')
			.text(function(d) { return d.count; });

	// Add the rank.
	for (var i = 1; i <= (data.length + 1); i++) {
		if (i === 1 || i % 10 === 0) {
			var yPos = y(i) + barHeight / 2;
			var rankWidth = measureLength(i);
			var nameWidth = measureLength(data[i - 1].name);
			if (i === 1) nameWidth += 20; // Add some space for the medal emoji.
			svg.append('text')
				.attr('x', -margin.left + 10)
				.attr('y', yPos)
				.attr('class', 'barplot-rank')
				.text(i);
			svg.append('line')
				.attr('x1', -margin.left + 10 + rankWidth + 5)
				.attr('x2', -10 - nameWidth - 5)
				.attr('y1', yPos)
				.attr('y2', yPos)
				.attr('class', 'barplot-rank-line');
		}
	}
});
$('button.show-more-less.inspiration').on('click', function() {
	$('.inspiration-count').toggleClass('show-all');
	$(this).closest('.inset-shadow-bottom').toggleClass('no-shadow');
	$(this).closest('.inset-shadow-bottom').find('.show-more-less').toggleClass('hidden');
});

// Luminary count barplot
d3.tsv('luminaryCount.txt', function(error, data) {
	if (error) throw error;
	
	var margin = {top: 20, left: 200, bottom: 100, right: 50};
	var width = $(window).height() - margin.left - margin.right;
	var barHeight = 8;
	var barSep = 8;
	var height = (barHeight + 2 * barSep) * data.length - margin.top - margin.bottom;
	var svg = d3.select('.luminary-count')
		.append('svg')
		.attr('width', width + margin.left + margin.right)
		.attr('height', height + margin.top + margin.bottom)
		.append('g')
		.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
	var x = d3.scaleLinear()
		.domain([0, 21])
		.range([0, width]);
	var y = d3.scaleLinear()
		.domain([0, data.length])
		.range([0, height]);
	var color = d3.scaleLinear()
		.domain([0, 21])
		.range(['#d1eeea', '#2a5674']);
	svg.selectAll('bar')
		.data(data)
		.enter()
		.append('rect')
			.attr('x', x(0))
			.attr('y', function(d) { return y(+d.rank); })
			.attr('width', function(d) { return x(+d.count); })
			.attr('height', barHeight)
			.attr('fill', function(d) { return color(+d.count); });
	
	// Add the names.
	svg.selectAll('bar')
		.data(data)
		.enter()
		.append('text')
			.attr('x', -10)
			.attr('y', function(d) { return y(+d.rank) + barHeight / 2; })
			.attr('class', 'barplot-name')
			.text(function(d) {
				var name = d.name;
				if (name.length > 23) {
					name = name.substr(0, 23) + '...';
				}
				if (+d.rank === 1) {
					name = name + ' 🥇';
				}
				if (+d.rank === 2) {
					name = name + ' 🥈';
				}
				if (+d.rank === 3) {
					name = name + ' 🥉';
				}
				return name;
			})
			.on('click', function(d) {
				twitterURL = 'https://twitter.com/' + d.twitter.replace('@', '');
				if (twitterURL) window.open(twitterURL);
			});
	
	// Add the count values.
	svg.selectAll('bar')
		.data(data)
		.enter()
		.append('text')
			.attr('x', function(d) { return x(+d.count) + 10; })
			.attr('y', function(d) { return y(+d.rank) + barHeight / 2; })
			.attr('text-anchor', 'start')
			.attr('alignment-baseline', 'middle')
			.attr('fill', '#3f3f3f')
			.text(function(d) { return d.count; });

	// Add the rank.
	for (var i = 1; i <= (data.length + 1); i++) {
		if (i === 1 || i % 10 === 0) {
			var yPos = y(i) + barHeight / 2;
			var rankWidth = measureLength(i);
			var nameWidth = measureLength(data[i - 1].name);
			if (i === 1) nameWidth += 20; // Add some space for the medal emoji.
			svg.append('text')
				.attr('x', -margin.left + 10)
				.attr('y', yPos)
				.attr('class', 'barplot-rank')
				.text(i);
			svg.append('line')
				.attr('x1', -margin.left + 10 + rankWidth + 5)
				.attr('x2', -10 - nameWidth - 5)
				.attr('y1', yPos)
				.attr('y2', yPos)
				.attr('class', 'barplot-rank-line');
		}
	}
});
$('button.show-more-less.luminary').on('click', function() {
	$('.luminary-count').toggleClass('show-all');
	$(this).closest('.inset-shadow-bottom').toggleClass('no-shadow');
	$(this).closest('.inset-shadow-bottom').find('.show-more-less').toggleClass('hidden');
});

// Inspiration network graph
d3.json("inspirationNetwork.json", function(error, graph) {
	if (error) throw error;

	var height = $(window).height();
	var width = height;
	var linkColor = 'rgba(200, 200, 200, 0.75)';
	var selectedColor = '#ffe241';
	var svg = d3.select('#network-graph')
		.append('svg')
		.attr('width', width)
		.attr('height', height)
		.call(d3.zoom().on('zoom', function() {
			svg.attr('transform', d3.event.transform);
		}))
		.append('g');
	//var colorGroup = d3.scaleOrdinal(d3.schemeCategory20);
	var color = d3.scaleLinear()
		.domain([0, 21])
		.range(['#d1eeea', '#2a5674']);
	var simulation = d3.forceSimulation()
		.force("link", d3.forceLink().id(function(d) { return d.id; }).distance(10))
		.force("charge", d3.forceManyBody().strength(-50).distanceMax(120))
		.force("center", d3.forceCenter(width / 2, height / 2));
	var link = svg.append("g")
		.attr("class", "links")
		.selectAll("line")
		.data(graph.links)
		.enter().append("line")
		.attr("stroke", linkColor)
		.attr("stroke-width", 0.5);
	var node = svg.append("g")
		.attr("class", "nodes")
		.selectAll("g")
		.data(graph.nodes)
		.enter().append("g");
	var circles = node.append("circle")
		.attr("r", function(d) { return d.inspiration_count / 2 + 3; })
		//.attr("r", 3)
		//.attr("fill", function(d) { return colorGroup(d.group); })
		.attr("fill", function(d) { return color(+d.inspiration_count); })
		.attr('stroke', '#ffffff')
		.attr('stroke-width', 1)
		//.call(d3.drag()
		//	.on("start", dragstarted)
		//	.on("drag", dragged)
		//	.on("end", dragended))
		.on('mouseover', function(d) {
			$('.person-name').remove();
			$('person-name-linked').remove();
			circles.style('fill', function(o) {
				//return neighboring(d, o) || neighboring(o, d) ? selectedColor : color(+o.inspiration_count);
				if (d === o) {
					return selectedColor;
				} else if (neighboring(d, o) || neighboring(o, d)) {
					// Is d the source or the target?
					var dIsSource = graph.links.some(function(l) {
						return (l.source.id === d.id && l.target.id === o.id);
					});
					if (dIsSource) {
						return '#d95f02';
					} else {
						return '#7570b3';
					}
				}
			});
			link.style('stroke', function(o) {
				return o.source === d || o.target === d ? '#1f1f1f' : linkColor;
			});
			svg.append('text')
				.attr('x', d.x + d3.select(this).attr('r') / 2 + 3)
				.attr('y', d.y - d3.select(this).attr('r') / 2 - 20)
				.attr('class', 'person-name')
				.text(d.name);
			svg.append('text')
				.attr('x', d.x + d3.select(this).attr('r') / 2)
				.attr('y', d.y - d3.select(this).attr('r') / 2 - 4)
				.attr('class', 'person-name person-twitter')
				.text(d.twitter);
		})
		.on('mouseout', function() {
			$('.person-name').remove();
			$('.person-name-linked').remove();
			circles.style('fill', function(o) { return color(+o.inspiration_count); });
			link.style('stroke', linkColor);
			//d3.select(this).attr('fill', function(d) { return colorGroup(d.group); });
		})
		.on('click', function(d) {
			twitterURL = 'https://twitter.com/' + d.twitter.replace('@', '');
			if (twitterURL) window.open(twitterURL);
		});
	simulation
		.nodes(graph.nodes)
		.on("tick", ticked);
	simulation.force("link")
		.links(graph.links);

	function ticked() {
		link
			.attr("x1", function(d) { return d.source.x; })
			.attr("y1", function(d) { return d.source.y; })
			.attr("x2", function(d) { return d.target.x; })
			.attr("y2", function(d) { return d.target.y; });
		node
			.attr("transform", function(d) {
				return "translate(" + d.x + "," + d.y + ")";
			});
	}

	function neighboring(a, b) {
		if (a === b) {
			return true;
		} else {
			return graph.links.some(function(d) {
				return (d.source === a && d.target === b) || (d.source === b && d.target === a);
			});
		}
	}
});

/* Graph node drag functionality
function dragstarted(d) {
	if (!d3.event.active) simulation.alphaTarget(0.3).restart();
	d.fx = d.x;
	d.fy = d.y;
}

function dragged(d) {
	d.fx = d3.event.x;
	d.fy = d3.event.y;
}

function dragended(d) {
	if (!d3.event.active) simulation.alphaTarget(0);
	d.fx = null;
	d.fy = null;
}*/
