/*globals angular*/
'use strict';

module.exports = [
  function MenuService() {

    var _ = require('lodash');

    function Feature(opts) {
      angular.extend(this, opts);
    }

    function FeatureCollection(data, opts) {
      var coll = this;
      angular.extend(this, opts);
      // Convert menu features (String) into Feature instances
      var features = [],
          ord = 0;
      if ( data ) {
        angular.forEach(_.keys(data), function(featureId) {
          features.push(new Feature({
            id: featureId,
            controller: data[featureId],
            ord: ord++
          }));
        });
      }
      coll.features = features;
    }

    FeatureCollection.prototype.getSubset = function getSubset(subset) {
      var coll = this;
      // Get a filtered set of features from the specified set of feature controllers
      return _.reduce(coll.features, function(filtered, f){
        if ( _.contains(subset, f.id) ) {
          filtered[f.id] = f;
        }
        return filtered;
      }, {});
    };

    FeatureCollection.prototype.get = function get(id) {
      var coll = this;
      return _.findWhere(coll.features, {id:id});
    };

    return new FeatureCollection({
      content: require('../../features/content'),
      filter: require('../../features/filter'),
      includes: require('../../features/includes'),
      submenu: require('../../features/submenu'),
      toc: require('../../features/toc'),
    });
  }
];