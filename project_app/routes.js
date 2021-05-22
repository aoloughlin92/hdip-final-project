const Wedoo = require('./app/controllers/wedoo');
const Accounts = require('./app/controllers/accounts');
const Todos = require('./app/controllers/todos');
const Events = require('./app/controllers/events');
const Guests = require('./app/controllers/guests');
const Requests = require('./app/controllers/requests');
const Budget = require('./app/controllers/budget');
const Questions = require('./app/controllers/questions');
const Tables = require('./app/controllers/tables');

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
  { method: 'GET', path: '/todolist/{id}/todo/{todoid}', config: Todos.viewTodo },
  { method: 'GET', path: '/todolist/{id}/delete/{todoid}', config: Todos.deleteTodo },
  { method: 'POST', path: '/todolist/{id}/edit/{todoid}', config: Todos.editTodo },

  { method: 'POST', path: '/addHost/{id}', config: Events.addHost },
  { method: 'POST', path: '/createEvent', config: Events.createEvent },
  { method: 'GET', path: '/events', config: Events.showEvents },
  { method: 'GET', path: '/event/{id}', config: Events.viewEvent },
  { method: 'GET', path: '/delete/{id}', config: Events.deleteEvent },
  { method: 'POST', path: '/rsvpmessage/{id}', config: Events.setWelcomeMessage },
  { method: 'GET', path: '/donations/{id}', config: Events.viewDonations },
  { method: 'GET', path: '/event/{id}/edit', config: Events.showEditEvent},
  { method: 'POST', path: '/editevent/{id}', config: Events.editEvent},



  { method: 'POST', path: '/rsvpquestion/{id}', config: Questions.addQuestion },
  { method: 'GET', path: '/event/{id}/question/{questionid}', config: Questions.viewQuestion },
  { method: 'GET', path: '/event/{id}/deletequestion/{questionid}', config: Questions.deleteQuestion },
  { method: 'POST', path: '/event/{id}/updatequestion/{questionid}', config: Questions.editQuestion },
  { method: 'POST',path: '/answerquestions/{id}', config: Questions.answerQuestions},
  { method: 'GET',path: '/viewquestions/{id}/plusOne/{plusoneid}', config: Questions.showQuestions},
  { method: 'POST',path: '/answerquestions/{id}/plusOne/{plusoneid}', config: Questions.answerQuestionsPlusOne},


  { method: 'GET', path: '/guestlist/{id}', config: Guests.guestlist },
  { method: 'POST', path: '/guestlist/{id}/uploadguestlist', config: Guests.uploadGuestlist },
  { method: 'POST', path: '/addGuest/{id}', config: Guests.addGuest },
  { method: 'POST',path: '/rsvp', config: Guests.rsvp},
  { method: 'POST',path: '/rsvplogin', config: Guests.rsvplogin},
  { method: 'GET', path: '/guest/{id}', config: Guests.showRSVP},
  { method: 'GET', path: '/myinfo/{id}', config: Guests.showInfo},
  { method: 'POST',path: '/postRSVP/{id}', config: Guests.updateRSVP},
  { method: 'POST', path: '/updatemyinfo/{id}', config: Guests.updateMyInfo},
  { method: 'POST', path: '/guest/{id}/donate', config: Guests.donate},
  { method: 'GET', path: '/guestdonation/{id}', config: Guests.showDonation},
  { method: 'POST', path: '/guest/{id}/paypal-transaction-complete', config: Guests.donationComplete},
  { method: 'POST', path: '/guestlist/{id}/editguest/{guestid}', config: Guests.editGuest },
  { method: 'GET', path: '/guestlist/{id}/viewguest/{guestid}', config: Guests.viewGuest },
  { method: 'GET', path: '/guestlist/{id}/deleteguest/{guestid}', config: Guests.deleteGuest },
  { method: 'POST', path: '/guestlist/{id}/guest/{guestid}/editplusone/{plusoneid}', config: Guests.editPlusOne },
  { method: 'POST', path: '/guestlist/{id}/guest/{guestid}/addplusone', config: Guests.addPlusOne },
  { method: 'GET', path: '/guestlist/{id}/guest/{guestid}/deleteplusone/{plusoneid}', config: Guests.deletePlusOne },
  { method: 'POST', path: '/guest/{guestid}/editplusone/{plusoneid}', config: Guests.updatePlusOne },


  { method: 'GET', path: '/request/{id}', config: Requests.viewRequest },
  { method: 'GET', path: '/request/decline/{id}', config: Requests.decline},
  { method: 'GET', path: '/request/accept/{id}', config: Requests.accept},


  { method: 'GET', path:'/tableplan/{id}', config: Tables.viewTables },
  { method: 'POST', path:'/tableplan/{id}/addtables', config: Tables.addTables },
  { method: 'GET', path:'/tableplan/{id}/view/{tableid}', config: Tables.viewTable },
  { method: 'GET', path:'/tableplan/{id}/delete/{tableid}', config: Tables.deleteTable },
  { method: 'POST', path:'/tableplan/{id}/addguest/{tableid}', config: Tables.addGuest },
  { method: 'GET', path:'/tableplan/{id}/table/{tableid}/removeguest/{guestid}', config: Tables.removeGuest},
  { method: 'POST', path:'/tableplan/{id}/edittable/{tableid}', config: Tables.editTable},


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