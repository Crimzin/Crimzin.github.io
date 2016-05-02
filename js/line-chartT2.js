/**
 * Created by tajaybongsa on 4/18/16.
 */
//var allData = [];

//inspiration from http://bl.ocks.org/mbostock/3884955


var margin = {top: 30, right: 200, bottom: 30, left: 100},
    width = 900 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;

// Parse the date / time
var parseDate = d3.time.format("%Y").parse;
var formatTime = d3.time.format("%Y");

// Set the ranges
var x = d3.time.scale()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var color = d3.scale.category10();

// Define the axes
var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");
    //.ticks(5);
    //.tickFormat(d3.time.format("%Y"));

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");
    //.ticks(12);

var line = d3.svg.line()
    //.interpolate("bundle")
    .x(function(d) { return x(d.Year); })
    .y(function(d) { return y(d.firms); });

// Define the div for the tooltip
var div = d3.select("#line-chart").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);


// Adds the svg canvas
var svg = d3.select("#line-chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

// Initialize data
loadData();

d3.select("#ranking-type")
    .on("change", function(){
        console.log("user selection changed.");
        loadData();
    });

var data;


 //Get the data
function loadData() {
    var criteriaChosen = d3.select("#ranking-type").property("value");
    console.log("data:" + criteriaChosen);
    d3.csv("data/" + criteriaChosen + ".csv", function (error, data) {
        if (error) throw error;
        if (!error) {
            console.log(data);
            //data.forEach(function (d) {
            //    d.Year = parseDate(d.Year);
            //    d.Female = +d.Female;
            //    d.Male = +d.Male;
            //
            //    d.White = +d.White;
            //    d.Asian = +d.Asian;
            //    d.Black_or_African_American =+d.Black_or_African_American;
            //    d.American_Indian_and_Alaska_Native=+d.American_Indian_and_Alaska_Native;
            //    d.Native_Hawaiian_and_Other_Pacific_Islander=+d.Native_Hawaiian_and_Other_Pacific_Islander;
            //
            //    d.Hispanic=+d.Hispanic;
            //    d.Non_Hispanic=+d.Non_Hispanic;
            //});
        }

        color.domain(d3.keys(data[0]).filter(function (key) {
            return key !== "Year";
        }));

        data.forEach(function (d) {
            d.Year = parseDate(d.Year);
            d.Female = +d.Female;
            d.Male = +d.Male;
            d.White = +d.White;
            d.Asian = +d.Asian;
            d.Black_or_African_American =+d.Black_or_African_American;
            d.American_Indian_and_Alaska_Native=+d.American_Indian_and_Alaska_Native;
            d.Native_Hawaiian_and_Other_Pacific_Islander=+d.Native_Hawaiian_and_Other_Pacific_Islander;
            d.Hispanic=+d.Hispanic;
            d.Non_Hispanic=+d.Non_Hispanic;

        });

        var firms = color.domain().map(function (name) {
            return {
                name: name,
                values: data.map(function (d) {
                    return {Year: d.Year, firms: +d[name]};
                })
            };
        });
        console.log("firms:");
        console.log(firms);

        x.domain(d3.extent(data, function (d) {
            return d.Year;
        }));

        y.domain([
            0,
            d3.max(firms, function (c) {
                return d3.max(c.values, function (v) {
                    return v.firms;
                });
            })
        ]);

        //svg.selectAll("path")
        //    .remove();
        //svg.selectAll(".axis")
        //    .remove();
        //svg.selectAll("text")
        //    .remove();

        svg.selectAll(".axis").remove();
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Firms");

        svg.selectAll(".firm").remove();

        var firm = svg.selectAll(".firm")
            .data(firms)
            .enter().append("g")
            .attr("class", "firm");

        firm.append("path")
            .attr("class", "line")
            .attr("d", function (d) {
                return line(d.values);
            })
            .style("stroke", function (d) {
                return color(d.name);
            });
        //
        //function mMove(){
        //
        //    var m = d3.mouse(this);
        //    d3.select("#myPath").select("title").text(m[1]);
        //}

        firm.append("text")
            .datum(function (d) {
                return {name: d.name, value: d.values[d.values.length - 1]};
            })
            .attr("transform", function (d) {
                return "translate(" + x(d.value.Year) + "," + y(d.value.firms) + ")";
            })
            .attr("x", 3)
            .transition().delay(630)
            .attr("dy", ".35em")
            .text(function (d) {
                return d.name;
            });

        //flatten the firms array so that we can add points
        var concatted = firms.reduce(function(arr, item ){
            return arr.concat(item.values);
        },[]);

        //var concatted = firms[0].values.concat(firms[1].values);
        console.log("concatted");
        console.log(concatted);

        var points = svg.selectAll('circle')
            .data(concatted);

        points
            .enter()
            .append('circle')
            .attr("class", "line-point");

        points
            .attr("fill", "#1C9A3D")
            .attr("stroke", "red")
            //.on('mouseover', tip.show)
            //.on('mouseout', tip.hide)
            .transition().delay(400).duration(700)
            .style("stroke", "#1C9A3D")
            .attr("cx", function(d) {return x(d.Year)})
            .attr("cy", function(d) {return y(d.firms) })
            .attr("r", 4.5)
        .on("mouseover", function(d) {
            div.transition()
                .duration(200)
                .style("opacity", .9);
            div	.html(formatTime(d.Year) + "<br/>"  + d.firms)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
            .on("mouseout", function(d) {
                div.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        //svg.selectAll("dot")
        //    .data(data)
        //    .enter().append("circle")
        //    .attr("r", 5)
        //    .attr("cx", function(d) { return x(d.Year); })
        //    .attr("cy", function(d) { return y(d.firms); })
        //    .on("mouseover", function(d) {
        //        div.transition()
        //            .duration(200)
        //            .style("opacity", .9);
        //        div	.html(formatTime(d.Year) + "<br/>"  + d.firms)
        //            .style("left", (d3.event.pageX) + "px")
        //            .style("top", (d3.event.pageY - 28) + "px");
        //    })
        //    .on("mouseout", function(d) {
        //        div.transition()
        //            .duration(500)
        //            .style("opacity", 0);
        //    });

        points.exit().remove();

        /* Add 'curtain' rectangle to hide entire graph */
        //credit: http://bl.ocks.org/markmarkoh/8700606
        var curtain = svg.append('rect')
            .attr('x', (-1 * width) - 5)
            .attr('y', (-1 * height) + 10)
            .attr('height', height)
            .attr('width', width)
            .attr('class', 'curtain')
            .attr('transform', 'rotate(180)')
            .style('fill', '#f7f7f7');

        ///* Optionally add a guideline */
        //var guideline = svg.append('line')
        //	.attr('stroke', '#333')
        //	.attr('stroke-width', 0)
        //	.attr('class', 'guide')
        //	.attr('x1', 1)
        //	.attr('y1', 1)
        //	.attr('x2', 1)
        //	.attr('y2', height);

        /* Create a shared transition for anything we're animating */
        var t = svg.transition()
            .duration(600)
            .ease('linear')
            .each('end', function() {
                d3.select('line.guide')
                    .transition()
                    .style('opacity', 0)
                    .remove()
            });

        t.select('rect.curtain')
            .attr('width', 0);
        t.select('line.guide')
            .attr('transform', 'translate(' + width + ', 1)')
            .on("mousemove", mMove)
            .append("title");

    })

}

