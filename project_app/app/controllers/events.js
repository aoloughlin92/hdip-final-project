'use strict';

const ShortId = require('../utils/shortid');
const User = require('../models/user');
const Guest = require('../models/guest');
const Event = require('../models/event');
const Request = require('../models/request');
const Question = require('../models/question');

const Events = {
  showEvents: {
    handler: async function(request, h) {
      const id = request.auth.credentials.id;
      const user = await User.findById(id);
      const events = await Event.findByHost(id).lean();
      const guestIds = await Guest.findByUserId(id).populate('event').lean();
      const reqs= await Request.findByEmail(user.email).populate('sentBy').populate('event').lean();
      return h.view('events', {
        title: 'My Events',
        events: events,
        requests: reqs,
        reqCount: reqs.length,
        eventCount: events.length,
        invites: guestIds,
        inviteCount: guestIds.length
      });
    }
  },
  createEvent: {
    handler: async function(request, h){
      try {
        const id = request.auth.credentials.id;
        const user = await User.findById(id);
        const data = request.payload;
        const shortId = await ShortId.generateShortEventId();
        const newEvent = new Event({
          title: data.title,
          date: data.date,
          info: data.info,
          shortEventId: shortId
        });
        newEvent.hosts.push(user);
        await newEvent.save();
        return h.redirect('/events');
      }catch(err){
        return h.view('main', {errors: [{ message: err.message}] });
      }
    }
  },
  deleteEvent:{
    handler: async function(request, h) {
      try {
        let event = await Event.findOne({ _id: request.params.id }).lean();
        const response = await Event.findOneAndDelete({_id: request.params.id});
        return h.redirect('/events');
      }catch(err){
        return h.redirect('/events', { errors: [{ message: err.message }] });
      }
    }
  },
  viewEvent: {
    handler: async function(request, h) {
      let event = await Event.findOne({ _id: request.params.id }).lean();
      return h.view('event', {
        title: event.title,
        event: event
      });
    }
  },
  addHost:{
    handler: async function(request, h) {
      try {
        let event = await Event.findOne({ _id: request.params.id }).lean();
        const id = request.auth.credentials.id;
        const user = await User.findById(id);
        const data = request.payload;
        const newRequest = new Request({
          email: data.email,
          sentBy: user,
          message: data.message,
          event: event
        });
        await newRequest.save();
        return h.view('event', {
          title: event.title,
          event: event
        });
      }catch(err){
        return h.redirect('/events', { errors: [{ message: err.message }] });
      }
    }
  },
  setWelcomeMessage: {
    handler: async function(request, h) {
      try {
        let event = await Event.findOne({ _id: request.params.id });
        const message = request.payload.message;
        event.welcomeMessage = message;
        await event.save();
        event = await Event.findOne({ _id: request.params.id }).lean();
        return h.view('event', {
          title: event.title,
          event: event
        });
      } catch (err) {
        return h.redirect('/events', { errors: [{ message: err.message }] });
      }
    }
  },
  addQuestion: {
    handler: async function(request, h) {
      try {
        let event = await Event.findOne({ _id: request.params.id });
        let bool = false;
        if(request.payload.required == 'required'){
          bool = true;
        }
        var ans = [];
        if(request.payload.answer1.length>0){
          ans.push(request.payload.answer1);
        }
        if(request.payload.answer2.length>0){
          ans.push(request.payload.answer2);
        }
        if(request.payload.answer3.length>0){
          ans.push(request.payload.answer3);
        }
        if(request.payload.answer4.length>0){
          ans.push(request.payload.answer4);
        }
        if(request.payload.answer5.length>0){
          ans.push(request.payload.answer5);
        }
        const newQuestion = new Question({
          question: request.payload.question,
          required: bool,
          answers: ans
        });
        await newQuestion.save();
        event.questions.push(newQuestion);
        await event.save();
        event = await Event.findOne({ _id: request.params.id }).lean();
        return h.view('event', {
          title: event.title,
          event: event
        });
      } catch (err) {
        return h.redirect('/events', { errors: [{ message: err.message }] });
      }
    }
  },
  viewDonations: {
    handler: async function(request, h) {
      try {
        let event = await Event.findOne({ _id: request.params.id })
          .populate({
            path: 'donations',
            populate:{
              path: 'guest'
            }
          }).lean();
        var total = 0;
         for(var i=0; i<event.donations.length; i++){
          total = total+event.donations[i].amount;
        }
        return h.view('donations', {
          title: event.title,
          event: event,
          donations: event.donations,
          total: total
        });
      } catch (err) {
        return h.redirect('/events', { errors: [{ message: err.message }] });
      }
    }
  },
};

module.exports = Events;