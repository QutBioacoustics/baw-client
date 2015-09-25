module.exports = function (environment) {
    var paths = {
        "api": {
            "root": environment.apiRoot,
            "routes": {
                "project": {
                    "list": "/projects/",
                    "show": "/projects/{projectId}",
                    "filter": "/projects/filter"
                },
                "site": {
                    "list": "projects/{projectId}/sites/",
                    "flattened": "/sites/{siteId}",
                    "nested": "/projects/{projectId}/sites/{siteId}",
                    "filter": "/sites/filter"
                },
                "audioRecording": {
                    "listShort": "/audio_recordings/{recordingId}",
                    "show": "/audio_recordings/{recordingId}",
                    "list": "/audio_recordings/",
                    "filter": "/audio_recordings/filter"
                },
                "audioEvent": {
                    "list": "/audio_recordings/{recordingId}/audio_events",
                    "show": "/audio_recordings/{recordingId}/audio_events/{audioEventId}",
                    "filter": "/audio_events/filter",
                    "csv": "/audio_recordings/{recordingId}/audio_events/download.{format}"
                },
                "tagging": {
                    "list": "/audio_recordings/{recordingId}/audio_events/{audioEventId}/taggings",
                    "show": "/audio_recordings/{recordingId}/audio_events/{audioEventId}/taggings/{taggingId}"
                },
                "tag": {
                    "list": "/tags/",
                    "show": "/tags/{tagId}",
                    "filter": "/tags/filter"
                },
                "media": {
                    "show": "/audio_recordings/{recordingId}/media.{format}"
                },
                "security": {
                    "signOut": "/security/user",
                    "ping": "/security/user",
                    "signIn": "/security/user"
                },
                "user": {
                    "profile": "/my_account",
                    "settings": "/my_account/prefs",
                    "filter": "/user_accounts/filter",
                    "show": "/user_accounts/{userId}"
                },
                "audioEventComment": {
                    "show": "/audio_events/{audioEventId}/comments/{audioEventCommentId}"
                },
                "bookmark": {
                    "show": "/bookmarks/{bookmarkId}"
                },
                "analysisResults": {
                    "system": "/audio_recordings/{recordingId}/analysis.{format}"
                }
            },
            "links": {
                "projects": "/projects",
                "home": "/",
                "project": "/projects/{projectId}",
                "site": "/projects/{projectId}/sites/{siteId}",
                "userAccounts": "/user_accounts/{userId}",
                "websiteStatus": "/website_status",
                "contactUs": "/contact_us",
                "disclaimers": "/disclaimers",
                "credits": "/credits",
                "ethicsStatement": "/ethics_statement",
                "login": "/errors/unauthorized",
                "loginActual": "/my_account/sign_in",
                "logout": "/my_account/sign_out",
                "register": "/my_account/sign_up",
                "admin": "/admin"
            }
        },
        "site": {
            "root": environment.siteRoot,
            // The following intentionally are not prefixed with a '/'
            // static files
            "files": {
                "error404": "error/error_404.tpl.html",
                "home": "home/home.tpl.html",
                "login": {
                    "loginWidget": "login/widget/loginWidget.tpl.html",
                    "defaultImage": "assets/img/user_spanhalf.png"
                },
                "listen": "listen/listen.tpl.html",
                "annotationViewer": "annotationViewer/annotationViewer.tpl.html",
                "gridLines": "annotationViewer/gridLines/gridLines.tpl.html",
                "annotationComments": "annotationLibrary/comments/comments.tpl.html",
                "library": {
                    "list": "annotationLibrary/annotationLibrary.tpl.html",
                    "item": "annotationLibrary/annotationItem.tpl.html"
                },
                "navigation": "navigation/navigation.tpl.html",
                "birdWalk": {
                    "list": "birdWalks/birdWalks.tpl.html",
                    "detail": "birdWalks/birdWalk.tpl.html",
                    "spec": "assets/bird_walk/bird_walk_spec.json",
                    "stats": "assets/bird_walk/bird_walk_stats.json",
                    "images": "assets/bird_walk/images/"
                },
                "recordings": {
                    "recentRecordings": "recordings/recentRecordings/recentRecordings.tpl.html"
                },
                "demo": {
                    "d3": "demo/d3TestPage.tpl.html",
                    "rendering": "demo/rendering.tpl.html",
                    "bdCloud2014": "demo/BDCloud2014Demo.tpl.html"
                },
                "d3Bindings": {
                    "eventDistribution": {
                        "distributionVisualisation": "d3Bindings/eventDistribution/distributionVisualisation.tpl.html"
                    }
                },
                "visualize": "visualize/visualize.tpl.html"
            },
            // routes used by angular
            "ngRoutes": {
                "recentRecordings": "/listen",
                "listen": "/listen/{recordingId}",
                "library": "/library",
                "libraryItem": "/library/{recordingId}/audio_events/{audioEventId}",
                "visualize": "/visualize",
                "demo": {
                    "d3": "/demo/d3",
                    "rendering": "/demo/rendering",
                    "bdCloud": "/demo/BDCloud2014"
                }
            },
            // general links for use in <a />'s
            "links": {}
        }
    };

    /**
     * Joins path fragments together.
     * @param {...[string]} fragments
     * @returns {*}
     */
    function joinPathFragments() {
        var fragments = Array.prototype.slice.call(arguments, 0);

        if (fragments.length === 0) {
            return undefined;
        }
        else if (fragments.length === 1) {
            return fragments[0];
        }
        else {
            var path = fragments[0];

            if (path.slice(-1) === "/") {
                path = path.slice(0, -1);
            }

            for (var i = 1; i < fragments.length; i++) {
                var f = fragments[i];

                if ((typeof f) !== "string") {
                    throw "joinPathFragments: Path fragment " + f + " is not a string";
                }

                var hasFirst = f[0] === "/";
                var hasLast = (f.slice(-1))[0] === "/";

                if (!hasFirst) {
                    f = "/" + f;
                }

                if (hasLast && i !== (fragments.length - 1)) {
                    f = f.slice(0, -1);
                }

                path += f;
            }

            return path;
        }
    }

    function isObject(x) {
        return typeof x === 'object' && x !== null;
    }

    // add helper paths
    function recursivePath(source, root) {
        for (var key in source) {
            if (!source.hasOwnProperty(key)) {
                continue;
            }

            if (isObject(source[key])) {
                recursivePath(source[key], root);
            }
            else {
                source[key + "Absolute"] = joinPathFragments(root, source[key]);
            }
        }
    }

    recursivePath(paths.api.routes, paths.api.root);
    recursivePath(paths.api.links, paths.api.root);
    recursivePath(paths.site.files, paths.site.root);
    recursivePath(paths.site.ngRoutes, paths.api.root);

    return paths;
};