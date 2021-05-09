'use strict';
const Event = require('../models/event');
const Guest = require('../models/guest');
const Boom = require('@hapi/boom');
const ShortId = require('../utils/shortid');
const xlsx = require('xlsx');

const ExcelHelper={
  parseExcel: async function(filepath, eventid){
    const event = await Event.findOne({ _id: eventid});
    const workbook = xlsx.readFile(filepath);
    const sheetnames = Object.keys(workbook.Sheets);
    const sheetname = sheetnames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetname]);
    var numToIDMap = new Map();

    for(let i=0; i< data.length;i++) {
      const shortId = await ShortId.generateShortGuestId();
      let type = "guest";
      if(data[i].isPlusOne == true){
        type = "plusOne";
      }
      let newGuest = new Guest({
        event: event,
        firstName: data[i].firstName,
        lastName: data[i].lastName,
        email: data[i].email,
        shortGuestId: shortId,
        address1: data[i].address1,
        address2: data[i].address2,
        address3: data[i].address3,
        county: data[i].county,
        postcode: data[i].postcode,
        country: data[i].country,
        rsvpStatus: data[i].rsvpStatus,
        type: type
      });
      const guest = await newGuest.save();
      numToIDMap.set(data[i].xlsGuestNumber, guest._id);
      event.guests.push(guest);
    }

    //plus one data needs to be in separate loop to account for cases when plus one information is before the original
    //guest information on the excel file.
    for(let i=0; i< data.length;i++)
    {
      if(data[i].isPlusOne==true){
        const plusOneGuestId = numToIDMap.get(data[i].xlsGuestNumber);
        const plusOneGuest = await Guest.findOne({ _id: plusOneGuestId});
        const originalGuestId = numToIDMap.get(data[i].plusOneofGuestNo);
        const originalGuest = await Guest.findOne({ _id: originalGuestId});
        originalGuest.plusOne.push(plusOneGuest);
        await originalGuest.save();
      }
    }
    await event.save();
  }
};

module.exports = ExcelHelper;