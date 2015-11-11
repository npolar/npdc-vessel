'use strict';

// @ngInject

var VesselEditController = function ($scope, $controller, $routeParams, Vessel) {

  // EditController -> NpolarEditController
  $controller('NpolarEditController', { $scope: $scope });

  // Expedition -> npolarApiResource -> ngResource
  $scope.resource = Vessel;

  // Formula ($scope.formula is set by parent)
  $scope.formula.schema = '//api.npolar.no/schema/vessel-1';
  $scope.formula.form = 'edit/formula.json';
  $scope.formula.template = 'material';

  // edit (or new) action
  $scope.edit();

};

module.exports = VesselEditController;
