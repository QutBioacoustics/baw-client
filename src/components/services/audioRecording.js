angular
    .module("bawApp.services.audioRecording", [])
    .factory(
    "AudioRecording",
    [
        '$resource', "bawResource", '$http', 'conf.paths', 'QueryBuilder',
        function ($resource, bawResource, $http, paths, QueryBuilder) {
            var resource = bawResource(paths.api.routes.audioRecording.showAbsolute,
                                       {projectId: "@projectId", siteId: "@siteId", recordingId: '@recordingId'});

            var filterUrl = paths.api.routes.audioRecording.filterAbsolute;
            var query = QueryBuilder.create(function (q) {
                return q
                    .sort({orderBy: "createdAt", direction: "desc"})
                    .page({page: 1, items: 10})
                    .project({include: ["id", "siteId", "durationSeconds", "recordedDate", "createdAt"]});
            });
            resource.getRecentRecordings = function () {


                return $http.post(filterUrl, query.toJSON());
            };

            resource.getRecordingsForVisualization = function (siteIds) {
                var query = QueryBuilder.create(function (q) {

                    //  WARNING: potentially very large queries because paging is disabled
                    return q
                        .in("siteId", siteIds)
                        .project({include: ["id", "siteId", "durationSeconds", "recordedDate"]})
                        .page.disable()
                        .sort({orderBy: "id"});
                });

                return $http.post(filterUrl, query.toJSON());
            };

            return resource;
        }
    ]
);