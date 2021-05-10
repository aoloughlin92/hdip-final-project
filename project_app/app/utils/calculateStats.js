'use strict';
const Event = require('../models/event');
const Guest = require('../models/guest');
const Stat = require('../models/stat');
const Todo = require('../models/todo');

const CalculateStats={
  calculateToDoStats: async function(eventid){
    const event = await Event.findOne({ _id: eventid}).populate('stats').populate("todos");
    for(let i=0; i<event.stats.length;i++){
      const stat = event.stats[i];
      let countNotStarted  = event.todos.filter(function(item){
        return (JSON.stringify(item.assigned._id) === JSON.stringify(stat.host._id) && item.status == 'not_started')
      }).length;
      let countInProgress  = event.todos.filter(function(item){
        return (JSON.stringify(item.assigned._id) === JSON.stringify(stat.host._id) && item.status == 'in_progress')
      }).length;
      let countComplete  = event.todos.filter(function(item){
        return (JSON.stringify(item.assigned._id) === JSON.stringify(stat.host._id) && item.status == 'complete')
      }).length;
      stat.notStarted = countNotStarted;
      stat.inProgress = countInProgress;
      stat.complete = countComplete;
      stat.total = countNotStarted+countInProgress+countComplete;
      await stat.save();

      let totalNotStarted  = event.todos.filter(function(item){
        return (item.status == 'not_started')
      }).length;
      let totalInProgress  = event.todos.filter(function(item){
        return (item.status == 'in_progress')
      }).length;
      let totalComplete  = event.todos.filter(function(item){
        return (item.status == 'complete')
      }).length;
      let totalAttending  = event.guests.filter(function(item){
        return (item.rsvpStatus == 'attending')
      }).length;
      let totalNotAttending  = event.guests.filter(function(item){
        return (item.rsvpStatus == 'not_attending')
      }).length;
      let totalNoResponse  = event.guests.filter(function(item){
        return (item.rsvpStatus == undefined || item.rsvpStatus == null )
      }).length;
      let totalDonations = 0;
      for(let i=0; i<event.donations.length; i++){
        totalDonations = totalDonations+event.donations[i].amount;
      }
      let totalBudget = 0;
      for(let i=0; i<event.todos.length; i++){
        totalBudget = totalBudget+event.todos[i].budget;
      }


      return {
        totalNotStarted: totalNotStarted,
        totalInProgress: totalInProgress,
        totalComplete: totalComplete,
        totalAttending: totalAttending,
        totalNotAttending: totalNotAttending,
        totalNoResponse: totalNoResponse,
        totalBudget: totalBudget,
        totalDonations: totalDonations
      }


    }
  }
};

module.exports = CalculateStats;