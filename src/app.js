"use strict";

var angular = require('angular');
var npdcCommon = require('npdc-common');
var AutoConfig = npdcCommon.AutoConfig;

// Create "vesselApp" (angular module) and declare its dependencies
var vesselApp = angular.module('vesselApp', ['npdcUi']);

vesselApp.controller('VesselSearchController', require('./search/VesselSearchController'));
vesselApp.controller('VesselShowController', require('./show/VesselShowController'));
vesselApp.controller('VesselEditController', require('./edit/VesselEditController'));
vesselApp.factory('Vessel', require('./model/vessel'));
//vesselApp.factory('Editlog', require('./model/editlog'));

// Bootstrap ngResource models using NpolarApiResource
//
// The "Vessel" model is an extended VesselResource,
// while the other models are just plain NpolarApiResource objects
// * Vessel -> VesselResource -> ngResource
// * Editlog -> ngResource
// * Placename -> ngResource
var resources = [
  {path: "/vessel", resource: "VesselResource" },
  {path: "/placename", resource: "Placename", fields: "*"}
];

resources.forEach(function (service) {
  // Expressive DI syntax is needed here
  vesselApp.factory(service.resource, ['NpolarApiResource', function (NpolarApiResource) {
    return NpolarApiResource.resource(service);
  }]);
});

// Filters
vesselApp.filter('a', function() {
  return function(input) {
    input = input || '';
    var out = input.replace(" ", "+");

    if (vesselApp.vesselAppConfig.aFilterPrefix) {
      out = vesselApp.vesselAppConfig.aFilterPrefix +"/"+ out;
    }
    return out;
  };
});

// Routing
vesselApp.config(require('./router'));

// Preserve newlines in text paragraphs
vesselApp.directive("p", function() {
  return {
    restrict: "E",
    controller: function($element) {
      $element.attr("style", "white-space: pre-wrap;");
    }
  };
});

// Auth interceptor
angular.module("vesselApp").config(function($httpProvider) {
  $httpProvider.interceptors.push("npolarApiInterceptor");
});

// Inject npolarApiConfig and run

vesselApp.run(function(npolarApiConfig, npdcAppConfig) {
  npdcAppConfig.cardTitle = "Kjell-G. Kjær's Historic Register of Arctic Vessels"; 
  
  var environment = "production"; // development | test | production
  var autoconfig = new AutoConfig(environment);
  angular.extend(npolarApiConfig, autoconfig);

  console.log("npolarApiConfig", npolarApiConfig);
});
