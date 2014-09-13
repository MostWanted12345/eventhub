var mongoose = require('mongoose');

var eventSchema = new mongoose.Schema({
  id: {type: String, unique: true},
  name: String,
  area: String,
  description: String,
  attending: Number,
  malePertentage: Number,
  femalePercentage: Number,
  maleAttendees : Array,
  femaleAttendees : Array,
  date: { type: Date },
  duration: { type: Date },
  updated: { type: Date }
});

eventSchema.statics.findById = function (id, cb) {
  this.find({ id: id }, cb);
};

eventSchema.statics.del = function (id, cb) {
  this.remove({ id: id }, cb);
};

eventSchema.statics.findAll = function (cb) {
  this.find({},cb);
};


var Event = module.exports = mongoose.model('Event', eventSchema);
