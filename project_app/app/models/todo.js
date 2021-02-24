'use strict';

const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;

const todoSchema = new Schema({
  amount: Number,
  method: String,
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
});

module.exports = Mongoose.model('Todo', todoSchema);