angular
    .module("bawApp.services.analysisResult", [])
    .factory(
        "AnalysisResult",
        [
            "$resource",
            "bawResource",
            "$http",
            "$q",
            "conf.paths",
            "lodash",
            "casingTransformers",
            "QueryBuilder",
            "baw.models.AnalysisResult",
            "$url",
            function ($resource,
                      bawResource,
                      $http,
                      $q,
                      paths,
                      _,
                      casingTransformers,
                      QueryBuilder,
                      AnalysisResultModel,
                      $url) {

                function query(analysisJobId, recordingId) {
                    const url = $url.formatUri(
                        paths.api.routes.analysisResults.jobAbsolute,
                        {analysisJobId, recordingId}
                    );
                    return $http
                        .get(url)
                        .then(x => AnalysisResultModel.makeFromApi(x));
                }

                function get(analysisJobId, path, page = 1) {
                    const url = $url.formatUri(
                        paths.api.routes.analysisResults.jobWithPathAbsolute,
                        {analysisJobId, path}
                    );

                    let pageParams = QueryBuilder.create(function (baseQuery) {
                        let q = baseQuery.page({page: page, items: 100});

                        return q;
                    }).toQueryString();

                    return $http
                        .get(url, {params: pageParams})
                        .then(x => AnalysisResultModel.makeFromApi(x));
                }

                return {
                    query,
                    get
                };
            }
        ]

                    },
                    {
                        "analysis_job_id": 1,
                        "audio_recording_id": 1234,
                        "path": "/1234/Towsey.Acoustic/Hello/test/bigtest/test.txt",
                        "name": "test.txt",
                        "type": "directory",
                        "children": []
                    },
                    {
                        "analysis_job_id": 1,
                        "audio_recording_id": 1234,
                        "path": "/1234/Towsey.Acoustic/ZoomingTiles",
                        "name": "ZoomingTiles",
                        "type": "directory",
                        "has_zip": false,
                        "children": []
                    },
                    {

                        "analysis_job_id": 1,
                        "audio_recording_id": 1234,
                        "path": "/1234/Towsey.Acoustic",
                        "name": "Towsey.Acoustic",
                        "type": "directory",
                        "has_zip": true,
                        "children": [
                            {

                                "name": "4c77b524-1857-4550-afaa-c0ebe5e3960a_20101012-140000Z__IndexGenerationData.json",
                                "type": "file",
                                "size_bytes": 217,
                                "mime": "application/json"
                            },
                            {

                                "name": "4c77b524-1857-4550-afaa-c0ebe5e3960a_20101012-140000Z__IndexStatistics.json",
                                "type": "file",
                                "size_bytes": 12549,
                                "mime": "application/json"
                            },
                            {

                                "name": "4c77b524-1857-4550-afaa-c0ebe5e3960a_20101012-140000Z__IndexDistributions.png",
                                "type": "file",
                                "size_bytes": 21726,
                                "mime": "image/png"
                            },
                            {

                                "name": "4c77b524-1857-4550-afaa-c0ebe5e3960a_20101012-140000Z__ACI.png",
                                "type": "file",
                                "size_bytes": 394539,
                                "mime": "image/png"
                            },
                            {

                                "name": "4c77b524-1857-4550-afaa-c0ebe5e3960a_20101012-140000Z__BGN.png",
                                "type": "file",
                                "size_bytes": 271785,
                                "mime": "image/png"
                            },
                            {

                                "name": "4c77b524-1857-4550-afaa-c0ebe5e3960a_20101012-140000Z__CVR.png",
                                "type": "file",
                                "size_bytes": 406413,
                                "mime": "image/png"
                            },
                            {

                                "name": "4c77b524-1857-4550-afaa-c0ebe5e3960a_20101012-140000Z__DIF.png",
                                "type": "file",
                                "size_bytes": 10799,
                                "mime": "image/png"
                            },
                            {

                                "name": "4c77b524-1857-4550-afaa-c0ebe5e3960a_20101012-140000Z__ENT.png",
                                "type": "file",
                                "size_bytes": 397892,
                                "mime": "image/png"
                            },
                            {

                                "name": "4c77b524-1857-4550-afaa-c0ebe5e3960a_20101012-140000Z__EVN.png",
                                "type": "file",
                                "size_bytes": 420567,
                                "mime": "image/png"
                            },
                            {

                                "name": "4c77b524-1857-4550-afaa-c0ebe5e3960a_20101012-140000Z__SUM.png",
                                "type": "file",
                                "size_bytes": 6001,
                                "mime": "image/png"
                            },
                            {

                                "name": "4c77b524-1857-4550-afaa-c0ebe5e3960a_20101012-140000Z__POW.png",
                                "type": "file",
                                "size_bytes": 386530,
                                "mime": "image/png"
                            },
                            {

                                "name": "4c77b524-1857-4550-afaa-c0ebe5e3960a_20101012-140000Z__SPT.png",
                                "type": "file",
                                "size_bytes": 332683,
                                "mime": "image/png"
                            },
                            {

                                "name": "4c77b524-1857-4550-afaa-c0ebe5e3960a_20101012-140000Z__BGN-POW-CVR.png",
                                "type": "file",
                                "size_bytes": 830777,
                                "mime": "image/png"
                            },
                            {

                                "name": "4c77b524-1857-4550-afaa-c0ebe5e3960a_20101012-140000Z__ACI-ENT-EVN.png",
                                "type": "file",
                                "size_bytes": 954437,
                                "mime": "image/png"
                            },
                            {

                                "name": "4c77b524-1857-4550-afaa-c0ebe5e3960a_20101012-140000Z__2Maps.png",
                                "type": "file",
                                "size_bytes": 1555863,
                                "mime": "image/png"
                            },
                            {

                                "name": "4c77b524-1857-4550-afaa-c0ebe5e3960a_20101012-140000Z__BGN-POW-CVR.SummaryRibbon.png",
                                "type": "file",
                                "size_bytes": 5367,
                                "mime": "image/png"
                            },
                            {

                                "name": "4c77b524-1857-4550-afaa-c0ebe5e3960a_20101012-140000Z__ACI-ENT-EVN.SummaryRibbon.png",
                                "type": "file",
                                "size_bytes": 5486,
                                "mime": "image/png"
                            },
                            {

                                "name": "4c77b524-1857-4550-afaa-c0ebe5e3960a_20101012-140000Z__BGN-POW-CVR.SpectralRibbon.png",
                                "type": "file",
                                "size_bytes": 105946,
                                "mime": "image/png"
                            },
                            {

                                "name": "4c77b524-1857-4550-afaa-c0ebe5e3960a_20101012-140000Z__ACI-ENT-EVN.SpectralRibbon.png",
                                "type": "file",
                                "size_bytes": 121949,
                                "mime": "image/png"
                            },
                            {

                                "name": "4c77b524-1857-4550-afaa-c0ebe5e3960a_20101012-140000Z__ACI-ENT-EVN.Tile_20101012-140000Z_60.png",
                                "type": "file",
                                "size_bytes": 40594,
                                "mime": "image/png"
                            },
                            {

                                "name": "4c77b524-1857-4550-afaa-c0ebe5e3960a_20101012-140000Z__ACI-ENT-EVN.Tile_20101012-150000Z_60.png",
                                "type": "file",
                                "size_bytes": 38652,
                                "mime": "image/png"
                            },
                            {

                                "name": "4c77b524-1857-4550-afaa-c0ebe5e3960a_20101012-140000Z__ACI-ENT-EVN.Tile_20101012-160000Z_60.png",
                                "type": "file",
                                "size_bytes": 38851,
                                "mime": "image/png"
                            },
                            {

                                "name": "4c77b524-1857-4550-afaa-c0ebe5e3960a_20101012-140000Z__ACI-ENT-EVN.Tile_20101012-170000Z_60.png",
                                "type": "file",
                                "size_bytes": 35306,
                                "mime": "image/png"
                            },
                            {

                                "name": "4c77b524-1857-4550-afaa-c0ebe5e3960a_20101012-140000Z__ACI-ENT-EVN.Tile_20101012-180000Z_60.png",
                                "type": "file",
                                "size_bytes": 38927,
                                "mime": "image/png"
                            },
                            {

                                "name": "4c77b524-1857-4550-afaa-c0ebe5e3960a_20101012-140000Z__ACI-ENT-EVN.Tile_20101012-190000Z_60.png",
                                "type": "file",
                                "size_bytes": 48092,
                                "mime": "image/png"
                            },
                            {

                                "name": "4c77b524-1857-4550-afaa-c0ebe5e3960a_20101012-140000Z__ACI-ENT-EVN.Tile_20101012-200000Z_60.png",
                                "type": "file",
                                "size_bytes": 45757,
                                "mime": "image/png"
                            },
                            {

                                "name": "4c77b524-1857-4550-afaa-c0ebe5e3960a_20101012-140000Z__ACI-ENT-EVN.Tile_20101012-210000Z_60.png",
                                "type": "file",
                                "size_bytes": 41888,
                                "mime": "image/png"
                            },
                            {

                                "name": "4c77b524-1857-4550-afaa-c0ebe5e3960a_20101012-140000Z__ACI-ENT-EVN.Tile_20101012-220000Z_60.png",
                                "type": "file",
                                "size_bytes": 43857,
                                "mime": "image/png"
                            },
                            {

                                "name": "4c77b524-1857-4550-afaa-c0ebe5e3960a_20101012-140000Z__ACI-ENT-EVN.Tile_20101012-230000Z_60.png",
                                "type": "file",
                                "size_bytes": 45503,
                                "mime": "image/png"
                            },
                            {

                                "name": "4c77b524-1857-4550-afaa-c0ebe5e3960a_20101012-140000Z__ACI-ENT-EVN.Tile_20101013-000000Z_60.png",
                                "type": "file",
                                "size_bytes": 40867,
                                "mime": "image/png"
                            },
                            {

                                "name": "4c77b524-1857-4550-afaa-c0ebe5e3960a_20101012-140000Z__ACI-ENT-EVN.Tile_20101013-010000Z_60.png",
                                "type": "file",
                                "size_bytes": 41826,
                                "mime": "image/png"
                            },
                            {

                                "name": "4c77b524-1857-4550-afaa-c0ebe5e3960a_20101012-140000Z__ACI-ENT-EVN.Tile_20101013-020000Z_60.png",
                                "type": "file",
                                "size_bytes": 44875,
                                "mime": "image/png"
                            },
                            {

                                "name": "4c77b524-1857-4550-afaa-c0ebe5e3960a_20101012-140000Z__ACI-ENT-EVN.Tile_20101013-030000Z_60.png",
                                "type": "file",
                                "size_bytes": 42020,
                                "mime": "image/png"
                            },
                            {

                                "name": "4c77b524-1857-4550-afaa-c0ebe5e3960a_20101012-140000Z__ACI-ENT-EVN.Tile_20101013-040000Z_60.png",
                                "type": "file",
                                "size_bytes": 42820,
                                "mime": "image/png"
                            },
                            {

                                "name": "4c77b524-1857-4550-afaa-c0ebe5e3960a_20101012-140000Z__ACI-ENT-EVN.Tile_20101013-050000Z_60.png",
                                "type": "file",
                                "size_bytes": 38260,
                                "mime": "image/png"
                            },
                            {

                                "name": "4c77b524-1857-4550-afaa-c0ebe5e3960a_20101012-140000Z__ACI-ENT-EVN.Tile_20101013-060000Z_60.png",
                                "type": "file",
                                "size_bytes": 41557,
                                "mime": "image/png"
                            },
                            {

                                "name": "4c77b524-1857-4550-afaa-c0ebe5e3960a_20101012-140000Z__ACI-ENT-EVN.Tile_20101013-070000Z_60.png",
                                "type": "file",
                                "size_bytes": 42659,
                                "mime": "image/png"
                            },
                            {

                                "name": "4c77b524-1857-4550-afaa-c0ebe5e3960a_20101012-140000Z__ACI-ENT-EVN.Tile_20101013-080000Z_60.png",
                                "type": "file",
                                "size_bytes": 34909,
                                "mime": "image/png"
                            },
                            {

                                "name": "4c77b524-1857-4550-afaa-c0ebe5e3960a_20101012-140000Z__ACI-ENT-EVN.Tile_20101013-090000Z_60.png",
                                "type": "file",
                                "size_bytes": 31175,
                                "mime": "image/png"
                            },
                            {

                                "name": "4c77b524-1857-4550-afaa-c0ebe5e3960a_20101012-140000Z__ACI-ENT-EVN.Tile_20101013-100000Z_60.png",
                                "type": "file",
                                "size_bytes": 29885,
                                "mime": "image/png"
                            },
                            {
                                "path": "/1234/Towsey.Acoustic/ZoomingTiles",
                                "name": "ZoomingTiles",
                                "type": "directory",
                                "has_children": true
                            },
                            {

                                "name": "4c77b524-1857-4550-afaa-c0ebe5e3960a_20101012-140000Z__ACI-ENT-EVN.Tile_20101013-110000Z_60.png",
                                "type": "file",
                                "size_bytes": 29891,
                                "mime": "image/png"
                            },
                            {

                                "name": "4c77b524-1857-4550-afaa-c0ebe5e3960a_20101012-140000Z__ACI-ENT-EVN.Tile_20101013-120000Z_60.png",
                                "type": "file",
                                "size_bytes": 29532,
                                "mime": "image/png"
                            },
                            {

                                "name": "4c77b524-1857-4550-afaa-c0ebe5e3960a_20101012-140000Z__ACI-ENT-EVN.Tile_20101013-130000Z_60.png",
                                "type": "file",
                                "size_bytes": 24295,
                                "mime": "image/png"
                            },
                            {

                                "name": "4c77b524-1857-4550-afaa-c0ebe5e3960a_20101012-140000Z__Towsey.Acoustic.Indices.csv",
                                "type": "file",
                                "size_bytes": 452247,
                                "mime": "text/csv"
                            },
                            {

                                "name": "4c77b524-1857-4550-afaa-c0ebe5e3960a_20101012-140000Z__Towsey.Acoustic.Indices_BACKUP.csv",
                                "type": "file",
                                "size_bytes": 452247,
                                "mime": "text/csv"
                            },
                            {

                                "name": "4c77b524-1857-4550-afaa-c0ebe5e3960a_20101012-140000Z__Towsey.Acoustic.ACI.csv",
                                "type": "file",
                                "size_bytes": 6581066,
                                "mime": "text/csv"
                            },
                            {

                                "name": "4c77b524-1857-4550-afaa-c0ebe5e3960a_20101012-140000Z__Towsey.Acoustic.BGN.csv",
                                "type": "file",
                                "size_bytes": 6581465,
                                "mime": "text/csv"
                            },
                            {

                                "name": "4c77b524-1857-4550-afaa-c0ebe5e3960a_20101012-140000Z__Towsey.Acoustic.CVR.csv",
                                "type": "file",
                                "size_bytes": 6821263,
                                "mime": "text/csv"
                            },
                            {

                                "name": "4c77b524-1857-4550-afaa-c0ebe5e3960a_20101012-140000Z__Towsey.Acoustic.DIF.csv",
                                "type": "file",
                                "size_bytes": 6213756,
                                "mime": "text/csv"
                            }
                        ]
                    }
                ];
                fakedData = casingTransformers.transformObject(fakedData, casingTransformers.camelize);

                function query() {
                    //const path = paths.api.routes.analysisResults;
                    return $q.when({data: {data: fakedData}})
                        .then(x => AnalysisResultModel.makeFromApi(x));
                }

                function get(path, page = 1) {

                    let data = angular.copy({data: fakedData.find(x => x.path === path), meta:{}});
                    let length = (data.data.children || []).length;
                    if (length > 100) {
                        let offset = (page - 1) * 100;
                        data.meta = {
                            paging: {
                                "page": page,
                                "items": 100,
                                "total": length,
                                "maxPage": Math.ceil(length / 100),
                                "current": null,
                                "previous": null,
                                "next": null
                            }
                        };
                        data.data.children = data.data.children.slice(offset, offset + 100);
                    }

                    return $q.when({data})
                        .then(x => AnalysisResultModel.makeFromApi(x));
                }

                return {
                    query,
                    get
                };
            }
        ]
    );
