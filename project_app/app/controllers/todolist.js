'use strict';

const Donations = {
  home: {
    handler: function(request, h) {
      return h.view('home', { title: 'Wedoo' });
    }
  },
  todolist: {
    handler: function(request, h) {
      return h.view('todolist', {
        title: 'Todos so far',
        todos: this.todos
      });
    }
  },
  createToDo: {
    handler: function(request, h){
      const data = request.payload;
      var creatorEmail = request.auth.credentials.id;
      data.creator = this.users[creatorEmail];
      this.todos.push(data);
      return h.redirect('/todolist');
    }
  }
};

module.exports = Donations;