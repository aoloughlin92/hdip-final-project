'use strict';

const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;
const Boom = require('@hapi/boom');

const requestSchema = new Schema({
  email: String,
  message: String,
  event:{
    type: Schema.Types.ObjectId,
    ref: 'Event'
  },
  sentBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
});

requestSchema.statics.findByEmail = function(email) {
  return this.find({ email : email});
};

module.exports = Mongoose.model('Request', requestSchema);