"use strict";

// @ngInject

var VesselFeedController = function($controller, $scope, $location, npolarApiConfig, Vessel, npdcAppConfig) {

  $controller('NpolarBaseController', { $scope: $scope });
  $scope.resource = Vessel;
  npdcAppConfig.cardTitle = 'Historic Vessels';

  let defaults = { limit: 50, sort: "-updated", facets: "harbours,built_where,shipwrecked_location",  "rangefacet-built_year": 50,  "rangefacet-shipwrecked_year": 50, "size-facet": 10 };
  let invariants = $scope.security.isAuthenticated() ? {} : {} ;
  let query = Object.assign({}, defaults, invariants);

  let search = function (q) {
    $scope.search(Object.assign({}, query, q));
  };

  search(query);

  $scope.$on('$locationChangeSuccess', (event, data) => {
    search($location.search());
  });
};

module.exports = VesselFeedController;
