/*globals angular*/
'use strict';

module.exports = [
  function MenuService() {

    var _ = require('lodash');

    function Feature(opts) {
      angular.extend(this, opts);
    }

    function FeatureCollection() {
      var coll = this;
      coll.features = [];
    }

    FeatureCollection.prototype.get = function get(id) {
      var coll = this;
      return _.findWhere(coll.features, {id:id});
    };

    FeatureCollection.prototype.isSupported = function isSupported(feature, componentId) {
      var coll = this;
      console.log('is supported', feature, componentId);
      return !!_.findWhere(coll.features, {id:feature.featureId, targetComponentId:componentId});
    };

    FeatureCollection.prototype.register = function get(id, targetComponentId, ctrl) {
      var coll = this;
      var existing = _.pluck(coll.features, 'id');
      if ( !_.contains(existing, id) ) {
        coll.features.push(new Feature({
          id: id,
          targetComponentId: targetComponentId,
          controller: ctrl
        }));
      }
    };

    return new FeatureCollection();
  }
];