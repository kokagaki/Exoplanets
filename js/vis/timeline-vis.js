/**
 * Created by kokagaki on 11/11/16.
 */
TimelineVis = function(_parentElement, _parentData){
    this.parentElement = _parentElement;
    this.parentData = _parentData;

    this.initVis();
};

// Date parser (https://github.com/mbostock/d3/wiki/Time-Formatting)
var formatDate = d3.time.format("%Y");

//slider
var dateSlider = document.getElementById('slider-area');
//var dateSlider = $("#slider-area");
dateSlideCreate();
/*
 * Initialize visualization (static content; e.g. SVG area, axes, brush component)
 */

TimelineVis.prototype.initVis = function () {
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
    vis.xScale = d3.time.scale()
        .range([0, vis.width]);
    vis.yScale = d3.scale.linear()
        .range([vis.height, 0]);

    //axis
    vis.xAxis = d3.svg.axis()
        .scale(vis.xScale)
        .tickFormat(d3.time.format("%Y"));
    vis.yAxis = d3.svg.axis()
        .scale(vis.yScale)
        .orient("left");


// planet data
    // vis.data;


//d3 tip
    vis.tip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-10, 0])
        .html(function(d) {
            return  "Planets Discovered in " + formatDate(d.key) + ": " + d.values;
        });

    vis.svg.call(vis.tip);

    //define clipping
    vis.svg.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", vis.width)
        .attr("height", vis.height);

    // Initialize data
    vis.loadData();

};

TimelineVis.prototype.loadData = function () {
    var vis = this;

    //nest data by year
    vis.nestedData = d3.nest()
        .key(function (d) {
            return d.DiscoveryYear;
        })
        .rollup(function (values) {
            return values.length;
        })
        .entries(vis.parentData);


    // parse date of nested data
    vis.nestedData.forEach(function (d) {
        d.key = formatDate.parse(d.key);
    });

    // (2) Sort data by day
    vis.nestedData.sort(function (a,b) {
        return a.key-b.key;
    });

    vis.data = vis.nestedData;

    // Draw the visualization for the first time
    vis.updateVisualization();
};

TimelineVis.prototype.updateVisualization = function () {
    var vis = this;

    //domain from slider
    //var sliderDomain =
    vis.xDomain = dateSlider.noUiSlider.get();

    //set domains of scale
    vis.xScale.domain(vis.xDomain);
    vis.yScale.domain([0, 1400]);

    //create line chart
    vis.line =  d3.svg.line()
        .x(function (d) { return vis.xScale(d.key); })
        .y(function (d) { return vis.yScale(d.values); })
        .interpolate("cardinal");

    //group for line
    vis.lineSvg = vis.svg.append("g");

    //append path
    vis.lineSvg.append("path")
        .attr("class", "line")
        .attr("fill","blue");

    //update line
    vis.svg.select(".line")
        .transition()
        .duration(800)
        .attr("d", vis.line(vis.data))
        .attr("clip-path", "url(#clip)");

    //draw axis
    vis.xAxisGroup = vis.svg.append("g")
        .attr("class", "x axis x-axis")
        .attr("transform", "translate(0," + vis.height + ")");

    vis.yAxisGroup = vis.svg.append("g")
        .attr("class", "axis y-axis");

    //update axis via class axis function
    vis.svg.select(".x-axis")
        .transition()                  //TRANSIITON
        .duration(800)
        .call(vis.xAxis);
    vis.svg.select(".y-axis")
        .transition()                  //TRANSIITON
        .duration(800)
        .call(vis.yAxis);


    //tooltip circle
    vis.tooltipCircle = vis.svg.selectAll("circle")
        .data(vis.data);

    //enter
    vis.tooltipCircle.enter()
        .append("circle")
        .attr("class", "tooltip-circle circle")
        .on('mouseover', vis.tip.show)
        .on('mouseout', vis.tip.hide)
        .attr("clip-path", "url(#clip)");

    //update
    vis.tooltipCircle.attr("r", 4)
        .transition()
        .duration(800)
        .attr("cx", function (d) {
            return vis.xScale(d.key);
        })
        .attr("cy", function (d) {
            return vis.yScale(d.values);
        });

    //exit
    vis.tooltipCircle.exit().remove();
};

function dateSlideCreate() {

    function timestamp(str){
        return new Date(str).getTime();
    }

    //create slider
    noUiSlider.create(dateSlider, {
        // Create two timestamps to define a range.
        range: {
            min: timestamp('1931'),
            max: timestamp('2017')
        },

        // Two more timestamps indicate the handle starting positions.
        start: [ timestamp('1930'), timestamp('2017') ],

    });

    var dateValues = [
        document.getElementById('event-start'),
        document.getElementById('event-end')
    ];

    dateSlider.noUiSlider.on('update', function( values, handle ) {
        dateValues[handle].innerHTML = formatDate(new Date(+values[handle]));
    });
}
