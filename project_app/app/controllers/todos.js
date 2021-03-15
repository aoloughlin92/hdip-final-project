'use strict';

const User = require('../models/user');
const Todo = require('../models/todo');
const Event = require('../models/event');
const dotenv = require('dotenv');

const Todos = {
  home: {
    handler: function(request, h) {
      const result = dotenv.config();
      if (result.error) {
        console.log(result.error.message);
        process.exit(1);
      }
      const paypalurl= process.env.paypalurl;
      return h.view('home', {
        title: 'Wedoo',
        paypalurl: paypalurl
      });
    }
  },
  todolist: {
    handler: async function(request, h) {
      const event = await Event.findOne({_id: request.params.id}).populate('todos').lean();
      return h.view('todolist', {
        title: 'Todos so far',
        todos: event.todos,
        event: event
      });
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
          assigned: user._id,
          status: data.status
        });
        await newTodo.save();
        event.todos.push(newTodo);
        await event.save();
        return h.redirect('/todolist/'+ event._id);
      }catch{
        return h.view('main', {errors: [{ message: err.message}] });
      }
    }
  }
};

module.exports = Todos;