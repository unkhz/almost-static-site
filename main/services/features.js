'use strict';

var angular = require('angular');
var _ = require('lodash');


// FeatureImplementation is instantiated for
// each page that implements a Feature
function FeatureImplementation(opts) {
  angular.extend(this, opts);
}

// FeatureDefinition is instantiated once per
// each feature that the application supports
function FeatureDefinition(opts) {
  angular.extend(this, opts);
}

FeatureDefinition.prototype.createImplementation = function createImplementation(opts) {
  var f = new FeatureImplementation(opts);
  f.targetComponentId = this.targetComponentId;
  f.controller = this.controller;

  // Run the initialize static method if it exists
  f.initialize = _.last(f.controller).initialize;
  if ( _.isFunction(f.initialize) ) {
    f.initialize(f);
  }

  return f;
};

function FeatureCollection() {
  var coll = this;
  coll.features = [];
}

FeatureCollection.prototype.createImplementations = function createImplementations(page, features) {
  var coll = this;
  var implementations = [];
  angular.forEach(features, function(conf, ord) {
    // features array can contain a string (featureId) or a configuration object
    conf = typeof conf === 'string' ? {id:conf} : conf;

    var def = coll.get(conf.id);
    var impl = def.createImplementation(
      angular.extend(conf, {
        // unique id for the implementation
        id: conf.id + '-' + page.level,

        // feature definition id
        featureId: conf.id,

        // sorting order
        ord: (parseInt(page.level,10)*100) + parseInt(ord,10),

        // page related data
        page: page,
        pages: page.children
      })
    );
    implementations.push(impl);
  });
  return implementations;
};

FeatureCollection.prototype.get = function get(id) {
  var coll = this;
  return _.findWhere(coll.features, {id:id});
};

FeatureCollection.prototype.register = function get(id, targetComponentId, ctrl) {
  var coll = this;
  var existing = _.pluck(coll.features, 'id');
  if ( !_.contains(existing, id) ) {
    coll.features.push(new FeatureDefinition({
      id: id,
      targetComponentId: targetComponentId,
      controller: ctrl
    }));
  }
};

function FeatureService() {
  return new FeatureCollection();
}
module.exports = [FeatureService];