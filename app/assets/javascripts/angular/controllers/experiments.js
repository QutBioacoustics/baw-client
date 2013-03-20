"use strict";

;
(function (undefined) {
    var app = angular.module('bawApp.controllers');

    app.controller('ExperimentsCtrl', ['$scope', '$resource', '$routeParams', '$route', '$http', 'Media', 'AudioEvent', 'Tag',

        /**
         * The Experiments controller.
         * @param $scope
         * @param $resource
         * @param $routeParams
         * @param AudioEvent
         * @constructor
         * @param Tag
         * @param Media
         * @param $route
         * @param $http
         */
            function ExperimentsCtrl($scope, $resource, $routeParams, $route, $http, Media, AudioEvent, Tag) {

            $scope.PREFACE_STAGE = "Welcome";
            $scope.EXPERIMENT_STAGE = "Activity";
            $scope.FINAL_STAGE = "Conclusion";

            $scope.results = {
                allowContact: true,
                consented: false,
                ethicsStatementViewed: false
            };
            $scope.errors = [];
            $scope.spec = {
                experimentSteps: []
            };
            $scope.stage = $scope.PREFACE_STAGE;
            $scope.step = 0;
            $scope.resultsSending = false;
            $scope.resultsSentSuccessfully = undefined;

            // todo: populate user information

            // download experiment protocol
            var experiment = $routeParams.experiment == "tour" ? '/experiment_assets/bird_tour.json' : '/experiment_assets/rapid_scan.json';
            $http.get(experiment).
                success(function (data, status, headers, config) {
                    $scope.spec = data;
                    $scope.results.experiment = $scope.spec.experiment;

                    if ($routeParams.cheat) {
                        $scope.stage = $routeParams.cheat;
                        if ($scope.stage = $scope.EXPERIMENT_STAGE) {
                            $scope.step = 1;
                        }
                    }
                }).error(function (data, status, headers, config) {
                    alert("downloading test specification failed");
                });

            $scope.login = function () {
                $scope.$emit('event:auth-loginRequired');
            };

            $scope.isChrome = function () {
                return Boolean(window.chrome);
            };

            $scope.verifyPreface = function verifyPreface() {
                $scope.errors.length = 0;

                if ($scope.results.consented !== true) {
                    $scope.errors.push("You must consent to participate in this experiment.");
                }

                if ($scope.results.ethicsStatementViewed !== true) {
                    $scope.errors.push("You must view the ethics statement before continuing (click on the link please).")
                }

                if ($scope.loggedIn && $scope.userData) {
                    $scope.results.userData = angular.copy($scope.userData);
                }
                else {
                    $scope.errors.push("You must be logged in to participate in this experiment, please log in.")
                }

                if (!$scope.isChrome()) {
                    $scope.errors.push("You must be using the Google Chrome web browser to continue")
                }

                if ($scope.errors.length > 0) {
                    return;
                }

                $scope.step = 1;
                $scope.stage = $scope.EXPERIMENT_STAGE;

            };

            $scope.getPath = function () {
                if ($scope.spec && $scope.spec.experimentSteps && $scope.spec.experimentSteps[$scope.step - 1]) {

                    return $scope.spec.experimentSteps[$scope.step - 1].template
                }
            };

            $scope.$watch(function () {
                return $scope.step;
            }, function (newValue, oldValue) {
                if (newValue > $scope.spec.experimentSteps.length) {
                    $scope.finishExperiment();
                }
            });


            $scope.finishExperiment = function () {

                $scope.step = 0;
                $scope.stage = $scope.FINAL_STAGE;

                // send back results to server
                $scope.resultsSending = true;
                $scope.resultsSentSuccessfully = undefined;
                $http.post('/experiments', $scope.results)
                    .success(function (data, status, headers, config) {

                        $scope.resultsSending = false;
                        $scope.resultsSentSuccessfully = true;
                    })
                    .error(function (data, status, headers, config) {
                        $scope.resultsSending = false;
                        $scope.resultsSentSuccessfully = false;
                    });
            };

            $scope.prettyResults = function () {
                return JSON.stringify($scope.results, undefined, 2);
            };


        }]);


    app.controller('RapidScanCtrl', ['$scope', '$resource', '$routeParams', '$route', '$http', '$timeout', 'Media', 'AudioEvent', 'Tag',
        function RapidScanCtrl($scope, $resource, $routeParams, $route, $http, $timeout, Media, AudioEvent, Tag) {
            var BASE_URL = "http://sensor.mquter.qut.edu.au/Spectrogram.ashx?ID={0}&start={1}&end={2}";
            $scope.ft = baw.secondsToDurationFormat;

            $scope.bigScope = $scope.$parent.$parent;

            $scope.bigScope.results.steps = angular.copy($scope.bigScope.spec.experimentSteps);

            $scope.stepResults = undefined;
            var EXPERIMENT_STEPS = $scope.bigScope.results.steps.length;
            $scope.$watch(function () {
                return $scope.bigScope.step;
            }, function (newValue, oldValue) {
                if (newValue <= EXPERIMENT_STEPS) {

                    $scope.showInstructions = true;

                    $scope.stepResults = $scope.bigScope.results.steps[$scope.bigScope.step - 1];
                    $scope.stepResults.hits = [];

                    $scope.flashes = calculateFlashes();
                }
            });

            $scope.showInstructions = true;
            $scope.showDoneButton = false;
            $scope.start = function () {
                $scope.showInstructions = false;
                $scope.stepResults.startTimeStamp = (new Date()).toISOString();

                $scope.flashes[0].show = true;
                $scope.currentFlash = 0;


                $scope.showDoneButton = false;
                $scope.tick();
                $scope.focus();
                $timeout(function() {
                    $scope.focus();
                })
            };

            var lastTick, pauseTick;
            $scope.paused = false;
            $scope.pauseOrResume = function() {
                if ($scope.paused) {
                    $scope.paused = false;
                    document.getElementById("countDown" + $scope.currentFlash).style.webkitAnimationPlayState = 'running';

                    var diff = lastTick - pauseTick;
                    pauseTick = 0;
                    $timeout(function() {
                        $scope.tick();
                    }, diff);
                } else {
                    $scope.paused = true;
                    pauseTick = Date.now();
                    document.getElementById("countDown" + $scope.currentFlash).style.webkitAnimationPlayState = 'paused';
                }
            };

            $scope.focus = function() {
                // bad voodoo
                document.getElementById('experimentKeyPressDiv').focus();
            };

            $scope.animationText = function() {
              return 'collapseWidthLeft ' + $scope.stepResults.speed  + 's linear 0s'
            };

            var stopTicker;
            $scope.tick = function () {
                stopTicker = $timeout(function () {
                        if($scope.paused) {
                            // exit early to disable timer
                            return;
                        }

                        $scope.flashes[$scope.currentFlash].show = false;
                        $scope.currentFlash++;

                        $scope.focus();

                        if ($scope.currentFlash >= $scope.flashes.length) {
                            $scope.stepResults.endFlashesTimeStamp = (new Date()).toISOString();
                            $scope.showDoneButton = true;
                            return;
                        }

                        lastTick = Date.now();

                        $scope.flashes[$scope.currentFlash].show = true;

                        $scope.tick();
                    },
                    $scope.stepResults.speed * 1000
                );
            };

            $scope.hit = function ($event) {
                console.log("HIT!");
                $scope.flashes[$scope.currentFlash].detected = true;
                $scope.stepResults.hits.push({card: $scope.currentFlash, timeStamp: (new Date()).toISOString()});
            };


            $scope.end = function () {
                $scope.stepResults.endTimeStamp = (new Date()).toISOString();
                $scope.bigScope.step = $scope.bigScope.step + 1;
            };

            $scope.SPECTROGRAM_WIDTH = 1080;
            var PPS = 45;
            $scope.flashes = [];

            function calculateFlashes() {

                // work out the scale of flash cards that need to be shown
                var adjustedPPS = PPS * $scope.stepResults.compression,
                    segmentDuration = $scope.SPECTROGRAM_WIDTH / adjustedPPS;

                var segments = [];
                for (var segmentIndex = 0; segmentIndex < $scope.stepResults.segments.length; segmentIndex++) {
                    var segment = $scope.stepResults.segments[segmentIndex];
                    var durationSeconds = segment.endTime - segment.startTime;

                    var numberOfSegments = durationSeconds / segmentDuration;

                    for (var i = 0; i < numberOfSegments; i++) {
                        var start = segment.startTime + (i * segmentDuration),
                            end = start + segmentDuration;

                        var imageUrl = String.format(BASE_URL, segment.audioId, start * 1000, end * 1000);

                        segments.push({start: start, end: end, imageLink: imageUrl, show: false, detected: false});
                    }
                }

                return segments;
            }
        }]);

    app.controller('VirtualBirdTourCtrl', ['$scope', '$resource', '$routeParams', '$route', '$http', 'Media', 'AudioEvent', 'Tag',
        function VirtualBirdTourCtrl($scope, $resource, $routeParams, $route, $http, Media, AudioEvent, Tag) {

            $scope.bigScope = $scope.$parent;

            $scope.bigScope.results.steps = angular.copy($scope.bigScope.spec.experimentSteps);

            $scope.locationMap = new google.maps.Map(document.getElementById("locationMap"),
                {center: new google.maps.LatLng(-24.287027, 134.208984),
                    zoom: 4,
                    mapTypeId: google.maps.MapTypeId.HYBRID});

            $scope.locationMarker = new google.maps.Marker({
                position: new google.maps.LatLng(-24.287027, 134.208984),
                map: $scope.locationMap,
                title: "Australia"
            });

            $scope.stepResults = undefined;
            $scope.$watch(function () {
                return $scope.bigScope.step;
            }, function (newValue, oldValue) {
                $scope.stepResults = $scope.bigScope.results.steps[$scope.bigScope.step - 1];


                $scope.currentLocation = $scope.getLocation($scope.stepResults.locationName);
                $scope.currentLocationName = $scope.currentLocation.name + " - " + $scope.currentLocation.environmentType;

                $scope.currentLocationMapLocal = $scope.getMapForLocation($scope.stepResults.locationName, 14);
                $scope.currentLocationMapArea = $scope.getMapForLocation($scope.stepResults.locationName, 6);
                $scope.currentLocationMapCountry = $scope.getMapForLocation($scope.stepResults.locationName, 3);

                $scope.currentSpecies = $scope.getSpeciesInfo($scope.stepResults.speciesCommonName);

                $scope.currentExamples = $scope.annotations.filter(function (element, index, array) {
                    return ($scope.stepResults.exampleAnnotationIds.indexOf(element.id) != -1);
                });

                $scope.currentVerify = $scope.annotations.filter(function (element, index, array) {
                    return ($scope.stepResults.verifyAnnotationIds.indexOf(element.id) != -1);
                });

                // change the map
                $scope.locationMap.setZoom(4);
                $scope.locationMap.panTo(
                    new google.maps.LatLng($scope.currentLocation.lat, $scope.currentLocation.long));

                // change the marker
                $scope.locationMarker.setPosition(
                    new google.maps.LatLng($scope.currentLocation.lat, $scope.currentLocation.long));
                $scope.locationMarker.setTitle($scope.currentLocationName);

            });

            $scope.selectedTab = "instructions";

            $scope.locations = angular.copy($scope.bigScope.spec.locations);
            $scope.species = angular.copy($scope.bigScope.spec.species);
            $scope.annotations = angular.copy($scope.bigScope.spec.annotations);

            $scope.getLocation = function (name) {
                var found = $scope.locations.filter(function (element, index, array) {
                    return (element.name == name);
                });
                if (found.length == 1) {
                    return found[0];
                }
                return null;
            };

            $scope.getMapForLocation = function (locationName, zoom) {
                var locationInfo = $scope.getLocation(locationName);
                if (locationInfo) {
                    //var locationEncoded = baw.angularCopies.encodeUriQuery(locationInfo.name, true);
                    var markerEncoded = baw.angularCopies.encodeUriQuery("color:0x7a903c|label:W|" + locationInfo.lat + "," + locationInfo.long, true);
                    var styleEncoded1 = baw.angularCopies.encodeUriQuery("style=feature:administrative", true);
                    var styleEncoded2 = baw.angularCopies.encodeUriQuery("style=feature:landscape.natural", true);
                    var styleEncoded3 = baw.angularCopies.encodeUriQuery("style=feature:water", true);
                    return "https://maps.googleapis.com/maps/api/staticmap?sensor=false&size=200x200&maptype=hybrid&markers=" + markerEncoded +
                        "&zoom=" + zoom;
                }
                return null;
            };

            $scope.getSpeciesInfo = function (speciesCommonName) {
                var found = $scope.species.filter(function (element, index, array) {
                    return (element.commonName == speciesCommonName);
                });
                if (found.length == 1) {
                    return found[0];
                }
                return null;
            };

            $scope.getExamples = function () {

            };

        }]);
})();