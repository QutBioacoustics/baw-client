class CitizenScienceListenController {
    constructor($scope,
                ngAudioEvents,
                CitizenScienceCommon,
                CsSamples,
                SampleLabels,
                backgroundImage,
                Question,
                $routeParams,
                StudyService,
                onboardingService
    ) {

        //var self = this;

        /**
         * The name of the css project as it appears in the dataset definition
         * @type {string}
         */
        $scope.csProject = $routeParams.studyName;

        /**
         * The current sample object, including sample id
         * @type {number}
         */
        $scope.currentItem = CsSamples.currentItem;

        $scope.onPlayed = CsSamples.onPlayed;

        // to be populated after getting samples from dataset
        $scope.media = null;

        onboardingService.addSteps([
            {
                element: ".citizen-science .spectrogram-wrapper",
                intro: "This shows a picture of the audio as a spectrogram.",
                order: 0
            },
            {
                element: "previous-play-next",
                intro: "Start or stop the audio here.",
                order: 0
            },

            {
                element: "dataset-progress .btn",
                intro: "When you have finished applying labels, use this button to go to the next clip",
                order: 10

            },
            {
                element: ".autoplay",
                intro: "Switch this on to automatically progress to the next clip when you reach the end of the current one.",
                order: 11
            }

        ]);

        $scope.questionData = {};

        // the model passed to ngAudio
        $scope.audioElementModel = CitizenScienceCommon.getAudioModel();
        $scope.sampleContext = {
            site: null,
            date: null,
            time: null
        };

        // get the study information by name, then load the appropriate question data
        StudyService.studyByName($routeParams.studyName).then(x => {
            var studies = x.data.data;
            if (studies.length === 0) {
                console.warn("No study " + $routeParams.studyName + " exists");
                return;
            } else if (studies.length > 1) {
                console.warn("More than one study found. Using the first one");
            }

            $scope.study = studies[0];

            Question.questions($scope.study.id).then(x => {
                console.log("questions loaded", x);
                //TODO: update to allow multiple questions
                $scope.questionData = x.data.data[0].questionData;

                SampleLabels.init(x.data.data[0], $scope.study.id);
            });
        });


        $scope.studyTitle = {"bristlebird": "Eastern Bristlebird Search", "koala-verification": "Koala Verification"}[$scope.csProject];



        //SampleLabels.init($scope.csProject, $scope.samples, $scope.labels);

        /**
         * When the currentItem changes, change the current audio file / spectrogram to match it
         */
        $scope.$watch(function () {

                // returns the current item if the media is loaded, otherwise returns false.
                var currentItem = CsSamples.currentItem();
                if (currentItem.hasOwnProperty("media")) {
                    return currentItem;
                }

                return false;
            },
            function (item, oldVal) {
                if (item) {
                    $scope.media = item.media;
                    if (item.hasOwnProperty("audioRecording")) {
                        backgroundImage.setBackgroundImageForItem(item.audioRecording, item.startTimeSeconds);

                    }
                }
            });

        /**
         * auto play feature
         * when the playback arrives at the end of the audio, it will proceed to the next segment.
         */
        $scope.$on(ngAudioEvents.ended, function navigate(event) {

            if (event.targetScope.audioElementModel === $scope.audioElementModel && $scope.audioElementModel.autoPlay) {
                $scope.$broadcast("autoNextTrigger");
            }
        });

    }

}

angular
    .module("bawApp.citizenScience.listen", [
        "bawApp.components.progress",
        "bawApp.citizenScience.common",
        "bawApp.citizenScience.sampleLabels",
        "bawApp.citizenScience.csLabels",
        "bawApp.components.onboarding",
        "bawApp.components.background"
    ])
    .controller(
        "CitizenScienceListenController",
        [
            "$scope",
            "ngAudioEvents",
            "CitizenScienceCommon",
            "CsSamples",
            "SampleLabels",
            "backgroundImage",
            "Question",
            "$routeParams",
            "Study",
            "onboardingService",
            CitizenScienceListenController
        ]);
