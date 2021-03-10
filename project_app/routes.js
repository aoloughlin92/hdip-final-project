const Todos = require('./app/controllers/wedoo');
const Accounts = require('./app/controllers/accounts');
const TodoList = require('./app/controllers/todos');
const Events = require('./app/controllers/events');

module.exports = [
  { method: 'GET', path: '/', config: Accounts.index },
  { method: 'GET', path: '/signup', config: Accounts.showSignup },
  { method: 'GET', path: '/login', config: Accounts.showLogin },
  { method: 'GET', path: '/logout', config: Accounts.logout },
  { method: 'POST', path: '/signup', config: Accounts.signup },
  { method: 'POST', path: '/login', config: Accounts.login },
  { method: 'POST', path: '/createToDo', config: TodoList.createToDo },
  { method: 'POST', path: '/createEvent', config: Events.createEvent },
  { method: 'GET', path: '/events', config: Events.showEvents },
  { method: 'GET', path: '/event/{id}', config: Events.viewEvent },
  { method: 'GET', path: '/home', config: TodoList.home },
  { method: 'GET', path: '/todolist', config: TodoList.todolist },
  { method: 'GET', path: '/settings', config: Accounts.showSettings },
  { method: 'POST', path: '/settings', config: Accounts.updateSettings },
  {
    method: 'GET',
    path: '/{param*}',
    handler: {
      directory: {
        path: './public'
      }
    },
    options: { auth: false }
  }];