'use strict';
const chars = [1,2,3,4,5,6,7,8,9,0,'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z']
const Event = require('../models/event');
const Guest = require('../models/guest');

const ShortId={
  generateShortEventId: async function(){
    let id = "";
    while(true) {
      for (let i = 0; i < 5; i++) {
        const random = Math.floor(Math.random() * chars.length);
        let c = chars[random];
        id = id + c;
      }
      const temp = await Event.findByShortId(id);
      if(temp == null || temp.id == undefined){
        return id;
      }
      else{
        id="";
      }
    }
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

module.exports = ShortId;