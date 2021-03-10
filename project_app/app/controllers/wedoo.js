const Wedoo = {
  index: {
    handler: function(request, h){
      return h.view('main',{title: 'Welcome to Wedoo'});
    }
  },
  signup: {
    handler: function(request, h) {
      return h.view('signup', { title: 'Sign up for Wedoo' });
    }
  },
  login: {
    handler: function(request, h) {
      return h.view('login', { title: 'Login to Wedoo' });
    }
  }
};

module.exports = Wedoo;