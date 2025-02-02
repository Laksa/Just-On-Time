var nodeResult;
var edgeResult;
function main(map) {
    bankai();
    new_init_map(map);
   
}
function new_init_map(map){
   
   //var nodeResult;
   //var edgeResult;
    d3.csv("NODE.csv", function(data) {
        var result =[];   
       //var headers = ["ID", "LABEL", "N", "W", "E", "out_num", "out_min", "in_num", "in_min"];
        data.forEach(function(d,i){
            var properties = {};
            properties["ID"] = d.AIRPORT_ID;
            properties["LABEL"] = d.LABEL;
            //airportArray.push(d.Label);
            properties["N"] = d.Northing;
            properties["W"] =d.Westing;
            properties["E"] = d.Easting;
            properties["out_num"] = d.Delay_No_Outgoing;
            properties["out_min"] = d.Delay_Min_Outgoing;
            properties["in_num"] = d.Delay_No_Incoming;
            properties["in_min"] = d.Delay_Min_Incoming;
            var north_str = properties["N"];
            var west_str = properties["W"];
            var east_str = properties["E"];
            var north = parseFloat(north_str);
            var west = parseFloat(west_str);
            var east = parseFloat(east_str);
            var node = {
                "type": "Feature",
                "properties": properties,
                "geometry": {
                    "type": "Point",
                    "coordinates": [east, north]
                }
            };
            result.push(node);
        });
        nodeResult = result;
        //alert(nodeResult[0].properties.LABEL);
    });
    
    d3.csv("EDGE.csv", function(data) {
        //var headers = ["ORIGIN_ID", "ORIGIN_LABEL", "DESTINATION_ID", "DESTINATION_LABEL", "ORIGIN_N", "ORIGIN_E", "DESTINATION_N", "DESTINATION_E", "COUNT"];
        var result =[];
        data.forEach(function(d,i){
            var properties = {};
            properties["ORIGIN_ID"] = d.ORIGIN_ID;
            properties["ORIGIN_LABEL"] = d.ORIGIN_LABEL;
            properties["DESTINATION_ID"] = d.DESTINATION_ID;
            properties["DESTINATION_LABEL"] =d.DESTINATION_LABEL;
            properties["ORIGIN_N"] = d.ORIGIN_N;
            properties["ORIGIN_E"] = d.ORIGIN_E;
            properties["DESTINATION_N"] = d.DESTINATION_N;
            properties["DESTINATION_E"] = d.DESTINATION_E;
            properties["COUNT"] = d.COUNT;
            var origin_n = parseFloat(properties["ORIGIN_N"]);
            var origin_e = parseFloat(properties["ORIGIN_E"]);
            var destination_n = parseFloat(properties["DESTINATION_N"]);
            var destination_e = parseFloat(properties["DESTINATION_E"]);
            var start = [origin_e,origin_n];
            var end = [destination_e, destination_n];
            var edge = {
                "type": "Feature",
                "properties": properties,
                "geometry": {
                    "type": "LineString",
                    "coordinates": [start, end]
                }
            };
            result.push(edge);
            
        });
        
        edgeResult = result;
        init_map(map,nodeResult,edgeResult);
     });
    
 }


function init_map(map, nodes, edges) {
    //var map = L.map('map').setView([40, 260], 4);
    L.tileLayer('http://{s}.tiles.mapbox.com/v3/realis.jo4acied/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18
    }).addTo(map);
    // ===================================================================================================
    function onEachEdge(feature, layer) {
        if (feature.properties.COUNT > 100) {
            var count = feature.properties.COUNT;
            var origin = feature.properties.ORIGIN_LABEL;
            var destination = feature.properties.DESTINATION_LABEL;
            layer.bindPopup("<b>From:</b> " + origin + " Airport<br/> <b>To:</b> " + destination + " Airport<br/> <b>No. of Departure Delays:</b> " + count + " flights");
        }
    }
   
    
    L.geoJson(edges, {
        onEachFeature: onEachEdge,
        style: function(feature) {
            var num = parseFloat(feature.properties.COUNT);
            if (num > 200) {
                return {
                    "color": "#FF0000",
                    "weight": num / 20,
                    "opacity": 0.6
                };
            } else if (num > 150) {
                return {
                    "color": "#F88017",
                    "weight": num / 40,
                    "opacity": 0.4
                };
            } else if (num > 100) {
                return {
                    "color": "#FFFF00",
                    "weight": num / 60,
                    "opacity": 0.2
                };
            } else if (num > 50) {
                return {
                    "color": "#CCFB5D",
                    "weight": num / 80,
                    "opacity": 0.1
                };
            }
            return {
                "color": "#00FF00",
                "weight": num / 100,
                "opacity": 0.1
            };
        }
    }).addTo(map);
    // ===================================================================================================
    var in_or_out = document.getElementById("in_or_out");
    var input = in_or_out.options[in_or_out.selectedIndex].value;
   
    function onEachNode(feature, layer) {
        var num;
        var cat;
        if (input === "in") {
            num = feature.properties.in_num;
            cat = " destination of ";
        } else {
            num = feature.properties.out_num;
            cat = " origin of ";
        }
        var label = feature.properties.LABEL;
        var descr = "is the" + cat + num + " departure delays.";
        layer.bindPopup();
        layer.bindPopup($('<a href="#cal" class="special_link">' + label + '</a>').click(function() {
            update_airport(descr);
        })[0]);

    }

    var geojsonMarkerOptions = {
        radius: 6,
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };
    L.geoJson(nodes, {
        onEachFeature: onEachNode,
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng, geojsonMarkerOptions);
        },
        style: function(feature) {
            var num;
            if (input === "in") {
                num = parseFloat(feature.properties.in_num);
            } else {
                num = parseFloat(feature.properties.out_num);
            }

            if (num > 3000) {
                return {fillColor: "#FF0000", radius: num / 400};
            } else if (num > 2000) {
                return {fillColor: "#F88017", radius: num / 400};
            } else if (num > 1000) {
                return {fillColor: "#FFFF00", radius: num / 400};
            } else if (num > 500) {
                return {fillColor: "#CCFB5D", radius: num / 400};
            }

            return {fillColor: "#00FF00", radius: num / 400};
        }
    }).addTo(map);

}

function bankai() {
    //Create the new dc.js cjart objects & link to div
    numberOfDelayedFlightChart = dc.barChart("#dc-flight-chart");
    totalDelayChart = dc.barChart("#dc-totalDelay-chart");
    delayFrequencyChart = dc.lineChart("#dc-delayFrequency-chart");
    dayOfWeekChart = dc.rowChart("#dc-newdayweek-chart");
    iDelay = dc.barChart("#iDelay");
    airlineDelayChart = dc.barChart("#dc-airlineDelay-chart");
    airportDelayChart = dc.barChart("#dc-airportDelay-chart");
    dataTable = dc.dataTable("#dc-table-graph");

    //load data from a csv file 
    d3.csv("FINAL.csv", function(data) {

        //format our data 
        function parseDate(d) {

            var index = d.lastIndexOf("-");
            var len = d.length;
            var hhmm = parseInt(d.substring(index + 1, len));
            var h = Math.floor(hhmm / 100);
            var m = hhmm % 100;
            h = h.toString();
            m = m.toString();
            return new Date(d.substring(0, 4), d.substring(5, 7) - 1, d.substring(8, 10), h, m);
        }
        var formatNumber = d3.format(",d"), // 5000 = 5,000
                formatChange = d3.format("+,d"), // work for both negative and positive numbers
                formatDate = d3.time.format("%b %d"), // formatDate = January 12, 2014
                formatTime = d3.time.format("%I:%M %p"), // formatTime = 12:13 am, 08:23 am , 09:34 am
                formatDate2 = d3.time.format("%d %b %Y"),
                formatDate3 = d3.time.format("%d %b %Y %I:%M %p");

        data.forEach(function(d, i) {

            d.index = i;
            d.date = parseDate(d.FL_DATE + "-" + d.CRS_ARR_TIME);
            d.carrier = d.UNIQUE_CARRIER;
            d.delay = +d.ARR_DELAY_NEW;
            d.originAirport = d.ORIGIN_AIRPORT_LABEL;
            d.destAirport = d.DEST_AIRPORT_LABEL;
            d.CarrierDelay = +d.CARRIER_DELAY;
            d.WeatherDelay = +d.WEATHER_DELAY;
            d.NasDelay = +d.NAS_DELAY;
            d.SecurityDelay = +d.SECURITY_DELAY;
            d.LateAircraftDelay = +d.LATE_AIRCRAFT_DELAY;
            d.carrierName = d.CARRIER_LABEL;
        });
        //Crossfilter is fine now..
        //Run the data through crossfilter and load our 'facts'
        var facts = crossfilter(data);
        var all = facts.groupAll();

        //For the number of delayed flights per day
        var date = facts.dimension(function(d) {
            return d3.time.day(d.date);
        });
        var dates = date.group();
        //For delay by day
        var delayByDay = facts.dimension(function(d) {
            return d3.time.day(d.date);
        });
        var delayByDayGroup = date.group().reduceSum(function(d) {
            return d.delay;
        });
        //For delay by causes
        var delayByCauses = facts.dimension(function(d) {
            return d3.time.day(d.date);
        });
        var delayByCausesGroup = date.group().reduce(
                function(p, v) {
                    p.count = p.count + 1;
                    p.CarrierDelay = p.CarrierDelay + v.CarrierDelay;
                    p.WeatherDelay = p.WeatherDelay + v.WeatherDelay;
                    p.NasDelay = p.NasDelay + v.NasDelay;
                    p.SecurityDelay = p.SecurityDelay + v.SecurityDelay;
                    p.LateAircraftDelay = p.LateAircraftDelay + v.LateAircraftDelay;
                    return p;
                },
                function(p, v) {

                    p.count = p.count - 1;
                    p.CarrierDelay = p.CarrierDelay - v.CarrierDelay;
                    p.WeatherDelay = p.WeatherDelay - v.WeatherDelay;
                    p.NasDelay = p.NasDelay - v.NasDelay;
                    p.SecurityDelay = p.SecurityDelay - v.SecurityDelay;
                    p.LateAircraftDelay = p.LateAircraftDelay - v.LateAircraftDelay;
                    return p;

                },
                function() {

                    return {
                        CarrierDelay: 0,
                        WeatherDelay: 0,
                        NasDelay: 0,
                        SecurityDelay: 0,
                        LateAircraftDelay: 0

                    };

                }
        );


        //For the frequency of delays 
        var delay = facts.dimension(function(d) {
            return d.delay;
        });
        var delays = delay.group().reduceCount(function(d) {
            return d.delay;
        });

        //For indivdual delay 
        var CarrierDelay = facts.dimension(function(d) {
            return d.CarrierDelay;
        });
        var WeatherDelay = facts.dimension(function(d) {
            return d.WeatherDelay;
        });
        var NasDelay = facts.dimension(function(d) {
            return d.NasDelay;
        });
        var SecurityDelay = facts.dimension(function(d) {
            return d.SecurityDelay;
        });
        var LateAircraftDelay = facts.dimension(function(d) {
            return d.LateAircraftDelay;
        });

        //cannot return the color properly
        var colorRenderlet = function(chart) {
            chart.selectAll("rect.bar")
                    .on("click", function(d) {
                function setAttr(selection, keyName) {
                    selection.style("text", function(d) {
                        if (d[keyName] === "CarrierDelay")
                            chart.showStack("CarrierDelay")
                        else if (d[keyName] === "WeatherDelay")
                            return "";
                        else if (d[keyName] === "NasDelay")
                            return "";
                        else if (d[keyName] === "SecurityDelay")
                            return "";
                        else if (d[keyName] === "LateAircraftDelay")
                            return "";
                    });
                }
                setAttr(chart.selectAll("g.stack").selectAll("rect.bar"), "layer");
                setAttr(chart.selectAll("g.dc-legend-item").selectAll("rect"), "name")
            });
            //dc.renderAll("iDelay");
        };

        //For individual airline delays
        var airline = facts.dimension(function(d) {
            return d.carrier;
        });

        /*var  airlines = airline.group().reduceSum(function (d){
         return d.delay;
         });*/

        var airlines = airline.group().reduce(
                function(p, v) {
                    p.delay = p.delay + v.delay;
                    p.count = p.count + 1;
                    p.carrier = p.carrier + v.carrier;
                    p.avgDelay = Math.floor(p.delay / p.count);
                    return p;
                },
                function(p, v) {
                    p.delay = p.delay - v.delay;
                    p.count = p.count - 1;
                    p.carrier = p.carrier - v.carrier;
                    p.avgDelay = Math.floor(p.delay / p.count);
                    return p;
                },
                function() {

                    return {
                        delay: 0,
                        count: 0,
                        carrier: 0,
                        avgDelay: 0
                    };
                }

        );

        //For indivdual airport delays
        var airport = facts.dimension(function(d) {
            return d.originAirport;
        });
        var airports = airport.group().reduceSum(function(d) {
            return d.delay;
        });

        //helper method 
        function getDayofWeek(d) {

            var day = d.getDay();
            switch (day) {
                case 0:
                    return "Sun";
                case 1:
                    return "Mon";
                case 2:
                    return "Tue";
                case 3:
                    return "Wed";
                case 4:
                    return "Thu";
                case 5:
                    return "Fri";
                case 6:
                    return "Sat";
            }
        }


        //For mon,tue,wed,thu.fri,sat,sun
        var dayOfWeek = facts.dimension(function(d) {
            var day = d.date.getDay();
            switch (day) {
                case 0:
                    return "0.Sun";
                case 1:
                    return "1.Mon";
                case 2:
                    return "2.Tue";
                case 3:
                    return "3.Wed";
                case 4:
                    return "4.Thu";
                case 5:
                    return "5.Fri";
                case 6:
                    return "6.Sat";
            }
        });
        var dayOfWeekGroup = dayOfWeek.group();

        dc.dataCount(".dc-data-count")
                .dimension(facts)
                .group(all);

        //For visualistion

        numberOfDelayedFlightChart.width(920)
                .height(150)
                .margins({top: 10, right: 15, bottom: 20, left: 50})
                .dimension(delayByDay)
                .group(dates)
                .transitionDuration(10)
                .centerBar(true)
                .gap(1)
                .renderTitle(true)
                .title(function(d) {
            return  getDayofWeek(d.data.key) + " " + formatDate2(d.data.key) + ": " + d.data.value;
        })
                .round(d3.time.day.round)
                .xUnits(d3.time.days)
                .x(d3.time.scale() //timescale 
                .domain([new Date(2013, 11, 31), new Date(2014, 1, 1)]) //domain will be hardcoded 
                .rangeRound([0, 5 * 120])) // convert the time scale to bar graph
                .elasticY(true)
                //.brushOn(false)
                .filter([new Date(2014, 0, 10), new Date(2014, 0, 20)])
                .xAxis().tickFormat(d3.time.format("%b %d"))
                .ticks(d3.time.day, 4);

        totalDelayChart.width(460)
                .height(150)
                .margins({top: 10, right: 15, bottom: 20, left: 50})
                .dimension(delayByDay)
                .group(delayByDayGroup)
                .transitionDuration(1)
                .centerBar(true)
                .gap(1)
                .round(d3.time.day.round)
                .xUnits(d3.time.days)
                .x(d3.time.scale() //timescale 
                .domain([new Date(2013, 11, 31), new Date(2014, 1, 1)]) //domain will be hardcoded 
                .rangeRound([0, 5 * 120])) // convert the time scale to bar graph 
                .elasticY(true)
                .filter([new Date(2014, 0, 10), new Date(2014, 0, 20)])
                .xAxis().tickFormat(d3.time.format("%b %d"))
                .ticks(d3.time.day, 4);

        //For indivdual delays
        iDelay
                .width(450)
                .height(150)
                .margins({top: 10, right: 20, bottom: 20, left: 50})
                .transitionDuration(10)
                .gap(1)
                .dimension(delayByDay)
                .group(delayByCausesGroup, "CarrierDelay")
                .valueAccessor(function(p) {
            return p.value.CarrierDelay;
        })
                .stack(delayByCausesGroup, "WeatherDelay", function(p) {
            return p.value.WeatherDelay;
        })
                .stack(delayByCausesGroup, "NasDelay", function(p) {
            return p.value.NasDelay;
        })
                .stack(delayByCausesGroup, "SecurityDelay", function(p) {
            return p.value.SecurityDelay;
        })
                .stack(delayByCausesGroup, "LateAircraftDelay", function(p) {
            return p.value.LateAircraftDelay;
        })
                .gap(1)
                .round(d3.time.day.round)
                .x(d3.time.scale() //timescale 
                .domain([new Date(2013, 11, 31), new Date(2014, 1, 1)]) //domain will be hardcoded 
                .rangeRound([0, 5 * 120])) // convert the time scale to bar graph
                .xUnits(d3.time.days)
                .elasticY(true)
                .brushOn(false)
                .renderlet(colorRenderlet)
                .renderTitle(true)
                .title(function(d) {

            return  getDayofWeek(d.data.key) + " " + formatDate2(d.data.key) + "\n" + d.data.value.CarrierDelay

        })
                .title(function(d) {

            return  "CarrierDelay: " + d.data.value.CarrierDelay +
                    "\n" + "WeatherDelay: " + d.data.value.WeatherDelay +
                    "\n" + "NasDelay: " + d.data.value.NasDelay +
                    "\n" + "SecurityDelay: " + d.data.value.SecurityDelay +
                    "\n" + "LateAircraftDelay: " + d.data.value.LateAircraftDelay;

        })

                .legend(dc.legend().x(350).y(0).itemHeight(13).gap(5))
                .xAxis().tickFormat(d3.time.format("%b %d"))
                .ticks(d3.time.day, 4);

        //For delay frequency
        delayFrequencyChart.width(300)
                .height(220)
                .margins({top: 10, right: 10, bottom: 20, left: 50})
                .dimension(delay)
                .group(delays)
                .renderArea(true)
                //.brushOn(false)			// added for title
                .title(function(d) {
            return ("Arrival Delay: " + (d.data.key) + " minutes")
                    + "\nFrequency: " + d.data.value;
        })
                .elasticY(true)
                //.elasticX(true)
                .x(d3.scale.linear().domain([15, 200]))
                .xAxis();




        //For day of week
        dayOfWeekChart.width(300)
                .height(250)
                .margins({top: 10, left: 10, right: 20, bottom: 50})
                .dimension(dayOfWeek)
                .group(dayOfWeekGroup)
                .colors(d3.scale.category10())
                .label(function(d) {
            return d.key.split(".")[1];
        })
                .title(function(d) {
            return d.value;
        })
                .elasticX(true)
                .xAxis().ticks(4);

        //For sum of delay for each airline
        airlineDelayChart.width(320)
                .height(240)
                .margins({top: 10, right: 10, bottom: 20, left: 60})
                .dimension(airline)
                .group(airlines)
                .transitionDuration(10)
                .valueAccessor(function(p) {

            return p.value.avgDelay;
        })

                .renderTitle(true)
                .title(function(d) {
            return  d.data.key + ": " + d.data.value.avgDelay + " minutes";
        })
                .centerBar(true)
                .gap(1)
                .x(d3.scale.ordinal().domain(["", "AA", "AS", "B6", "DL", "EV", "UA", "US", "OO", "VX", "WN", "F9", "FL", "HA", "MQ"]))
                //.x(d3.scale.ordinal().domain(data.map(function (d) {return d.carrier; })))
                .xUnits(dc.units.ordinal)
                .y(d3.scale.linear().domain([0, 200]))
                .xAxis().tickFormat();

        //For sum of delay for each airport
        airportDelayChart.width(450)
                .height(220)
                .margins({top: 10, right: 10, bottom: 20, left: 50})
                .dimension(airport)
                .group(airports)
                .transitionDuration(10)
                .centerBar(true)
                .gap(1)
                .x(d3.scale.ordinal().domain(data.map(function(d) {
            return d.originAirport;
        })))
                .xUnits(dc.units.ordinal)
                .elasticY(true)
                .xAxis().tickFormat();

        //The data table 
        dataTable.width(920).height(800)
                .dimension(date)
                .group(function(d) {
            return "Arrival Delay"
        })
                .size(10)
                .columns([
            function(d) {
                return formatDate3(d.date);
            },
            function(d) {
                return d.carrierName;
            },
            function(d) {
                return d.originAirport;
            },
            function(d) {
                return d.destAirport;
            },
            function(d) {
                return d.delay;
            }
        ])
                .sortBy(function(d) {
            return d.delay;
        })
                .order(d3.ascending);

        //Render the shit
        dc.renderAll();
    });
};

// This method converts a csv (as Text String) into a well-formed JSON object
function node(csv) {
    var lines = csv.split("\n");
    var result = [];
    var headers = ["ID", "LABEL", "N", "W", "E", "out_num", "out_min", "in_num", "in_min"];
    for (var i = 1; i < lines.length; i++) {
        var properties = {};
        var currentline = lines[i].split(",");
        for (var j = 0; j < headers.length; j++) {
            properties[headers[j]] = currentline[j];
        }
        var north_str = properties["N"];
        var west_str = properties["W"];
        var east_str = properties["E"];
        var north = parseFloat(north_str);
        var west = parseFloat(west_str);
        var east = parseFloat(east_str);
        var node = {
            "type": "Feature",
            "properties": properties,
            "geometry": {
                "type": "Point",
                "coordinates": [east, north]
            }
        };
        result.push(node);
    }
    return result;
}

function edge(csv) {
    var lines = csv.split("\n");
    var result = [];
    var headers = ["ORIGIN_ID", "ORIGIN_LABEL", "DESTINATION_ID", "DESTINATION_LABEL", "ORIGIN_N", "ORIGIN_E", "DESTINATION_N", "DESTINATION_E", "COUNT"];
    for (var i = 1; i < lines.length; i++) {
        var properties = {};
        var currentline = lines[i].split(",");
        for (var j = 0; j < headers.length; j++) {
            properties[headers[j]] = currentline[j];
        }
        var origin_n = parseFloat(properties["ORIGIN_N"]);
        var origin_e = parseFloat(properties["ORIGIN_E"]);
        var destination_n = parseFloat(properties["DESTINATION_N"]);
        var destination_e = parseFloat(properties["DESTINATION_E"]);
        var start = [origin_e, origin_n];
        var end = [destination_e, destination_n];
        var edge = {
            "type": "Feature",
            "properties": properties,
            "geometry": {
                "type": "LineString",
                "coordinates": [start, end]
            }
        };
        result.push(edge);
    }
    return result;
}

//For uploading files (eliminate this part, auto upload for convienience)
/*function init_upload(map) {
    
    var inputElement = document.getElementById("input");
    inputElement.addEventListener("change", handleFiles, false);
    function handleFiles() {
        var fileList = this.files; /* now you can work with the file list */
        /*var edge_file;
        var node_file;
        var first_file = fileList[0];
        var second_file = fileList[1];
        if (first_file.name === 'EDGE.csv') {
            edge_file = first_file;
            node_file = second_file;
        } else {
            edge_file = second_file;
            node_file = first_file;
        }
        var edge_reader = new FileReader();
        edge_reader.readAsText(edge_file);
        edge_reader.onload = function() {
            var edges = edge(edge_reader.result);
            var node_reader = new FileReader();
            node_reader.readAsText(node_file);
            node_reader.onload = function() {
                var nodes = node(node_reader.result);
                init_map(map, nodes, edges);
            };
        };
    }
}*/