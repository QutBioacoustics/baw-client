angular.module("bawApp.components.citizenScienceThumbLabels",
    [
        "bawApp.components.citizenScienceThumbLabels.label"
    ])
    .component("citizenScienceLabels", {
        templateUrl: "citizenScience/thumbLabels/labels.tpl.html",
        controller: [
            "$scope",
            "$http",
            "CitizenScienceCommon",
            "annotationLibraryCommon",
            "AudioEvent",
            "baw.models.AudioEvent",
            "$q",
            function ($scope,
                      $http,
                      CitizenScienceCommon,
                      libraryCommon,
                      AudioEventService,
                      AudioEvent,
                      $q) {

                var self = this;

                console.log(" --- current sample num (labels) ", self.currentSampleNum);

                $scope.currentDetailsLabelNum = {value: -1};

                // $scope.onToggleShowInfo = function (labelNum) {
                //     console.log("onToggleSelected", labelNum);
                //
                //     if ($scope.selectedLabelNum.value === labelNum) {
                //         $scope.selectedLabelNum.value = -1;
                //     } else {
                //         $scope.selectedLabelNum.value = labelNum;
                //     }
                //
                // };

                $scope.examplesPosition = "0px";

                // $scope.$on("examples-position", function (event, newPosition) {
                //     console.log("examples-position has changed: ", newPosition);
                //     $scope.examplesPosition = newPosition + "px";
                // });

                $scope.$on("update-selected-labels", function (e, sampleNum) {




                });


                $scope.$watch(function () {
                    return self.labels;
                }, function (newVal, oldVal) {
                    self.fetchAnnotationData(newVal);
                });

                /**
                 * fetches site/project/media data for all label examples
                 * updates the labels' examples array, replacing each annotationId with a
                 * full "anotation" object that contains the AudioEvent model as well Media model
                 * @param labels Object
                 */
                self.fetchAnnotationData = function (labels) {

                    // transform labels structure into a single array of annotationsIds
                    var annotationIds = [].concat.apply([], labels.map(l => l.examples)).map(e => e.annotationId);

                    if (annotationIds.length === 0) {
                        return;
                    }

                    var annotations = [];

                    AudioEventService
                        .getAudioEventsByIds(annotationIds)
                        .then(function (response) {

                            annotations = response.data.data || [];

                            var annotationIds = new Set(),
                                recordingIds = new Set();

                            annotations.forEach(function (resource, index) {

                                annotationIds.add(resource.id);
                                recordingIds.add(resource.audioRecordingId);
                                libraryCommon.addCalculatedProperties(resource);

                            });

                            var data = {
                                annotations,
                                annotationIds,
                                recordingIds
                            };

                            var x = libraryCommon.getSiteMediaAndProject(data);
                            return x;

                        }, function (error) {
                            console.log("get audio events by ids failed", error);
                        })
                        .then(function (response) {

                            // add annotations back into labels object
                            response.annotations.forEach(function (annotation) {
                               self.labels.forEach(function (l) {
                                   l.examples.forEach(function (e) {
                                       if (e.annotationId === annotation.id) {
                                           e.annotation = annotation;
                                       }
                                   });
                               });
                            });

                            console.log(self.labels);


                        }, function (httpResponse) {
                                console.error("Failed to load citizen science example item response.", httpResponse);
                        });


                };


            }],
        bindings: {
            labels: "=",
        }
    });