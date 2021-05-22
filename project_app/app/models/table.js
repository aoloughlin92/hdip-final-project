'use strict';

const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;
const Boom = require('@hapi/boom');

const tableSchema = new Schema({
  name: String,
  number: Number,
  capacity: Number,
  guests:  [{
    type: Schema.Types.ObjectId,
    ref: 'Guest'
  }],
});



module.exports = Mongoose.model('Table', tableSchema);