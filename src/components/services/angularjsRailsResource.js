// Adapted from https://github.com/tpodom/angularjs-rails-resource/blob/master/vendor/assets/javascripts/angularjs/rails/resource.js

// Copyright (c) 2012 Tommy Odom
//
// MIT License
// https://github.com/tpodom/angularjs-rails-resource

angular
    .module("rails", [])
    .constant("casingTransformers", (function () {

        function transformObject(data, transform) {
            if (data && angular.isObject(data)) {

                // we'd normally leave this call up to the JSON serializer
                // however we need to be able to rename properties before we get to the serializer
                // and there's no point renaming properites that don't need to be renamed.
                // Additionally, this helps avoid some cyclic referencing problems because toJSON typically produces
                // non-cyclical results.
                if (data.toJSON instanceof Function) {
                    data = data.toJSON();

                    // toJSON can return primitives - we don't want to forEach them
                    if (!angular.isObject(data)) {
                        return data;
                    }
                }

                var newData = angular.isArray(data) ? [] : {};
                angular.forEach(data, function (value, key) {
                    var newKey = transform(key);

                    if (angular.isObject(value)) {
                        newData[newKey] = transformObject(value, transform);
                    }
                    else {
                        newData[newKey] = value;
                    }
                });

                return newData;
            }
        }

        var STAMPER_LABEL = "__railsJsonRenamer__";

        function stampObject(object, value) {
            if (angular.isObject(object)) {
                try {
                    // mark this object as having been transformed

                    Object.defineProperty(object, STAMPER_LABEL, {configurable: true, value: value});
                }
                catch (e) {
                    console.warn("Object.defineProperty failed in stampObject");
                }
                return object;
            }
            else {
                return object;
            }
        }

        function isStamped(object) {
            if (object) {
                return object.hasOwnProperty(STAMPER_LABEL);
            }
            else {
                return false;
            }
        }

        function camelize(key) {
            if (!angular.isString(key)) {
                return key;
            }

            // should this match more than word and digit characters?
            return key.replace(/_[\w\d]/g, function (match, index, string) {
                return index === 0 ? match : string.charAt(index + 1).toUpperCase();
            });
        }

        function underscore(key) {
            if (!angular.isString(key)) {
                return key;
            }

            return key.replace(/[A-Z]/g, function (match, index) {
                return index === 0 ? match : "_" + match.toLowerCase();
            });
        }

        return {
            camelize: camelize,
            underscore: underscore,
            isStamped: isStamped,
            stampObject: stampObject,
            STAMP_LABEL: STAMPER_LABEL,
            transformObject: transformObject
        };
    }()))
    .factory("railsFieldRenamingTransformer", ["casingTransformers", function (casingTransformers) {
        return {
            "request": function railsFieldRenamingTransformerRequest(data, headers) {
                // TODO: add conditions
                // probs only want to do this if headers contains app/json
                // and only if object has a __railsJsonRenamer__
                // or if request is going to our server?
                let headersActual = headers();
                if ((headersActual.accept || headersActual.Accept || "").indexOf("application/json") >= 0) {

                    if (data === undefined || data === null) {
                        return;
                    }

                    if (!angular.isObject(data)) {
                        return data;
                    }

                    var result = casingTransformers.transformObject(data, casingTransformers.underscore);
                    casingTransformers.stampObject(result, "camelCased->underscored");
                    return result;
                }

                return data;
            },
            "response": function railsFieldRenamingTransformerResponse(data, headers) {

                if (data === undefined || data === null) {
                    return;
                }

                if (!angular.isObject(data)) {
                    return data;
                }

                if ((headers()["content-type"] || "").indexOf("application/json") >= 0) {
                    var result = casingTransformers.transformObject(data, casingTransformers.camelize);
                    casingTransformers.stampObject(result, "underscored->camelCased");
                    return result;
                }
                else {
                    return data;
                }
            }
        };
    }])
    // CSRF support has been deprecated

/**
 * Configure the default $httpRequest
 */
    .config([
        "$httpProvider",
        /* We are in the config phase - traditional services are not available yet
         * Thus we must make a reference to the factory's provider.
         * This is also why the $gets are necessary below!
         */
        "casingTransformers",
        "railsFieldRenamingTransformerProvider",
        function ($httpProvider,
                  casingTransformers,
                  railsFieldRenamingTransformerProvider) {

            ////$httpProvider.responseInterceptors.push(railsFieldRenamingInterceptor.$get()().promise);

            //HACK:!
            var hackedDiTransformers = railsFieldRenamingTransformerProvider.$get();
            $httpProvider.defaults.transformResponse.push(hackedDiTransformers.response);
            $httpProvider.defaults.transformRequest.unshift(hackedDiTransformers.request);
        }]);


