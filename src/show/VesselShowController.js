"use strict";
var angular = require('angular');
var _ = require('lodash');

// @ngInject

var VesselShowController = function($controller, $rootScope, $scope, $route, $routeParams, $log, $location, $sce, npolarApiConfig, NpolarApiSecurity, NpolarApiText, Vessel, npdcAppConfig) {

  $controller('NpolarEditController', { $scope: $scope });
  $scope.resource = Vessel;
  $scope.uri = window.document.location.href;

  let ctrl = this;

  ctrl.wikilinks = [];
  // matchText and m1 => whole match
    // m2 => text [text] => <a>text</a>
    // m3 => ?
    // m4 => id (id1) => <a href="id1">
    // m5 m6 ?
    // m7 => title
  ctrl.wikilink = function (matchText, m1, m2, m3, m4, m5, m6, m7) {
    ctrl.wikilinks.push([m4, m2]);
    return `<a href="${m4}" title="${m7||''}">${m2}</a>`;
  };

  let linkify = function(vessel, prop) {

    let text = vessel[prop];
    // regexp from https://github.com/showdownjs/showdown/blob/master/src/subParsers/anchors.js
    text = text.replace(/(\[((?:\[[^\]]*]|[^\[\]])*)]\([ \t]*()<?(.*?(?:\(.*?\).*?)?)>?[ \t]*((['"])(.*?)\6[ \t]*)?\))/g, ctrl.wikilink);

    let wikiships = [...new Set(ctrl.wikilinks)];
    wikiships.forEach(w => {
      let id = w[0];
      let name = w[1];
      //console.log(name);
      text = text.split(`\"${name}\"`).join(`<a href="${id}">${name}</a>`);
    });

    let mentions = Vessel.mentions(text);

    mentions.forEach(m => {
      if (m.name.toUpperCase() === vessel.name.toUpperCase()) {
        // Set current ship in bold
        text = text.split(`\"${m.name}\"`).join(`<b>${m.name}</b>`);
      } else {
        // Search links for all "Vessel Name"
        text = text.split(`\"${m.name}\"`).join(`<a href="?q=${m.id || m.name }" title="Search for ${m.name}"><b>${m.name}</b></a>`);
      }

    });

    return text;
  };


  let fetch = function() {

    // Fetch vessel
    $scope.vessel = Vessel.fetch($routeParams, function(vessel) {

      // Inject vessel model into formula
      //$scope.formula.setModel(vessel);

      // Detect ships mentioned in vessel history
      //$scope.mentions = Vessel.mentions(vessel.history);

      $scope.history = $sce.trustAsHtml(linkify(vessel, 'history'));

      $scope.years = Vessel.years(vessel);

      // Fetch edits
      //Editlog.feed({q: null, "q-response.body": vessel.id, sort: "-request.time", "filter-endpoint": "/vessel" }, function(response) {
      //  $scope.edits = response.feed.entries;
      //});

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

        console.log("Number of candidates for mentioned by:", response.feed.opensearch.totalResults);

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

  fetch();

  $scope.show().$promise.then(data => {
    // npdcAppConfig.cardTitle = data.name;
  });

};

module.exports = VesselShowController;
