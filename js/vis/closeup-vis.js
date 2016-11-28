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
            return d.PlanetIdentifier;
        })
        .rollup(function(values) {
            return values;
        })
        .entries(vis.parentData);


    // (2) Sort data by day
    vis.nestedData.sort(function (a,b) {
        return a.key-b.key;
    });

    // vis.data = vis.nestedData;

    vis.data = vis.getHabitablePlanets();

    // Draw the visualization for the first time
    vis.updateVisualization();
};

CloseUp.prototype.updateVisualization = function() {
    var vis = this;


};

CloseUp.prototype.updateSelection = function(selection) {
  var vis = this;

  var planetData;
  for (var i in vis.data) {
    if (vis.data[i].key == selection) {
      planetData = vis.data[i].values[0];
      break;
    }
  }
  console.log(vis.data);

  if (selection !== "root") {
    $("#planetname").text( selection );
    $('#temperature').text("Temperature: " + Math.round(planetData.SurfaceTempK - 273.15)  + "C");
    $("#mass").text("Planetary Mass: " + (planetData.PlanetaryMassJpt).toFixed(6) + " Jupiter masses");
    $("#radius").text("Planetary Radius: " + planetData.RadiusJpt + " Jupiter radii");
    $("#period").text("Orbital Period: " + Math.round(planetData.period) + " days");
    $("#orbrad").text("Orbital Radius: " + planetData.SemiMajorAxisAU + "AU");
    i = Math.round(Math.random() * 14);
    vis.material.map = THREE.ImageUtils.loadTexture('img/skins/'+selection+'.jpg');
  } else {
    $("#planetname").text( "Generic Host Star" );
  }
};

CloseUp.prototype.getHabitablePlanets = function(){

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
