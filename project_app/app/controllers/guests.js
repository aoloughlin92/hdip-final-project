'use strict';

const User = require('../models/user');
const Donation = require('../models/donation');
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
    auth:false,
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
          throw Boom.badData(message);
        }
        //check if guest is for that event ID
        if(event.guests.indexOf(guest.id)<0){
          const message = 'Invalid Event ID or Guest ID.';
          throw Boom.badData(message);
        }
        request.cookieAuth.set({ id: guest.id });
        return h.redirect('/guest/'+ guest.id);
      } catch (err) {
        return h.view('main', { errors: [{ message: err.message }] });
      }
    }
  },
  showRSVP:{
    handler: async function(request, h){
      try {
        const guest = await Guest.findOne({_id: request.params.id}).lean();
        const event = await Event.findOne({guests: request.params.id}).lean();
        return h.view('rsvp', {
          title: event.title,
          guest: guest,
          event: event
        });
      }catch(err){
        return h.view('main', {errors: [{ message: err.message}] });
      }
    }
  },
  showDonation:{
    handler: async function(request, h){
      try {
        const guest = await Guest.findOne({_id: request.params.id}).lean();
        const event = await Event.findOne({guests: request.params.id}).lean();
        return h.view('guestdonation', {
          title: event.title,
          guest: guest,
          event: event,
        });
      }catch(err){
        return h.view('main', {errors: [{ message: err.message}] });
      }
    }
  },
  donate:{
    handler: async function(request, h){
      try {
        const guest = await Guest.findOne({_id: request.params.id}).lean();
        const event = await Event.findOne({guests: request.params.id}).lean();
        const result = dotenv.config();
        if (result.error) {
          console.log(result.error.message);
          process.exit(1);
        }
        const paypalurl= process.env.paypalurl;
        const message = request.payload.message;
        const donation = request.payload.donation;
        return h.view('donationconfirmation',{
          guest: guest,
          event: event,
          title: event.title,
          message: message,
          donation: donation,
          paypalurl: paypalurl,
        });
      }catch(err){
        return h.view('main', {errors: [{ message: err.message}] });
      }
    }
  },
  donationComplete:{
    handler: async function(request, h){
      try {
        const guest = await Guest.findOne({_id: request.params.id});
        console.log("guest is : "+ guest.firstName);
        const event = await Event.findOne({guests: request.params.id});
        console.log("event is "+event.title);
        console.log("donation "+ request.payload.donation);
        console.log("message "+ request.payload.message);
        console.log("Payload "+ request.payload);
        const newDonation = new Donation({
          guest: guest,
          date: Date(),
          message: request.payload.message,
          amount: request.payload.donation,
          orderId: request.payload.orderID
        });
        await newDonation.save();
        event.donations.push(newDonation);
        await event.save();
        return 100;
      }catch(err){
        console.log(err);
        return h.view('main', {errors: [{ message: err.message}] });
      }
    }
  },
};

module.exports = Guests;