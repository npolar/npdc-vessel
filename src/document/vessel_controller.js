"use strict";
var angular = require('angular');
var _ = require('lodash');

/**
 * @ngInject
 */
var VesselController = function($controller, $rootScope, $scope, $route, $routeParams, $location, NpolarApiSecurity, NpolarApiText, Placename, Editlog, Vessel) {
     
  $controller('NpolarEditController', { $scope: $scope });
  $scope.resource = Vessel;
   
  // Init formula
  $scope.formula = Object.assign($scope.formula);
  $scope.formula.schema = "//api.npolar.no/schema/historic-vessel";
  $scope.formula.form = "document/vessel-formula.json";
  $scope.formula.template = "default";
  
  $scope.formula.validateHidden = true;
  $scope.formula.saveHidden = true;
  
  $scope.formula.onsave = function(model) {
     $scope.document = model;   
     $scope.save();
     $route.reload();
  };
  
  $scope.$watch('vessel', function() {
    $scope.document = $scope.vessel;
  });
  
  console.log("2", $scope.formula);  
  
  $scope.fetch = function() {
      
    // Fetch vessel
    $scope.vessel = Vessel.fetch($routeParams, function(vessel) {
   
    // Inject vessel model into formula
    $scope.formula.model = vessel;
    
    // Detect ships mentioned in vessel history
    $scope.mentions = Vessel.mentions(vessel.history);
    
    $scope.years = Vessel.years(vessel);
    
    // Fetch edits
    Editlog.feed({q: null, "q-response.body": vessel.id, sort: "-request.time", "filter-endpoint": "/vessel" }, function(response) {
      $scope.edits = response.feed.entries;
    });
    
    // Fetch and simplify facets (for suggestions)
    var facets = ["built_where", "type"];
    Vessel.feed({q: "", limit: 0, "size-facet": 10, facets: facets.join(",") }, function(response) {
       angular.forEach(facets, function(facet) {
          var nested = _.select(response.feed.facets, function(f) {
             return angular.isDefined(f[facet]);
          });           
          $scope[facet] = nested[0][facet];
       });
    });

    // Fetch mentions by others by searching for name
    Vessel.feed({q: vessel.name, limit: 50, facets: false, "not-id": vessel.id }, function(response) {
      
      console.log("candidates for mentioned by:", response.feed.opensearch.totalResults);
      
      $scope.mentioned = _.select(response.feed.entries, function(v) {
        var text = v.history; //JSON.stringify(v);
        var found = new RegExp(vessel.name, "i").test(text);
        return found;
        
      });
      console.log("mentioned", $scope.mentioned);
      
    }); 
  },
  function(response) {
      if (404 === response.status) {
        Vessel.array({"q": $routeParams.id, limit: 50, fields: "id,name,harbours,owner,built_year,built_where" }, function(response) {
            var m =_.select(response, { name: $routeParams.id.toUpperCase() });
            
            if (m.length === 0) {
               m =_.select(response, function(ship) {
                  return (ship.name.toUpperCase().match($routeParams.id.toUpperCase())); 
               });
            }
            console.log("Found ", m.length, "vessels matches", $routeParams.id);
            
            if (1 === m.length) {
               console.log("Redirecting /"+ $routeParams.id +" to /"+ m[0].id);
               $location.path(m[0].id);
            } else if (2 <= m.length) {
               console.log(m.length);
               // Multiple matches
               $scope.error = { status: 409, statusText: "Conflict", data: {explanation: m.length+" vessels are named "+$routeParams.id}};
               $scope.vessels = m;
               
            } else {
               // todo move into conflict feat
               $scope.error = { status: 404, statusText: "Not Found", data: { explanation: m.length+" vessels are named "+$routeParams.id }};
            }
         });
      } else {
         if (response.status >= 100) {
            $scope.error = response;
         } else { 
            $scope.error = { status: 0, statusText: "Data API error", data: "Please inform data@npolar.no if this problem persists" };
         }
      }
   });
   
  }; // end fetch
   
   
  if ($routeParams.id === "__new") {
    $scope.editAction = true;
    var vessel = Vessel.create();
    $scope.vessel = vessel;
    $scope.formula.model = vessel;
      
      
  } else {
    $scope.fetch();
    $scope.editAction = false;
  }
   
};

module.exports = VesselController;