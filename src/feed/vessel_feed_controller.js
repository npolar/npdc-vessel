"use strict";

/**
 * @ngInject
 */
var VesselFeedController = function($controller, $scope, $location, npolarApiConfig, npdcAppConfig, Vessel) {
  
  $controller('NpolarBaseController', { $scope: $scope });
  $scope.resource = Vessel;
  
  npdcAppConfig.cardTitle = "Kjell-G. Kjær's Historic Register of Arctic Vessels"; 
  
  let param = Object.assign({ facets: "harbours,built_where,shipwrecked_location",
      "rangefacet-built_year": 50,
      "rangefacet-shipwrecked_year": 50,
      "size-facet": 10,
      fields: "id,name"
  }, $location.search());
  
  
  
  if (!param.q) {
    param.sort = "-updated";
  }
  
  Vessel.feed(param, response => {
    $scope.filters = response._filters();
    $scope.feed = response.feed;
  });
  
  $scope.subTitle = function(e) {
    return "X"; 
  };
  
};

module.exports = VesselFeedController;