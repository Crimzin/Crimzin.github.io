/**
 * Created by tajaybongsa on 4/18/16.
 */
//var allData = [];

//inspiration from http://bl.ocks.org/mbostock/3884955
//NOTE: Sometimes the line chart gets wonky in Chrome, so try it in Safari if it's not behaving


var margin = {top: 30, right: 200, bottom: 30, left: 120},
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

// Adds the svg canvas
var svg = d3.select("#line-chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

var formatDate = d3.time.format("%Y");

function addCommas(nStr) {
    nStr += '';
    x = nStr.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
}

var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([0, 0])
    .html(function(d) {
        return "<strong style='color:red'> Year: </strong> <span>" + formatDate(d.Year) + "</span></br>"
            + "<strong style='color:red'>" + capitalizeFirstLetter(selection) + ":</strong> <span>" + addCommas(d.firms) + "</span></br>";
    })

var attribute = "race";
var selection = "firms";

// Initialize data
loadData();

d3.select("#ranking-type")
    .on("change", function(){
        console.log("user selection changed.");
        attribute = d3.select("#ranking-type").property("value");
        loadData();
    });

d3.select("#ranking-type2")
    .on("change", function(){
        selection = d3.select("#ranking-type2").property("value");
       loadData();
    });

//Get the data
function loadData() {
    console.log(selection + "_" + attribute);
    d3.csv("data/" + selection + "_" + attribute + ".csv", function (error, data) {
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
            .text(capitalizeFirstLetter(selection));

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

        svg.call(tip);

        var points = svg.selectAll('circle')
            .data(concatted);

        points
            .enter()
            .append('circle')
            .attr("class", "line-point");

        points
            .attr("fill", "#1C9A3D")
            .attr("stroke", "red")
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide)
            .transition().delay(400).duration(700)
            .style("stroke", "#1C9A3D")
            .attr("cx", function(d) {return x(d.Year)})
            .attr("cy", function(d) {return y(d.firms) })
            .attr("r", 4.5);

        points.exit().remove();

        svg.selectAll("rect").remove();

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
            .attr('transform', 'translate(' + width + ', 1)');

    })

}

