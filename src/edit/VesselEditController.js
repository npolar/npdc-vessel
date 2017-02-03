'use strict';

function VesselEditController($scope, $controller, $location,
  formula, formulaAutoCompleteService, fileFunnelService, NpolarApiSecurity,
  npdcAppConfig, Vessel) {
  'ngInject';

  let ctrl = this;

  ctrl.init = () => {
    $controller('NpolarEditController', { $scope: $scope });
    $scope.resource = Vessel;

    $scope.formula = formula.getInstance({
      schema: '//api.npolar.no/schema/vessel-1',
      form: 'edit/formula.json',
      //language: 'edit/translation.json',
      templates: npdcAppConfig.formula.templates,
      languages: npdcAppConfig.formula.languages
    });

    let autocomplete = ['harbours', 'type', 'links.type', 'shipwrecked_location', 'built_where', 'owners.name', 'owners.from', 'owners.location'];
    formulaAutoCompleteService.autocompleteFacets(autocomplete, $scope.resource, $scope.formula);
  };

  if (!$scope.formula) {
    ctrl.init();
  }

  // edit (or new) action
  $scope.edit();

}

module.exports = VesselEditController;