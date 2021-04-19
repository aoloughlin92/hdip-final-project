'use strict';

const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;

const answerSchema = new Schema({
  question: {
    type: Schema.Types.ObjectId,
    ref: 'Question'
  },
  answer: String,
});


module.exports = Mongoose.model('Answer', answerSchema);