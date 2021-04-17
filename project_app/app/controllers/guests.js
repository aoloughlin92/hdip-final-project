'use strict';

const User = require('../models/user');
const Guest = require('../models/guest');
const dotenv = require('dotenv');
const Event = require('../models/event');
const ShortId = require('../utils/shortid');

const Guests = {
  addGuest: {
    handler: async function(request, h){
      try {
        const event = await Event.findOne({_id: request.params.id});
        const data = request.payload;
        const shortId = await ShortId.generateShortGuestId();
        const newGuest = new Guest({
          firstName: data.fname,
          lastName: data.lname,
          email: data.email,
          shortGuestId: shortId
        });
        await newGuest.save();
        event.guests.push(newGuest);
        await event.save();
        return h.redirect('/guestlist/'+event._id);
      }catch{
        return h.view('main', {errors: [{ message: err.message}] });
      }
    }
  },
  guestlist: {
    handler: async function(request, h){
      try {
        const event = await Event.findOne({_id: request.params.id}).populate('guests').lean();
        const guests = event.guests;
        return h.view('guestlist', {
          title: event.title,
          guests: guests,
          event: event
        });
      }catch{
        return h.view('main', {errors: [{ message: err.message}] });
      }
    }
  },
  rsvp:{
    handler: async function(request, h){

    }
  }
};

module.exports = Guests;