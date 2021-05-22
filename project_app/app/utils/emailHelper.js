'use strict';
const Event = require('../models/event');
const Guest = require('../models/guest');
const Boom = require('@hapi/boom');
const nodemailer = require('nodemailer');
const url = "http://localhost:3000/";

const EmailHelper={
  sendEmail: async function(request,subject){
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.gmailemail,
        pass: process.env.gmailpass
      }
    });
    var mailOptions = {
      from: process.env.gmailemail,
      to: request.email,
      subject: subject,
      text: 'Please click link to respond '+url+'request/'+request.id+"  "+request.message
    };
    transporter.sendMail(mailOptions, function(error,info) {
      if (error) {
        console.log("error sending email");
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

  },
  sendRSVPEmail: async function(guestid){
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.gmailemail,
        pass: process.env.gmailpass
      }
    });
    let guest = await Guest.findById(guestid).populate('event').lean();
    let subject = "Please RSVP to event: "+guest.event.title;
    let text = "Hi "+guest.firstName+"! Please click link to RSVP to event: "
      +url+"guest/addrsvp/"+guest._id+"    Your Event ID is "+guest.event.shortEventId+"  Your Guest ID is "+guest.shortGuestId;
    var mailOptions = {
      from: process.env.gmailemail,
      to: guest.email,
      subject: subject,
      text: text
    };
    transporter.sendMail(mailOptions, function(error,info) {
      if (error) {
        console.log("error sending email");
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

  },
  sendInfoEmail: async function(guestid){
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.gmailemail,
        pass: process.env.gmailpass
      }
    });
    let guest = await Guest.findById(guestid).populate('event');
    let subject = "Event "+guest.event.title+" has requested your info!";
    let text = "Hi "+guest.firstName+"! Please click link to update your info: "
      +url+"guest/addinfo/"+guest._id+"    Your Event ID is "+guest.event.shortEventId+"  Your Guest ID is "+guest.shortGuestId;
    var mailOptions = {
      from: process.env.gmailemail,
      to: guest.email,
      subject: subject,
      text: text
    };
    transporter.sendMail(mailOptions, function(error,info) {
      if (error) {
        console.log("error sending email");
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

  }
};

module.exports = EmailHelper;