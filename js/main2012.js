var widthj = 960,
    heightj = 500,
    radiusj = Math.min((widthj - 50, heightj - 50)) / 2;

var colorj = d3.scale.category20();

var arcj = d3.svg.arc()
    .outerRadius(radiusj - 10)
    .innerRadius(0);

var labelArcj = d3.svg.arc()
    .outerRadius(radiusj + 15)
    .innerRadius(radiusj + 15);

var labelArcj2 = d3.svg.arc()
    .outerRadius(radiusj - 80)
    .innerRadius(radiusj - 80);

var piej = d3.layout.pie()
    .value(function(d) { return d.Firms; });

var svgj = d3.select("#pieChart").append("svg")
    .attr("width", widthj)
    .attr("height", heightj)
    .append("g")
    .attr("transform", "translate(" + widthj / 2 + "," + heightj / 2 + ")");

loadDataJ();

function loadDataJ() {
    d3.csv("data/Industry2012.csv", function(error, data) {
        if (error) throw error;

        var totalFirms = d3.sum(data.map(function(d) {
            return d.Firms;
        }));


        svgj.selectAll(".arc").remove();
        var g = svgj.selectAll(".arc")
            .data(piej(data));

        //enter
        g.enter().append("g")
            .transition()
            .duration(200)
            .attr("class", "arc");

        //update
        g.append("path")
            .attr("d", arcj)
            .transition()
            .duration(200)
            .style("fill", function(d) {
                return colorj(d.data.Industry);
            })

        g.append("text")
            .attr("class", "pieText")
            .transition()
            .duration(1000)
            .attr("transform", function(d) {
                return "translate(" + labelArcj2.centroid(d) + ")";
            })
            .attr("dy", ".35em")
            .text(function(d) {
                var percent = Math.round(1000 * d.data.Firms / totalFirms) / 10;
                if (percent > 4.0) {
                    return Math.round(1000 * d.data.Firms / totalFirms) / 10 + " %";
                }

            });

        g.append("text")
            .attr("class", "pieText")
            .transition()
            .duration(1000)
            .attr("transform", function(d) {
                return "translate(" + labelArcj.centroid(d) + ")";
            })
            .attr("dy", ".35em")
            .text(function(d) {
                var percent = Math.round(1000 * d.data.Firms / totalFirms) / 10;
                if (percent > 4.0) {
                    return d.data.Industry;
                }
            });

        //Exit
        g.exit()
            .remove();

        function type(d) {
            d.Firms = +d.Firms;
            return d;
        }

        var tooltip = d3.select("#pieChart")            // NEW
            .append('div')                             // NEW
            .attr('class', 'my-tooltip');                 // NEW

        tooltip.append('div')                        // NEW
            .attr('class', 'Industry');                   // NEW

        tooltip.append('div')                        // NEW
            .attr('class', 'Firms');                   // NEW

        tooltip.append('div')                        // NEW
            .attr('class', 'percent');

        g.on('mouseover', function(d) {
            var total = d3.sum(data.map(function(d) {
                return d.Firms;
            }));
            var percent = Math.round(1000 * d.data.Firms / total) / 10;
            tooltip.select('.Industry').html(d.data.Industry);
            tooltip.select('.Firms').html(d.data.Firms);
            tooltip.select('.percent').html(percent + '%');
            tooltip.style('display', 'block');
        });
        g.on('mouseout', function() {
            tooltip.style('display', 'none');
        });

        g.on('mousemove', function(d) {
            tooltip.style('top', (d3.event.layerY + 10) + 'px')
                .style('left', (d3.event.layerX + 10) + 'px');
        });


    });

}


function updateVisualizationj() {

    var criteriaChosen = d3.select("#criteria").property("value");

    var yearChosen = d3.select("#year-pie").property("value");

    d3.csv("data/" + criteriaChosen + yearChosen + ".csv", function(error, data) {
        console.log(criteriaChosen + yearChosen);
        if (error) throw error;


            var totalFirms = d3.sum(data.map(function(d) {
                return d.Firms;
            }));

            svgj.selectAll(".arc").remove();
            var g = svgj.selectAll(".arc")
                .data(piej(data));

            //enter
            g.enter().append("g")
                .transition()
                .duration(200)
                .attr("class", "arc");

            //update
            g.append("path")
                .transition()
                .duration(200)
                .attr("d", arcj)
                .style("fill", function(d) {
                    return colorj(d.data[criteriaChosen]);
                })

        g.append("text")
            .transition()
            .duration(1000)
            .attr("transform", function(d) {
                return "translate(" + labelArcj2.centroid(d) + ")";
            })
            .attr("dy", ".35em")
            .text(function(d) {
                var percent = Math.round(1000 * d.data.Firms / totalFirms) / 10;
                if (percent > 4.0) {
                    return Math.round(1000 * d.data.Firms / totalFirms) / 10 + " %";
                }

            });

        g.append("text")
            .transition()
            .duration(1000)
            .attr("transform", function(d) {
                return "translate(" + labelArcj.centroid(d) + ")";
            })
            .attr("dy", ".35em")
            .text(function(d) {
                var percent = Math.round(1000 * d.data.Firms / totalFirms) / 10;
                if (percent > 4.0) {
                    return d.data[criteriaChosen];
                }
            });


            //Exit
            g.exit()
                .remove();

        function type(d) {
            d.Firms = +d.Firms;
            return d;
        }

        var tooltip2 = d3.select("#pieChart")            // NEW
            .append('div')                             // NEW
            .attr('class', 'my-tooltip');                 // NEW

        tooltip2.append('div')                        // NEW
            .attr('class', 'Industry');                   // NEW

        tooltip2.append('div')                        // NEW
            .attr('class', 'Firms');                   // NEW

        tooltip2.append('div')                        // NEW
            .attr('class', 'percent');

        g.on('mouseover', function(d) {
            var total = d3.sum(data.map(function(d) {
                return d.Firms;
            }));
            var percent = Math.round(1000 * d.data.Firms / total) / 10;
            tooltip2.select('.Industry').html(d.data[criteriaChosen]);
            tooltip2.select('.Firms').html(d.data.Firms);
            tooltip2.select('.percent').html(percent + '%');
            tooltip2.style('display', 'block');
        });
        g.on('mouseout', function() {
            tooltip2.style('display', 'none');
        });

        g.on('mousemove', function(d) {
            tooltip2.style('top', (d3.event.layerY + 10) + 'px')
                .style('left', (d3.event.layerX + 10) + 'px');
        });


    });

}

