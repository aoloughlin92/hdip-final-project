'use strict';

const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;

const questionSchema = new Schema({
  question: String,
  answers: [String],
  required: Boolean
});


module.exports = Mongoose.model('Question', questionSchema);