class BristlebirdAboutController {
    constructor($scope,
                $location) {

        $scope.citizenScientistName = "";

        $scope.getStarted = function () {
            localStorage.setItem("citizenScientistName", $scope.citizenScientistName);
            $location.path("/citsci/bristlebird/listen");
        };
    }
}


class BristlebirdController {
    constructor($scope,
                $routeParams,
                $http,
                ngAudioEvents,
                AudioRecording,
                Media,
                MediaModel,
                UserProfile,
                UserProfileEvents,
                CitizenScienceCommon,
                backgroundImage,
                paths) {

        var self = this;

        /**
         * The name of the css project as it appears in the dataset definition
         * @type {string}
         */
        $scope.csProject = "ebb";

        /**
         * The duration of each audio sample
         * currently all samples will be the same duration (not set per sample in the dataset)
         * @type {number}
         */
        self.sampleDuration = 25;

        /**
         * list of the samples, to be retrieved from the dataset
         * @type {Array}
         */
        $scope.samples = [];

        /**
         * Inddex in the samples array of the current sample
         * @type {number}
         */
        $scope.currentSampleNum = -1;

        // to be populated after getting samples from dataset
        $scope.media = null;


        $scope.onboardingSteps = [
            {
                element: document.querySelector(".citizen-science .spectrogram-wrapper"),
                intro: "This shows a picture of the audio as a spectrogram."
            },
            {
                element: document.querySelector("dataset-progress"),
                intro: "This shows how many clips you have listened do, and lets you navigate between clips"
            },
            {
                element: document.querySelector(".autoplay"),
                intro: "Switch this on to automatically progress to the next clip and play it."
            }
        ];

        /**
         * Labels that the user can select.
         * applies one or more tags which are not shown to the user.
         * example response from server
         *   [{
         *      "tags": ["ebb", "type1"],
         *      "name": "Eastern Bristlebird",
         *      "examples": [{
         *          "annotationId": 124730
         *      },{
         *          "annotationId": 124727
         *      },{
         *           "annotationId": 98378
         *       }]
         *   },
         *   {
         *       "tags": ["ground_parrot", "type1"],
         *       "name": "Ground Parrot",
         *       "examples": [{
         *           "annotationId": 124622
         *       }]
         *   },
         *   {
         *       "tags": ["quoll", "type1"],
         *       "label": "Spotted Quoll",
         *       "examples": []
         *   }];
         */

        $scope.labels = [];

        self.getSamples = CitizenScienceCommon.bindGetSamples($scope);

        // the model passed to ngAudio
        $scope.model = {
            audioElement: CitizenScienceCommon.getAudioModel()
        };

        this.showAudio = CitizenScienceCommon.bindShowAudio($scope);

        CitizenScienceCommon.getLabels($scope.csProject).then(function (labels) {

            console.log("labels received", labels);

                $scope.labels = labels;
        });


        $scope.$on("label-toggle", function (e, labelNumber, value) {
            self.toggleLabel(labelNumber, value);
        });


        /**
         * applies or removes the tag-sets from the given label number
         * to the current sample
         * @param labelNumber
         */
        self.toggleLabel = function (labelNumber, value) {

            console.log("toggling lable ", labelNumber, value);
            var currentSample = $scope.samples[$scope.currentSampleNum];
            if (typeof value === "boolean") {
                currentSample.labels[labelNumber] = value;
            } else {
                currentSample.labels[labelNumber] = !currentSample.labels[labelNumber];
            }

            currentSample.done = true;

            var tags = $scope.labels.filter(function (value, index) {
                return currentSample.labels[index];
            }).map(function (value) {
                return value.tags;
            });

            console.log("new tags for sample: ", CitizenScienceCommon.labelsAsString(tags));

            var url = CitizenScienceCommon.apiUrl("setLabels",
                $scope.csProject,
                currentSample.name,
                currentSample.recordingId,
                currentSample.startOffset,
                CitizenScienceCommon.labelsAsString(tags));
            $http.get(url).then(function (response) {
                console.log(response.data);
            });

        };


        /**
         * Get settings from sheet
         */
        $http.get(CitizenScienceCommon.apiUrl(
            "settings",
            $scope.csProject
        )).then(function (response) {
            $scope.settings = response.data;
            if ($scope.settings.hasOwnProperty("sampleDuration")) {
                self.sampleDuration = $scope.settings.sampleDuration;
            }
        });

        // /**
        //  * Sets the current sample to sampleNum
        //  * @param sample_num int the index of the samples array of json objects
        //  */
        // $scope.goToSample = function (sampleNum) {
        //     if (sampleNum < $scope.samples.length && sampleNum >= 0) {
        //         $scope.currentSampleNum = sampleNum;
        //
        //
        //
        //
        //     } else {
        //         console.log("can't go to next sample because this is the last one");
        //     }
        //
        // };







        /**
         * When the currentSampleNum changes, change the current audio file / spectrogram to match it
         */
        $scope.$watch("currentSampleNum", function () {
            if ($scope.currentSampleNum > -1) {
                console.log("load audio for sample " + $scope.currentSampleNum);
                var currentSample = $scope.samples[$scope.currentSampleNum];
                self.showAudio(currentSample.recordingId, currentSample.startOffset, self.sampleDuration);
                var backgroundPath = self.backgroundPaths[$scope.currentSampleNum % (self.backgroundPaths.length - 1)];
                backgroundImage.currentBackground = backgroundPath;

                $scope.$broadcast("update-selected-labels", $scope.samples[$scope.currentSampleNum].labels);

            }
        });

        /**
         * Reload audio when the source changes. Without this it won't change the audio
         * even though the src attribute changes
         */
        $scope.$watch("media", function () {
            document.querySelector("audio").load();
        });

        /**
         * auto play feature
         * when the playback arrives at the end of the audio, it will proceed to the next segment.
         */
        $scope.$on(ngAudioEvents.ended, function navigate(event, model) {
            if (model === $scope.model.audioElement) {
                var nextSampleNum = $scope.currentSampleNum + 1;
                console.info("Changing page to next segment, which is segment " + nextSampleNum);
                $scope.$safeApply($scope, function () {
                    $scope.goToSample(nextSampleNum);
                });
            }
        });


        self.backgroundPaths = ["1.jpg","2.jpg","3.jpg","4.jpg"].map(fn => paths.site.assets.backgrounds.citizenScience + fn);

    }

}

angular
    .module("bawApp.citizenScience.bristlebird", [
        "bawApp.components.progress",
        "bawApp.citizenScience.common",
//        "bawApp.components.citizenScienceTextLabels",
//        "bawApp.components.citizenScienceExamples",
        "bawApp.components.citizenScienceThumbLabels",
        "bawApp.components.onboarding",
        "bawApp.components.background"
    ])
    .controller(
        "BristlebirdController",
        [
            "$scope",
            "$routeParams",
            "$http",
            "ngAudioEvents",
            "AudioRecording",
            "Media",
            "baw.models.Media",
            "UserProfile",
            "UserProfileEvents",
            "CitizenScienceCommon",
            "backgroundImage",
            "conf.paths",
            BristlebirdController
        ])
    .controller(
        "BristlebirdAboutController",
        [
            "$scope",
            "$location",
            BristlebirdAboutController
        ]);
