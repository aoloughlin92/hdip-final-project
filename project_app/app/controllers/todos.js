'use strict';

const User = require('../models/user');
const Todo = require('../models/todo');
const Event = require('../models/event');
const dotenv = require('dotenv');

const Todos = {
  todolist: {
    handler: async function(request, h) {
      try {
        const event = await Event.findOne({ _id: request.params.id })
          .populate({
            path: 'todos',
            populate:{
              path: 'assigned'
            }
        }).populate('hosts').lean();
        let mytodos  = event.todos.filter(function(item){
          return (JSON.stringify(item.assigned._id) === JSON.stringify(request.auth.credentials.id))
        });
        return h.view('todolist', {
          title: 'Todos so far',
          todos: event.todos,
          event: event,
          mytodos: mytodos
        });
      }catch(err){
        return h.view('main', {errors: [{ message: err.message}] });
      }
    }
  },
  createToDo: {
    handler: async function(request, h){
      try {
        const id = request.auth.credentials.id;
        const user = await User.findById(id);
        const data = request.payload;
        const event = await Event.findOne({_id: request.params.id});
        const newTodo = new Todo({
          title: data.title,
          budget: data.budget,
          assigned: data.assigned,
          status: data.status
        });
        await newTodo.save();
        event.todos.push(newTodo);
        await event.save();
        return h.redirect('/todolist/'+ event._id);
      }catch(err){
        return h.view('main', {errors: [{ message: err.message}] });
      }
    }
  }
};

module.exports = Todos;