'use strict';

const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;

const donationSchema = new Schema({
  guest: {
    type: Schema.Types.ObjectId,
    ref: 'Guest'
  },
  date: Date,
  message: String,
  amount: Number
});


module.exports = Mongoose.model('Donation', donationSchema);