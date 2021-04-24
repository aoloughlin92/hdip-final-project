'use strict';

const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;

const todoSchema = new Schema({
  title: String,
  budget: Number,
  assigned: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  status: String
});

todoSchema.statics.findByIds = function(ids) {
  return this.find({ _id: {$in: [ids]}});
};

module.exports = Mongoose.model('Todo', todoSchema);