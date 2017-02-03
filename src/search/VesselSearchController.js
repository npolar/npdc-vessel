'use strict';

function VesselSearchController($controller, $scope, $location,
  npdcAppConfig, Vessel) {
  'ngInject';

  let ctrl = this;

  $controller('NpolarBaseController', { $scope: $scope });
  $scope.resource = Vessel;

  ctrl.defaultQuery = { limit: 20,
    sort: "-updated",
    facets: "harbours,type,built_where,shipwrecked_location,created_by,updated_by",
    "rangefacet-built_year": 100,
    "rangefacet-shipwrecked_year": 100,
    fields: "id,name,type,harbours,built_where,shipwrecked_location,created,updated,created_by,updated_by",
    "size-facet": 100
  };

  let avatar = function(vessel) {
    return vessel.id.slice(0,5);
  };

  let detail = function(vessel) {
    return vessel.type+ ' (built '+ (vessel.built_year || '?') +')';
  };

  let subtitle = function(vessel) {
    return vessel.harbours.join(', ');
  };

  //npdcAppConfig.search.local.results.title = 'name';
  npdcAppConfig.search.local.results.detail = detail;
  npdcAppConfig.search.local.results.avatar = avatar;
  npdcAppConfig.search.local.results.subtitle = subtitle;

  $scope.$on('$locationChangeSuccess', (event, data) => {
    $scope.search(ctrl.defaultQuery);
  });

  $scope.search(Object.assign(ctrl.defaultQuery, $location.search()));

}

module.exports = VesselSearchController;