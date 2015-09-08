"use strict";

var angular = require('angular');

require('angular-route');
require('angular-npolar');

var npdcCommon = require('npdc-common');
require('formula');
var AutoConfig = npdcCommon.AutoConfig;

// Create "vesselApp" (angular module) and declare its dependencies
var app = angular.module('vesselApp', ['ngRoute', 'formula', 'npolarApi', 'npolarUi', 'npdcUi', 'templates']);

app.controller('VesselController', require('./document/vessel_controller'));
app.controller('VesselFeedController', require('./feed/vessel_feed_controller'));
app.factory('Vessel', require('./model/vessel'));
app.factory('Editlog', require('./model/editlog'));

// Bootstrap ngResource models using NpolarApiResource
//
// The "Vessel" model is an extended VesselResource,
// while the other models are just plain NpolarApiResource objects
// * Vessel -> VesselResource -> ngResource
// * Editlog -> ngResource
// * Placename -> ngResource
var resources = [
  {"path": "/vessel", "resource": "VesselResource" },
  //{"path": "/editlog", "resource": "EditlogResource"},
  {"path": "/placename", base: "//api.npolar.no", "resource": "Placename", fields: "*"}
];
resources.forEach(function (service) {
  // Expressive DI syntax is needed here
  app.factory(service.resource, ['NpolarApiResource', function (NpolarApiResource) {
    return NpolarApiResource.resource(service);
  }]);
});

// Filters
app.filter('a', function() {
  return function(input) {
    input = input || '';
    var out = input.replace(" ", "+");

    if (app.vesselAppConfig.aFilterPrefix) {
      out = app.vesselAppConfig.aFilterPrefix +"/"+ out;
    }
    return out;
  };
});

// Routing
app.config(require('./routes'));

// Directives
// Set default textarea rows
app.directive("textarea", function() {
  return {
    restrict: "E",
    controller: function($element) {
      $element.attr("rows", 15);
    }
  };
});

// Preserve newlines in text paragraphs
app.directive("p", function() {
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
app.run(function(npolarApiConfig) {
  var environment = "production"; // development | test | production
  var autoconfig = new AutoConfig(environment);
  angular.extend(npolarApiConfig, autoconfig);
  console.log("npolarApiConfig", npolarApiConfig);
});
