drawNodes = function() {
	var width = 600,
		height = 300;
		
	this.tickN = 0; // Track the tick number.
	
	this.cfg = {"valueFormat": "fraction"};
	//this.cfg = {"valueFormat": "decimal"};
		
	this.nodeData = {
		"nodes" : [
			{"id": 0, "x": 200, "y": 200, "v": 10 },
			{"id": 1, "x": 250, "y": 50,  "v": 1  },
			{"id": 2, "x": 350, "y": 150, "v": 1  },
			{"id": 3, "x": 450, "y": 50,  "v": 1  },
			{"id": 4, "x": 500, "y": 200, "v": 1  }
		],
		"links": [
			{"source": 0, "target": 1},
			{"source": 1, "target": 2},
			{"source": 2, "target": 3},
			{"source": 3, "target": 4}
		],
		"edgeMap": []
	};
	
	// Use Fraction objects for v.
	this.nodeData.nodes.map ( function (n) {
		return n.v = (new Fraction(n.v));
	});
	
	// Get object references for the nodes.
	var thisDrawNodes = this;
	this.nodeData.links.forEach(function(link) {
		link.sNode = thisDrawNodes.nodeData.nodes[link.source];
		link.tNode = thisDrawNodes.nodeData.nodes[link.target];
	});
	

	// Create a 2-way edge map; nodeId -> targetNode.
	this.nodeData.edgeMap = [];
	this.nodeData.links.forEach(function(link) {
		console.log(link);
		if (thisDrawNodes.nodeData.edgeMap[link.source] === undefined) {
			console.log("init source");
			thisDrawNodes.nodeData.edgeMap[link.source] = [];
		}
		
		if (thisDrawNodes.nodeData.edgeMap[link.target] === undefined) {
			console.log("init target");
			thisDrawNodes.nodeData.edgeMap[link.target] = [];
		}
		
		thisDrawNodes.nodeData.edgeMap[link.source].push (thisDrawNodes.nodeData.nodes[link.target]);
		thisDrawNodes.nodeData.edgeMap[link.target].push (thisDrawNodes.nodeData.nodes[link.source]);
	});
	
	console.log(this.nodeData);
	console.log('-----');
	
	// Create the SVG canvas
	this.svg = d3.select("body")
		.append("svg")
		.attr("width", width)
		.attr("height", height);
		
	this.svg.transition()
      .duration(1000)
      .attr("opacity", 1);

	// Define the tree params.
	var tree = d3.layout.tree()
		.separation(function(a, b) { return a.parent === b.parent ? 1 : .5; })
		.size([height, width])
		
	var links = this.svg.selectAll("line")
		.data(this.nodeData.links)
		.enter().append("line")
		.style("stroke", "rgb(6,120,155)")
		.style("stroke-width", "2");
		
	links.attr("x1", function(d) { console.log(d); return d.sNode.x; })
        .attr("y1", function(d) { return d.sNode.y; })
        .attr("x2", function(d) { return d.tNode.x; })
        .attr("y2", function(d) { return d.tNode.y; });
		
	links.append("title")
		.text(function(d) { return d.label } );	
		
	var nodes = this.svg.selectAll("g.node")
		.data(this.nodeData.nodes)
		.enter().append("svg:g")
		.attr("class","node")
		.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
		
	nodes.append("svg:circle")
		.attr("r", this.nodeRadius)
		.style("stroke-width", "2")
		.style("stroke", "black")
		
	nodes.append("svg:text")
		.attr("class", "name")
		.text(function(d) { return d.v; })
		.on("tick", tick)
		
	tree.nodes(this.nodeData.nodes);
	tree.links(this.nodeData.links);
	

	this.tickCounter = $('<div id="tickCounter">');
	this.tickCounter.html("tick " + this.tickN);
	$('#tick').append(this.tickCounter);
}

drawNodes.prototype.tick = function () {
	var thisDrawNode = this;
	
	this.tickN += 1;
	this.tickCounter.html("tick " + this.tickN);
	
	this.nodeData.nodes.map ( function (n) {
		n.xferAmt = n.v.divide(thisDrawNode.nodeData.edgeMap[n.id].length);
		console.log(n.xferAmt);
		return n;
	});
	
	this.nodeData.nodes.map ( function (n) {
		var newV = thisDrawNode.nodeData.edgeMap[n.id].reduce (function (p, e) {
			var r = p.add(e.xferAmt);
			return r;
		}, new Fraction(1));
		
		n.v = newV.subtract(1);
		
		return n;
	});
	
	// Update.
	var nodes = this.svg.selectAll("g.node")
		.data(this.nodeData.nodes);
		
	nodes.selectAll("circle")	
		.attr("r", this.nodeRadius);
		
	nodes.selectAll("text")
		.text(function (d) {
			if (thisDrawNode.cfg.valueFormat == 'fraction') {
				return d.v;
			}
			return (d.v.numerator / d.v.denominator);
		});
}

drawNodes.prototype.nodeRadius = function (n) {
	return 20 + (2 * (n.v.numerator / n.v.denominator));
}
		

console.log('drawNodes.js loaded');
