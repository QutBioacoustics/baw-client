/**
 * Overriding the standard template because of this bug:
 * https://github.com/QutBioacoustics/baw-client/issues/292
 */
angular
    .module("angular-tags.templates.monkeypatch", [])
    .run(["$templateCache", function ($templateCache) {
        $templateCache.put("templates/tags.html", `
<div class="decipher-tags" data-ng-mousedown="selectArea()">

  <div class="decipher-tags-taglist">
    <span data-ng-repeat="tag in tags|orderBy:orderBy"
          data-ng-mousedown="$event.stopPropagation()">
        <span class="decipher-tags-tag" data-ng-class="getClasses(tag)">{{tag.name}}
              <i class="icon-remove" data-ng-click="remove(tag)"></i>
        </span>
    </span>
  </div>

  <span class="container-fluid" data-ng-show="toggles.inputActive">
    <input ng-if="!srcTags.length" type="text" data-ng-model="inputTag"
           class="decipher-tags-input"/>
    <!-- may want to fiddle with limitTo here, but it was inhibiting my results
    so perhaps there is another way -->
    <!-- THIS MONKEYPATCH WORKS! -->
    <input ng-if="srcTags.length" type="text" data-ng-model="inputTag"
           class="decipher-tags-input"
           uib-typeahead="stag as stag.name for stag in srcTags|filter:$viewValue|orderBy:orderBy"
           data-typeahead-input-formatter="typeaheadOptions.inputFormatter"
           data-typeahead-loading="typeaheadOptions.loading"
           data-typeahead-min-length="typeaheadOptions.minLength"
           data-typeahead-template-url="{{typeaheadOptions.templateUrl}}"
           data-typeahead-wait-ms="typeaheadOptions.waitMs"
           data-typeahead-editable="typeaheadOptions.allowsEditable"
           data-typeahead-on-select="add($item) && selectArea() && typeaheadOptions.onSelect()"/>

  </span>
</div>
    `);
    }]);
