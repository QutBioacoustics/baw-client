const jobNewControllerSymbol = Symbol("JobNewControllerPrivates");

class JobNewController {
    constructor($scope, $routeParams, $timeout, paths, AnalysisJobService, AnalysisJobModel, ScriptService) {
        this[jobNewControllerSymbol] = {};
        let privates = this[jobNewControllerSymbol];
        
        let controller = this;

        this.jobListPath = paths.site.ngRoutes.analysisJobs.list;
        
        privates.newSavedSearch = false;
        privates.$scope = $scope;
        privates.$timeout = $timeout;
        privates.$scope.newAnalysisJobForm = null;

        // the new analysis job we are making
        this.analysisJob = new AnalysisJobModel();
        this.selectedSavedSearch = null;

        // the available scripts
        this.scripts = [];

        // download available scripts
        ScriptService
            .query()
            .then(function (response) {
                controller.scripts = response.data.data;
            });


        this.aceConfig = {
            useWrapMode: true,
            showGutter: true,
            theme: "xcode",
            mode: "yaml",
            firstLineNumber: 1,
            onLoad: this.aceLoaded,
            onChange: this.aceChanged
        };

        $scope.$watch(
            () => this.analysisJob.scriptId,
            (newValue) => {
                if (newValue === null || newValue === undefined) {
                    return;
                }

                this.analysisJob.customSettings =
                    this.scripts.find(x => x.id === newValue).executableSettings;
            }
        );

        $scope.$watch(
            () => this.analysisJob.selectedSavedSearch,
            (newValue) => {
                if (newValue === null || newValue === undefined) {
                    this.analysisJob.savedSearchId = null;

                }
                else {
                    this.analysisJob.savedSearchId = newValue.id;
                }
            }
        );
    }

    aceLoaded(editor) {
        editor.getSession().setUseSoftTabs(true);

        editor.maxLines = Infinity;

        // This is to remove following warning message on console:
        // Automatically scrolling cursor into view after selection change this will be disabled in the next
        // version set editor.$blockScrolling = Infinity to disable this message
        editor.$blockScrolling = Infinity;
    }

    aceChanged() {

    }

    get newSavedSearch() {
        return this[jobNewControllerSymbol].newSavedSearch;
    }

    set newSavedSearch(value) {
        let p = this[jobNewControllerSymbol];

        p.newSavedSearch = value;
        this.selectedSavedSearch = null;

        // this hack fixes: after form has been submitted, user chooses, new saved search,
        // form fields are pristine.
        if (p.$scope.newAnalysisJobForm.$invalid && p.$scope.newAnalysisJobForm.$submitted) {
            p.$timeout(() => p.$scope.$broadcast("$submitted"));
        }
    }


    scriptSelect(id) {
        this.analysisJob.scriptId = id;
    }

    submitAnalysisJob() {
        console.info("submitAnalysisJob: ", this.analysisJob);


    }
}

angular
    .module("bawApp.jobs.new", [])
    .controller(
        "JobNewController",
        [
            "$scope",
            "$routeParams",
            "$timeout",
            "conf.paths",
            "AnalysisJob",
            "baw.models.AnalysisJob",
            "Script",
            JobNewController
        ]);

