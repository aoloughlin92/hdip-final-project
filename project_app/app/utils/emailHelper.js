'use strict';
const Event = require('../models/event');
const Guest = require('../models/guest');
const Boom = require('@hapi/boom');
const nodemailer = require('nodemailer');

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
      text: 'Please click link to respond http://localhost:3000/request/'+request.id+"  "+request.message
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