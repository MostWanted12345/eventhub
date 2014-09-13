var mongoose = require('mongoose');

var pageSchema = new mongoose.Schema({
  id: {type: String, unique: true},
  name: String,
  query: String,
  description: String,
  updated: { type: Date }
});

pageSchema.statics.findById = function (id, cb) {
  this.find({ id: id }, cb);
};

pageSchema.statics.del = function (id, cb) {
  this.remove({ id: id }, cb);
};

pageSchema.statics.findAll = function (cb) {
  this.find({},cb);
};


var Page = module.exports = mongoose.model('Page', pageSchema);
