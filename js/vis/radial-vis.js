/**
 * Created by mattdeveney on 11/11/16.
 */
/*
 * AreaChart - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the area chart
 * @param _data						-- the dataset 'household characteristics'
 */

var tip;


RadialChart = function(_parentElement, _data, _planetSelect){
    this.parentElement = _parentElement;
    this.data = _data;
    this.planetSelect = _planetSelect;
    this.nestedData = [];
    this.displayData = [];
    this.tempColors = ['#fee5d9','#fcae91','#fb6a4a','#de2d26','#a50f15'];
    // this.orbitRunning;

    this.initVis();
};


/*
 * Initialize visualization (static content; e.g. SVG area, axes, brush component)
 */

RadialChart.prototype.initVis = function(){
    var vis = this;

    // * TO-DO *
    vis.margin = { top: 0, right: 25, bottom: 0, left: 25};

    vis.width = 600 - vis.margin.left - vis.margin.right;
    vis.height = 600 - vis.margin.top - vis.margin.bottom;

    vis.svg = d3.select(vis.parentElement.selector).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("class","viz")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");
    //
    // vis.orbitScale = d3.scale.linear().domain([1, 3]).range([3.8, 1.5]).clamp(true);

    vis.orbitScale = d3.scale.linear()
        .range([0,vis.height/2]);

    vis.radiusScale = d3.scale.linear()
        .range([2,15]);

    vis.orbit = d3.layout.orbit()
        .size([vis.width, vis.height])
        .mode("solar");

    vis.legend = vis.svg.selectAll("g.legend")
        .data(vis.tempColors)
        .enter().append("g")
        .attr("transform","translate(0,-250)")
        .attr("class", "legend");

    vis.ls_w = 20;
    vis.ls_h = 20;

    vis.legend.append("rect")
        .attr("x", 0)
        .attr("y", function(d, i){ return vis.height - (i*vis.ls_h) - 2*vis.ls_h;})
        .attr("width", vis.ls_w)
        .attr("height", vis.ls_h)
        .style("fill", function(d, i) {
            return vis.tempColors[i]; })
        .style("opacity", 0.8);

    vis.legend.append("text")
        .attr("x", 30)
        .attr("y", function(d, i){ return vis.height - (i*vis.ls_h) - vis.ls_h - 4;})
        .text(function(d, i){
            if (i === 0) {
                return "Cooler";
            } else if (i == vis.tempColors.length - 1) {
                return "Hotter";
            } else {
                return "";
            }
        })
        .attr("fill", "white");



    // 5) LISTEN TO THE 'TICK' EVENT AND UPDATE THE X/Y COORDINATES FOR ALL ELEMENTS
    vis.wrangleData();

};


/*
 * Data wrangling
 */

RadialChart.prototype.wrangleData = function(){
    var vis = this;

    // nested data format for orbit layout
    vis.data.forEach(function(d){

        var json = {
            "key" : d.PlanetIdentifier,
            "orbit" : d.SemiMajorAxisAU,
            "period" : d.PeriodDays,
            "radius" : d.RadiusJpt,
            "temp" : d.SurfaceTempK
        };

        vis.nestedData.push(json);

    });

    var habitablePlanets = vis.getHabitablePlanets();

    vis.displayData = habitablePlanets;

    vis.displayData.sort(function(a,b){
        return a.orbit - b.orbit;
    });

    // Update the visualization
    vis.updateVis();
};


/*
 * The drawing function
 */

RadialChart.prototype.updateVis = function(){

    var vis = this;

    vis.generateTooltips();

    vis.orbitScale
        .domain([0,d3.max(vis.displayData, function(d){
            return d.orbit;
        })]);

    vis.radiusScale
        .domain([0,d3.max(vis.displayData, function(d){
            return d.radius;
        })]);

    vis.orbit
        .children(function(d){
            return d.values;
        })
        .nodes(vis.displayData)
        .orbitSize(function(d) {
            return vis.orbitScale( d.radius);
          })
        .revolution(function(d) {
            return 1 / d.period;
          })
        .speed(15);

    vis.svg
        .append("g")
        .selectAll("g.node").data(vis.orbit.nodes())
        .enter()
        .append("g")
        .attr("class", "node")
        .attr("id", function(d){
            return d.key;
        })
        .attr("transform", function(d) { return "translate(" +d.x +"," + d.y+")"; });

    d3.selectAll("g.node")
        .append("circle")
        .attr("r", function(d) {
          return d.key == "root"? 10 : vis.radiusScale(d.radius);
        })
        .style("fill", function(d) {
          return d.key == "root"? "yellow" : vis.tempColorScale(d);
        })
        .on("mouseover", function(d) {
          $(vis.planetSelect).trigger("selectionChanged", d);
          return tip.show;
        })
        // .on("mouseover",tip.show)
        .on("mouseout", tip.hide);

    d3.select("g.viz")
        .selectAll("circle.ring")
        .data(vis.orbit.orbitalRings())
        .enter()
        .insert("circle", "g")
        .attr("class", "ring")
        .attr("r", function(d) { return d.r; })
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });

    d3.select("g.viz")
        .selectAll("circle.ring")
        .data(vis.orbit.orbitalRings())
        .exit()
        .transition()
        .duration(500)
        .style("stroke-opacity", 0)
        .style("stroke-width", 3)
        .remove();

    d3.select("g.viz")
        .selectAll("circle.ring")
        .data(vis.orbit.orbitalRings())
        .enter()
        .insert("circle", "g")
        .attr("class", "ring");

    d3.selectAll("circle.ring")
        .attr("r", function(d) { return d.r; })
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });

    vis.orbit.on("tick", function() {
        d3.selectAll("g.node")
            .attr("transform", function(d) { return "translate(" +d.x +"," + d.y+")"; });

    });

    vis.orbit.start();
    vis.orbitRunning = true;



};

RadialChart.prototype.getHabitablePlanets = function(){

    var vis = this;

    // ID's of habitable planets
    var habitableIDs = [
        "Earth",
        "Alpha Centauri B c",
        "Gliese 667 C c",
        "Kepler-442 b",
        "Kepler-452 b",
        "Wolf 1061 c",
        "Kepler-1229 b",
        "Kapteyn b",
        "Kepler-62 f",
        'Kepler-186 f'
    ];

    var habitablePlanets = vis.nestedData.filter(function(d){

        var id = d.key;

        return (habitableIDs.indexOf(id) != -1);

    });

    return habitablePlanets;

};

RadialChart.prototype.generateTooltips = function() {

    var vis = this;

    vis.displayData.forEach(function () {

        tip = d3.tip()
            .attr("class", "d3-tip")
            .offset([-10,0])
            .html(function (d){
                return d.key == "root" ? "<p>Host Star</p>" : vis.tooltipString(d);
            });

    });

    vis.svg.call(tip);

};

RadialChart.prototype.tempColorScale = function(planet) {
    var vis = this;

    var maxTemp = d3.max(vis.displayData, function(d) {
        return d.temp;
    });

    var minTemp = d3.min(vis.displayData, function(d) {
        return d.temp;
    });

    // get difference between max temp and min temp and programmatically
    // calculate scale split
    diff = maxTemp - minTemp;
    split_size = parseFloat(diff) / parseFloat(vis.tempColors.length);

    if (planet.temp <= minTemp + split_size) {
        return vis.tempColors[0];
    } else if (planet.temp <= minTemp + 2 * split_size) {
        return vis.tempColors[1];
    } else if (planet.temp <= minTemp + 3 * split_size) {
        return vis.tempColors[2];
    } else if (planet.temp <= minTemp + 4 * split_size) {
        return vis.tempColors[3];
    } else {
        return vis.tempColors[4];
    }

};

// function to start and stop orbit based on current status
RadialChart.prototype.startStopVis = function() {

    var vis = this;

    if (vis.orbitRunning) {
        vis.orbit.stop();
        vis.orbitRunning = false;
    } else {
        vis.orbit.start();
        vis.orbitRunning = true;
    }

};

RadialChart.prototype.tooltipString = function(planet) {

    var string = "";

    // convert radiusJPT to KM
    radiusKM = (planet.radius * 69911).toFixed(0);

    string += "<p><b>" + planet.key + "</b></p>";
    string += "<p>Planet Radius: " + radiusKM + " km</p>";
    string += "<p>Surface Temp: " + planet.temp + " K</p>";
    string += "<p>Orbit Size: " + planet.orbit + " AU</p>";

    return string;


};
