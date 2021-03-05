'use strict';

const User = require('../models/user');
const Event = require('../models/event');

const Events = {
  showEvents: {
    handler: async function(request, h) {
        const events = await Event.find().lean();
        return h.view('events', {
          title: 'Todos so far',
          events: events
        });
    }
  },
  createEvent: {
    handler: async function(request, h){
      try {
        const id = request.auth.credentials.id;
        const user = await User.findById(id);
        const data = request.payload;
        const newEvent = new Event({
          title: data.title,
          date: data.date,
          info: data.info
        });
        await newEvent.save();
        return h.redirect('/events');
      }catch{
        return h.view('main', {errors: [{ message: err.message}] });
      }
    }
  }

};

module.exports = Events;