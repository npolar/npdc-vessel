"use strict";

// @ngInject

var VesselSearchController = function($controller, $scope, $location, npolarApiConfig, Vessel, npdcAppConfig) {

  $controller('NpolarBaseController', { $scope: $scope });
  $scope.resource = Vessel;
  npdcAppConfig.cardTitle = 'Historic Vessels';

  let defaults = { limit: 50,
    sort: "-updated",
    facets: "harbours,built_where,shipwrecked_location",
    "rangefacet-built_year": 50,
    "rangefacet-shipwrecked_year": 50,
    "size-facet": 10
  };

  let avatar = function(vessel) {
    return vessel.id.slice(0,5);
  };
  
  let detail = function(vessel) {
    return vessel.type+ ' ('+ (vessel.built_year || '-') +')';
  };
  
  let subtitle = function(vessel) {
    return vessel.harbours.join(', ');
  };
  
  //npdcAppConfig.search.local.results.title = 'name';
  npdcAppConfig.search.local.results.detail = detail;
  npdcAppConfig.search.local.results.avatar = avatar;
  npdcAppConfig.search.local.results.subtitle = subtitle;
  
  $scope.$on('$locationChangeSuccess', (event, data) => {
    $scope.search(defaults);
  });
  
  $scope.search(defaults);
  
};

module.exports = VesselSearchController;
