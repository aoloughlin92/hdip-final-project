'use strict';

const User = require('../models/user');
const Event = require('../models/event');
const Request = require('../models/request');

const Requests = {
  viewRequest: {
    handler: async function(request, h) {
      try{
        //if user logged in
        const id = request.auth.credentials.id;
        const user = await User.findById(id);
        let req = await Request.findOne({ _id: request.params.id }).lean();

      }catch(err){
        return h.view('main', {errors: [{ message: err.message}] });
      }
    }
  },
  decline: {
    handler: async function(request, h){
      try{
        let req = await Request.deleteOne({ _id: request.params.id }).lean();
        return h.redirect('/events');
      }catch(err){
        return h.view('main', {errors: [{ message: err.message}] });
      }
    }
  },
  accept:{
    handler: async function(request, h){
      try{
        let req = await Request.findOne({ _id: request.params.id });
        const id = request.auth.credentials.id;
        const user = await User.findById(id);
        let event = await Event.findOne({_id: req.event });
        event.hosts.push(user);
        event.save();
        await Request.deleteOne({ _id: request.params.id });
        return h.redirect('/events');
      }catch(err){
        return h.view('main', {errors: [{ message: err.message}] });
      }
    }
  }
};

module.exports = Requests;