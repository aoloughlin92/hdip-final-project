'use strict';

const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;

const eventSchema = new Schema({
  guest: {
    type: Schema.Types.ObjectId,
    ref: 'Guest'
  },
  date: Date,
  message: String,
  amount: Number
});

eventSchema.statics.findByHost = function(id) {
  return this.find({ hosts: id});
};

eventSchema.statics.findByShortId = function(id) {
  return this.findOne({ shortEventId: id});
};

module.exports = Mongoose.model('Event', eventSchema);