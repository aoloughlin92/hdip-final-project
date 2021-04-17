'use strict';

const User = require('../models/user');
const Guest = require('../models/guest');
const dotenv = require('dotenv');
const Event = require('../models/event');
const ShortId = require('../utils/shortid');
const Boom = require('@hapi/boom');
const Joi = require('@hapi/joi');

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
    auth: false,
    validate: {
      payload: {
        eventId: Joi.string().required(),
        guestId: Joi.string().required(),
      },
      options: {
        abortEarly: false,
      },
      failAction: function(request, h, error) {
        return h
          .view('main', {
            title: 'RSVP error',
            errors: error.details
          })
          .takeover()
          .code(400);
      }
  },
    handler: async function(request, h) {
      try {
        const payload = request.payload;
        console.log(payload);
        let event = await Event.findByShortId(payload.eventId);
        let guest = await Guest.findByShortId(payload.guestId);
        if (event.id == undefined || guest.id == undefined) {
          const message = 'Invalid Event ID or Guest ID.';
          throw Boom.badData(message);
        }
        //check if guest is for that event ID
        if(event.guests.indexOf(guest.id)>=0){
          console.log("yes it does");
          return h.redirect('/guest/'+guest.id);
        }
        else{
          console.log("nope it doesn;t");
          const message = 'Invalid Event ID or Guest ID.';
          throw Boom.badData(message);
        }
      } catch (err) {
        return h.view('main', { errors: [{ message: err.message }] });
      }
    }
  },
  showRSVP:{
    handler: async function(request, h){
      try {
        const guest = await Guest.findOne({_id: request.params.id}).lean();
        console.log("Guest is"+ guest);
        const event = await Event.findOne({guests: request.params.id}).lean();
        console.log("Event is"+event);
        return h.view('guestlist', {
          title: event.title,
          guests: guest,
          event: event
        });
      }catch(err){
        return h.view('main', {errors: [{ message: err.message}] });
      }
    }
  }
};

module.exports = Guests;