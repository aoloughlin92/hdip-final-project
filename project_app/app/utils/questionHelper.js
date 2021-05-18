'use strict';
const Event = require('../models/event');
const Guest = require('../models/guest');
const Question = require('../models/question');
const Answer = require('../models/answer');

const QuestionHelper={
  findAnswer: async function(guestId, questionId){
    const guest = await Guest.findOne({ _id: guestId}).populate('answers');
    const question = await Question.findById(questionId);
    const answer = guest.answers.filter(function(item){
      return (JSON.stringify(item.question._id) === JSON.stringify(question._id))
    });
    if(answer.length>0) {
      return answer[0].answer;
    }
    else{
      return null;
    }
  },
  updateAnswers: async function(guestid,payload){
    const guest = await Guest.findById(guestid).populate('answers');
    const keys = Object.keys(payload);
    for(let i=0;i<keys.length;i++){
      let key = keys[i];
      let split = key.split(".");
      let queId = split[1];
      let question = await Question.findOne({_id: queId});
      //if there is already an answer to that question - return answer
      let returnedAnswer  = guest.answers.filter(function(item){
        return (JSON.stringify(item.question._id) === JSON.stringify(question._id))
      });
      if(returnedAnswer.length==0){
        //if not create a new answer
        let answer = new Answer({
          question: question,
          answer: payload[key]
        });
        await answer.save();
        guest.answers.push(answer);
      }
      else{
        //update answer
        const ans = await Answer.findById(returnedAnswer);
        ans.answer=payload[key];
        await ans.save()
      }
    }
    await guest.save();
  }
};

module.exports = QuestionHelper;