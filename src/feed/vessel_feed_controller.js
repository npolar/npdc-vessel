"use strict";

/**
 * @ngInject
 */
var VesselFeedController = function($controller, $scope, $location, npolarApiConfig, Vessel) {
   
 $controller('NpolarBaseController', { $scope: $scope });

  var params = $location.search();
  $scope.base = npolarApiConfig.base;
   
  
  
  Vessel.feed(params, function(response) {
   
   
   console.log("isAuthenticated", $scope.isAuthenticated());
      
      $scope.filters = response._filters();
      $scope.feed = response.feed;
      
   }, function(error) {
      if (error.status) {
         $scope.error = error;
      } else {
         // @todo Send 500
         $scope.error = { status: 500, statusText: "Data API error", data: "Please inform data@npolar.no if this problem persists" };
      }
   });
};

module.exports = VesselFeedController;