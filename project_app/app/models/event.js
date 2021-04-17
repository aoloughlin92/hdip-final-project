'use strict';

const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;

const eventSchema = new Schema({
  title: String,
  date: Date,
  rsvpCutOff: Date,
  info: String,
  shortEventId: String,
  hosts: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  guests: [{
    type: Schema.Types.ObjectId,
    ref: 'Guest'
  }],
  todos: [{
    type: Schema.Types.ObjectId,
    ref: 'Todo'
  }],
  donations: [{
    type: Schema.Types.ObjectId,
    ref: 'Donation'
  }]
});

eventSchema.statics.findByHost = function(id) {
  return this.find({ hosts: id});
};

eventSchema.statics.findByShortId = function(id) {
  return this.findOne({ shortEventId: id});
};

module.exports = Mongoose.model('Event', eventSchema);