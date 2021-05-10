'use strict';

const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;

const statSchema = new Schema({
  host: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  hostName: String,
  notStarted: Number,
  inProgress: Number,
  complete: Number,
  total: Number
});


module.exports = Mongoose.model('Stat', statSchema);