var sampleLabels = angular.module("bawApp.citizenScience.sampleLabels", ["bawApp.citizenScience.common"]);

/**
 *
 *  Handles applying labels to and removing labels from samples
 *  The "join" between labels and samples is stored in JSON in the following structure
 *  {
 *  'sampleId': {
 *    'labelId': {
 *      'value': [1,0],
 *      'timestamp': [timestamp]
 *      }
 *      ...
 *    }
 *    ...
 *  }
 *
 *
 */
sampleLabels.factory("SampleLabels", [
    "CitizenScienceCommon",
    "$http",
    function SampleLabels(CitizenScienceCommon, $http) {

        var self = this;

        /**
         * checks the local storage for sampleLabels
         */
        self.init = function (citizenScienceProject) {

            self.localStorageKey = citizenScienceProject + "_sampleLabels";

            var data = localStorage.getItem(self.localStorageKey);

            if (data !== null) {
                self.data = JSON.parse(data);
            } else {
                self.data = {};
            }

            self.csProject = citizenScienceProject;

            return self.data;

        };

        self.currentSampleId = 0;

        /**
         * stringifies the object that acts as a join between samples and labels,
         * then stores that json string in local storage
         */
        self.writeToStorage = function () {
            var value = JSON.stringify(self.data);
            localStorage.setItem(self.localStorageKey, value);
        };


        /**
         * submits all responses to the server
         * will merge with existing responses using timestamp of each response to save the latest
         * @param sampleId
         * @param labelId
         * @param value
         */
        self.submitResponse = function () {

            //TODO

        };


        self.functions = {

            init : self.init,

            /**
             * Looks up the data to see if there is a boolean value stored for a given sampleId and labelId
             * and if so, returns it.
             * @param sampleId. If omitted, will use the current sample if available
             * @param labelId
             * @returns {boolean}
             */
            getValue : function (sampleId, labelId) {

                if (sampleId === null) {
                    sampleId = self.currentSampleId;
                }

                if (self.data[sampleId] !== undefined) {
                    if (self.data[sampleId][labelId] !== undefined) {
                        return self.data[sampleId][labelId].value;
                    }
                }
                return false;
            },

            /**
             * updates the value of a labelId applied to a sampleId as either true or false
             * @param sampleId int; if null, will use the current sample id
             * @param labelId int; if omitted, we are not applying a label but noting that the sample has been viewed
             * @param value int [0,1]
             */
            setValue : function (sampleId, labelId, value) {


                if (sampleId === null) {
                    sampleId = self.currentSampleId;
                }

                if (sampleId <= 0) {
                    console.warn("bad sampleId supplied");
                    return;
                }

                if (self.data[sampleId] === undefined) {
                    self.data[sampleId] = {};
                }

                if (labelId !== undefined) {

                    if (self.data[sampleId][labelId] === undefined) {
                        self.data[sampleId][labelId] = {};
                    }

                    self.data[sampleId][labelId].value = value;
                    self.data[sampleId][labelId].timestamp = new Date();

                }

                self.writeToStorage();
                self.submitResponse(sampleId, labelId, value);

            },

            /**
             * returns an object that holds all the labels that have been applied to
             * the given sample and their values. (if a label has been removed then it will be stored
             * as false. If it has never been applied, it will not be present).
             * @param sampleId
             * @returns {*}
             */
            getLabelsForSample : function (sampleId) {

                if (typeof(self.data[sampleId]) !== "object") {
                    self.data[sampleId] = {};
                }

                return self.data[sampleId];

            },

            /**
             * returns the number of samples that have responses
             * If a sample is viewed, but no labels are applied, an element
             * should be added to the data object as an empty object
             */
            getNumSamplesViewed : function () {
                if (self.data !== undefined) {
                    return Object.keys(self.data).length;
                } else {
                    return 0;
                }

            },

            registerCurrentSampleId : function (currentSampleId) {
                self.currentSampleId = currentSampleId;
            },

            /**
             * Dev function to delete all applied labels
             */
            clearLabels : function () {
                self.data = {};
                self.writeToStorage();
            }





        };

        return self.functions;

    }]);



