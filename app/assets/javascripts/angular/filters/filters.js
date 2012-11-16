/* http://docs.angularjs.org/#!angular.filter */
(function() {
    var bawfs = angular.module('bawApp.filters', []);

    /*
     http://stackoverflow.com/questions/11873570/angularjs-for-loop-with-numbers-ranges

     <div ng-repeat="n in [] | range:100">
     do something
     </div>
     */
    bawfs.filter('range', function() {
        return function(input, total) {
            total = parseInt(total);
            for (var i=0; i<total; i++) {
                input.push(i);
            }
            return input;
        };
    });

    bawfs.filter('boolToWords', function(){
        return function(text,truePhrase, falsePhrase){
            var value = JSON.parse(text);
            if (value) {
                return truePhrase || "";
            }
            else {
                return falsePhrase || "";
            }
        }
    });

})();
