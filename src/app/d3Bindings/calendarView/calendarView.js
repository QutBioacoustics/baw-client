/**
 * A d3 Calendar View directive
 * Created by Anthony on 23/08/2014, modified by Mark.
 * based on http://bl.ocks.org/mbostock/4063318
 */
angular.module("bawApp.d3.calendarView", ["bawApp.vendorServices.auto"])
    .directive(
    "bawCalendarView",
    ["d3", "moment",
     function (d3, moment) {

         // d3 functions
         // private properties - globals, formatters, magic numbers
         var day = d3.time.format("%w"),
             week = d3.time.format("%U"),
             format = d3.time.format("%Y-%m-%d"),
             monthFormat = d3.time.format("%b"),
             width = 960,
             height = 136,
             cellSize = 17, // cell size
             minYear = 2007,
             firstYear = null, //new Date().getFullYear(),
             lastYear = null, //2007
             colourRangeStop = 10;

         var color = d3.scale.quantize()
             .domain([0, 25])
             .range(d3.range(11).map(function (d) {
                        return "q" + d + "-11";
                    }));

         var updateCatalogueData = function updateCatalogueData(json, options) {

             var data = {};
             for (var i = 0; i < json.length; i++) {
                 var item = json[i];
                 var recordedDate = moment(item.recordedDate);
                 var key = recordedDate.format("YYYY-MM-DD");

                 var itemYear = parseInt(recordedDate.year());
                 if (firstYear === null || itemYear > firstYear) {
                     firstYear = itemYear;
                 }
                 if (lastYear === null || itemYear < lastYear) {
                     lastYear = itemYear;
                 }

                 // add one or set property
                 if (data[key]) {
                     data[key] += 1;
                 } else {
                     data[key] = 1;
                 }

                 // get the max number of recordings in a day
                 if (colourRangeStop === null || data[key] > colourRangeStop) {
                     colourRangeStop = data[key];
                 }
             }

             // ensure year doesn't go beyond 2007
             if (lastYear < minYear) {
                 lastYear = minYear;
             }

             var elements = createSvgCalendarView(firstYear, lastYear);
             addDataToCalendar(elements.rect, data, options);

             return function (options) {
                 addDataToCalendar(elements.rect, data, options);
             };
         };


         var createSvgCalendarView = function createSvgCalendarView(firstYear, lastYear) {

             // create svg and year rows
             var svg = d3.select("#audioRecordingCalendar").selectAll("svg")
                 .data(d3.range(firstYear, lastYear - 1, -1)) // subtract one due to exclusive end bound
                 .enter().append("svg")
                 .attr("width", width)
                 .attr("height", height)
                 .attr("class", "RdYlGn")
                 .append("g")
                 .attr("transform",
                       "translate(" + ((width - cellSize * 53) / 2) + "," + (height - cellSize * 7 - 1) + ")");

             // add year label to left end
             svg.append("text")
                 .attr("transform", "translate(-6," + cellSize * 3.5 + ")rotate(-90)")
                 .style("text-anchor", "middle")
                 .text(function (d) {
                           return d;
                       });

             // create day rectangles
             var rect = svg.selectAll(".day")
                 .data(function (d) {
                           return d3.time.days(new Date(d, 0, 1), new Date(d + 1, 0, 1));
                       })
                 .enter().append("rect")
                 .attr("class", "day")
                 .attr("width", cellSize)
                 .attr("height", cellSize)
                 .attr("x", function (d) {
                           return week(d) * cellSize;
                       })
                 .attr("y", function (d) {
                           return day(d) * cellSize;
                       })
                 .datum(format);

             // add titles to day rectangles
             rect.append("title")
                 .text(function (d) {
                           return d;
                       });

             // find the months and outline them
             var month = svg.selectAll(".month")
                 .data(function (d) {
                           return d3.time.months(new Date(d, 0, 1), new Date(d + 1, 0, 1));
                       })
                 .enter().append("path")
                 .attr("class", "month")
                 .attr("d", monthPath);

             // add labels for each month
             svg.selectAll(".monthText")
                 .data(function (d) {
                           return d3.time.months(new Date(d, 0, 1), new Date(d + 1, 0, 1));
                       })
                 .enter()
                 .append("text")
                 .attr("x", function (d) {
                           return (week(d) * cellSize) + (cellSize * 2.8);
                       })
                 .attr("y", function (d) {
                           return -2.5;
                       })
                 .style("text-anchor", "middle")
                 .text(function (d) {
                           return monthFormat(d);
                       });

             return {
                 svg: svg,
                 day: day,
                 month: month,
                 rect: rect
             };
         };

         // calculate the path to surround the days of the month
         var monthPath = function monthPath(t0) {
             var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
                 d0 = +day(t0), w0 = +week(t0),
                 d1 = +day(t1), w1 = +week(t1);
             return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize +
                    "H" + w0 * cellSize + "V" + 7 * cellSize +
                    "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize +
                    "H" + (w1 + 1) * cellSize + "V" + 0 +
                    "H" + (w0 + 1) * cellSize + "Z";
         };

         var addDataToCalendar = function addDataToCalendar(rect, data, options) {
             rect
                 .filter(function (d) {
                             return d in data;
                         })
                 .attr("class", function (d) {
                           var c = options.singleColor ? (data[d] && "q9-11" || "") : color(data[d]);
                           return "day " + c;
                       })
                 .select("title")
                 .text(function (d) {
                           return d + ": " + data[d] + " audio recordings";
                       });
         };

         return {
             restrict: "EA",
             scope: {
                 data: "=",
                 options: "="
             },
             templateUrl: "d3Bindings/calendarView/calenderViewTemplate.tpl.html",
             link: function ($scope, $element, attributes, controller, transcludeFunction) {
                 // use this function to bind DOM events to angular scope
                 // or d3 events to angular scope.
                 // you can use the jQuery / d3 objects here (use the injected d3 instance)

                 // where possible avoid jQuery
                 //var element = $element[0];

                 // TODO: merge options with defaults

                 // d3.doSomething
                 var updateFunction;
                 function redraw() {
                     if ($scope.data) {
                         updateFunction = updateCatalogueData($scope.data, $scope.options);
                     }
                 }

                 // watch for changes on scope data
                 $scope.$watch(function () {
                     return $scope.data;
                 }, function () {
                     redraw();
                 });

                 $scope.$watch(function () {
                     return $scope.options.singleColor;
                 }, function (n, o) {
                     if (n !== o && $scope.data) {
                         updateFunction($scope.options);
                     }
                 });
             },
             controller: "bawCalendarViewController"
         };
     }])
    .controller(
    "bawCalendarViewController",
    ["$scope", "$element", "$attrs",
     function ($scope, $element, $attrs) {
         // The controller should host functionality native to angular
         // e.g.
         // - functions for button clicks
         // - API calls (not relevant in this case)
         // - scope modification
         // - interaction with other services/providers
         // IT SHOULD NOT contain any reference to the d3 or jQuery objects

         $scope.example = "Hello world!";
     }]);

