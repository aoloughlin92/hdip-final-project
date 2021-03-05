'use strict';

const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;
const Boom = require('@hapi/boom');

const guestSchema = new Schema({
  firstName: String,
  lastName: String,
  type: String,
  rsvpStatus: String,
  donation: Number,
  plusOne: [{
    type: Schema.Type.ObjectId,
    ref: 'Guest'
  }]
});

module.exports = Mongoose.model('Guest', guestSchema);