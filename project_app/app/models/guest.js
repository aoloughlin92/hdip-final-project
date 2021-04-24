'use strict';

const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;
const Boom = require('@hapi/boom');

const guestSchema = new Schema({
  event: {
    type: Schema.Types.ObjectId,
    ref: 'Event'
  },
  firstName: String,
  lastName: String,
  type: String,
  email: String,
  address1: String,
  address2: String,
  address3: String,
  county: String,
  postcode: String,
  rsvpStatus: String,
  shortGuestId: String,
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  answers:[{
    type: Schema.Types.ObjectId,
    ref: 'Answer'
  }],
  plusOne: [{
    type: Schema.Types.ObjectId,
    ref: 'Guest'
  }]
});

guestSchema.statics.findByShortId = function(id) {
  return this.findOne({ shortGuestId: id});
};

guestSchema.statics.findByUserId = function(id) {
  return this.find({ user: id});
};


module.exports = Mongoose.model('Guest', guestSchema);