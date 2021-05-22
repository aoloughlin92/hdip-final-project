'use strict';

require('dotenv').config();

const Mongoose = require('mongoose');

Mongoose.set('useNewUrlParser', true);
Mongoose.set('useUnifiedTopology', true);

async function seed() {
  let seeder = require('mais-mongoose-seeder')(Mongoose);
  const data = require('./seed-data.json');
  const Event = require('./event.js');
  const Answer = require('./answer.js');
  const User = require('./user');
  const Donation =require('./donation');
  const Guest = require('./guest');
  const Question = require('./question');
  const Request = require('./request');
  const Todo = require('./todo');
  const Stat = require('./stat');
  const dbData = await seeder.seed(data, { dropDatabase: false, dropCollections: true });
  //console.log(dbData);
}


Mongoose.connect(process.env.db);
const db = Mongoose.connection;

db.on('error', function(err) {
  console.log(`database connection error: ${err}`);
});

db.on('disconnected', function() {
  console.log('database disconnected');
});

db.once('open', function() {
  console.log(`database connected to ${this.name} on ${this.host}`);
  //seed();
});