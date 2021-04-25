'use strict';

const User = require('../models/user');
const Event = require('../models/event');

const Budget = {
  viewBudget: {
    auth: false,
    handler: async function(request, h) {
      try {
        const event = await Event.findOne({ _id: request.params.id }).populate('todos').lean();
        let total = 0;
        for(let i=0; i<event.todos.length; i++){
          total = total+event.todos[i].budget;
        }
        return h.view('budget',{
          event: event,
          todos: event.todos,
          total: total
        });
      }
      catch (e) {
        return h.view('main', {errors: [{ message: e.message}] });
      }
    }
  },
};

module.exports = Budget;