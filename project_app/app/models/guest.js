'use strict';

const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;
const Boom = require('@hapi/boom');

const guestSchema = new Schema({
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


module.exports = Mongoose.model('Guest', guestSchema);