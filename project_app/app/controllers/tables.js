'use strict';

const ShortId = require('../utils/shortid');
const User = require('../models/user');
const Guest = require('../models/guest');
const Event = require('../models/event');
const Request = require('../models/request');
const Question = require('../models/question');
const EmailHelper = require('../utils/emailHelper');
const CalculateStats = require('../utils/calculateStats');
const Stat = require('../models/stat');
const Answer = require('../models/answer');
const Table = require('../models/table');

const Tables = {
  viewTables: {
    handler: async function(request, h) {
      let event = await Event.findOne({ _id: request.params.id }).populate('tables').lean();
      let tables = event.tables;
      return h.view('tableplan', {
        title: event.title,
        event: event,
        tables: tables
      });
    }
  },
  addTables: {
    handler: async function(request, h) {
      let event = await Event.findOne({ _id: request.params.id }).populate('tables');
      let last = 0;
      if(event.tables.length>0) {
        last = event.tables[event.tables.length - 1].number;
      }
      for(let i=1;i<=request.payload.count;i++){
        let no = last+i;
        let newtable = new Table({
          name: "Table No."+no,
          number: no,
          capacity: request.payload.capacity
        });
        await newtable.save();
        event.tables.push(newtable);
      }
      await event.save();
      return h.redirect('/tableplan/'+event._id);
    }
  },
  viewTable: {
    handler: async function(request, h) {
      let event = await Event.findOne({ _id: request.params.id }).populate('guests').lean();
      let table = await Table.findOne({_id: request.params.tableid}).populate('guests').lean();
      let spaces = table.capacity - table.guests.length;
      return h.view('tableview', {
        title: table.name,
        event: event,
        table: table,
        guests: table.guests,
        spaces: spaces
      });
    }
  },
  deleteTable: {
    handler: async function(request, h) {
      let event = await Event.findOne({ _id: request.params.id });
      event.tables.pull({ _id: request.params.tableid });
      await event.save()
      let table = await Table.findOne({_id: request.params.tableid});
      for(let i=0;i<table.guests.length;i++){
        let guest = await Guest.findone({_id:table.guests[i]});
        guest.table = null;
      }
      await Table.findOneAndDelete({_id: request.params.tableid});
      return h.redirect('/tableplan/'+event._id);
    }
  },
  addGuest: {
    handler: async function(request, h) {
      let event = await Event.findOne({ _id: request.params.id });
      let table = await Table.findOne({_id: request.params.tableid});
      let guest = await Guest.findOne({_id: request.payload.guest});
      guest.table = table;
      await guest.save();
      table.guests.push(guest);
      await table.save();
      return h.redirect('/tableplan/'+event._id+'/view/'+table._id);
    }
  },
  removeGuest: {
    handler: async function(request, h) {
      let event = await Event.findOne({ _id: request.params.id });
      let table = await Table.findOne({_id: request.params.tableid});
      let guest = await Guest.findOne({_id: request.params.guestid});
      guest.table = null;
      await guest.save();
      table.guests.pull(guest);
      await table.save();
      return h.redirect('/tableplan/'+event._id+'/view/'+table._id);
    }
  },
  editTable: {
    handler: async function(request, h) {
      let event = await Event.findOne({ _id: request.params.id });
      let table = await Table.findOne({_id: request.params.tableid});
      table.name = request.payload.name;
      table.capacity = request.payload.capacity;
      await table.save();
      return h.redirect('/tableplan/'+event._id+'/view/'+table._id);
    }
  },
};

module.exports = Tables;