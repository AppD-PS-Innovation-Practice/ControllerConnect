var express = require('express');
var router = express.Router();
var passport = require('passport');
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
  if (req.isAuthenticated()) {
    res.redirect('users/');
  }
  else{
    res.render('login', {title: "Log in", userData: req.user, messages: {danger: req.flash('danger'), warning: req.flash('warning'), success: req.flash('success')}});
  }
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/account',
  failureRedirect: '/login',
  failureFlash: true
}), function(req, res) {
  if (req.body.remember) {
    req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // Cookie expires after 30 days
  } else {
    req.session.cookie.expires = false; // Cookie expires at end of session
  }
  res.redirect('/');
});

router.get('/logout', function(req, res){
  console.log(req.isAuthenticated());
  req.logout();
  console.log(req.isAuthenticated());
  req.flash('success', "Logged out. See you soon!");
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
  try {
    const result = await pool.query(
        'SELECT * FROM Admin'
    );
    res.render('users', {
      title: 'Users',
      results: result.rows,
    });
  } catch (error) {
    console.error('Error executing user list', error.stack);
    res.status(500).send('Internal Server Error');
  }
});

// new user form
router.get('/users/add', async (req, res) => {
  res.render('add_user', {
    title: 'Add User'
  });
});

// submit new user
router.post('/users/add', async (req, res) => {

  try {
    const result = await pool.query(
        'INSERT INTO Admin (user_id, user_pass, user_email) VALUES ($1, $2, $3)',
        [req.body.user_id, req.body.user_pass, req.body.user_email]
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

});

// load edit form
router.get('/users/edit/:id', async (req, res) => {
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
});

// update submit new user
router.post('/users/edit/:id', async (req, res) => {

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

});

// Delete post
router.delete('/users/:id', async (req, res) => {
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
});

// get single user
router.get('/users/:id', async (req, res) => {
  try {
    const result = await pool.query(
        'SELECT * FROM Admin WHERE id=$1',
        [req.params.id]
    );

    console.error("user JSON.stringify(result): " + JSON.stringify(result));
    console.error(result.rows[0]);
    console.error("user JSON.stringify(result.rows[0]): " + JSON.stringify(result.rows[0]));

    res.render('user', {
      title: 'Get User',
      results: result.rows[0],
      query: req.params.id,
    });
  } catch (error) {
    console.error('Error executing user query', error.stack);
    res.status(500).send('Internal Server Error');
  }
});

//controllers routes
// Controller model
const Controller = require('../models/controller');

/* list all controllers */
router.get('/controllers/', async (req, res) => {
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
});

// new controller form
router.get('/controllers/add', function (req, res) {
  res.render('add_controller', {
    title: 'Add Controller'
  });
});

// submit new controller
router.post('controllers/add', async (req, res) => {

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

});

// load edit form
router.get('/controllers/edit/:id', async (req, res) => {

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
});

// update submit new controller
router.post('/controllers/edit/:id', async (req, res) => {

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
});

// Delete post
router.delete('/controllers/:id', async (req, res) => {

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

});

// get single controller
router.get('/controllers/:id', async (req, res) => {
  try {
    const result = await pool.query(
        'SELECT * FROM Controllers WHERE id=$1',
        [req.params.id]
    );

    console.error("controller JSON.stringify(result): " + JSON.stringify(result));
    console.error(result.rows[0]);
    console.error("controller JSON.stringify(result.rows[0]): " + JSON.stringify(result.rows[0]));

    res.render('controller', {
      title: 'Get Controller',
      results: result.rows[0],
      query: req.params.id,
    });
  } catch (error) {
    console.error('Error executing controller query', error.stack);
    res.status(500).send('Internal Server Error');
  }
});


passport.use('local', new LocalStrategy({passReqToCallback : true}, (req, username, password, done) => {

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
              bcrypt.compare(password, result.rows[0].password, function(err, check) {
                if (err){
                  console.log('Error while checking password');
                  return done();
                }
                else if (check){
                  return done(null, [{email: result.rows[0].email, firstName: result.rows[0].firstName}]);
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
