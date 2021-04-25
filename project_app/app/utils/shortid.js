'use strict';
const chars = [1,2,3,4,5,6,7,8,9,0,'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
const Event = require('../models/event');
const Guest = require('../models/guest');

const ShortId={
  generateShortEventId: async function(){
    while(true) {
      let id = this.generateCode();
      const temp = await Event.findByShortId(id);
      if(temp == null || temp.id == undefined){
        return id;
      }
    }
  },
  generateShortGuestId: async function(){
    while(true) {
      let id = this.generateCode();
      const temp = await Guest.findByShortId(id);
      if(temp == null || temp.id == undefined){
        return id;
      }
    }
  },
  generateCode: function(){
    let id = "";
    for (let i = 0; i < 5; i++) {
      const random = Math.floor(Math.random() * chars.length);
      let c = chars[random];
      id = id + c;
    }
    return id;
  }
};

module.exports = ShortId;