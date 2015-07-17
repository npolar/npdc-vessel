"use strict";
var angular = require('angular');
var _ = require('lodash');

/**
 * @ngInject
 */
var Vessel = function(VesselResource, NpolarApiText) {
  
  var vessel = angular.extend(VesselResource, {
    
    create: function() {
      return {
         name: "Unnamed vessel created "+ new Date().toISOString()
      };
    },
    
    // Detect "Ship Name" (anything between quotes) and search for all matches
    // @todo refactor the (and search bit... nned to set sctope)
    mentions: function(text) { 
      
      var matches = NpolarApiText.extract(text, /\s"([^"]{2,})"(?:\s|\.|,)/gi);
        
      // Reject non-uppercase and other often used quo  ted phrases
      // "Tromsø " => Tromsø Stidtstidende|Tromsø Stiftsidende|Tromsø Stiftstidende|Tromsø Skibsverft
      var reject = /^([\d+\.\s\:]|Fra |Av |Den |Norsk |Norske |Norges |Polar Record|Norsk Fiskeritidende|The |Norsk Fiskereitidende|Tromsø |Tromsøposten|Fra Ishavet|Svalbard var min verden)/;
      
      // Reject anything not starting with a Capital, or any match over 40 characters
      matches = _.reject(matches, function(m) {
        if (m[0] !== m[0].toUpperCase() || m.length > 40) {
          return true;
        }
        return reject.test(m);
      }).sort();
      
      // Search for all matches
      var detected =  _.map(matches, function(name) {
        
        var id = "";
        
        // return matches;
        // @todo leave response function here, move array call to controller to set $scope on response....
        
       VesselResource.array({"q-name": name, limit: 10, fields: "id,name" }, function(response) {
          
          // Force UPPERCASE ship names
          var ships = _.map(response, function(v) {
            return { id: v.id, name: v.name.toUpperCase() };
          });
          
          // Is detected SHIP NAME in search engine result?
          var ship = _.find(ships, { name: name.toUpperCase()});
          if (ship && "id" in ship) {
            console.log(ship.id, ship.name);
            id = ship.id;
          }
          
        });
        return { id: id, name: name }; 
      });
      return detected;

    },
    years: function(ship) {
      
      var years = NpolarApiText.extract(ship.history, /([1][56789]\d{2})/g);
      
      // Reject years outside life-span of ship
      years = _.select(years, function(y) {        
        if (ship.shipwrecked_year && (y > ship.shipwrecked_year)) {
          return false;
        } else if (ship.built_year && (y < ship.built_year)) {
          return false;
        } else {
          return true;
        }
      });

      return _.uniq(years).sort();
    }

  });
  
  return vessel;
  
};

module.exports = Vessel;
