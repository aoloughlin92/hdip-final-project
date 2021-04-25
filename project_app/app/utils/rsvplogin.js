'use strict';
const Event = require('../models/event');
const Guest = require('../models/guest');

const RsvpLogin={
  checkInfo: async function(eventId, guestId){
    let event = await Event.findByShortId(eventId);
    let guest = await Guest.findByShortId(guestId);
    if (event == null || guest ==null || event.id == undefined || guest.id == undefined) {
      throw Boom.badData(message);
    }
    //check if guest is for that event ID
    if(event.guests.indexOf(guest.id)<0){
      const message = 'Invalid Event ID or Guest ID.';
      throw Boom.badData(message);
    }
    return {event,guest}
  },
  generateShortGuestId: async function(){
    let id = "";
    for (let i = 0; i < 5; i++) {
      const random = Math.floor(Math.random() * chars.length);
      let c = chars[random];
      id = id + c;
    }
    const temp = await Guest.findByShortId(id);
    if(temp == null || temp.id == undefined){
      return id;
    }
    else{
      id="";
    }
  }

}

module.exports = RsvpLogin;