'use strict';

var angular = require ("angular");
var vesselApp = angular.module("vesselApp");

/**
 * @ngInject
 */
var routes = function($routeProvider, $locationProvider) {

  //$locationProvider.html5Mode(false);
  $locationProvider.html5Mode(true).hashPrefix('!');

  if ($locationProvider.html5Mode().enabled) {
    vesselApp.vesselAppConfig = { aFilterPrefix: null };
  } else {
    vesselApp.vesselAppConfig = { aFilterPrefix: "#" };
  }
 
  $routeProvider.when('/:id/:action?', {
    templateUrl: "document/vessel.html",
    controller: "VesselController"
  }).when('/', {
    templateUrl: "feed/vessel_feed.html",
    controller: "VesselFeedController"
  });
  
};

module.exports = routes;