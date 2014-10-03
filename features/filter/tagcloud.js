'use strict';
var _ = require('lodash');

var links = {},
    tagId = 0;

function Tag(name, linkedItem, cloud) {
  this.id = tagId++;
  this.cloud = cloud;
  this.name = name;
  this.count = 0;
  this.links = [];
  this.link(linkedItem);
}

Tag.prototype.link = function(linkedItem) {
  links[linkedItem.id + '-' + this.name] = true;
  this.links.push(linkedItem);
  this.count++;
};

Tag.prototype.toggle = function(){
  var tag = this;
  this[tag.isSelected ? 'unselect' : 'select']();
};

Tag.prototype.select = function() {
  var tag=this;
  if ( this.cloud.forceSingleSelectedValue ) {
    this.cloud.clearSelected();
  }
  this.isSelected = true;
  this.links.forEach(function(linkedItem){
    links[linkedItem.id + '-' + tag.name] = true;
  });
  this.cloud.selected = _.union(this.cloud.selected, [tag]);
  TagCloud.selectedTags = _.union(TagCloud.selectedTags, [tag]);
};

Tag.prototype.unselect = function() {
  var tag=this;
  this.isSelected = false;
  this.links.forEach(function(linkedItem){
    links[linkedItem.id + '-' + tag.name] = false;
  });
  this.cloud.selected = _.without(this.cloud.selected, tag);
  TagCloud.selectedTags = _.without(TagCloud.selectedTags, tag);
};


// Cloud multiton

function TagCloud(name) {
  this.name = name;
  this.tagsByName = {};
  this.tags = [];
  this.selected = [];
  _.bindAll(this, 'filterSelected', 'filterUnselected');
}

TagCloud.prototype.get = function(tag) {
  if ( typeof tag === 'string' )  {
    return this.tagsByName[tag];
  } else {
    return tag;
  }
};

TagCloud.prototype.add = function(name, linkedItem){
  if ( !this.tagsByName[name] ) {
    this.tagsByName[name] = new Tag(name, linkedItem, this);
    this.tags.push(this.tagsByName[name]);
  } else {
    this.tagsByName[name].link(linkedItem);
  }
};

TagCloud.prototype.clearSelected = function(){
  _.each(this.selected, function(tag){
    TagCloud.selectedTags = _.without(TagCloud.selectedTags, tag);
    tag.unselect();
  });
  this.selected = [];
};

TagCloud.prototype.toggle = function(tag){
  tag = this.get(tag);
  tag.toggle();
};

TagCloud.prototype.select = function(tag){
  tag = this.get(tag);
  tag.select();
};

TagCloud.prototype.unselect = function(tag){
  tag = this.get(tag);
  tag.unselect();
};

TagCloud.prototype.filterUnselected = function(tag){
  tag = this.get(tag);
  return !tag.isSelected;
};

TagCloud.prototype.filterSelected = function(tag){
  tag = this.get(tag);
  return tag.isSelected;
};

TagCloud.prototype.isLinkSelected = function(linkedItem){
  return _.every(this.selected, function(tag) {
    return links[linkedItem.id + '-' + tag.name];
  });
};

// Static API

TagCloud.instances = [];
TagCloud.selectedTags = [];
TagCloud.getInstance = function(name) {
  if ( !TagCloud.instances[name] ) {
    TagCloud.instances[name] = new TagCloud(name);
  }
  return TagCloud.instances[name];
};

module.exports = TagCloud;