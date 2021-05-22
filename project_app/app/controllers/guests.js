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
const EmailHelper = require('../utils/emailhelper');
const QuestionHelper = require('../utils/questionHelper');

const Guests = {
  addGuest: {
    handler: async function(request, h){
      try {
        const event = await Event.findOne({_id: request.params.id});
        const data = request.payload;
        const shortId = await ShortId.generateShortGuestId();
        const newGuest = new Guest({
          event: event,
          type: 'guest',
          firstName: data.fname,
          lastName: data.lname,
          email: data.email,
          shortGuestId: shortId
        });
        const guest = await newGuest.save();
        event.guests.push(newGuest);
        await event.save();
        return h.redirect('/guestlist/'+event._id+'/viewguest/'+guest._id);
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
        const guest = await Guest.findOne({_id: request.params.id}).populate('plusOne').lean();
        const event = await Event.findOne({guests: request.params.id}).populate('hosts')
          .populate('questions').lean();
        let showQuestions = false;
        if(guest.rsvpStatus == "yes" && event.questions.length>0){
          showQuestions = true;
        }
        let questions = event.questions;
        for(let i = 0 ; i< questions.length;i++){
          let selected = await QuestionHelper.findAnswer(guest._id, questions[i]._id);
          if(selected != null) {
            questions[i].selected = selected;
          }
        }
        return h.view('rsvp', {
          title: event.title,
          guest: guest,
          hosts: event.hosts,
          event: event,
          questions: questions,
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
        const user = await Guest.findOne({_id: request.params.id}).lean();
        const event = await Event.findOne({guests: request.params.id}).populate("donations").lean();
        const donations = event.donations.filter(function(item){
          return (JSON.stringify(item.guest._id) === JSON.stringify(user._id))
        });
        return h.view('guestdonation', {
          title: event.title,
          guest: user,
          event: event,
          loggedin: loggedin,
          donations: donations
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
        console.log("here");
        let loggedin = RSVPLogin.isUserLoggedIn(request.auth.credentials.id,request.params.id);
        const guest = await Guest.findOne({_id: request.params.id}).populate('plusOne').lean();
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
        let guest = await Guest.findOne({_id: request.params.id});
        const payload = request.payload;
        guest.rsvpStatus = payload.rsvpstatus;
        let keys = Object.keys(payload);
        for(let i=0; i<keys.length;i++){
          let key = keys[i];
          if(key == "rsvpstatus"){
            // do nothing
          }
          else{
            let split = key.split(".");
            let plusOneId = split[1];
            let plusOne = await Guest.findOne({_id: plusOneId});
            plusOne.rsvpStatus = payload[key];
            await plusOne.save();
          }
        }
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
  },
  editGuest:{
    handler: async function(request, h){
      try {
        let guest = await Guest.findOne({_id: request.params.guestid});
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
        return h.redirect('/guestlist/'+request.params.id);
      }catch(err){
        return h.view('main', {errors: [{ message: err.message}] });
      }
    }
  },
  viewGuest:{
    handler: async function(request, h){
      try {
        let guest = await Guest.findOne({_id: request.params.guestid}).populate('plusOne').lean();
        let event = await Event.findOne({_id: request.params.id}).lean();
        return h.view('guestview', {
          title: guest.firstName+" "+guest.lastName,
          guest: guest,
          event: event
        });
      }catch(err){
        return h.view('main', {errors: [{ message: err.message}] });
      }
    }
  },
  deleteGuest:{
    handler: async function(request, h){
      try {
        const event = await Event.findOne({_id: request.params.id});
        const guest = await Guest.findOne({_id: request.params.guestid});
        let index =  event.guests.indexOf(request.params.guestid);
        if(index > -1){
          event.guests.splice(index,1);
        }
        if(guest.plusOne.length>0){
          for(let i=0; i<guest.plusOne.length;i++){
            index =  event.guests.indexOf(guest.plusOne[i]);
            if(index > -1){
              event.guests.splice(index,1);
            }
          }
        }
        await Guest.findOneAndDelete({_id: request.params.guestid});
        await event.save();
        return h.redirect('/guestlist/'+request.params.id);
      }catch(err){
        return h.view('main', {errors: [{ message: err.message}] });
      }
    }
  },
  deletePlusOne:{
    handler: async function(request, h){
      try {
        const event = await Event.findOne({_id: request.params.id});
        const guest = await Guest.findOne({_id: request.params.guestid});
        const plusOne = await Guest.findOne({_id: request.params.plusoneid});
        let index =  event.guests.indexOf(request.params.plusoneid);
        if(index > -1){
          event.guests.splice(index,1);
        }
        index =  guest.plusOne.indexOf(request.params.plusoneid);
        if(index > -1){
          guest.plusOne.splice(index,1);
        }
        await Guest.findOneAndDelete({_id: request.params.plusoneid});
        await guest.save()
        await event.save();
        return h.redirect('/guestlist/'+request.params.id+'/viewguest/'+request.params.guestid);
      }catch(err){
        return h.view('main', {errors: [{ message: err.message}] });
      }
    }
  },
  editPlusOne:{
    handler: async function(request, h){
      try {

        let plusOne = await Guest.findOne({_id: request.params.plusoneid});
        plusOne.firstName = request.payload.firstName;
        plusOne.lastName = request.payload.lastName;
        await plusOne.save();
        return h.redirect('/guestlist/'+request.params.id+'/viewguest/'+request.params.guestid);
      }catch(err){
        return h.view('main', {errors: [{ message: err.message}] });
      }
    }
  },
  updatePlusOne:{
    handler: async function(request, h){
      try {

        let plusOne = await Guest.findOne({_id: request.params.plusoneid});
        plusOne.firstName = request.payload.firstName;
        plusOne.lastName = request.payload.lastName;
        await plusOne.save();
        return h.redirect('/myinfo/'+request.params.guestid);
      }catch(err){
        return h.view('main', {errors: [{ message: err.message}] });
      }
    }
  },
  addPlusOne:{
    handler: async function(request, h){
      try {
        let guest = await Guest.findOne({_id: request.params.guestid});
        const plusOne = new Guest({
          firstName: request.payload.fname,
          lastName: request.payload.lname
        });
        await plusOne.save();
        guest.plusOne.push(plusOne);
        await guest.save();
        return h.redirect('/guestlist/'+request.params.id+'/viewguest/'+request.params.guestid);
      }catch(err){
        return h.view('main', {errors: [{ message: err.message}] });
      }
    }
  },
  viewInfoEmail:{
    handler: async function(request, h){
      try {
        let event = await Event.findById(request.params.id).populate('guests').lean();
        let guest = event.guests.filter(function(item){
          return (item.type == 'guest')
        });
        return h.view('sendinfoemail', {
          title: event.title,
          guest: guest,
          event: event
        });
      }catch(err){
        return h.view('main', {errors: [{ message: err.message}] });
      }
    }
  },
  viewRSVPEmail:{
    handler: async function(request, h){
      try {
        let event = await Event.findById(request.params.id).populate('guests').lean();
        let guest = event.guests.filter(function(item){
          return (item.type == 'guest' && item.rsvpStatus==undefined)
        });
        return h.view('sendrsvpemail', {
          title: event.title,
          guest: guest,
          event: event
        });
      }catch(err){
        return h.view('main', {errors: [{ message: err.message}] });
      }
    }
  },
  infoRequest:{
    handler: async function(request, h){
      try {
        let t = typeof request.payload.selected;
        if(t == 'string'){
          EmailHelper.sendInfoEmail(request.payload.selected);
        }
        else {
          for (let i = 0; i < request.payload.selected.length; i++) {
            let id = request.payload.selected[i];
            EmailHelper.sendInfoEmail(id);
          }
        }
        return h.redirect('/guestlist/'+request.params.id);
      }catch(err){
        return h.view('main', {errors: [{ message: err.message}] });
      }
    }
  },
  rsvpRequest:{
    handler: async function(request, h){
      try {
        let t = typeof request.payload.selected;
        if(t == 'string'){
           EmailHelper.sendRSVPEmail(request.payload.selected);
        }
        else {
          for (let i = 0; i < request.payload.selected.length; i++) {
            let id = request.payload.selected[i];
            EmailHelper.sendRSVPEmail(id);
          }
        }
        return h.redirect('/guestlist/'+request.params.id);
      }catch(err){
        return h.view('main', {errors: [{ message: err.message}] });
      }
    }
  },
  addInfo:{
    auth: false,
    handler: async function(request, h) {
      try {
        const id = request.params.id;
        const guest = await Guest.findById(id);
        request.cookieAuth.set({ id: guest._id });
        console.log(guest);
        return h.redirect('/myinfo/'+ guest._id);
      } catch (err) {
        return h.view('main', { errors: [{ message: err.message }] });
      }
    }
  },
  addRSVP:{
    auth: false,
    handler: async function(request, h) {
      try {
        const id = request.params.id;
        const guest = await Guest.findById(id);
        request.cookieAuth.set({ id: guest._id });
        return h.redirect('/guest/'+ guest._id);
      } catch (err) {
        return h.view('main', { errors: [{ message: err.message }] });
      }
    }
  },
};

module.exports = Guests;