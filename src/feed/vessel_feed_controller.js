"use strict";

/**
 * @ngInject
 */
var VesselFeedController = function($controller, $scope, $location, npolarApiConfig, Vessel, Editlog, $q) {
  
  $controller('NpolarBaseController', { $scope: $scope });
  $scope.resource = Vessel;
  
  let param = Object.assign({ facets: "harbours,built_where,shipwrecked_location",  "rangefacet-built_year": 50,  "rangefacet-shipwrecked_year": 50, "size-facet": 10 }, $location.search());
  
  if (!param.q) {
    param.sort = "-updated";
  }
  
  Vessel.feed(param, response => {
    $scope.filters = response._filters();
    $scope.feed = response.feed;
   });
};

module.exports = VesselFeedController;