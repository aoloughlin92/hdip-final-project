'use strict';
const Event = require('../models/event');
const Guest = require('../models/guest');
const Boom = require('@hapi/boom');

const RsvpLogin={
  checkInfo: async function(eventId, guestId) {
    let event = await Event.findByShortId(eventId);
    let guest = await Guest.findByShortId(guestId);
    if (event == null || guest == null || event.id == undefined || guest.id == undefined) {
      throw Boom.badData(message);
    }
    //check if guest is for that event ID
    if (event.guests.indexOf(guest.id) < 0) {
      const message = 'Invalid Event ID or Guest ID.';
      throw Boom.badData(message);
    }
    return { event, guest }
  },
  isUserLoggedIn: function(cred, params){
    if(cred == params){
      //credential is same as params -> guest is not logged in
      return false;
    }
    else {
      return true;
    }
  }
};

module.exports = RsvpLogin;