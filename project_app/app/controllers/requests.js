'use strict';
const User = require('../models/user');
const Event = require('../models/event');
const Request = require('../models/request');
const Stat = require('../models/stat');

const Requests = {
  viewRequest: {
    auth: false,
    handler: async function(request, h) {
      try{
        let req = await Request.findOne({ _id: request.params.id }).populate('sentBy').populate('event').lean();
        return h.view('request',{
          title: "New Request",
          req: req
        });
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
        //statistics for hosts
        const newStat = new Stat({
          host: user,
          hostName: user.firstName+" "+user.lastName
        });
        await newStat.save();
        event.hosts.push(user);
        event.stats.push(newStat);
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