var express = require('express');
var router = express.Router();
const passport = require('passport');
var request = require('request');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const LocalStrategy = require('passport-local').Strategy;
const { Pool } = require('pg');

// Configure PostgreSQL connection
const pool = new Pool({
  user: 'postgres',
  host: 'db',
  database: 'controller_connect',
  password: 'example',
  port: 5432,
});

/* user login */
router.get('/login', function (req, res, next) {
  console.log('login get');
  if (req.isAuthenticated()) {
    console.log('logged in');
    res.redirect('/users/');
  }
  else{
    res.render('login', {title: "Log in", userData: req.user, messages: {danger: req.flash('danger'), warning: req.flash('warning'), success: req.flash('success')}});
  }
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/users/',
  failureRedirect: '/login',
  failureFlash: true
}), function(req, res) {
  console.log('post logged in');
  req.session.cookie.expires = false; // Cookie expires at end of session
  res.redirect('/users');
});

router.get('/logout', function(req, res){
  console.log(req.isAuthenticated());
  req.session.destroy((err) => {
    if (err) {
      res.status(500).send('Internal Server Error');
    }
  });
  console.log(req.isAuthenticated());

  res.redirect('/');
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'ConCon' });
});

// Route for the search functionality
router.get('/search', async (req, res) => {
  const searchQuery = req.query.query;
  if (!searchQuery) {
    return res.status(400).send('Search query is required');
  }

  try {
    const result = await pool.query(
        'SELECT * FROM applications WHERE app_name ILIKE $1 ORDER BY controller_name, app_name',
        [`%${searchQuery}%`]
    );
    res.render('search_results', {
      title: 'Search Results',
      results: result.rows,
      query: searchQuery,
    });
  } catch (error) {
    console.error('Error executing query', error.stack);
    res.status(500).send('Internal Server Error');
  }
});

//Users routes
// User model
const User = require('../models/user');

/* list all users */
router.get('/users/', async (req, res) => {
  console.log('in /users');
  if(req.isAuthenticated()) {
    try {
      const result = await pool.query(
          'SELECT * FROM admin'
      );
      res.render('users', {
        title: 'Users',
        results: result.rows,
      });
    } catch (error) {
      console.error('Error executing user list', error.stack);
      res.status(500).send('Internal Server Error');
    }
  }
  else {
    res.redirect('/login');
  }

});

// new user form
router.get('/users/add', async (req, res) => {
  if(req.isAuthenticated()) {
    res.render('add_user', {
      title: 'Add User'
    });
  }
  else {
      res.redirect('/login');
    }
});

// submit new user
router.post('/users/add', async (req, res) => {
  if(req.isAuthenticated()) {
    try {
      var pwd = await bcrypt.hash(req.body.user_pass, 5);
      const result = await pool.query(
          'INSERT INTO admin (user_email, user_pass) VALUES ($1, $2)',
          [req.body.user_email, pwd]
      );

      res.render('results', {
        title: 'SUCCESS - User Added',
        results: 'SUCCESS - User Added',
        goback: '/users/'
      });
    } catch (error) {
      console.error('Error executing user add', error.stack);
      res.status(500).send('Internal Server Error');
    }
  }
  else {
    res.redirect('/login');
  }

});

// load edit form
router.get('/users/edit/:id', async (req, res) => {
  if(req.isAuthenticated()) {
    try {
      const result = await pool.query(
          'SELECT * FROM Admin WHERE id=$1',
          [req.params.id]
      );

      res.render('edit_user', {
        title: 'Edit User',
        results: result.rows[0],
        query: req.params.id,
      });
    } catch (error) {
      console.error('Error executing user edit', error.stack);
      res.status(500).send('Internal Server Error');
    }
  }
  else {
    res.redirect('/login');
  }
});

// update submit new user
router.post('/users/edit/:id', async (req, res) => {
  if(req.isAuthenticated()) {
    try {
      const result = await pool.query(
          'UPDATE Admin SET user_id=$1, user_pass=$2, user_email=$3 WHERE id=$4',
          [req.body.user_id, req.body.user_pass, req.body.user_email, req.params.id]
      );

      res.render('results', {
        title: 'SUCCESS - User Updated',
        results: 'SUCCESS - User Updated',
        goback: '/users/'
      });

    } catch (error) {
      console.error('Error executing user update', error.stack);
      res.status(500).send('Internal Server Error');
    }
  }
  else {
    res.redirect('/login');
  }
});

// Delete post
router.delete('/users/:id', async (req, res) => {
  if(req.isAuthenticated()) {
    try {
      const result = await pool.query(
          'DELETE FROM Admin WHERE id=$1',
          [req.params.id]
      );

      res.render('results', {
        title: 'SUCCESS - User Deleted',
        results: 'SUCCESS - User Deleted',
        goback: '/users/'
      });

    } catch (error) {
      console.error('Error executing user delete', error.stack);
      res.status(500).send('Internal Server Error');
    }
  }
  else {
    res.redirect('/login');
  }
});

// get single user
router.get('/users/:id', async (req, res) => {
  if(req.isAuthenticated()) {
    try {
      const result = await pool.query(
          'SELECT * FROM Admin WHERE id=$1',
          [req.params.id]
      );

      res.render('user', {
        title: 'Get User',
        results: result.rows[0],
        query: req.params.id,
      });
    } catch (error) {
      console.error('Error executing user query', error.stack);
      res.status(500).send('Internal Server Error');
    }
  }
  else {
    res.redirect('/login');
  }
});

//controllers routes
// Controller model
const Controller = require('../models/controller');

/* list all controllers */
router.get('/controllers/', async (req, res) => {
  if(req.isAuthenticated()) {
    try {
      const result = await pool.query('SELECT * FROM Controllers');
      res.render('controllers', {
        title: 'Controllers',
        results: result.rows,
      });
    } catch (error) {
      console.error('Error executing query', error.stack);
      res.status(500).send('Internal Server Error');
    }
  }
  else {
    res.redirect('/login');
  }
});

// new controller form
router.get('/controllers/add', function (req, res) {
  if(req.isAuthenticated()) {
    res.render('add_controller', {
      title: 'Add Controller'
    });
  }
  else {
    res.redirect('/login');
  }
});

// submit new controller
router.post('/controllers/add', async (req, res) => {
  if(req.isAuthenticated()) {
    try {
      const result = await pool.query(
          'INSERT INTO Controllers (controller_name, client_id, client_secret) VALUES ($1, $2, $3)',
          [req.body.controller_name, req.body.client_id, req.body.client_secret]
      );

      res.render('results', {
        title: 'SUCCESS - Controller Added',
        results: 'SUCCESS - Controller Added',
        goback: '/controllers/'
      });

    } catch (error) {
      console.error('Error executing user add', error.stack);
      res.status(500).send('Internal Server Error');
    }
  }
  else {
    res.redirect('/login');
  }
});

// load edit form
router.get('/controllers/edit/:id', async (req, res) => {
  if(req.isAuthenticated()) {
    try {
      const result = await pool.query(
          'SELECT * FROM Controllers WHERE id=$1',
          [req.params.id]
      );

      res.render('edit_controller', {
        title: 'Edit Controller',
        results: result.rows[0],
        query: req.params.id,
      });
    } catch (error) {
      console.error('Error executing controller edit', error.stack);
      res.status(500).send('Internal Server Error');
    }
  }
  else {
    res.redirect('/login');
  }
});

// update submit new controller
router.post('/controllers/edit/:id', async (req, res) => {
  if(req.isAuthenticated()) {
    try {
      const result = await pool.query(
          'UPDATE Controllers SET controller_name=$1, client_id=$2, client_secret=$3 WHERE id=$4',
          [req.body.controller_name, req.body.client_id, req.body.client_secret, req.params.id]
      );

      res.render('results', {
        title: 'SUCCESS - Controller Updated',
        results: 'SUCCESS - Controller Updated',
        goback: '/controllers/'
      });

    } catch (error) {
      console.error('Error executing controller update', error.stack);
      res.status(500).send('Internal Server Error');
    }
  }
  else {
    res.redirect('/login');
  }
});

// Delete post
router.delete('/controllers/:id', async (req, res) => {
  if(req.isAuthenticated()) {
    try {
      const result = await pool.query(
          'DELETE FROM Controllers WHERE id=$1',
          [req.params.id]
      );

      res.render('results', {
        title: 'SUCCESS - Controller Deleted',
        results: 'SUCCESS - Controller Deleted',
        goback: '/controllers/'
      });

    } catch (error) {
      console.error('Error executing controller delete', error.stack);
      res.status(500).send('Internal Server Error');
    }
  }
  else {
    res.redirect('/login');
  }
});

// get single controller
router.get('/controllers/:id', async (req, res) => {
  if(req.isAuthenticated()) {
    try {
      const result = await pool.query(
          'SELECT * FROM Controllers WHERE id=$1',
          [req.params.id]
      );

      res.render('controller', {
        title: 'Get Controller',
        results: result.rows[0],
        query: req.params.id,
      });
    } catch (error) {
      console.error('Error executing controller query', error.stack);
      res.status(500).send('Internal Server Error');
    }
  }
  else {
    res.redirect('/login');
  }
});


passport.use('local', new LocalStrategy({
  usernameField: 'user_email',
  passwordField: 'user_pass',
  passReqToCallback : true
    }, (req, username, password, done) => {
  console.log('in local passport authentication');
      loginAttempt();
      async function loginAttempt() {


        const client = await pool.connect()
        try{
          await client.query('BEGIN')
          let currentAccountsData = JSON.stringify(client.query('SELECT id, "user_email", "user_pass" FROM "admin" WHERE "user_email"=$1', [username], function(err, result) {

            if(err) {
              return done(err)
            }
            if(result.rows[0] == null){
              req.flash('danger', "Oops. Incorrect login details.");
              return done(null, false);
            }
            else{
              bcrypt.compare(password, result.rows[0].user_pass, function(err, check) {
                if (err){
                  console.log('Error while checking password');
                  return done();
                }
                else if (check){
                  return done(null, [{email: result.rows[0].user_email}]);
                }
                else{
                  req.flash('danger', "Oops. Incorrect login details.");
                  return done(null, false);
                }
              });
            }
          }))
        }

        catch(e){throw (e);}
      }
    }
));
passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(user, done) {
  done(null, user);
});


module.exports = router;
