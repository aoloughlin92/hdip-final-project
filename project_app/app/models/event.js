'use strict';

const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;

const eventSchema = new Schema({
  title: String,
  date: Date,
  rsvpCutOff: Date,
  info: String,
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

module.exports = Mongoose.model('Event', eventSchema);