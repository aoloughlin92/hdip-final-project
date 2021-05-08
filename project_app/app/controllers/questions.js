'use strict';

const Event = require('../models/event');
const Question = require('../models/question');

const Questions = {
  addQuestion: {
    handler: async function(request, h) {
      try {
        let event = await Event.findOne({ _id: request.params.id });
        let bool = false;
        if(request.payload.required == 'required'){
          bool = true;
        }
        let ans = [];
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
        return h.redirect('/event/'+event._id);
      } catch (err) {
        return h.redirect('/events', { errors: [{ message: err.message }] });
      }
    }
  },
  viewQuestion:{
    handler: async function(request, h) {
      const question = await Question.findById(request.params.questionid).lean();
      const event = await Event.findById(request.params.id).lean();
      return h.view('editquestion', {
        title: event.title,
        question: question,
        event: event
      });
    }
  },
  deleteQuestion: {
    handler: async function(request, h) {
      const response = await Question.findOneAndDelete({_id: request.params.questionid});
      const event = await Event.findById(request.params.id);
      event.questions.pull({ _id: request.params.questionid });
      event.save();
      return h.redirect('/event/'+event._id);
    }
  },
  editQuestion:{
    handler: async function(request, h) {
      try {
        let event = await Event.findOne({ _id: request.params.id });
        let question = await Questions.findById(request.params.questionid);
        question.question = request.payload.question;
        let ans = [];
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
        question.answers = ans;
        await question.save();
        return h.redirect('/event/'+event._id);
      } catch (err) {
        return h.redirect('/events', { errors: [{ message: err.message }] });
      }
    }
  }
};

module.exports = Questions;