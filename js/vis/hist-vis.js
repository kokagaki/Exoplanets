/**
 * Created by mattdeveney on 11/27/16.
 */

HistVis = function(_parentElement, _parentData){
    this.parentElement = _parentElement;
    this.parentData = _parentData;
    this.displayData = [];

    this.initVis();
};


HistVis.prototype.initVis = function () {
    var vis = this;

    // SVG drawing area

    vis.margin = {top: 25, right: 40, bottom: 60, left: 60};

    vis.width = 600 - vis.margin.left - vis.margin.right;
    vis.height = 500 - vis.margin.top - vis.margin.bottom;

    vis.svg = d3.select(vis.parentElement.selector).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    // scales
    vis.xScale = d3.scale.linear()
        .rangeRound([0, vis.width]);

    vis.yScale = d3.scale.linear()
        .range([vis.height, 0]);

    //axis
    vis.xAxis = d3.svg.axis()
        .scale(vis.xScale)
        .orient("bottom");

    vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.height + ")");


//d3 tip
//     vis.tip = d3.tip()
//         .attr("class", "d3-tip")
//         .offset([-10, 0])
//         .html(function(d) {
//             return  "Planets Discovered in " + formatDate(d.key) + ": " + d.values;
//         });
//
//     vis.svg.call(vis.tip);

    //define clipping
    vis.svg.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", vis.width)
        .attr("height", vis.height);

    // Initialize data
    vis.wrangleData();

};

HistVis.prototype.wrangleData = function() {

    var vis = this;

    vis.category = d3.select("#hist-category").property("value");

    // get data specific to category
    vis.catData = vis.parentData.map(function(d){

        var raw = +d[vis.category];

        var converted;

        // convert to appropriate units
        if (vis.category == "PlanetaryMassJpt") {
            // earth masses
            converted = raw * 317.8;
        } else if (vis.category == "RadiusJpt") {
            // earth radii
            converted = raw * 11.209;
        } else if (vis.category == "PeriodDays") {
            // period in years
            converted = raw / 365.0;
        } else {
            converted = raw;
        }

        return converted;
    });

    if (vis.category == "PlanetaryMassJpt") {
        // earth masses
        $("#hist-x-label").text("Planetary Mass (in Earth Masses)");
    } else if (vis.category == "RadiusJpt") {
        // earth radii
        $("#hist-x-label").text("Planetary Radius (in Earth Radii)");
    } else if (vis.category == "PeriodDays") {
        // earth radii
        $("#hist-x-label").text("Orbital Period (Years)");
    } else {
        // earth radii
        $("#hist-x-label").text("Orbital Radius (AU)");
    }

    vis.nonNullData = vis.catData.filter(function(d){
        return (d !== 0 && d < 10000);
    });

    vis.displayData = vis.nonNullData;

    vis.updateVisualization();
};

HistVis.prototype.updateVisualization = function () {

    var vis = this;



    vis.xScale.domain([d3.min(vis.displayData),d3.max(vis.displayData)]);

    vis.bins = d3.layout.histogram()
        .bins(vis.xScale.ticks(30))
        (vis.displayData);

    vis.yScale.domain([0, d3.max(vis.bins, function(d) { return d.length; })]);

    console.log(vis.bins);


    vis.bar = vis.svg.selectAll(".bar")
        .data(vis.bins, function(d){ return d.x; });

    vis.bar
        .enter().append("g")
        .attr("class", "bar")
        .attr("transform", function(d) { return "translate(" + vis.xScale(d.x) + "," + vis.yScale(d.y) + ")"; });

    vis.bar
        .attr("transform", function(d) { return "translate(" + vis.xScale(d.x) + "," + vis.yScale(d.y) + ")"; })
        .transition()
        .duration(1000)
        .attr("height", function(d) { return vis.height - vis.yScale(d.y); });

    vis.bar.exit().remove();

    vis.bar.append("rect")
        .attr("x", 1)
        .attr("width", vis.xScale(vis.bins[0].dx - vis.xScale(0)) - 1)
        .attr("height", function(d) { return vis.height - vis.yScale(d.length); })
        .attr("fill", "rgb(200,200,200)");

    vis.svg.select(".x-axis")
        .attr("transform", "translate(0," + vis.height + ")")
        .call(vis.xAxis);


};
