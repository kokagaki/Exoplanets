/**
 * Created by bencmbrook on 11/27/16.
 */
CloseUp = function(_parentElement, _parentData){
    this.parentElement = _parentElement;
    this.parentData = _parentData;

    this.initVis();
};

var formatDate = d3.time.format("%Y");

/*
 * Initialize visualization (static content; e.g. SVG area, axes, brush component)
 */
CloseUp.prototype.initVis = function () {
    var vis = this;

    // SVG drawing area
    vis.margin = {top: 25, right: 40, bottom: 60, left: 60};

    vis.width = vis.parentElement.width();
    vis.height = vis.parentElement.height();

    // Set up canvas and WebGL renderer
    vis.scene = new THREE.Scene();
    vis.camera = new THREE.PerspectiveCamera( 75, vis.width/vis.height, 0.1, 1000 );
    vis.renderer = new THREE.WebGLRenderer();
    vis.renderer.setSize( vis.width, vis.height );
    $(vis.parentElement.selector).append( vis.renderer.domElement );

    // Add Sphere
    var geometry  = new THREE.SphereGeometry(0.5, 32, 32);
    vis.material  = new THREE.MeshPhongMaterial();
    vis.earthMesh = new THREE.Mesh(geometry, vis.material);
    vis.scene.add(vis.earthMesh);

    // Add light
    var light = new THREE.DirectionalLight( 0xffffff );
    light.position.set( 1, 1, 2 ).normalize();
    vis.scene.add(light);

    // Add skin
    vis.material.map = THREE.ImageUtils.loadTexture('img/skins/Planet_2_d.png');

    vis.camera.position.z = 1;


    var render = function () {
      requestAnimationFrame( render );

      vis.earthMesh.rotation.y  += 1/32 * 0.1;

      vis.renderer.render(vis.scene, vis.camera);

    };

    render();

    // Initialize data
    vis.loadData();
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

CloseUp.prototype.updateVisualization = function() {
    var vis = this;


};

CloseUp.prototype.updateSelection = function(selection) {
  var vis = this;
  console.log(selection);
  $("#planetname").text( selection.key );
  $("#orbrad").text("Planetary Mass: " + selection.radius + "AU");
  $("#radius").text("Planetary Radius: ");
  $("#period").text("Orbital Period: " + Math.round(selection.period) + " days");
  $("#orbrad").text("Orbital Radius: ");
  vis.material.map = THREE.ImageUtils.loadTexture('img/skins/Planet_Wight_1600.jpg');
};
