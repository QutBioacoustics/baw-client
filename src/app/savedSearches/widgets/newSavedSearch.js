const newSavedSearchControllerSymbol = Symbol("newSavedSearchControllerPrivates");

class NewSavedSearchController {
    constructor($scope, SavedSearchModel, ProjectService, SiteService) {
        //let controller = this;
        this[newSavedSearchControllerSymbol] = {};
        let privates = this[newSavedSearchControllerSymbol];
        privates.SiteService = SiteService;
        privates.$scope = $scope;

        // when created make sure there is a model to edit
        if (!this.newSavedSearch || !(this.newSavedSearch instanceof SavedSearchModel)) {
            this.newSavedSearch = new SavedSearchModel();
        }

        // storage for dynamic bits
        this.projects = [];
        this.sites = [];

        // load projects
        ProjectService
            .getAllProjectNames()
            .then((response) => this.projects = response.data.data);


        // WARNING: object structural equality watcher!
        $scope.$watch(
            () => this.newSavedSearch,
            () => this.newSavedSearch.updateQueryFromBasicFilter(),
            true
        );

        $scope.$watch(
            () => this.newSavedSearch.basicFilter.projectId,
            (newValue) => {
                if (newValue) {
                    this.downloadSites();
                }
            }
        );
    }

    selectAllSites(siteSelectorModel) {
        this.newSavedSearch.basicFilter.siteIds = this.sites.map(s => s.id);
        siteSelectorModel.$setDirty();
    }

    downloadSites() {
        this[newSavedSearchControllerSymbol].SiteService
            .getSitesByProjectIds([this.newSavedSearch.basicFilter.projectId])
            .then((response) => this.sites = response.data.data);
    }


}

angular
    .module("bawApp.savedSearches.widgets.new", [])
    .controller("NewSavedSearchController", [
        "$scope",
        "baw.models.SavedSearch",
        "Project",
        "Site",
        NewSavedSearchController
    ])
    .component("newSavedSearch", {
        bindings: {
            newSavedSearch: "=model",
        },
        controller: "NewSavedSearchController",
        templateUrl: ["conf.paths", function (paths) {
            return paths.site.files.savedSearches.new;
        }]
    });

