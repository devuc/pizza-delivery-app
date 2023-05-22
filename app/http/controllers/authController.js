const User = require('../../models/user');
const bcrypt = require('bcrypt');
const passport = require('passport');

function authController() {
  const _getReadirectUrl = req => {
    return req.user.role === 'admin' ? 'admin/orders' : 'customer/orders';
  };

  return {
    //Naming convention for read
    login(req, res) {
      res.render('auth/Login');
    },
    postLogin(req, res, next) {
      const { email, password } = req.body;

      //Validate request
      if (!email || !password) {
        req.flash('error', 'All fields are required');
        return res.redirect('/login');
      }

      passport.authenticate('local', (err, user, info) => {
        if (err) {
          req.flash('error', info.message);
          return next(err);
        }
        if (!user) {
          req.flash('error', info.message);
          return res.redirect('/login');
        }
        req.logIn(user, err => {
          if (err) {
            req.flash('error', info.message);
            return next(err);
          }

          return res.redirect(_getReadirectUrl(req));
        });
      })(req, res, next);
    },

    register(req, res) {
      res.render('auth/Register');
    },
    async postRegister(req, res) {
      const { name, email, password } = req.body;

      //Validate request
      if (!name || !email || !password) {
        req.flash('error', 'All fields are required');
        req.flash('name', name);
        req.flash('email', email);
        return res.redirect('/register');
      }

      //Check if email exists
      User.exists({ email: email }, (err, result) => {
        if (result) {
          req.flash('error', 'Email already exists');
          req.flash('name', name);
          req.flash('email', email);
          return res.redirect('/register');
        }
      });

      //Hash password
      const hashedpassword = await bcrypt.hash(password, 10);

      //Create a user
      const user = new User({
        name,
        email,
        password: hashedpassword,
      });

      user
        .save()
        .then(user => {
          //Login
          return res.redirect('/');
        })
        .catch(err => {
          req.flash('error', 'Something went wrong...');
          return res.redirect('/register');
        });
    },
    logout(req, res) {
      req.logout(function (err) {
        if (err) {
          return next(err);
        }
      });
      return res.redirect('/');
    },
  };
}

module.exports = authController;
