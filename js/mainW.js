/**
 * Created by williamcorbett on 4/8/16.
 */

var allDataW = [];

var marginW = {top: 30, right: 20, bottom: 110, left: 110},
    widthW = 800 - marginW.left - marginW.right,
    heightW = 700 - marginW.top - marginW.bottom;

var xW = d3.scale.ordinal()
    .rangeRoundBands([0, widthW], 0.5);

var yW = d3.scale.linear()
    .rangeRound([heightW, 0]);

var zW = d3.scale.category20();

//var colorW = d3.scale.category20();

var xAxisW = d3.svg.axis()
    .scale(xW)
    .orient("bottom");

var yAxisW = d3.svg.axis()
    .scale(yW)
    .orient("left");

var svgW = d3.select("body #stacked-bar-chart").append("svg")
    .attr("width", widthW + marginW.left + marginW.right)
    .attr("height", heightW + marginW.top + marginW.bottom)
    .append("g")
    .attr("transform", "translate(" + marginW.left + "," + marginW.top + ")");

var selectionW;
var demographicW;
var logW = "absolute";
var datasets;
var tipW = d3.tip()
    .attr('class', 'd3-tip')
    .offset([70, 90])
    .html(function(d) {
        return "<strong style='color: red;'>Industry:</strong></br> <span>" + d.industry + "</span></br>" +
                "<strong style='color:red;'>" + capitalizeFirstLetter(selectionW) + ":</strong></br> <span>" + formatCommas(d.y)+ "</span>";
    });

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
var formatCommas = d3.format("0,000");

function arraySumW(array) {
    var sum = 0;

    // goes through input array and sums up all the firms/revenue/employees for that group
    array.forEach(function(node){
        //if at the bottom level, skip NaNs else add firms/revenue/employees to the sum
       //console.log(node);
        if (node.values.length == 1) {
            if (isNaN(node.values[0][selectionW])) {
                sum += 0;
            }
            else {
                sum += node.values[0][selectionW];
            }
        }
        //otherwise, go one level deeper into the nested data
        else {
            sum += arraySumW(node.values)
        }
    });

    return sum;
}

var year = "2012";

loadDataW(year);

//declare global nested arrays for each demographic
var nestedEthnicityW;
var nestedRaceW;
var nestedGenderW;

function loadDataW(year) {
    d3.csv("data/CS171-Final-Data-" + year + "-cleaned.csv", function(error, data){
        if(!error){
            allDataW = data;

            //document.getElementById("log").innerHTML = capitalizeFirstLetter(logW);
            //logW = document.getElementById("log").value;

            allDataW.forEach(function(row){
                row.employees = parseInt(row.employees);
                row.ethnicity = parseInt(row.ethnicity);
                row.firms = parseInt(row.firms);
                row.gender = parseInt(row.gender);
                row.payroll = parseInt(row.payroll);
                row.race = parseInt(row.race);
                row["revenue"] = parseInt(row["revenue"]);
                row["revenue-with-paid"] = parseInt(row["revenue-with-paid"]);
                row["revenue-without-paid"] = parseInt(row["revenue-without-paid"]);
                row["firms-with-paid"] = parseInt(row["firms-with-paid"]);
                row["firms-without-paid"] = parseInt(row["firms-without-paid"]);
                row.year = parseInt(row.year);

                if (row.gender == 98){
                    row["gender-label"] = "Not classifiable by gender";
                }

                if (row.race == 70){
                    row["race-label"] = "Pacific Islander";
                }

                if (row.race == 50){
                    row["race-label"] = "Native American";
                }
            });

            var ethnicityData = allDataW.filter(function(row) {
                return (row["gender-label"] != "All firms")
                    && (row["gender-label"] != "All firms classifiable by gender, ethnicity, race, and veteran status")
                    && (row.gender != 96)
                    && (row.race == 0)
                    && (row.ethnicity != 1)
                    && (row.ethnicity != 21)
                    && (row.ethnicity != 22)
                    && (row.ethnicity != 23)
                    && (row.ethnicity != 24)
                    && (row.ethnicity != 96)
                    && (row["industry-label"] != "Total for all sectors");
            });

            var raceData = allDataW.filter(function(row){
                return (row["gender-label"] != "All firms")
                    && (row["gender-label"] != "All firms classifiable by gender, ethnicity, race, and veteran status")
                    && (row.gender != 96)
                    && (row.ethnicity == 1)
                    && (row.race != 0)
                    && (row.race != 61)
                    && (row.race != 62)
                    && (row.race != 63)
                    && (row.race != 64)
                    && (row.race != 65)
                    && (row.race != 66)
                    && (row.race != 67)
                    && (row.race != 71)
                    && (row.race != 72)
                    && (row.race != 73)
                    && (row.race != 74)
                    && (row.race != 90)
                    && (row.race != 91)
                    && (row.race != 92)
                    && (row.race != 96)
                    && (row["industry-label"] != "Total for all sectors");
                });

            var genderData = allDataW.filter(function(row){
                return (row["gender-label"] != "All firms")
                    && (row["gender-label"] != "All firms classifiable by gender, ethnicity, race, and veteran status")
                    && (row.gender != 96)
                    && (row.ethnicity == 1)
                    && (row.race == 0)
                    && (row["industry-label"] != "Total for all sectors");
                });

            nestedEthnicityW = d3.nest()
                .key(function(d) {return d["industry-label"]})
                .key(function(d) {return d["ethnicity-label"]})
                .key(function(d) {return d["gender-label"]})
                .entries(ethnicityData);

            nestedRaceW = d3.nest()
                .key(function(d) {return d["industry-label"]})
                .key(function(d) {return d["race-label"]})
                .key(function(d) {return d["gender-label"]})
                .entries(raceData);

            nestedGenderW = d3.nest()
                .key(function(d) {return d["industry-label"]})
                .key(function(d) {return d["gender-label"]})
                .entries(genderData);

            selectionW = "firms";
            demographicW = "race";

            datasets = [nestedEthnicityW, nestedGenderW, nestedRaceW];

            createVisW(nestedRaceW);
        }
    });
}

function createVisW(data) {

    data.forEach(function(industry) {
        industry.key = industry.key.replace(/[0-9()]/g, '');
    })

    svgW.selectAll("rect").remove();
    svgW.selectAll(".axis").remove();
    svgW.selectAll(".axis-title").remove();

    //format the layers for the stacked bars
    var layers = d3.layout.stack()(data.map(function(industry){
        if (demographicW == "gender") {
            return industry.values.map(function(d){
                return {industry: industry.key, x: d["key"], y: d.values[0][selectionW]}
            })
        }
        else {
            return industry.values.map(function (d) {
                return {industry: industry.key, x: d["key"], y: arraySumW(d.values)};
            })
        }
    }));

    //layers.forEach(function(industry){
    //    industry.forEach(function(race){
    //        race.y0 /= race.y0;
    //        race.y1 /= race.y0
    //    });
    //});

    console.log(layers);

    xW.domain(layers[0].map(function(d) {return d.x;}));
    yW.domain([0, d3.max(layers[layers.length - 1], function(d) {return d.y0 + d.y;})]).nice();

    var layer = svgW.selectAll(".layer")
        .data(layers);

    layer.enter().append("g")
        .attr("class", "layer")
        .style("fill", function(d, i) {return zW(i);});

    layer.call(tipW);

    layer.selectAll("rect")
        .data(function(d) {return d;})
        .enter().append("rect")
        .attr("class", function(d) {return d.industry})
        .transition().duration(1000)
        .attr("x", function(d) {return xW(d.x);})
        .attr("y", function(d) {return yW(d.y + d.y0);})
        .attr("height", function(d) {return yW(d.y0) - yW(d.y + d.y0);})
        .attr("width", xW.rangeBand());

    layer.exit().transition().duration(400).remove();

    svgW.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + heightW + ")")
        .call(xAxisW)
        .selectAll(".tick text")
        .call(wrap, xW.rangeBand());

    svgW.append("g")
        .attr("class", "axis axis--y")
        .attr("transform", "translate(0,0)")
        .call(yAxisW);

    //taken from stack overflow
    function wrap(text, width) {
        text.each(function() {
            var text = d3.select(this),
                words = text.text().split(/\s+/).reverse(),
                word,
                line = [],
                lineNumber = 0,
                lineHeight = 1.1, // ems
                y = text.attr("y"),
                dy = parseFloat(text.attr("dy")),
                tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(" "));
                if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                }
            }
        });
    }

    svgW.append("text")
        .attr("class", "axis-title")
        .attr("x", widthW-5)
        .attr("y", heightW-15)
        .attr("dy", ".1em")
        .style("text-anchor", "end")
        .text(capitalizeFirstLetter(demographicW));

    svgW.append("text")
        .attr("class", "axis-title")
        .attr("x", -5)
        .attr("y", -15)
        .attr("dy", ".1em")
        .style("text-anchor", "end")
        .text(capitalizeFirstLetter(selectionW));



    ////tooltip (stolen from Mike Bostock)
    svgW.selectAll("rect")
        .on("mouseover", function(d){
            tipW.show(d);
            d3.select(this).attr("stroke","blue").attr("stroke-width",0.8);
        })
        .on("mouseout",function(d){
            tipW.hide(d);
            d3.select(this).attr("stroke", "none").attr("stroke-width", 0.2);
        });

    //make it interactive
    document.getElementById("demographic").onchange = (function() {
        demographicW = this.options[this.selectedIndex].value;
        console.log(demographicW);
        if (demographicW == "ethnicity") {
            createVisW(nestedEthnicityW);
        }
        else if (demographicW == "race") {
            createVisW(nestedRaceW);
        }
        else if (demographicW == "gender") {
            createVisW(nestedGenderW);
        }
    });

    //toggle between firms, revenue, and employees
    document.getElementById("selection").onchange = (function() {
        var selected = this.options[this.selectedIndex].value;
        selectionW = selected;
        if (demographicW == "ethnicity") {
            createVisW(nestedEthnicityW);
        }
        else if (demographicW == "race") {
            createVisW(nestedRaceW);
        }
        else if (demographicW == "gender") {
            createVisW(nestedGenderW);
        }
    });

    document.getElementById("year").onchange = (function() {
        document.getElementById("log").value = "log";
        document.getElementById("log").innerHTML = "Switch to Log view";
        var selected = this.options[this.selectedIndex].value;
        year = selected;
        loadDataW(year);
    });

    //toggle between log view and regular view
    document.getElementById("log").onclick = (function() {
        logW = document.getElementById("log").value;
        if (logW == "log"){
            document.getElementById("log").value = "absolute";
            document.getElementById("log").innerHTML = "Switch back to Regular view";
            datasets.forEach(function(dataset) {
                if (dataset[0].values.length == 4) {
                    dataset.forEach(function(industry) {
                        industry.values.forEach(function(gender) {
                            gender.values[0].employees = Math.log(gender.values[0].employees);
                            gender.values[0].firms = Math.log(gender.values[0].firms);
                            gender.values[0].revenue = Math.log(gender.values[0].revenue);
                        })
                    })
                }
                else {
                    dataset.forEach(function(industry){
                        industry.values.forEach(function(group) {
                            group.values.forEach(function(gender) {
                                gender.values[0].employees = Math.log(gender.values[0].employees);
                                gender.values[0].firms = Math.log(gender.values[0].firms);
                                gender.values[0].revenue = Math.log(gender.values[0].revenue);
                            })
                        })
                    })
                }
            })
        }
        else{
            document.getElementById("log").value = "log";
            document.getElementById("log").innerHTML = "Switch to Log view";
            datasets.forEach(function(dataset) {
                if (dataset[0].values.length == 4) {
                    dataset.forEach(function(industry) {
                        industry.values.forEach(function(gender) {
                            gender.values[0].employees = Math.exp(gender.values[0].employees);
                            gender.values[0].firms = Math.exp(gender.values[0].firms);
                            gender.values[0].revenue = Math.exp(gender.values[0].revenue);
                        })
                    })
                }
                else {
                    dataset.forEach(function(industry){
                        industry.values.forEach(function(group) {
                            group.values.forEach(function(gender) {
                                gender.values[0].employees = Math.exp(gender.values[0].employees);
                                gender.values[0].firms = Math.exp(gender.values[0].firms);
                                gender.values[0].revenue = Math.exp(gender.values[0].revenue);
                            })
                        })
                    })
                }
            })

        }
        console.log(logW);
        if (demographicW == "ethnicity") {
            {
                createVisW(nestedEthnicityW);
            }
        }
        else if (demographicW == "race") {
            createVisW(nestedRaceW);
        }
        else if (demographicW == "gender") {
            createVisW(nestedGenderW);
        }
    })

    //TO DO:
    // 2) Make it possible to break down race and ethnicity by gender (same in pie chart)
    // 4) Make transitions work without clearing the svg

}

//
////lists of all the different attributes just in case we need them
//var ethnicities = ["Hispanic", "Equally Hispanic/non-Hispanic", "Non-Hispanic",
//    "Publicly held and other firms not classifiable by gender, ethnicity, race, and veteran status"]
//var races = ["White", "Black or African American", "American Indian and Alaska Native",
//    "Asian", "Native Hawaiian and Other Pacific Islander", "Some other race"];
//var industries = ["Agriculture, forestry, fishing and hunting(606)", "Mining, quarrying, and oil and gas extraction",
//    "Utilities", "Construction", "Manufacturing", "Wholesale trade", "Retail trade", "Transportation and warehousing(607)",
//    "Information", "Finance and insurance(608)", "Real estate and rental and leasing", "Professional, scientific, and technical services",
//    "Management of companies and enterprises", "Administrative and support and waste management and remediation services",
//    "Educational services", "Health care and social assistance", "Arts, entertainment, and recreation", "Accommodation and food services",
//    "Other services (except public administration)(609)", "Industries not classified"];