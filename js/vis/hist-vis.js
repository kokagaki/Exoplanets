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

    // x-axis
    vis.xAxis = d3.svg.axis()
        .scale(vis.xScale)
        .orient("bottom");

    // y-axis
    vis.yAxis = d3.svg.axis()
        .scale(vis.yScale)
        .orient("left");


    vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.height + ")");

    vis.svg.append("g")
        .attr("class", "y-axis axis")
        .attr("transform", "translate(0,0)");


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

    vis.xCategory = d3.select("#scat-xCategory").property("value");
    vis.yCategory = d3.select("#scat-yCategory").property("value");

    console.log(vis.xCategory);
    console.log(vis.yCategory);

    // get data specific to category
    vis.catData = vis.parentData.map(function(d){

        var xRaw = +d[vis.xCategory];
        var yRaw = +d[vis.yCategory];

        var xConverted;
        var yConverted;

        // convert to appropriate units
        if (vis.xCategory == "PlanetaryMassJpt") {
            // earth masses
            xConverted = xRaw * 317.8;
        } else if (vis.xCategory == "RadiusJpt") {
            // earth radii
            xConverted = xRaw * 11.209;
        } else {
            xConverted = xRaw;
        }

        // convert to appropriate units
        if (vis.xCategory == "PlanetaryMassJpt") {
            // earth masses
            yConverted = yRaw * 317.8;
        } else if (vis.xCategory == "RadiusJpt") {
            // earth radii
            yConverted = yRaw * 11.209;
        } else {
            yConverted = yRaw;
        }

        var converted = {x : xConverted, y : yConverted};

        return converted;
    });
    //
    // if (vis.category == "PlanetaryMassJpt") {
    //     // earth masses
    //     $("#hist-x-label").text("Planetary Mass (in Earth Masses)");
    // } else if (vis.category == "RadiusJpt") {
    //     // earth radii
    //     $("#hist-x-label").text("Planetary Radius (in Earth Radii)");
    // } else if (vis.category == "PeriodDays") {
    //     // earth radii
    //     $("#hist-x-label").text("Orbital Period (Days)");
    // } else {
    //     // earth radii
    //     $("#hist-x-label").text("Orbital Radius (AU)");
    // }

    vis.nonNullData = vis.catData.filter(function(d){
        return (d.x != 0 && d.y != 0);
    });

    vis.displayData = vis.nonNullData;

    vis.updateVisualization();
};

HistVis.prototype.updateVisualization = function () {

    var vis = this;

    vis.xScale.domain([0, d3.max(vis.displayData, function(d){
        return d.x;
    })]);

    vis.yScale.domain([0,d3.max(vis.displayData, function (d){
        return d.y;
    })]);

    vis.svg.selectAll(".dot")
        .data(vis.displayData)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("fill","rgb(185,185,185)")
        .attr("r", 3.5)
        .attr("cx", function(d){
            return vis.xScale(d.x)})
        .attr("cy", function(d){return vis.yScale(d.y)});

    vis.svg.select(".x-axis")
        .attr("transform", "translate(0," + vis.height + ")")
        .call(vis.xAxis);

    vis.svg.select(".x-axis")
        .append("text")
        .attr("x", vis.width / 2 - 10)
        .attr("y", 50)
        .text(convertCategory(vis.xCategory));

    vis.svg.select(".y-axis")
        .attr("transform", "translate(0,0)")
        .call(vis.yAxis);

    vis.svg.select(".y-axis")
        .append("text")
        .attr("y", -50)
        .attr("x", -200)
        .text(convertCategory(vis.yCategory))
        .attr("transform", "rotate(-90)")

};

function convertCategory(category) {
    if (category == "PlanetaryMassJpt") {
        // earth masses
        return "Mass (in Earth Masses)";
    } else if (category == "RadiusJpt") {
        // earth radii
        return "Radius (in Earth Radii)";
    } else if (category == "PeriodDays") {
        return "Orbital Period (Days";
    } else {
        return "Orbital Radius (AU)";
    }
};


// OLD HISTOGRAM CODE

// vis.bins = d3.layout.histogram()
//     .bins(vis.xScale.ticks(30))
//     (vis.displayData);
//
// vis.yScale.domain([0, d3.max(vis.bins, function(d) { return d.length; })]);

// .on("mouseover", function(d) {
//     tooltip.transition()
//         .duration(200)
//         .style("opacity", .9);
//     tooltip.html(d["Cereal Name"] + "<br/> (" + xValue(d)
//         + ", " + yValue(d) + ")")
//         .style("left", (d3.event.pageX + 5) + "px")
//         .style("top", (d3.event.pageY - 28) + "px");
// })
// .on("mouseout", function(d) {
//     tooltip.transition()
//         .duration(500)
//         .style("opacity", 0);
// });


// vis.bar = vis.svg.selectAll(".bar")
//     .data(vis.bins, function(d){ return d.x; });
//
// vis.bar
//     .enter().append("g")
//     .attr("class", "bar")
//     // .attr("transform", function(d) { return "translate(" + vis.xScale(d.x) + "," + vis.yScale(d.y) + ")"; });
//
// vis.bar
//     .attr("transform", function(d) { return "translate(" + vis.xScale(d.x) + "," + vis.yScale(d.y) + ")"; })
//     .transition()
//     .duration(1000)
//     .attr("height", function(d) { return vis.height - vis.yScale(d.y); });
//
// vis.bar.exit().remove();
//
// vis.bar.append("rect")
//     .attr("x", 1)
//     .attr("width", vis.xScale(vis.bins[0].dx - vis.xScale(0)) - 1)
//     .attr("height", function(d) { return vis.height - vis.yScale(d.length); })
//     .attr("fill", "rgb(200,200,200)");
