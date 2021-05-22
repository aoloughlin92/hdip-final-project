'use strict';

const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;

const eventSchema = new Schema({
  title: String,
  date: Date,
  rsvpCutOff: Date,
  welcomeMessage: String,
  info: String,
  shortEventId: String,
  questions:[{
    type: Schema.Types.ObjectId,
    ref: 'Question'
  }],
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
  }],
  tables: [{
    type: Schema.Types.ObjectId,
    ref: 'Table'
  }],
  stats:[{
    type: Schema.Types.ObjectId,
    ref: 'Stat'
  }]
});

eventSchema.statics.findByHost = function(id) {
  return this.find({ hosts: id});
};

eventSchema.statics.findByGuest = function(ids) {
  return this.find({ guests: {$in: [ids]}});
};

eventSchema.statics.findByShortId = function(id) {
  return this.findOne({ shortEventId: id});
};

module.exports = Mongoose.model('Event', eventSchema);