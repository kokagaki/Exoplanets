/**
 * Created by bencmbrook on 11/27/16.
 */
CloseUp = function(_parentElement, _parentData){
    this.parentElement = _parentElement;
    this.parentData = _parentData;

    this.initVis();
};

/*
 * Initialize visualization (static content; e.g. SVG area, axes, brush component)
 */
CloseUp.prototype.initVis = function () {
    var vis = this;

    // SVG drawing area
    vis.margin = {top: 25, right: 40, bottom: 60, left: 60};

    vis.width = vis.parentElement.width() - vis.margin.left - vis.margin.right;
    vis.height = vis.parentElement.height() - vis.margin.top - vis.margin.bottom;

    // Set up canvas and WebGL renderer
    vis.scene = new THREE.Scene();
    vis.camera = new THREE.PerspectiveCamera( 75, vis.width/vis.height, 0.1, 1000 );
    vis.renderer = new THREE.WebGLRenderer();
    vis.renderer.setSize( vis.width, vis.height );
    $(vis.parentElement.selector).append( vis.renderer.domElement );

    // Add Sphere
    var geometry  = new THREE.SphereGeometry(0.5, 32, 32);
    var material  = new THREE.MeshPhongMaterial();
    vis.earthMesh = new THREE.Mesh(geometry, material);
    vis.scene.add(vis.earthMesh);

    // Add light
    var light = new THREE.DirectionalLight( 0xffffff );
    light.position.set( 1, 1, 2 ).normalize();
    vis.scene.add(light);

    // Add skin
    material.map = THREE.ImageUtils.loadTexture('img/skins/earthmap1k.jpg');

    vis.camera.position.z = 1;

    var render = function () {
      requestAnimationFrame( render );

      vis.earthMesh.rotation.y  += 1/32 * 0.1;

      vis.renderer.render(vis.scene, vis.camera);
    };

    render();

    // Initialize data
    // vis.loadData();

};

CloseUp.prototype.loadData = function () {
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

CloseUp.prototype.updateVisualization = function () {
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
