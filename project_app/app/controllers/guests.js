'use strict';

const User = require('../models/user');
const Donation = require('../models/donation');
const Guest = require('../models/guest');
const dotenv = require('dotenv');
const Event = require('../models/event');
const ShortId = require('../utils/shortid');
const RSVPLogin = require('../utils/rsvplogin');
const Boom = require('@hapi/boom');
const Joi = require('@hapi/joi');
const ExcelHelper = require('../utils/excelhelper');


const Guests = {
  addGuest: {
    handler: async function(request, h){
      try {
        const event = await Event.findOne({_id: request.params.id});
        const data = request.payload;
        const shortId = await ShortId.generateShortGuestId();
        const newGuest = new Guest({
          event: event,
          firstName: data.fname,
          lastName: data.lname,
          email: data.email,
          shortGuestId: shortId
        });
        await newGuest.save();
        event.guests.push(newGuest);
        await event.save();
        return h.redirect('/guestlist/'+event._id);
      }catch(err){
        return h.view('main', {errors: [{ message: err.message}] });
      }
    }
  },
  guestlist: {
    handler: async function(request, h){
      try {
        const event = await Event.findOne({_id: request.params.id}).populate('guests').lean();
        const guests= await Guest.find({event: request.params.id, type: 'guest'}).lean();
        return h.view('guestlist', {
          title: event.title,
          guests: guests,
          event: event
        });
      }catch(err){
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
        const res = await RSVPLogin.checkInfo(payload.eventId, payload.guestId);
        request.cookieAuth.set({ id: res.guest._id });
        return h.redirect('/guest/'+ res.guest._id);
      } catch (err) {
        return h.view('main', { errors: [{ message: err.message }] });
      }
    }
  },
  rsvplogin:{
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
        const res = await RSVPLogin.checkInfo(payload.eventId, payload.guestId);
        const id = request.auth.credentials.id;
        const guest = res.guest;
        guest.user = id;
        await guest.save();
        return h.redirect('/guest/'+ res.guest._id);
      } catch (err) {
        return h.view('main', { errors: [{ message: err.message }] });
      }
    }
  },
  showRSVP:{
    handler: async function(request, h){
      try {
        let loggedin = RSVPLogin.isUserLoggedIn(request.auth.credentials.id,request.params.id);
        const guest = await Guest.findOne({_id: request.params.id}).lean();
        const event = await Event.findOne({guests: request.params.id}).populate('hosts')
          .populate('questions').lean();
        let showQuestions = false;
        if(guest.rsvpStatus == "yes" && event.questions.length>0){
          showQuestions = true;
        }
        return h.view('rsvp', {
          title: event.title,
          guest: guest,
          hosts: event.hosts,
          event: event,
          questions: event.questions,
          showQuestions: showQuestions,
          loggedin: loggedin
        });
      }catch(err){
        return h.view('main', {errors: [{ message: err.message}] });
      }
    }
  },
  showDonation:{
    handler: async function(request, h){
      try {
        let loggedin = RSVPLogin.isUserLoggedIn(request.auth.credentials.id,request.params.id);
        const guest = await Guest.findOne({_id: request.params.id}).lean();
        const event = await Event.findOne({guests: request.params.id}).lean();
        return h.view('guestdonation', {
          title: event.title,
          guest: guest,
          event: event,
          loggedin: loggedin
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
        const event = await Event.findOne({guests: request.params.id});
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
  showInfo:{
    handler: async function(request, h){
      try {
        let loggedin = RSVPLogin.isUserLoggedIn(request.auth.credentials.id,request.params.id);
        const guest = await Guest.findOne({_id: request.params.id}).lean();
        const event = await Event.findOne({guests: request.params.id}).lean();
        return h.view('guestinfo', {
          title: event.title,
          guest: guest,
          event: event,
          loggedin: loggedin
        });
      }catch(err){
        return h.view('main', {errors: [{ message: err.message}] });
      }
    }
  },
  updateMyInfo:{
    handler: async function(request, h){
      try {
        let loggedin = RSVPLogin.isUserLoggedIn(request.auth.credentials.id,request.params.id);
        let guest = await Guest.findOne({_id: request.params.id});
        guest.firstName = request.payload.firstName;
        guest.lastName = request.payload.lastName;
        guest.email = request.payload.email;
        guest.address1 = request.payload.address1;
        guest.address2 = request.payload.address2;
        guest.address3 = request.payload.address3;
        guest.county = request.payload.county;
        guest.postcode = request.payload.postcode;
        guest.country = request.payload.country;
        await guest.save();
        return h.redirect('/myinfo/'+ guest._id);
      }catch(err){
        return h.view('main', {errors: [{ message: err.message}] });
      }
    }
  },
  updateRSVP:{
    handler: async function(request, h){
      try {
        let loggedin = RSVPLogin.isUserLoggedIn(request.auth.credentials.id,request.params.id);
        let guest = await Guest.findOne({_id: request.params.id});
        guest.rsvpStatus = request.payload.rsvpstatus;
        await guest.save();
        return h.redirect('/guest/'+ guest._id);
      }catch(err){
        return h.view('main', {errors: [{ message: err.message}] });
      }
    }
  },
  uploadGuestlist:{
    payload: {
      maxBytes: 209715200,
      output: 'file',
      parse: true,
      multipart: true     // <-- this fixed the media type error
    },
    handler: async function(request, h) {
      try {
        const eventid = request.params.id;
        const filepath = request.payload.excelfile.path;
        await ExcelHelper.parseExcel(filepath,eventid);
        return h.redirect('/guestlist/'+eventid);
      } catch (err) {
        return h.redirect('/events', { errors: [{ message: err.message }] });
      }
    }
  }
};

module.exports = Guests;