/**
 * Created by mattdeveney on 11/12/16.
 */

loadData();

var radialChart;
var timelineChart;

function loadData() {

    d3.csv("data/oec-modified.csv", function(data){

        data.forEach( function(d){

            d.SemiMajorAxisAU = +d.SemiMajorAxisAU;
            d.PeriodDays = +d.PeriodDays;
            d.RadiusJpt = +d.RadiusJpt;
            d.SurfaceTempK = +d.SurfaceTempK;
        });

        // first 100 planet objects
        radialChart = new RadialChart($("#radial-chart"), data);

        timelineChart = new TimelineVis($("#timeline-chart"),data);

        closeUp = new CloseUp($("#closeup-vis"),data);

        histVis = new HistVis($("#hist-vis"),data);

        var button = document.getElementById('updateButton');
        button.addEventListener('click', function () {
            timelineChart.updateVisualization();
        });

    });


}
