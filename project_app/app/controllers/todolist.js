'use strict';

const User = require('../models/user');
const Todo = require('../models/todo');

const TodoList = {
  home: {
    handler: function(request, h) {
      return h.view('home', { title: 'Wedoo' });
    }
  },
  todolist: {
    handler: async function(request, h) {
      const todos = await Todo.find().populate('creator').lean();
      return h.view('todolist', {
        title: 'Todos so far',
        todos: todos
      });
    }
  },
  createToDo: {
    handler: async function(request, h){
      const id = request.auth.credentials.id;
      const user = await User.findById(id);
      const data = request.payload;
      const newTodo = new Todo({
        amount:data.amount,
        method: data.method,
        creator: user._id
      });
      await newTodo.save();
      return h.redirect('/todolist');
    }
  }
};

module.exports = TodoList;