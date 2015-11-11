'use strict';

// @ngInject

var router = function($routeProvider, $locationProvider) {

  $locationProvider.html5Mode(true).hashPrefix('!');

  $routeProvider.when('/:id', {
    templateUrl: "document/vessel.html",
    controller: "VesselController"
  }).when('/', {
    template: '<npdc:search-input feed="feed"></npdc:search-input><npdc:search feed="feed"></npdc:search>',
    controller: "VesselFeedController",
    reloadOnSearch: false
  });

};

module.exports = router;
