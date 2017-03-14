"use strict";

var angular = require('angular');
var npdcCommon = require('npdc-common');
var AutoConfig = npdcCommon.AutoConfig;

// Create "vesselApp" (angular module) and declare its dependencies
var vesselApp = angular.module('vesselApp', ['npdcCommon']);

vesselApp.controller('VesselSearchController', require('./search/VesselSearchController'));
vesselApp.controller('VesselShowController', require('./show/VesselShowController'));
vesselApp.controller('VesselEditController', require('./edit/VesselEditController'));
vesselApp.factory('Vessel', require('./model/vessel'));

// Bootstrap models using NpolarApiResource
//
// The "Vessel" model is an extended VesselResource
// * Vessel -> VesselResource -> ngResource

var resources = [
  {path: "/vessel", resource: "VesselResource" },
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

// Inject configuration and run
vesselApp.run(function($http, npolarApiConfig, npdcAppConfig, NpolarTranslate, NpolarLang) {

  var environment = 'test'; // development | test | production
  var autoconfig = new AutoConfig(environment);
  Object.assign(npolarApiConfig, autoconfig);

  // i18n
  $http.get('//api.npolar.no/text/?q=&filter-bundle=npolar|npdc|npdc-vessel&format=json&variant=array&limit=all').then(response => {
    NpolarTranslate.appendToDictionary(response.data);
    NpolarLang.setLanguages(['en', 'nb', 'nn']);
  });
  console.debug("npolarApiConfig", npolarApiConfig);

});
