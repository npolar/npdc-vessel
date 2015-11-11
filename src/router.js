'use strict';

// @ngInject

var router = function($routeProvider, $locationProvider) {

  $locationProvider.html5Mode(true).hashPrefix('!');

  $routeProvider.when('/:id', {
    templateUrl: "show/vessel.html",
    controller: "VesselShowController"
  }).when('/:id/edit', {
    template: '<npdc:formula></npdc:formula>',
    controller: "VesselEditController"
  }).when('/', {
    template: '<npdc:search-input feed="feed"></npdc:search-input><npdc:search feed="feed"></npdc:search>',
    controller: "VesselSearchController",
    reloadOnSearch: false
  });

};

module.exports = router;
