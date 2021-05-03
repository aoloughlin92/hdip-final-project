const Wedoo = require('./app/controllers/wedoo');
const Accounts = require('./app/controllers/accounts');
const Todos = require('./app/controllers/todos');
const Events = require('./app/controllers/events');
const Guests = require('./app/controllers/guests');
const Requests = require('./app/controllers/requests');
const Budget = require('./app/controllers/budget');

module.exports = [
  { method: 'GET', path: '/', config: Accounts.index },
  { method: 'GET', path: '/signup', config: Accounts.showSignup },
  { method: 'GET', path: '/login', config: Accounts.showLogin },
  { method: 'GET', path: '/logout', config: Accounts.logout },
  { method: 'POST', path: '/signup', config: Accounts.signup },
  { method: 'POST', path: '/login', config: Accounts.login },
  { method: 'GET', path: '/settings', config: Accounts.showSettings },
  { method: 'POST', path: '/settings', config: Accounts.updateSettings },

  { method: 'POST', path: '/createToDo/{id}', config: Todos.createToDo },
  { method: 'GET', path: '/todolist/{id}', config: Todos.todolist },

  { method: 'POST', path: '/addHost/{id}', config: Events.addHost },
  { method: 'POST', path: '/createEvent', config: Events.createEvent },
  { method: 'GET', path: '/events', config: Events.showEvents },
  { method: 'GET', path: '/event/{id}', config: Events.viewEvent },
  { method: 'GET', path: '/delete/{id}', config: Events.deleteEvent },
  { method: 'POST', path: '/rsvpmessage/{id}', config: Events.setWelcomeMessage },
  { method: 'POST', path: '/rsvpquestion/{id}', config: Events.addQuestion },
  { method: 'GET', path: '/donations/{id}', config: Events.viewDonations },

  { method: 'GET', path: '/guestlist/{id}', config: Guests.guestlist },
  { method: 'POST', path: '/addGuest/{id}', config: Guests.addGuest },
  { method: 'POST',path: '/rsvp', config: Guests.rsvp},
  { method: 'POST',path: '/rsvplogin', config: Guests.rsvplogin},
  { method: 'GET', path: '/guest/{id}', config: Guests.showRSVP},
  { method: 'POST', path: '/guest/{id}/donate', config: Guests.donate},
  { method: 'GET', path: '/guestdonation/{id}', config: Guests.showDonation},
  { method: 'POST', path: '/guest/{id}/paypal-transaction-complete', config: Guests.donationComplete},


  { method: 'GET', path: '/request/{id}', config: Requests.viewRequest },
  { method: 'GET', path: '/request/decline/{id}', config: Requests.decline},
  { method: 'GET', path: '/request/accept/{id}', config: Requests.accept},

  { method: 'GET', path: '/budget/{id}', config: Budget.viewBudget},

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